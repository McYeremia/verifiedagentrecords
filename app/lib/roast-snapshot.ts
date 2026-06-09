import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getMemWal } from "./memwal"

export type SnapshotTrigger = "PREDICTION" | "RESULT" | "PATTERN"

export async function saveRoastSnapshot(
  userId: string,
  trigger: SnapshotTrigger,
  userMemories: string[]
): Promise<void> {
  if (userMemories.length === 0) return

  const groq = createOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  })

  const predCount = userMemories.filter(m => m.startsWith("[PREDICTION]")).length
  const hasResults = userMemories.some(m => m.startsWith("[RESULT]"))
  const hasPattern = userMemories.some(m => m.startsWith("[PATTERN]"))
  const hasStreak  = userMemories.some(m => m.startsWith("[STREAK]"))
  const memoryContext = userMemories.join("\n")

  const { text: roastText } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: `You are VAR — Verified Agent Records. A ruthlessly honest football prediction referee who remembers EVERY call this user has made.

Prediction track record for user "${userId}":
${memoryContext}

Roast tier to apply:
${!hasResults ? "• TIER 1 (no results yet): Lightly sarcastic and observational. Comment on their team choices. Hint that VAR is watching and waiting." : ""}
${hasResults && !hasPattern ? "• TIER 2 (results in): Call out specific wrong predictions by team name. Be pointed — no mercy for bad calls." : ""}
${hasPattern ? "• TIER 3 (pattern analysis available): Use the PATTERN memory directly. Be savage and specific about their recurring bias." : ""}
${hasStreak ? "• Include the streak if notable (3+ games losing or winning)." : ""}

Start directly — no greeting. Casual English. Max 2 sentences. Must reference specific teams from their history.`,
  })

  const mem = getMemWal()
  const snapshotText = `[ROAST_SNAPSHOT] User ${userId} after ${predCount} predictions (${trigger}): ${roastText} Timestamp: ${new Date().toISOString()}`
  const job = await mem.remember(snapshotText)
  await mem.waitForRememberJob(job.job_id)
}
