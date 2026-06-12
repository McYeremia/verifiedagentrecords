import { NextRequest, NextResponse } from "next/server"
import { getMemWal, invalidateUserMemories } from "../../../lib/memwal"
import { getMatchById } from "../../../lib/matches"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"
import { generateWithFallback } from "../../../lib/groq-generate"
import { rememberSafely } from "../../../lib/walrus-utils"

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { matchId, actualWinner, homeScore, awayScore, force } = body

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
      query: `${match.homeTeam} ${match.awayTeam} predicted win PREDICTION World Cup`,
      limit: 200, // every user who predicted this match — default 10 would leave most unresolved
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

      const userMatch = text.match(/User (0x[a-fA-F0-9]+) predicted/)
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

      // Dedup guard — skip [RESULT] write if this match is already resolved for this user.
      // Check for [LEADERBOARD] too: if RESULT exists but LEADERBOARD is missing (e.g. a
      // prior resolve timed out mid-write), fall through so the leaderboard gets written.
      const existCheck = await mem.recall({
        query: `${match.homeTeam} ${match.awayTeam} RESULT LEADERBOARD User ${userId}`,
        limit: 200,
      })
      const hasResult = (existCheck.results ?? []).some(
        (r: { text: string }) =>
          r.text.startsWith("[RESULT]") &&
          r.text.includes(`Match ${matchId}`) &&
          r.text.includes(`User ${userId}`)
      )
      const hasLeaderboard = (existCheck.results ?? []).some(
        (r: { text: string }) =>
          r.text.startsWith("[LEADERBOARD]") &&
          r.text.includes(`User ${userId}`)
      )
      if (!force && hasResult && hasLeaderboard) continue // fully processed — skip (use force:true to correct a wrong result)

      // Only write [RESULT] if it doesn't already exist
      if (!hasResult) {
        const resultText = `[RESULT] Match ${matchId} (${match.homeTeam} vs ${match.awayTeam}) ended: ${actualWinner} won ${homeScore}-${awayScore}. User ${userId} predicted ${predictedWinner} — ${isCorrect ? "CORRECT" : "WRONG"}. Timestamp: ${new Date().toISOString()}`
        await rememberSafely(resultText)
      }

      // Count total resolved results for this user
      const userResults = await mem.recall({
        query: `RESULT User ${userId} predicted`,
        limit: 200, // full result history drives accuracy + the every-3rd PATTERN trigger
      })

      const filteredResults = (userResults.results || []).filter(
        (r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(`User ${userId}`)
      )
      // Deduplicate by matchId — a match resolved multiple times (e.g. during testing)
      // must count as one resolved prediction, not N.
      const seenMatchIds = new Set<string>()
      const uniqueResults = filteredResults.filter((r: { text: string }) => {
        const mid = r.text.match(/Match ([\w_]+)/)?.[1]
        if (!mid || seenMatchIds.has(mid)) return false
        seenMatchIds.add(mid)
        return true
      })
      const resultCount = uniqueResults.length
      const userCorrectCount = uniqueResults.filter(
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

        const patternInsight = await generateWithFallback(
          `Analyze the football prediction patterns of user "${userId}" based on the following track record:\n\n${memoryContext}\n\nWrite 1-2 sentences describing their prediction patterns or biases. Focus on: teams they frequently back, whether they overestimate or underestimate certain teams, accuracy patterns. Use casual English with a slightly sarcastic tone.`
        )

        const patternText = `[PATTERN] User ${userId} after ${resultCount} predictions: ${userCorrectCount} correct, ${wrongCount} wrong (${Math.round((userCorrectCount / resultCount) * 100)}% accuracy). Pattern analysis: ${patternInsight} Timestamp: ${new Date().toISOString()}`

        await rememberSafely(patternText)
        patternGenerated = true
      }

      // Update leaderboard entry for this user
      // Count total predictions made (all matches, not just resolved) for the leaderboard display
      const allPredRecall = await mem.recall({
        query: `PREDICTION User ${userId} matchId predicted`,
        limit: 200,
      })
      const totalPredCount = new Set(
        (allPredRecall.results ?? [])
          .filter((r: { text: string }) => r.text.startsWith("[PREDICTION]") && r.text.includes(userId))
          .map((r: { text: string }) => r.text.match(/matchId: ([\w_]+)/)?.[1])
          .filter(Boolean)
      ).size || resultCount // fallback to resultCount if recall returns nothing

      const lbAccuracy = resultCount > 0 ? Math.round((userCorrectCount / resultCount) * 100) : 0
      const leaderboardText = `[LEADERBOARD] User ${userId}: ${totalPredCount} predictions, ${resultCount} resolved, ${userCorrectCount} correct, ${lbAccuracy}% accuracy. Last updated: ${new Date().toISOString()}`
      await rememberSafely(leaderboardText)

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
          await rememberSafely(streakText)
        }
      }

      // Save roast snapshot — captures how harsh VAR is at this moment in time
      {
        const snapMem = await mem.recall({ query: `User ${userId} predictions results wins losses`, limit: 200 }) // snapshot tier flags need the complete history
        const snapUserMems = (snapMem.results ?? [])
          .filter((r: { text: string }) => r.text.includes(userId))
          .map((r: { text: string }) => r.text)
        if (snapUserMems.length > 0) {
          await saveRoastSnapshot(userId, patternGenerated ? "PATTERN" : "RESULT", snapUserMems)
        }
      }

      summary.push({ userId, correct: isCorrect, patternGenerated })
      // Clear the per-user recall cache so the next page load (history/predict)
      // gets fresh Walrus data instead of the stale pre-resolve snapshot.
      invalidateUserMemories(userId)
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
