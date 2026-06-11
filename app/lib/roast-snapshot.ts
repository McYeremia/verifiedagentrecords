import { generateWithFallback } from "./groq-generate"
import { rememberSafely } from "./walrus-utils"

export type SnapshotTrigger = "PREDICTION" | "RESULT" | "PATTERN"

/** Latest memory of a given prefix, sorted by Timestamp: field descending. */
function latestByType(memories: string[], prefix: string): string | null {
  return memories
    .filter(m => m.startsWith(prefix))
    .sort((a, b) => {
      const ta = a.match(/Timestamp: (.+)/)?.[1]?.trim() ?? ""
      const tb = b.match(/Timestamp: (.+)/)?.[1]?.trim() ?? ""
      return tb.localeCompare(ta)
    })[0] ?? null
}

export async function saveRoastSnapshot(
  userId: string,
  trigger: SnapshotTrigger,
  userMemories: string[]
): Promise<{ roast: string; snapshot: string } | null> {
  if (userMemories.length === 0) return null

  // Tier flags + counts use the FULL history; only the text sent to Groq is
  // capped at 15 (matching roast-engine) so a larger recall limit never inflates
  // the prompt token cost.
  const predCount = userMemories.filter(m => m.startsWith("[PREDICTION]")).length
  const hasResults  = userMemories.some(m => m.startsWith("[RESULT]"))
  const hasPattern  = userMemories.some(m => m.startsWith("[PATTERN]"))
  const hasStreak   = userMemories.some(m => m.startsWith("[STREAK]"))
  const hasChampion = userMemories.some(m => m.startsWith("[CHAMPION_PICK]"))
  const hasChampionResult = userMemories.some(m => m.startsWith("[CHAMPION_RESULT]"))
  const memoryContext = userMemories.slice(0, 15).join("\n")

  // Identify the specific event that triggered this snapshot so Groq reacts to
  // the NEW call, not just the most semantically prominent memory in the pool.
  const triggerLine =
    trigger === "PREDICTION" ? latestByType(userMemories, "[PREDICTION]") :
    trigger === "RESULT"     ? latestByType(userMemories, "[RESULT]")     :
    trigger === "PATTERN"    ? latestByType(userMemories, "[PATTERN]")    :
    null

  const roastText = await generateWithFallback(
    `You are VAR — Verified Agent Records. A ruthlessly honest football prediction referee who remembers EVERY call this user has made.

Prediction track record for user "${userId}":
${memoryContext}
${triggerLine ? `\nTRIGGER EVENT (what just happened — your opening sentence MUST react to this specifically):\n${triggerLine}\n` : ""}
Roast tier to apply:
${!hasResults ? "• TIER 1 (no results yet): Lightly sarcastic and observational. Comment on their team choices. Hint that VAR is watching and waiting." : ""}
${hasResults && !hasPattern ? "• TIER 2 (results in): Call out specific wrong predictions by team name. Be pointed — no mercy for bad calls." : ""}
${hasPattern ? "• TIER 3 (pattern analysis available): Use the PATTERN memory directly. Be savage and specific about their recurring bias." : ""}
${hasStreak ? "• Include the streak if notable (3+ games losing or winning)." : ""}
${hasChampionResult ? "• CHAMPION VERDICT: Their WC 2026 champion pick is resolved — call it out. WRONG = savage, CORRECT = one sentence of grudging credit then back to their match record." : ""}
${hasChampion && !hasChampionResult ? "• CHAMPION rule: They locked a WC 2026 champion pick — mention it. If their match accuracy is weak, question whether this pick will hold up." : ""}

Start directly — no greeting. Casual English. Max 2 sentences. Must reference the trigger event and specific teams from their history.`
  )

  const snapshotText = `[ROAST_SNAPSHOT] User ${userId} after ${predCount} predictions (${trigger}): ${roastText} Timestamp: ${new Date().toISOString()}`
  await rememberSafely(snapshotText)
  return { roast: roastText, snapshot: snapshotText }
}
