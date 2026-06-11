import { NextRequest, NextResponse } from "next/server"
import { getMemWal, recallUserMemories, appendUserMemory } from "../../lib/memwal"
import { rememberSafely } from "../../lib/walrus-utils"

// The original locked pick = earliest "Locked in" timestamp (recall is ordered
// by relevance, not time, so position can't be trusted).
function pickEarliest(picks: string[]): string {
  return [...picks].sort((a, b) => {
    const ta = a.match(/Locked in: (.+)/)?.[1] ?? ""
    const tb = b.match(/Locked in: (.+)/)?.[1] ?? ""
    return ta.localeCompare(tb)
  })[0]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // Shared 45s cache — reuses the same recall as /api/bootstrap and /api/profile
    // so a /champion load on a page where the user already visited /predict costs 0
    // extra Walrus requests.
    const memories = await recallUserMemories(userId)
    const picks = memories.filter(
      (t: string) => t.startsWith("[CHAMPION_PICK]") && t.includes(userId)
    )

    if (picks.length === 0) {
      return NextResponse.json({ pick: null })
    }

    // A champion pick is locked forever — the ORIGINAL (earliest "Locked in")
    // is the authoritative one. recall() orders by relevance, not time, so we
    // must sort by timestamp rather than trust array position.
    const original = pickEarliest(picks)
    const teamMatch = original.match(/predicts (.+?) will win/)
    const timeMatch = original.match(/Locked in: (.+)/)

    return NextResponse.json({
      pick: teamMatch?.[1] ?? null,
      lockedAt: timeMatch?.[1] ?? null,
    })
  } catch {
    // Graceful degradation — no 500 if recall fails under rate limit
    return NextResponse.json({ pick: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, team } = await req.json()
    if (!userId || !team) {
      return NextResponse.json({ error: "userId and team are required" }, { status: 400 })
    }

    const mem = getMemWal()

    // Enforce "locked forever" on the server, not just in localStorage. If a
    // pick already exists, reject and return the original so the client can
    // reconcile. On a recall failure we fall through and write rather than
    // block the user (better a rare duplicate than a lost pick).
    try {
      const existing = await recallUserMemories(userId)
      const priorPicks = existing.filter(
        (t: string) => t.startsWith("[CHAMPION_PICK]") && t.includes(userId)
      )
      if (priorPicks.length > 0) {
        const original = pickEarliest(priorPicks)
        return NextResponse.json(
          {
            error: "already_locked",
            message: "Your champion pick is locked forever. VAR doesn't allow takebacks.",
            pick: original.match(/predicts (.+?) will win/)?.[1] ?? null,
            lockedAt: original.match(/Locked in: (.+)/)?.[1] ?? null,
          },
          { status: 409 }
        )
      }
    } catch {
      // recall failed (e.g. rate limit) — proceed to write rather than block.
    }

    const memoryText = `[CHAMPION_PICK] User ${userId} predicts ${team} will win World Cup 2026. Locked in: ${new Date().toISOString()}`
    await rememberSafely(memoryText)
    appendUserMemory(userId, memoryText) // keep shared recall cache fresh

    return NextResponse.json({ success: true, pick: team })
  } catch (error) {
    console.error("Error saving champion pick:", error)
    return NextResponse.json({ error: "Failed to save champion pick" }, { status: 500 })
  }
}
