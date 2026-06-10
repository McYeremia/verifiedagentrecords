import { NextRequest, NextResponse } from "next/server"
import { recallUserMemories } from "../../lib/memwal"

// Zero-Groq: a user's raw memory texts, used to build the /history timeline.
// Kept separate from /api/roast so the 2-hour roast cache never freezes the
// prediction list — a just-written prediction must appear on the next refresh
// once Walrus indexes it, independent of when the verdict was last generated.
// Uses the shared recallUserMemories (45s cache + coalescing), so on the history
// page it reuses the same recall as /api/roast and /api/profile — no extra cost.
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  try {
    const memories = await recallUserMemories(userId)
    return NextResponse.json({ memories })
  } catch {
    // Degrade gracefully under a Walrus rate-limit — empty rather than 500.
    return NextResponse.json({ memories: [], rateLimited: true })
  }
}
