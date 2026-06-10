import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { actualWinner, userId } = await req.json()
    if (!actualWinner || !userId) {
      return NextResponse.json({ error: "actualWinner and userId are required" }, { status: 400 })
    }

    const mem = getMemWal()

    // Find user's champion pick
    const result = await mem.recall({
      query: `CHAMPION_PICK User ${userId} World Cup 2026 predicts win`,
    })

    const picks = (result.results || [])
      .map((m: { text: string }) => m.text)
      .filter((t: string) => t.startsWith("[CHAMPION_PICK]") && t.includes(userId))

    if (picks.length === 0) {
      return NextResponse.json({ error: "No champion pick found for this user" }, { status: 404 })
    }

    // Resolve against the ORIGINAL locked pick (earliest "Locked in"), not array
    // position — recall() orders by relevance, not time.
    const original = [...picks].sort((a, b) => {
      const ta = a.match(/Locked in: (.+)/)?.[1] ?? ""
      const tb = b.match(/Locked in: (.+)/)?.[1] ?? ""
      return ta.localeCompare(tb)
    })[0]
    const teamMatch = original.match(/predicts (.+?) will win/)
    const predictedTeam = teamMatch?.[1] ?? "Unknown"
    const isCorrect = predictedTeam.toLowerCase() === actualWinner.toLowerCase()

    const memoryText = `[CHAMPION_RESULT] User ${userId} predicted ${predictedTeam} for World Cup 2026 champion — ${isCorrect ? "CORRECT" : "WRONG"}. Actual champion: ${actualWinner}. Resolved: ${new Date().toISOString()}`
    const job = await mem.remember(memoryText)
    await mem.waitForRememberJob(job.job_id)

    return NextResponse.json({ success: true, isCorrect, predictedTeam, actualWinner })
  } catch (error) {
    console.error("Error resolving champion:", error)
    return NextResponse.json({ error: "Failed to resolve champion" }, { status: 500 })
  }
}
