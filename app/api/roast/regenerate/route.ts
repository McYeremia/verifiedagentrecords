import { NextRequest, NextResponse } from "next/server"
import { recallUserMemories, invalidateUserMemories, appendUserMemory } from "../../../lib/memwal"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"
import { primeRoastCache } from "../../../lib/roast-engine"

// Admin endpoint — regenerates a fresh [ROAST_SNAPSHOT] for a user using
// current Walrus data. Use after a force-resolve corrects a wrong result:
// the snapshot written during force-resolve used stale context (45s delay),
// so this replaces it with a correct verdict.
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
    // Bust cache so the recall fetches fresh data including newly indexed results
    invalidateUserMemories(userId)
    const memories = await recallUserMemories(userId)

    if (memories.length === 0) {
      return NextResponse.json({ error: "No memories found for user" }, { status: 404 })
    }

    const snap = await saveRoastSnapshot(userId, "RESULT", memories)
    if (!snap) {
      return NextResponse.json({ error: "Snapshot generation failed (Groq may be rate-limited)" }, { status: 503 })
    }

    appendUserMemory(userId, snap.snapshot)
    primeRoastCache(userId, snap.roast, [...memories, snap.snapshot])

    return NextResponse.json({ success: true, roast: snap.roast, snapshot: snap.snapshot })
  } catch (err) {
    console.error("[roast/regenerate] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
