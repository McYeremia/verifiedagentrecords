import { NextResponse } from "next/server"
import { getMemWal } from "../../lib/memwal"

// 60s in-memory cache — leaderboard changes only on result resolution, not per request.
let leaderboardCache: { texts: string[]; ts: number } | null = null
const LEADERBOARD_TTL = 60_000

export async function GET() {
  if (leaderboardCache && Date.now() - leaderboardCache.ts < LEADERBOARD_TTL) {
    return NextResponse.json({ texts: leaderboardCache.texts })
  }
  try {
    const mem = getMemWal()
    const result = await mem.recall({
      query: "LEADERBOARD user predictions correct accuracy",
      limit: 200, // one [LEADERBOARD] per ranked user — default 10 would truncate the board
    })
    const texts = (result.results || []).map((m: { text: string }) => m.text)
    leaderboardCache = { texts, ts: Date.now() }
    return NextResponse.json({ texts })
  } catch (e) {
    console.error(e)
    // Serve stale cache under rate limit rather than returning empty
    return NextResponse.json({ texts: leaderboardCache?.texts ?? [] })
  }
}
