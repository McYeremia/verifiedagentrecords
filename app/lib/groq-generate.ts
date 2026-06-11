import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

// Models tried in order. Groq free tier limits are per-model, so falling back to
// a different model gives additional quota when the primary is exhausted (429).
// llama-3.3-70b: best roast quality. llama-3.1-8b: higher daily limit, faster.
const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const

function isRateLimit(err: unknown): boolean {
  const msg = String(err)
  return msg.includes("429") || (err as { statusCode?: number }).statusCode === 429
}

/**
 * Call Groq with automatic model fallback on 429.
 * Tries FALLBACK_MODELS in order; only advances to the next model on rate-limit.
 * Non-rate-limit errors (auth, bad request, network) propagate immediately.
 * Throws only when ALL models are exhausted.
 */
export async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: unknown
  for (const modelId of FALLBACK_MODELS) {
    try {
      const { text } = await generateText({
        model: groq(modelId),
        maxRetries: 0, // fail fast on 429 retry-after; we do our own fallback below
        prompt,
      })
      return text
    } catch (err) {
      if (!isRateLimit(err)) throw err
      lastError = err
    }
  }
  throw lastError
}
