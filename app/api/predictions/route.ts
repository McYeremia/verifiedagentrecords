import { NextRequest, NextResponse } from "next/server";
import { getMemWal } from "../../lib/memwal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, matchId, homeTeam, awayTeam, predictedWinner, confidence } = body;

    if (!userId || !matchId || !predictedWinner) {
      return NextResponse.json(
        { error: "userId, matchId, and predictedWinner are required" },
        { status: 400 }
      );
    }

    const mem = getMemWal();

    // Text stored to Walrus — this is what the roast engine reads later
    const memoryText = `[PREDICTION] User ${userId} predicted ${predictedWinner} to win ${homeTeam} vs ${awayTeam} (matchId: ${matchId}). Confidence: ${confidence || "medium"}. Timestamp: ${new Date().toISOString()}`;

    const job = await mem.remember(memoryText);
    await mem.waitForRememberJob(job.job_id);

    return NextResponse.json({
      success: true,
      message: "Prediction saved to Walrus",
      blob_id: job.job_id,
      prediction: { userId, matchId, homeTeam, awayTeam, predictedWinner, confidence }
    });

  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    );
  }
}