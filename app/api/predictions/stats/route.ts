import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"
import { getMatchById } from "../../../lib/matches"

// Per-match aggregate cache (60s) — these recalls also count against the Walrus
// rate limit, and pick % barely changes minute-to-minute.
const statsCache = new Map<string, { data: { total: number; picks: Record<string, number> }; ts: number }>()
const STATS_TTL = 60_000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get("matchId")

  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 })

  const match = getMatchById(matchId)
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

  const cached = statsCache.get(matchId)
  if (cached && Date.now() - cached.ts < STATS_TTL) return NextResponse.json(cached.data)

  try {
    const mem = getMemWal()
    const recall = await mem.recall({ query: `PREDICTION matchId: ${matchId} predicted win`, limit: 200 }) // all predictions for this match — default 10 undercounts pick %

    const predictions = (recall.results ?? [])
      .map((r: { text: string }) => r.text)
      .filter((t: string) => t.startsWith("[PREDICTION]") && t.includes(`matchId: ${matchId}`))

    const counts: Record<string, number> = {}
    for (const text of predictions) {
      const m = text.match(/predicted (.+?) to win/)
      if (m) counts[m[1]] = (counts[m[1]] ?? 0) + 1
    }

    const total = Object.values(counts).reduce((s, c) => s + c, 0)
    const picks: Record<string, number> = {}
    for (const [team, count] of Object.entries(counts)) {
      picks[team] = total > 0 ? Math.round((count / total) * 100) : 0
    }

    const data = { total, picks }
    statsCache.set(matchId, { data, ts: Date.now() })
    return NextResponse.json(data)
  } catch {
    // Serve stale cache if present, else a soft-empty payload (never 500 the UI).
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ total: 0, picks: {}, rateLimited: true })
  }
}
