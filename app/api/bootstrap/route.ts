import { NextRequest, NextResponse } from "next/server"
import {
  recallUserMemories,
  getMemWal,
  appendUserMemory,
} from "../../lib/memwal"
import { getMatchById } from "../../lib/matches"
import {
  computeBiasProfile,
  forecastPick,
  computeScoreboard,
  PRECOG_MIN_PREDICTIONS,
} from "../../lib/bias"
import { getRoast, cachedRoastFallback } from "../../lib/roast-engine"

// Single page bootstrap for /predict — ONE Walrus recall returns the roast,
// the full memory list, the per-match Pre-Cog forecast, and the "VAR knows you"
// scoreboard. Consolidating these avoids the parallel-recall burst that tripped
// the Walrus rate limit (each serverless instance has its own in-memory cache,
// so separate requests couldn't share one recall).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const matchId = searchParams.get("matchId")
  const bust = searchParams.get("bust") === "1"
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  // ── One recall (shared cache + in-flight coalescing) ──
  let memories: string[]
  try {
    memories = await recallUserMemories(userId)
  } catch (e) {
    console.error("bootstrap recall failed:", e)
    const fb = cachedRoastFallback(userId)
    return NextResponse.json({
      roast: fb?.roast ?? "VAR's memory is temporarily unavailable. Your records are safe — try again shortly.",
      memoriesUsed: fb?.memoriesUsed ?? 0,
      memories: fb?.memories ?? null,
      precog: null,
      knowsYou: { total: 0, hits: 0, knowsYouPct: 0 },
      degraded: true,
    })
  }

  // ── Roast (cached 30 min — no Groq on repeat) ──
  const roast = await getRoast(userId, memories, bust)

  // ── Scoreboard ──
  const knowsYou = computeScoreboard(memories)

  // ── Per-match Pre-Cog forecast ──
  let precog: Record<string, unknown> | null = null
  if (matchId) {
    const match = getMatchById(matchId)
    const alreadyPredicted = memories.some(
      t => t.startsWith("[PREDICTION]") && t.includes(`(matchId: ${matchId})`)
    )
    if (match && !alreadyPredicted) {
      const profile = computeBiasProfile(memories)
      if (profile.predictionCount < PRECOG_MIN_PREDICTIONS) {
        precog = {
          ready: false,
          predictionCount: profile.predictionCount,
          remaining: PRECOG_MIN_PREDICTIONS - profile.predictionCount,
        }
      } else {
        const forecast = forecastPick(profile, { home: match.homeTeam, away: match.awayTeam, matchId })
        if (forecast) {
          const already = memories.some(
            t => t.startsWith("[VAR_FORECAST]") && t.includes(`(matchId: ${matchId})`)
          )
          if (!already) {
            const text = `[VAR_FORECAST] VAR predicted User ${userId} would pick ${forecast.pick} for ${match.homeTeam} vs ${match.awayTeam} (matchId: ${matchId}). Basis: ${forecast.basis}. Timestamp: ${new Date().toISOString()}`
            appendUserMemory(userId, text)
            try {
              await getMemWal().remember(text)
            } catch (e) {
              console.error("bootstrap forecast write failed:", e)
            }
          }
          precog = {
            ready: true,
            pick: forecast.pick,
            line: forecast.line,
            basis: forecast.basis,
            wrongLikely: forecast.wrongLikely,
          }
        }
      }
    }
  }

  return NextResponse.json({
    roast: roast.roast,
    memoriesUsed: roast.memoriesUsed,
    memories,            // full list (better for locks/stats than the 15-cap)
    precog,
    knowsYou,
  })
}
