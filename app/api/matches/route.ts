import { NextRequest, NextResponse } from "next/server"
import { matches } from "../../lib/matches"

// In-memory cache for football API results (5-minute TTL)
let resultsCache: Record<string, { winner: string | null; homeScore: number; awayScore: number }> = {}
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000

// Separate cache for currently live (IN_PLAY / PAUSED / HALF_TIME) matches
let liveMatchesCache: Array<{
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
}> = []

async function fetchLiveResults() {
  if (Date.now() - cacheTimestamp < CACHE_TTL) return resultsCache

  try {
    const res = await fetch(
      // All stages (group + knockout) — knockout results must flow into the live
      // ticker and completed lists once the round of 32 starts.
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
        next: { revalidate: 0 },
      }
    )
    if (!res.ok) return resultsCache

    const data = await res.json()
    const fresh: typeof resultsCache = {}
    const freshLive: typeof liveMatchesCache = []

    for (const m of data.matches ?? []) {
      const matchId = `match_${m.id}`
      const homeShort = m.homeTeam.shortName ?? m.homeTeam.name
      const awayShort = m.awayTeam.shortName ?? m.awayTeam.name

      if (m.status === "FINISHED" && m.score?.fullTime?.home !== null) {
        fresh[matchId] = {
          winner:
            m.score.winner === "HOME_TEAM" ? homeShort
            : m.score.winner === "AWAY_TEAM" ? awayShort
            : null,
          homeScore: m.score.fullTime.home,
          awayScore: m.score.fullTime.away,
        }
      }

      if (["IN_PLAY", "PAUSED", "HALF_TIME"].includes(m.status) && m.score) {
        freshLive.push({
          id: matchId,
          homeTeam: homeShort,
          awayTeam: awayShort,
          homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? 0,
          awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? 0,
          status: m.status,
        })
      }
    }

    resultsCache = fresh
    liveMatchesCache = freshLive
    cacheTimestamp = Date.now()
  } catch {
    // Return stale cache on error
  }

  return resultsCache
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  await fetchLiveResults()

  // ?live — return currently in-play matches for the ticker
  if (searchParams.has("live")) {
    return NextResponse.json({ matches: liveMatchesCache })
  }

  const merged = matches.map(m => ({
    ...m,
    result: resultsCache[m.id] ?? m.result,
  }))

  const today = new Date().toISOString().split("T")[0]

  if (searchParams.has("upcoming")) {
    return NextResponse.json({
      matches: merged.filter(m => m.date >= today && m.result === null),
    })
  }

  if (searchParams.has("completed")) {
    return NextResponse.json({
      matches: merged.filter(m => m.result !== null),
    })
  }

  return NextResponse.json({ matches: merged })
}
