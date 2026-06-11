import { NextRequest, NextResponse } from "next/server"
import { recallUserMemories } from "../../../lib/memwal"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    // Uses shared 45s cache (limit: 200) — no extra Walrus request vs /api/memories
    // on a /history page load that already called the shared recall.
    const memories = await recallUserMemories(userId)

    const snapshots = memories
      .filter((t: string) => t.startsWith("[ROAST_SNAPSHOT]") && t.includes(userId))
      .map((text: string) => {
        const predCountM = text.match(/after (\d+) predictions/)
        const triggerM   = text.match(/predictions \((\w+)\):/)
        const tsM        = text.match(/Timestamp: (.+)$/)
        // roast text = everything between "): " and " Timestamp:"
        const roastM     = text.match(/\(\w+\): (.+) Timestamp:/)
        return {
          roast:           roastM?.[1]?.trim() ?? "",
          trigger:         triggerM?.[1] ?? "PREDICTION",
          predictionCount: parseInt(predCountM?.[1] ?? "0"),
          timestamp:       tsM?.[1]?.trim() ?? "",
        }
      })
      .filter(s => s.roast && s.timestamp)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

    return NextResponse.json({ snapshots })
  } catch {
    // Degrade gracefully under rate limit — empty list rather than 500.
    return NextResponse.json({ snapshots: [], rateLimited: true })
  }
}
