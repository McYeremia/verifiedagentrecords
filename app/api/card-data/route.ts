import { NextRequest, NextResponse } from "next/server"
import { recallUserMemories } from "../../lib/memwal"

// Returns roast from latest saved snapshot + stats from leaderboard.
// Zero Groq calls — reads only from Walrus memory.
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    // Single shared recall (45s cache, limit:200) — replaces two direct mem.recall()
    // calls that bypassed the cache and doubled the Walrus request count on landing.
    const memories = await recallUserMemories(userId)

    // Parse snapshots, keep only this user's, sort newest first
    const snapshots = memories
      .filter((t: string) => t.startsWith("[ROAST_SNAPSHOT]") && t.includes(userId))
      .map((text: string) => {
        const predCountM = text.match(/after (\d+) predictions/)
        const triggerM   = text.match(/predictions \((\w+)\):/)
        const tsM        = text.match(/Timestamp: (.+)$/)
        const roastM     = text.match(/\(\w+\): (.+) Timestamp:/)
        return {
          roast:           roastM?.[1]?.trim() ?? "",
          trigger:         triggerM?.[1] ?? "PREDICTION",
          predictionCount: parseInt(predCountM?.[1] ?? "0"),
          timestamp:       tsM?.[1]?.trim() ?? "",
        }
      })
      .filter((s: { roast: string; timestamp: string }) => s.roast && s.timestamp)
      .sort((a: { timestamp: string }, b: { timestamp: string }) =>
        b.timestamp.localeCompare(a.timestamp)
      )

    const latest = snapshots[0] ?? null

    // Parse stats from latest leaderboard entry for this user
    const lbTexts: string[] = memories
      .filter((t: string) => t.startsWith("[LEADERBOARD]") && t.includes(userId))

    let stats = { total: 0, correct: 0, wrong: 0, accuracy: 0 }
    if (lbTexts.length > 0) {
      const best = lbTexts.reduce((a, b) => {
        const aP = parseInt(a.match(/(\d+) predictions/)?.[1] ?? "0")
        const bP = parseInt(b.match(/(\d+) predictions/)?.[1] ?? "0")
        return bP > aP ? b : a
      })
      const total    = parseInt(best.match(/(\d+) predictions/)?.[1]  ?? "0")
      const correct  = parseInt(best.match(/(\d+) correct/)?.[1]      ?? "0")
      const accuracy = parseInt(best.match(/(\d+)% accuracy/)?.[1]    ?? "0")
      stats = { total, correct, wrong: total - correct, accuracy }
    }

    return NextResponse.json({
      roast:           latest?.roast           ?? "",
      trigger:         latest?.trigger         ?? null,
      predictionCount: latest?.predictionCount ?? 0,
      memoriesUsed:    snapshots.length,
      stats,
    })
  } catch {
    // Graceful degradation under Walrus 429 — serve empty state rather than 500
    // so LiveRoastBanner keeps showing the localStorage paint cache instead of erroring.
    return NextResponse.json({
      roast: "", trigger: null, predictionCount: 0, memoriesUsed: 0,
      stats: { total: 0, correct: 0, wrong: 0, accuracy: 0 },
      rateLimited: true,
    })
  }
}
