import { NextRequest, NextResponse } from "next/server"
import { getMemWal, recallUserMemories, appendUserMemory } from "../../lib/memwal"
import { getMatchById } from "../../lib/matches"
import {
  computeBiasProfile,
  forecastPick,
  computeScoreboard,
  PRECOG_MIN_PREDICTIONS,
} from "../../lib/bias"

// VAR Pre-Cog — VAR guesses the user's pick from their own history (zero Groq).
//   GET ?userId=&matchId=  → per-match forecast; commits [VAR_FORECAST] once
//   GET ?userId=           → cumulative scoreboard ("VAR knows you X%")
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const matchId = searchParams.get("matchId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  let memories: string[] = []
  try {
    memories = await recallUserMemories(userId)
  } catch (e) {
    console.error("precog recall failed:", e)
    // Degrade gracefully — never 500 the UI over a rate limit.
    return matchId
      ? NextResponse.json({ ready: false, predictionCount: 0, remaining: PRECOG_MIN_PREDICTIONS, rateLimited: true })
      : NextResponse.json({ scoreboard: true, total: 0, hits: 0, knowsYouPct: 0, rateLimited: true })
  }

  // ── Scoreboard mode ────────────────────────────────────────────────────────
  if (!matchId) {
    return NextResponse.json({ scoreboard: true, ...computeScoreboard(memories) })
  }

  // ── Per-match forecast mode ────────────────────────────────────────────────
  const match = getMatchById(matchId)
  if (!match) return NextResponse.json({ error: "match not found" }, { status: 404 })

  const profile = computeBiasProfile(memories)
  if (profile.predictionCount < PRECOG_MIN_PREDICTIONS) {
    return NextResponse.json({
      ready: false,
      predictionCount: profile.predictionCount,
      remaining: PRECOG_MIN_PREDICTIONS - profile.predictionCount,
    })
  }

  const forecast = forecastPick(profile, {
    home: match.homeTeam,
    away: match.awayTeam,
    matchId,
  })
  if (!forecast) {
    return NextResponse.json({ ready: false, predictionCount: profile.predictionCount, remaining: 0 })
  }

  // Commit [VAR_FORECAST] once per match — proves VAR guessed before the pick.
  const already = memories.some(
    t => t.startsWith("[VAR_FORECAST]") && t.includes(`(matchId: ${matchId})`)
  )
  if (!already) {
    const text = `[VAR_FORECAST] VAR predicted User ${userId} would pick ${forecast.pick} for ${match.homeTeam} vs ${match.awayTeam} (matchId: ${matchId}). Basis: ${forecast.basis}. Timestamp: ${new Date().toISOString()}`
    // Append to the shared cache immediately so dedupe + scoreboard see it, then
    // persist best-effort. We do NOT poll waitForRememberJob — that multiplied
    // Walrus requests and pushed us into the rate limit.
    appendUserMemory(userId, text)
    try {
      const mem = getMemWal()
      await mem.remember(text)
    } catch (e) {
      console.error("precog write failed:", e)
      // Non-fatal — forecast is already shown and cached.
    }
  }

  return NextResponse.json({
    ready: true,
    pick: forecast.pick,
    line: forecast.line,
    basis: forecast.basis,
    wrongLikely: forecast.wrongLikely,
  })
}
