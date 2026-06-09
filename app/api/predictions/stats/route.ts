import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"
import { getMatchById } from "../../../lib/matches"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get("matchId")

  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 })

  const match = getMatchById(matchId)
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

  try {
    const mem = getMemWal()
    const recall = await mem.recall({ query: `PREDICTION matchId: ${matchId} predicted win` })

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

    return NextResponse.json({ total, picks })
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
