import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"
import { getMatchById } from "../../../lib/matches"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"

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
        { error: "matchId, actualWinner, homeScore, awayScore are required" },
        { status: 400 }
      )
    }

    const match = getMatchById(matchId)
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    const mem = getMemWal()

    const predictions = await mem.recall({
      query: `PREDICTION matchId: ${matchId}`,
    })

    if (!predictions.results || predictions.results.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No predictions for this match",
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

      const filteredResults = (userResults.results || []).filter(
        (r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(`User ${userId}`)
      )
      const userCorrectCount = filteredResults.filter(
        (r: { text: string }) => r.text.includes("— CORRECT")
      ).length

      let patternGenerated = false

      if (resultCount > 0 && resultCount % 3 === 0) {
        const allMemories = await mem.recall({
          query: `User ${userId} predictions results wins losses`,
        })

        const memoryContext = (allMemories.results || [])
          .map((m: { text: string }) => m.text)
          .join("\n")

        const wrongCount = resultCount - userCorrectCount

        const { text: patternInsight } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt: `Analyze the football prediction patterns of user "${userId}" based on the following track record:\n\n${memoryContext}\n\nWrite 1-2 sentences describing their prediction patterns or biases. Focus on: teams they frequently back, whether they overestimate or underestimate certain teams, accuracy patterns. Use casual English with a slightly sarcastic tone.`,
        })

        const patternText = `[PATTERN] User ${userId} after ${resultCount} predictions: ${userCorrectCount} correct, ${wrongCount} wrong (${Math.round((userCorrectCount / resultCount) * 100)}% accuracy). Pattern analysis: ${patternInsight} Timestamp: ${new Date().toISOString()}`

        const patternJob = await mem.remember(patternText)
        await mem.waitForRememberJob(patternJob.job_id)
        patternGenerated = true
      }

      // Update leaderboard entry for this user
      const lbAccuracy = resultCount > 0 ? Math.round((userCorrectCount / resultCount) * 100) : 0
      const leaderboardText = `[LEADERBOARD] User ${userId}: ${resultCount} predictions, ${userCorrectCount} correct, ${lbAccuracy}% accuracy. Last updated: ${new Date().toISOString()}`
      const lbJob = await mem.remember(leaderboardText)
      await mem.waitForRememberJob(lbJob.job_id)

      // Write [STREAK] — track consecutive wins/losses
      {
        const sorted = [...filteredResults].sort((a: { text: string }, b: { text: string }) => {
          const tsA = a.text.match(/Timestamp: (.+)/)?.[1] ?? ""
          const tsB = b.text.match(/Timestamp: (.+)/)?.[1] ?? ""
          return tsA.localeCompare(tsB)
        })
        const outcomes: boolean[] = sorted.map((r: { text: string }) => r.text.includes("— CORRECT"))
        const alreadyInRecall = filteredResults.some(
          (r: { text: string }) => r.text.includes(`Match ${matchId}`) && r.text.includes(`User ${userId}`)
        )
        if (!alreadyInRecall) outcomes.push(isCorrect)

        if (outcomes.length > 0) {
          const lastOut = outcomes[outcomes.length - 1]
          let streakLen = 1
          for (let i = outcomes.length - 2; i >= 0; i--) {
            if (outcomes[i] === lastOut) streakLen++
            else break
          }
          const streakText = `[STREAK] User ${userId} is on a ${streakLen}-game ${lastOut ? "winning" : "losing"} streak. Last: ${predictedWinner} ${isCorrect ? "CORRECT" : "WRONG"}. Timestamp: ${new Date().toISOString()}`
          const sJob = await mem.remember(streakText)
          await mem.waitForRememberJob(sJob.job_id)
        }
      }

      // Save roast snapshot — captures how harsh VAR is at this moment in time
      {
        const snapMem = await mem.recall({ query: `User ${userId} predictions results wins losses` })
        const snapUserMems = (snapMem.results ?? [])
          .filter((r: { text: string }) => r.text.includes(userId))
          .map((r: { text: string }) => r.text)
        if (snapUserMems.length > 0) {
          await saveRoastSnapshot(userId, patternGenerated ? "PATTERN" : "RESULT", snapUserMems)
        }
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
    return NextResponse.json({ error: "Failed to resolve predictions" }, { status: 500 })
  }
}
