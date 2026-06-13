import { NextResponse } from "next/server"
import { getMemWal, invalidateUserMemories, recallUserMemories } from "../../../lib/memwal"
import { getMatchByApiId } from "../../../lib/matches"
import { saveRoastSnapshot } from "../../../lib/roast-snapshot"
import { generateWithFallback } from "../../../lib/groq-generate"
import { rememberSafely } from "../../../lib/walrus-utils"

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
    const syncLog: Array<{ matchId: string; usersResolved: number; debug?: unknown }> = []

    for (const apiMatch of finishedMatches) {
      const match = getMatchByApiId(apiMatch.id)
      if (!match) continue

      // Use internal team names (match.homeTeam/awayTeam) so the winner string
      // matches what users stored in their [PREDICTION] records. The football-data
      // API may return "Korea Republic" while our system uses "South Korea".
      const actualWinner =
        apiMatch.score.winner === "HOME_TEAM" ? match.homeTeam
        : apiMatch.score.winner === "AWAY_TEAM" ? match.awayTeam
        : apiMatch.score.winner === "DRAW" ? "Draw"
        : null

      const homeScore: number = apiMatch.score.fullTime.home
      const awayScore: number = apiMatch.score.fullTime.away

      // Strategy 1: generic recall that should match ANY prediction record
      const predRecall = await mem.recall({
        query: "PREDICTION User predicted to win Confidence Timestamp matchId",
        limit: 200,
      })

      const debugSample = (predRecall.results ?? []).slice(0, 5).map((r: { text: string }) => ({
        preview: r.text.slice(0, 100),
        isPrediction: r.text.startsWith("[PREDICTION]"),
        hasThisMatch: r.text.includes(`matchId: ${match.id}`),
      }))

      let predTexts: string[] = (predRecall.results ?? [])
        .map((r: { text: string }) => r.text)
        .filter((t: string) => t.startsWith("[PREDICTION]") && t.includes(`matchId: ${match.id}`))

      // Strategy 2: fallback via all known userIds (leaderboard + broader recall)
      if (predTexts.length === 0) {
        const [lbRecall, broadRecall] = await Promise.all([
          mem.recall({ query: "LEADERBOARD User predictions accuracy resolved correct", limit: 200 }),
          mem.recall({ query: `${match.homeTeam} ${match.awayTeam} predicted win`, limit: 200 }),
        ])
        const allTexts = [
          ...(lbRecall.results ?? []).map((r: { text: string }) => r.text),
          ...(broadRecall.results ?? []).map((r: { text: string }) => r.text),
        ]
        const knownUserIds = [...new Set(
          allTexts
            .map((t: string) => t.match(/User (0x[a-fA-F0-9]+)/)?.[1])
            .filter(Boolean) as string[]
        )]

        for (const uid of knownUserIds) {
          const userMems = await recallUserMemories(uid)
          const pred = userMems.find(t =>
            t.startsWith("[PREDICTION]") &&
            t.includes(uid) &&
            t.includes(`matchId: ${match.id}`)
          )
          if (pred && !predTexts.includes(pred)) predTexts.push(pred)
        }
      }

      if (predTexts.length === 0) {
        syncLog.push({ matchId: match.id, usersResolved: 0, debug: { strategy1Results: predRecall.results?.length ?? 0, sample: debugSample } })
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
       // Per-user isolation: a Walrus 429 (this loop makes many weighted requests)
       // must not abort the whole sync. Skip the failing user and continue; the next
       // cron run picks them up (the RESULT dedup skips the ones already done).
       try {
        const existCheck = await mem.recall({
          // RESULT-anchored query so the exact prior [RESULT] for this match ranks at
          // the top — a team-name-led query got diluted and (under the relayer's
          // 100-result cap) missed the existing record, re-resolving the match with
          // contradictory data (e.g. Canada stored as both "Bosnia 0-2" and "Draw 1-1").
          query: `RESULT Match ${match.homeTeam} ${match.awayTeam} User ${userId} predicted ended CORRECT WRONG`,
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
        await rememberSafely(resultText)

        const userResults = await mem.recall({ query: `RESULT User ${userId} predicted`, limit: 200 }) // full result history drives accuracy + PATTERN trigger
        const userResultTexts = (userResults.results ?? []).filter(
          (r: { text: string }) => r.text.startsWith("[RESULT]") && r.text.includes(`User ${userId}`)
        )
        // Deduplicate by matchId — same match resolved multiple times must count as
        // one, and the latest timestamp wins so a corrected result supersedes a wrong one.
        const seenMids = new Set<string>()
        const uniqueResultTexts = [...userResultTexts]
          .sort((a: { text: string }, b: { text: string }) =>
            (b.text.match(/Timestamp: (.+)/)?.[1] ?? "").localeCompare(a.text.match(/Timestamp: (.+)/)?.[1] ?? "")
          )
          .filter((r: { text: string }) => {
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
          // Groq-dependent — best-effort. A 429 (daily quota) here must NOT abort the
          // sync loop, or later matches stay unresolved and no snapshot ever writes.
          try {
            const allMem = await mem.recall({ query: `User ${userId} predictions results wins losses` })
            const ctx = (allMem.results ?? []).map((m: { text: string }) => m.text).join("\n")
            const insight = await generateWithFallback(
              `Analyze the football prediction patterns of user "${userId}":\n\n${ctx}\n\nWrite 1-2 sentences about their prediction bias. Use casual English with a sarcastic tone.`
            )
            const patternText = `[PATTERN] User ${userId} after ${resultCount} predictions: ${correctCount} correct, ${resultCount - correctCount} wrong (${Math.round((correctCount / resultCount) * 100)}% accuracy). Pattern analysis: ${insight} Timestamp: ${new Date().toISOString()}`
            await rememberSafely(patternText)
          } catch (e) {
            console.warn(`Sync: PATTERN generation failed for ${userId} (Groq?) — skipping, RESULT already saved:`, e)
          }
        }

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
        ).size || resultCount

        const accuracy = resultCount > 0 ? Math.round((correctCount / resultCount) * 100) : 0
        const lbText = `[LEADERBOARD] User ${userId}: ${totalPredCount} predictions, ${resultCount} resolved, ${correctCount} correct, ${accuracy}% accuracy. Last updated: ${new Date().toISOString()}`
        await rememberSafely(lbText)

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
            await rememberSafely(streakText)
          }
        }

        // Save roast snapshot for this user — Groq-dependent, best-effort.
        // A 429 must NOT abort the loop: the RESULT/LEADERBOARD/STREAK above are the
        // critical records; the snapshot is a replayable nicety. On failure the page
        // keeps showing the last good snapshot (per the zero-Groq replay design).
        try {
          const snapMem = await mem.recall({ query: `User ${userId} predictions results wins losses`, limit: 200 }) // snapshot tier flags need the complete history
          const snapUserMems = (snapMem.results ?? [])
            .filter((r: { text: string }) => r.text.includes(userId))
            .map((r: { text: string }) => r.text)
          if (snapUserMems.length > 0) {
            await saveRoastSnapshot(userId, "RESULT", snapUserMems)
          }
        } catch (e) {
          console.warn(`Sync: snapshot failed for ${userId} (Groq?) — result still resolved:`, e)
        }

        invalidateUserMemories(userId)
        resolved++
       } catch (e) {
        console.warn(`Sync: failed for ${userId} (Walrus 429?) — skipped, self-heals next run:`, e)
       }
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
