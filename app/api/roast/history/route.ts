import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const mem = getMemWal()
    const result = await mem.recall({
      query: `ROAST_SNAPSHOT User ${userId} after predictions`,
    })

    const snapshots = (result.results ?? [])
      .map((r: { text: string }) => r.text)
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
    return NextResponse.json({ error: "Failed to fetch roast history" }, { status: 500 })
  }
}
