import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../lib/memwal"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const mem = getMemWal()
    const result = await mem.recall({
      query: `CHAMPION_PICK User ${userId} World Cup 2026 predicts win`,
    })

    const picks = (result.results || [])
      .map((m: { text: string }) => m.text)
      .filter((t: string) => t.startsWith("[CHAMPION_PICK]") && t.includes(userId))

    if (picks.length === 0) {
      return NextResponse.json({ pick: null })
    }

    const latest = picks[picks.length - 1]
    const teamMatch = latest.match(/predicts (.+?) will win/)
    const timeMatch = latest.match(/Locked in: (.+)/)

    return NextResponse.json({
      pick: teamMatch?.[1] ?? null,
      lockedAt: timeMatch?.[1] ?? null,
    })
  } catch (error) {
    console.error("Error getting champion pick:", error)
    return NextResponse.json({ error: "Failed to get champion pick" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, team } = await req.json()
    if (!userId || !team) {
      return NextResponse.json({ error: "userId and team are required" }, { status: 400 })
    }

    const mem = getMemWal()
    const memoryText = `[CHAMPION_PICK] User ${userId} predicts ${team} will win World Cup 2026. Locked in: ${new Date().toISOString()}`
    const job = await mem.remember(memoryText)
    await mem.waitForRememberJob(job.job_id)

    return NextResponse.json({ success: true, pick: team })
  } catch (error) {
    console.error("Error saving champion pick:", error)
    return NextResponse.json({ error: "Failed to save champion pick" }, { status: 500 })
  }
}
