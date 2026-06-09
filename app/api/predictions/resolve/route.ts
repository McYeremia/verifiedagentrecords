import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"
import { getMatchById } from "../../../lib/matches"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { matchId, actualWinner, homeScore, awayScore } = body

    if (!matchId || !actualWinner || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: "matchId, actualWinner, homeScore, awayScore wajib diisi" },
        { status: 400 }
      )
    }

    const match = getMatchById(matchId)
    if (!match) {
      return NextResponse.json({ error: "Match tidak ditemukan" }, { status: 404 })
    }

    const mem = getMemWal()

    const predictions = await mem.recall({
      query: `PREDICTION matchId: ${matchId}`,
    })

    if (!predictions.results || predictions.results.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada prediksi untuk match ini",
        resolved: 0,
      })
    }

    // Extract unique userIds and their predictions for this match
    const userPredictions: Record<string, { predictedWinner: string }> = {}

    for (const result of predictions.results) {
      const text = result.text as string
      if (!text.startsWith("[PREDICTION]")) continue

      const userMatch = text.match(/User (\w+) predicted/)
      const winnerMatch = text.match(/predicted (.+?) to win/)
      const midMatch = text.match(/matchId: ([\w_]+)/)

      if (userMatch && winnerMatch && midMatch && midMatch[1] === matchId) {
        const userId = userMatch[1]
        // Only keep first prediction per user per match
        if (!userPredictions[userId]) {
          userPredictions[userId] = { predictedWinner: winnerMatch[1] }
        }
      }
    }

    const resolvedUsers = Object.keys(userPredictions)
    const summary: Array<{ userId: string; correct: boolean; patternGenerated: boolean }> = []

    for (const userId of resolvedUsers) {
      const { predictedWinner } = userPredictions[userId]
      const isCorrect = predictedWinner.toLowerCase() === actualWinner.toLowerCase()

      const resultText = `[RESULT] Match ${matchId} (${match.homeTeam} vs ${match.awayTeam}) ended: ${actualWinner} won ${homeScore}-${awayScore}. User ${userId} predicted ${predictedWinner} — ${isCorrect ? "CORRECT" : "WRONG"}. Timestamp: ${new Date().toISOString()}`

      const resultJob = await mem.remember(resultText)
      await mem.waitForRememberJob(resultJob.job_id)

      // Count total resolved results for this user
      const userResults = await mem.recall({
        query: `RESULT User ${userId} predicted`,
      })

      const resultCount = (userResults.results || []).filter(
        (r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(`User ${userId}`)
      ).length

      let patternGenerated = false

      if (resultCount > 0 && resultCount % 3 === 0) {
        const allMemories = await mem.recall({
          query: `User ${userId} predictions results wins losses`,
        })

        const memoryContext = (allMemories.results || [])
          .map((m: { text: string }) => m.text)
          .join("\n")

        const correctCount = (allMemories.results || []).filter(
          (r: { text: string }) => r.text.includes("CORRECT") && r.text.includes(userId)
        ).length
        const wrongCount = resultCount - correctCount

        const { text: patternInsight } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt: `Analisis pola prediksi sepak bola dari user "${userId}" berdasarkan rekam jejak berikut:\n\n${memoryContext}\n\nTulis 1-2 kalimat yang mendeskripsikan pola atau bias prediksi mereka secara spesifik. Fokus pada: tim yang sering mereka jagokan, apakah mereka overestimate atau underestimate tim tertentu, pola keakuratan. Gunakan Bahasa Indonesia santai dan sedikit sarkastik.`,
        })

        const patternText = `[PATTERN] User ${userId} after ${resultCount} predictions: ${correctCount} correct, ${wrongCount} wrong (${Math.round((correctCount / resultCount) * 100)}% accuracy). Pattern analysis: ${patternInsight} Timestamp: ${new Date().toISOString()}`

        const patternJob = await mem.remember(patternText)
        await mem.waitForRememberJob(patternJob.job_id)
        patternGenerated = true
      }

      summary.push({ userId, correct: isCorrect, patternGenerated })
    }

    return NextResponse.json({
      success: true,
      matchId,
      actualWinner,
      score: `${homeScore}-${awayScore}`,
      resolved: summary.length,
      summary,
    })
  } catch (error) {
    console.error("Error resolving predictions:", error)
    return NextResponse.json({ error: "Gagal resolve prediksi" }, { status: 500 })
  }
}
