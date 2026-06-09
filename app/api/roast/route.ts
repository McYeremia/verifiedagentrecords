import { NextRequest, NextResponse } from "next/server";
import { getMemWal } from "../../lib/memwal";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// Per-user in-memory cache — avoids Groq call on every page load
const roastCache = new Map<string, { roast: string; memoriesUsed: number; memories: string[]; ts: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bust   = searchParams.get("bust") === "1";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Return cached roast if still fresh and not busting
  const cached = roastCache.get(userId)
  if (!bust && cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({
      roast: cached.roast,
      memoriesUsed: cached.memoriesUsed,
      memories: cached.memories,
    })
  }

  // ── Step 1: recall from Walrus (separate try-catch) ──────────────────────
  let allUserMemories: Array<{ text: string }> = []
  try {
    const mem = getMemWal();
    const result = await mem.recall({
      query: `User ${userId} predictions results wins losses`,
    });
    allUserMemories = (result.results ?? []).filter(
      (m: { text: string }) => m.text.includes(userId)
    );
  } catch (err) {
    console.error("Walrus recall failed:", err);
    // Return cached memories if available, otherwise empty
    const fallback = roastCache.get(userId)
    return NextResponse.json({
      roast: fallback?.roast ?? "VAR's memory is temporarily unavailable. Your records are safe — try again shortly.",
      memoriesUsed: fallback?.memoriesUsed ?? 0,
      memories: fallback?.memories ?? [],
    });
  }

  if (allUserMemories.length === 0) {
    return NextResponse.json({
      roast: "No predictions yet. Too scared to be wrong?",
      memoriesUsed: 0,
      memories: [],
    });
  }

  // Limit context to 15 most relevant memories to reduce token usage
  const userMemories      = allUserMemories.slice(0, 15)
  const responseMemories  = userMemories.map((m: { text: string }) => m.text)
  const memoryContext     = responseMemories.join("\n")

  // Tier detection uses full list so hasResults/hasPattern aren't lost by the 15-cap
  const hasResults = allUserMemories.some((m: { text: string }) => m.text.startsWith("[RESULT]"))
  const hasPattern = allUserMemories.some((m: { text: string }) => m.text.startsWith("[PATTERN]"))
  const hasStreak  = allUserMemories.some((m: { text: string }) => m.text.startsWith("[STREAK]"))

  // ── Step 2: generate roast with Groq (separate try-catch) ────────────────
  // If Groq fails (rate limit / outage), ALWAYS return memories + fallback roast.
  // This keeps history/predict pages functional even when Groq is unavailable.
  let roast: string
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
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
    });
    roast = text
    // Store fresh result in cache
    roastCache.set(userId, { roast, memoriesUsed: userMemories.length, memories: responseMemories, ts: Date.now() })
  } catch (err) {
    console.error("Groq generation failed:", err);
    // Use cached roast if available — otherwise generic fallback
    // Memories are always returned so the timeline stays intact
    roast = roastCache.get(userId)?.roast
      ?? "VAR's verdict engine is temporarily over capacity. Your prediction records are intact — come back when the dust settles."
  }

  return NextResponse.json({
    roast,
    memoriesUsed: userMemories.length,
    memories: responseMemories,
  });
}
