import { NextRequest, NextResponse } from "next/server";
import { getMemWal } from "../../lib/memwal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, matchId, homeTeam, awayTeam, predictedWinner, confidence } = body;

    if (!userId || !matchId || !predictedWinner) {
      return NextResponse.json(
        { error: "userId, matchId, dan predictedWinner wajib diisi" },
        { status: 400 }
      );
    }

    const mem = getMemWal();

    // Teks yang disimpan ke Walrus — ini yang nanti dibaca roast engine
    const memoryText = `[PREDICTION] User ${userId} predicted ${predictedWinner} to win ${homeTeam} vs ${awayTeam} (matchId: ${matchId}). Confidence: ${confidence || "medium"}. Timestamp: ${new Date().toISOString()}`;

    const job = await mem.remember(memoryText);
    await mem.waitForRememberJob(job.job_id);

    return NextResponse.json({
      success: true,
      message: "Prediksi tersimpan di Walrus",
      blob_id: job.job_id,
      prediction: { userId, matchId, homeTeam, awayTeam, predictedWinner, confidence }
    });

  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan prediksi" },
      { status: 500 }
    );
  }
}