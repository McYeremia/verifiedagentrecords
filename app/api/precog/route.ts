import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../lib/memwal"
import { getMatchById } from "../../lib/matches"
import {
  computeBiasProfile,
  forecastPick,
  parsePredictions,
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

  const mem = getMemWal()

  let memories: string[] = []
  try {
    const res = await mem.recall({ query: `User ${userId} predictions results forecast` })
    memories = (res.results ?? [])
      .map((m: { text: string }) => m.text)
      .filter((t: string) => t.includes(userId))
  } catch (e) {
    console.error("precog recall failed:", e)
    return NextResponse.json({ error: "recall failed" }, { status: 500 })
  }

  // ── Scoreboard mode ────────────────────────────────────────────────────────
  if (!matchId) {
    const forecasts = memories.filter(t => t.startsWith("[VAR_FORECAST]"))
    const predMap: Record<string, string> = {}
    for (const p of parsePredictions(memories)) predMap[p.matchId] = p.pick

    let total = 0
    let hits = 0
    const seen = new Set<string>()
    for (const f of forecasts) {
      const midM = f.match(/matchId: ([\w_]+)/)
      const pickM = f.match(/would pick (.+?) for /)
      if (!midM || !pickM) continue
      const mid = midM[1]
      if (seen.has(mid)) continue
      seen.add(mid)
      const actual = predMap[mid]
      if (!actual) continue            // only score matches the user actually predicted
      total++
      if (pickM[1].trim() === actual) hits++
    }

    const knowsYouPct = total > 0 ? Math.round((hits / total) * 100) : 0
    return NextResponse.json({ scoreboard: true, total, hits, knowsYouPct })
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
    try {
      const text = `[VAR_FORECAST] VAR predicted User ${userId} would pick ${forecast.pick} for ${match.homeTeam} vs ${match.awayTeam} (matchId: ${matchId}). Basis: ${forecast.basis}. Timestamp: ${new Date().toISOString()}`
      const job = await mem.remember(text)
      await mem.waitForRememberJob(job.job_id)
    } catch (e) {
      console.error("precog write failed:", e)
      // Non-fatal — still return the forecast for display.
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
