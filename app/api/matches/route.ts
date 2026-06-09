import { NextRequest, NextResponse } from "next/server"
import { matches } from "../../lib/matches"

// In-memory cache for football API results (5-minute TTL)
let resultsCache: Record<string, { winner: string | null; homeScore: number; awayScore: number }> = {}
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000

async function fetchLiveResults() {
  if (Date.now() - cacheTimestamp < CACHE_TTL) return resultsCache

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches?stage=GROUP_STAGE",
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
        next: { revalidate: 0 },
      }
    )
    if (!res.ok) return resultsCache

    const data = await res.json()
    const fresh: typeof resultsCache = {}

    for (const m of data.matches ?? []) {
      if (m.status === "FINISHED" && m.score?.fullTime?.home !== null) {
        const matchId = `match_${m.id}`
        const homeShort = m.homeTeam.shortName ?? m.homeTeam.name
        const awayShort = m.awayTeam.shortName ?? m.awayTeam.name
        fresh[matchId] = {
          winner:
            m.score.winner === "HOME_TEAM" ? homeShort
            : m.score.winner === "AWAY_TEAM" ? awayShort
            : null,
          homeScore: m.score.fullTime.home,
          awayScore: m.score.fullTime.away,
        }
      }
    }

    resultsCache = fresh
    cacheTimestamp = Date.now()
  } catch {
    // Return stale cache on error
  }

  return resultsCache
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const liveResults = await fetchLiveResults()

  const merged = matches.map(m => ({
    ...m,
    result: liveResults[m.id] ?? m.result,
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
