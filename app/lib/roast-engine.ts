import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

// Per-user roast cache (30 min) — avoids a Groq call on every page load.
const roastCache = new Map<string, { roast: string; memoriesUsed: number; memories: string[]; ts: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000

// Per-user in-flight generation — concurrent callers share one Groq call.
const inFlightRoast = new Map<string, Promise<RoastResult>>()

export interface RoastResult {
  roast: string
  memoriesUsed: number
  memories: string[]
}

/** Cached roast if still fresh and not busting — lets callers skip the recall. */
export function peekFreshRoast(userId: string, bust = false): RoastResult | null {
  if (bust) return null
  const c = roastCache.get(userId)
  if (c && Date.now() - c.ts < CACHE_TTL_MS) {
    return { roast: c.roast, memoriesUsed: c.memoriesUsed, memories: c.memories }
  }
  return null
}

/** Any cached roast (even stale) — used as a fallback when recall fails. */
export function cachedRoastFallback(userId: string): RoastResult | null {
  const c = roastCache.get(userId)
  return c ? { roast: c.roast, memoriesUsed: c.memoriesUsed, memories: c.memories } : null
}

/**
 * Most recent [ROAST_SNAPSHOT] verdict text from a memory list — zero Groq.
 * Returns null when the user has no snapshot yet. Lets the predict page show a
 * verdict on load without spending tokens (snapshots are written on every
 * prediction + every result, so the latest one is the current verdict).
 */
export function latestSnapshotRoast(memories: string[]): string | null {
  let bestTs = ""
  let bestRoast: string | null = null
  for (const t of memories) {
    if (!t.startsWith("[ROAST_SNAPSHOT]")) continue
    const roastM = t.match(/\(\w+\): (.+) Timestamp:/)
    if (!roastM) continue
    const ts = t.match(/Timestamp: (.+)$/)?.[1]?.trim() ?? ""
    if (ts >= bestTs) { bestTs = ts; bestRoast = roastM[1].trim() }
  }
  return bestRoast
}

/**
 * Seed the cache with an already-generated roast (e.g. the snapshot written on a
 * new prediction) so the next read returns the fresh verdict without a Groq call.
 */
export function primeRoastCache(userId: string, roast: string, memories: string[]): void {
  const userMemories = memories.slice(0, 15)
  roastCache.set(userId, { roast, memoriesUsed: userMemories.length, memories: userMemories, ts: Date.now() })
}

/**
 * Generate (or return cached) VAR roast for pre-recalled memories. Tiered:
 * Day 1 polite → results in (pointed) → pattern available (savage).
 */
export async function getRoast(userId: string, memories: string[], bust = false): Promise<RoastResult> {
  const fresh = peekFreshRoast(userId, bust)
  if (fresh) return fresh

  if (memories.length === 0) {
    return { roast: "No predictions yet. Too scared to be wrong?", memoriesUsed: 0, memories: [] }
  }

  // Coalesce concurrent generations for the same user into a single Groq call.
  // Without this, two near-simultaneous requests (React Strict Mode double-mount,
  // two tabs, a bust racing a load) each see an empty cache and both generate.
  const pending = inFlightRoast.get(userId)
  if (pending) return pending

  const promise = (async (): Promise<RoastResult> => {
    const userMemories = memories.slice(0, 15) // cap context to limit tokens
    const memoryContext = userMemories.join("\n")
    const hasResults = memories.some(t => t.startsWith("[RESULT]"))
    const hasPattern = memories.some(t => t.startsWith("[PATTERN]"))
    const hasStreak  = memories.some(t => t.startsWith("[STREAK]"))

    let roast: string
    try {
      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        maxRetries: 1, // a 429 (esp. daily-token limit) won't clear in seconds — fail fast to the cached fallback
        prompt: `You are VAR — Verified Agent Records. A ruthlessly honest football prediction referee who remembers EVERY call this user has ever made. Your job: roast them based solely on their actual track record below.

Prediction track record for user "${userId}":
${memoryContext}

Roast instructions — apply the HIGHEST tier that fits their data:
${!hasResults ? "• TIER 1 (predictions only, no results yet): Be lightly sarcastic and observational. Comment on their team choices. Hint that VAR is watching and waiting." : ""}
${hasResults && !hasPattern ? "• TIER 2 (results available): Call out specific wrong predictions by team name. Be pointed. No mercy for bad calls." : ""}
${hasPattern ? "• TIER 3 (pattern analysis available): This is the gold. Use the PATTERN analysis directly — name their bias, their blind spots, their recurring mistake. Be savage and specific." : ""}
${hasStreak ? "• STREAK rule: If they have a losing streak of 3+, roast it hard ('at this point just pick the opposite'). If they have a winning streak, give reluctant credit but add a 'but...'." : ""}

Rules:
- Never be generic. Every sentence must reference something specific from their history.
- Mention specific team names they predicted.
- Do NOT start with 'Hey' or any greeting. Start the roast directly.
- Casual English only. Maximum 3 sentences.
- The roast must be impossible to write without seeing this exact prediction history.`,
      })
      roast = text
      roastCache.set(userId, { roast, memoriesUsed: userMemories.length, memories: userMemories, ts: Date.now() })
    } catch (err) {
      console.error("Groq generation failed:", err)
      roast = roastCache.get(userId)?.roast
        ?? "VAR's verdict engine is temporarily over capacity. Your prediction records are intact — come back when the dust settles."
    }

    return { roast, memoriesUsed: userMemories.length, memories: userMemories }
  })()

  inFlightRoast.set(userId, promise)
  try {
    return await promise
  } finally {
    inFlightRoast.delete(userId)
  }
}
