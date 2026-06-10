import { NextRequest, NextResponse } from "next/server";
import { recallUserMemories } from "../../lib/memwal";
import { getRoast, peekFreshRoast, cachedRoastFallback } from "../../lib/roast-engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bust   = searchParams.get("bust") === "1";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Fast path — fresh cached roast, no Walrus recall needed.
  const fresh = peekFreshRoast(userId, bust)
  if (fresh) return NextResponse.json(fresh)

  let memories: string[]
  try {
    memories = await recallUserMemories(userId)
  } catch (err) {
    console.error("Walrus recall failed:", err);
    // Degraded: serve cached roast if any, and `null` memories (NOT []) so the
    // client can tell "recall failed" apart from "no predictions".
    const fb = cachedRoastFallback(userId)
    return NextResponse.json({
      roast: fb?.roast ?? "VAR's memory is temporarily unavailable. Your records are safe — try again shortly.",
      memoriesUsed: fb?.memoriesUsed ?? 0,
      memories: fb?.memories ?? null,
      degraded: true,
    });
  }

  const result = await getRoast(userId, memories, bust)
  return NextResponse.json(result)
}
