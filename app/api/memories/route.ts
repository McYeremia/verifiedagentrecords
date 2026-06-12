import { NextRequest, NextResponse } from "next/server"
import { recallUserMemoriesDetailed, getMemWal } from "../../lib/memwal"

// Zero-Groq: a user's raw memory texts, used to build the /history timeline.
// Kept separate from /api/roast so the 2-hour roast cache never freezes the
// prediction list — a just-written prediction must appear on the next refresh
// once Walrus indexes it, independent of when the verdict was last generated.
// Uses the shared recallUserMemories (45s cache + coalescing), so on the history
// page it reuses the same recall as /api/roast and /api/profile — no extra cost.
//
// [RESULT] records are fetched via a separate targeted recall because the primary
// query (`User ${userId} predictions results forecast streak confidence`) does not
// semantically match [RESULT] records well enough to return them reliably.
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  try {
    const records = await recallUserMemoriesDetailed(userId)

    // Secondary targeted recall for [RESULT] records — the primary query misses
    // them due to semantic distance. Non-fatal: degrade to primary-only on error.
    let resultRecords: { text: string; blob_id: string }[] = []
    try {
      const mem = getMemWal()
      const res = await mem.recall({
        query: `User ${userId} RESULT Match ended predicted CORRECT WRONG`,
        limit: 200,
      })
      const existingTexts = new Set(records.map(r => r.text))
      resultRecords = (res.results ?? [])
        .filter((r: { text: string }) =>
          r.text.startsWith("[RESULT]") &&
          r.text.includes(userId) &&
          !existingTexts.has(r.text)
        )
        .map((r: { text: string; blob_id?: string }) => ({ text: r.text, blob_id: r.blob_id ?? "" }))
    } catch {
      // Non-fatal — degrade to primary recall only
    }

    const allRecords = [...records, ...resultRecords]
    // `memories` (texts) kept for backward compat; `records` adds the Walrus
    // blob_id per memory so the timeline can link each record to the explorer.
    return NextResponse.json({ memories: allRecords.map(r => r.text), records: allRecords })
  } catch {
    // Degrade gracefully under a Walrus rate-limit — empty rather than 500.
    return NextResponse.json({ memories: [], records: [], rateLimited: true })
  }
}
