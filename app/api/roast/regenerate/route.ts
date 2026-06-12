import { NextRequest, NextResponse } from "next/server"
import { recallUserMemories, invalidateUserMemories, appendUserMemory, getMemWal } from "../../../lib/memwal"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"
import { primeRoastCache } from "../../../lib/roast-engine"

// Admin endpoint — regenerates a fresh [ROAST_SNAPSHOT] for a user.
// Use after a force-resolve corrects a wrong result: the snapshot written
// during force-resolve used stale context (45s Walrus indexing delay).
// This endpoint does a targeted [RESULT] recall, deduplicates by matchId
// (latest timestamp wins), and feeds the correct context to Groq.
// POST /api/roast/regenerate  { "userId": "0x..." }
// Header: x-admin-secret: var-admin-2026
export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    // Bust cache — force fresh recall so newly indexed records are included
    invalidateUserMemories(userId)
    const memories = await recallUserMemories(userId)

    if (memories.length === 0) {
      return NextResponse.json({ error: "No memories found for user" }, { status: 404 })
    }

    // Targeted recall for [RESULT] records — the primary query misses them.
    // Dedup by matchId taking the LATEST timestamp, so a force-corrected
    // CORRECT record overrides the earlier WRONG one for the same match.
    const mem = getMemWal()
    const resultRecall = await mem.recall({
      query: `User ${userId} RESULT Match ended predicted CORRECT WRONG`,
      limit: 200,
    })
    const resultTexts = (resultRecall.results ?? [])
      .filter((r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(userId))
      .map((r: { text: string }) => r.text)

    const resultByMatch = new Map<string, string>()
    for (const text of resultTexts) {
      const mid = text.match(/Match ([\w_]+)/)?.[1]
      const ts  = text.match(/Timestamp: (.+)$/)?.[1] ?? ""
      if (!mid) continue
      const existing = resultByMatch.get(mid)
      const existingTs = existing?.match(/Timestamp: (.+)$/)?.[1] ?? ""
      if (!existing || ts > existingTs) resultByMatch.set(mid, text)
    }

    // Merge: primary memories + deduped RESULT records (no exact duplicates)
    const existingTexts = new Set(memories)
    const dedupedResults = [...resultByMatch.values()].filter(t => !existingTexts.has(t))
    const allMemories = [...memories, ...dedupedResults]

    const snap = await saveRoastSnapshot(userId, "RESULT", allMemories)
    if (!snap) {
      return NextResponse.json({ error: "Snapshot generation failed (Groq may be rate-limited)" }, { status: 503 })
    }

    appendUserMemory(userId, snap.snapshot)
    primeRoastCache(userId, snap.roast, [...allMemories, snap.snapshot])

    return NextResponse.json({
      success: true,
      roast: snap.roast,
      snapshot: snap.snapshot,
      resultRecordsUsed: [...resultByMatch.values()].map(t => t.slice(0, 120)),
    })
  } catch (err) {
    console.error("[roast/regenerate] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
