import { NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"
import { getMatchByApiId } from "../../../lib/matches"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"
import { generateWithFallback } from "../../../lib/groq-generate"

// 1-minute in-memory cooldown to prevent abuse
let lastSyncTime = 0
const SYNC_COOLDOWN = 60 * 1000

export async function GET() {
  if (Date.now() - lastSyncTime < SYNC_COOLDOWN) {
    return NextResponse.json({ message: "Sync cooldown active — try again in a minute", skipped: true })
  }
  lastSyncTime = Date.now()

  try {
    const apiRes = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches?stage=GROUP_STAGE",
      { headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! } }
    )
    if (!apiRes.ok) {
      return NextResponse.json({ error: "Football API unavailable" }, { status: 502 })
    }

    const apiData = await apiRes.json()
    const finishedMatches = (apiData.matches ?? []).filter(
      (m: { status: string; score: { fullTime: { home: number | null } } }) =>
        m.status === "FINISHED" && m.score?.fullTime?.home !== null
    )

    if (finishedMatches.length === 0) {
      return NextResponse.json({ message: "No finished matches yet", synced: 0 })
    }

    const mem = getMemWal()
    const syncLog: Array<{ matchId: string; usersResolved: number }> = []

    for (const apiMatch of finishedMatches) {
      const match = getMatchByApiId(apiMatch.id)
      if (!match) continue

      const homeShort = apiMatch.homeTeam.shortName ?? apiMatch.homeTeam.name
      const awayShort = apiMatch.awayTeam.shortName ?? apiMatch.awayTeam.name
      const actualWinner =
        apiMatch.score.winner === "HOME_TEAM" ? homeShort
        : apiMatch.score.winner === "AWAY_TEAM" ? awayShort
        : apiMatch.score.winner === "DRAW" ? "Draw"
        : null

      const homeScore: number = apiMatch.score.fullTime.home
      const awayScore: number = apiMatch.score.fullTime.away

      const predRecall = await mem.recall({
        query: `PREDICTION matchId: ${match.id} predicted win`,
        limit: 200, // every user who predicted this match
      })

      const predTexts: string[] = (predRecall.results ?? [])
        .map((r: { text: string }) => r.text)
        .filter((t: string) => t.startsWith("[PREDICTION]") && t.includes(`matchId: ${match.id}`))

      if (predTexts.length === 0) {
        syncLog.push({ matchId: match.id, usersResolved: 0 })
        continue
      }

      const userPreds: Record<string, string> = {}
      for (const text of predTexts) {
        const userM = text.match(/User (0x[a-fA-F0-9]+) predicted/)
        const winnerM = text.match(/predicted (.+?) to win/)
        if (userM && winnerM && !userPreds[userM[1]]) {
          userPreds[userM[1]] = winnerM[1]
        }
      }

      let resolved = 0

      for (const [userId, predictedWinner] of Object.entries(userPreds)) {
        const existCheck = await mem.recall({
          query: `RESULT Match ${match.id} User ${userId}`,
          limit: 200, // dedupe guard — must not miss an existing [RESULT] beyond the top 10
        })
        const alreadyDone = (existCheck.results ?? []).some(
          (r: { text: string }) =>
            r.text.startsWith("[RESULT]") &&
            r.text.includes(`Match ${match.id}`) &&
            r.text.includes(`User ${userId}`)
        )
        if (alreadyDone) continue

        const isCorrect = actualWinner !== null &&
          predictedWinner.toLowerCase() === actualWinner.toLowerCase()

        const resultText = `[RESULT] Match ${match.id} (${match.homeTeam} vs ${match.awayTeam}) ended: ${actualWinner ?? "Draw"} won ${homeScore}-${awayScore}. User ${userId} predicted ${predictedWinner} — ${isCorrect ? "CORRECT" : "WRONG"}. Timestamp: ${new Date().toISOString()}`
        const rJob = await mem.remember(resultText)
        await mem.waitForRememberJob(rJob.job_id)

        const userResults = await mem.recall({ query: `RESULT User ${userId} predicted`, limit: 200 }) // full result history drives accuracy + PATTERN trigger
        const userResultTexts = (userResults.results ?? []).filter(
          (r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(`User ${userId}`)
        )
        // Deduplicate by matchId — same match resolved multiple times must count as one
        const seenMids = new Set<string>()
        const uniqueResultTexts = userResultTexts.filter((r: { text: string }) => {
          const mid = r.text.match(/Match ([\w_]+)/)?.[1]
          if (!mid || seenMids.has(mid)) return false
          seenMids.add(mid)
          return true
        })
        const resultCount = uniqueResultTexts.length
        const correctCount = uniqueResultTexts.filter(
          (r: { text: string }) => r.text.includes("— CORRECT")
        ).length

        if (resultCount > 0 && resultCount % 3 === 0) {
          const allMem = await mem.recall({ query: `User ${userId} predictions results wins losses` })
          const ctx = (allMem.results ?? []).map((m: { text: string }) => m.text).join("\n")
          const insight = await generateWithFallback(
            `Analyze the football prediction patterns of user "${userId}":\n\n${ctx}\n\nWrite 1-2 sentences about their prediction bias. Use casual English with a sarcastic tone.`
          )
          const patternText = `[PATTERN] User ${userId} after ${resultCount} predictions: ${correctCount} correct, ${resultCount - correctCount} wrong (${Math.round((correctCount / resultCount) * 100)}% accuracy). Pattern analysis: ${insight} Timestamp: ${new Date().toISOString()}`
          const pJob = await mem.remember(patternText)
          await mem.waitForRememberJob(pJob.job_id)
        }

        const accuracy = resultCount > 0 ? Math.round((correctCount / resultCount) * 100) : 0
        const lbText = `[LEADERBOARD] User ${userId}: ${resultCount} predictions, ${correctCount} correct, ${accuracy}% accuracy. Last updated: ${new Date().toISOString()}`
        const lbJob = await mem.remember(lbText)
        await mem.waitForRememberJob(lbJob.job_id)

        // Write [STREAK] — track consecutive wins/losses
        {
          const sorted = [...userResultTexts].sort((a: { text: string }, b: { text: string }) => {
            const tsA = a.text.match(/Timestamp: (.+)/)?.[1] ?? ""
            const tsB = b.text.match(/Timestamp: (.+)/)?.[1] ?? ""
            return tsA.localeCompare(tsB)
          })
          const outcomes: boolean[] = sorted.map((r: { text: string }) => r.text.includes("— CORRECT"))
          const alreadyInRecall = userResultTexts.some(
            (r: { text: string }) => r.text.includes(`Match ${match.id}`) && r.text.includes(`User ${userId}`)
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

        // Save roast snapshot for this user
        {
          const snapMem = await mem.recall({ query: `User ${userId} predictions results wins losses`, limit: 200 }) // snapshot tier flags need the complete history
          const snapUserMems = (snapMem.results ?? [])
            .filter((r: { text: string }) => r.text.includes(userId))
            .map((r: { text: string }) => r.text)
          if (snapUserMems.length > 0) {
            await saveRoastSnapshot(userId, "RESULT", snapUserMems)
          }
        }

        resolved++
      }

      syncLog.push({ matchId: match.id, usersResolved: resolved })
    }

    const totalResolved = syncLog.reduce((s, l) => s + l.usersResolved, 0)

    return NextResponse.json({
      success: true,
      finishedMatchesChecked: finishedMatches.length,
      totalUsersResolved: totalResolved,
      log: syncLog,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
