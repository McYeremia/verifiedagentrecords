import { NextRequest, NextResponse } from "next/server";
import {
  getMemWal,
  appendUserMemory,
  recallUserMemories,
  hasPredictedMatch,
  markPredictedMatch,
} from "../../lib/memwal";
import { saveRoastSnapshot } from "../../lib/roast-snapshot";
import { primeRoastCache } from "../../lib/roast-engine";
import { computeScoreboard } from "../../lib/bias";
import { getMatchById, isPredictionClosed } from "../../lib/matches";

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

    // Predictions lock at kickoff — server-side guard (the UI also blocks it, but
    // this catches clock skew / direct API calls). Absolute time via the +07:00
    // (WIB) offset baked into getKickoff, so it's independent of server timezone.
    const matchForDeadline = getMatchById(matchId);
    if (matchForDeadline && isPredictionClosed(matchForDeadline)) {
      return NextResponse.json(
        { error: "predictions_closed", message: "This match has kicked off. VAR locks predictions at kickoff." },
        { status: 403 }
      );
    }

    const mem = getMemWal();

    // One prediction per match, locked forever — reject any re-prediction.
    // 1) Durable in-process index — reliable even when a live recall is rate-limited.
    // 2) Shared recall cache as a backstop (also catches predictions made on other
    //    server instances / before this process started). If the recall itself
    //    fails, we fall through and write rather than 500 — better a rare duplicate
    //    than blocking the user.
    let already: string | undefined;
    if (hasPredictedMatch(userId, matchId)) {
      already = "indexed";
    } else {
      let priorMemories: string[] = [];
      try {
        priorMemories = await recallUserMemories(userId);
      } catch {
        priorMemories = [];
      }
      already = priorMemories.find(
        (t: string) =>
          t.startsWith("[PREDICTION]") &&
          t.includes(userId) &&
          t.includes(`(matchId: ${matchId})`)
      );
    }
    if (already) {
      const winnerM = already === "indexed" ? null : already.match(/predicted (.+?) to win/);
      return NextResponse.json(
        {
          error: "already_predicted",
          message: "You already predicted this match. VAR locks every call forever.",
          predictedWinner: winnerM?.[1] ?? null,
          matchId,
        },
        { status: 409 }
      );
    }

    // Text stored to Walrus — this is what the roast engine reads later
    const memoryText = `[PREDICTION] User ${userId} predicted ${predictedWinner} to win ${homeTeam} vs ${awayTeam} (matchId: ${matchId}). Confidence: ${confidence || "medium"}. Timestamp: ${new Date().toISOString()}`;

    const job = await mem.remember(memoryText);
    await mem.waitForRememberJob(job.job_id);
    appendUserMemory(userId, memoryText);     // keep shared recall cache fresh
    markPredictedMatch(userId, matchId);      // durable lock — survives later recall failures

    // Freeze a [ROAST_SNAPSHOT] for the timeline (one Groq call, reused as the
    // live verdict so the predict page doesn't fire a second roast). Non-fatal.
    let roast: string | null = null;
    let memories: string[] | null = null;
    let knowsYou = { total: 0, hits: 0, knowsYouPct: 0 };
    try {
      const userMems = await recallUserMemories(userId); // includes the new prediction
      const snap = await saveRoastSnapshot(userId, "PREDICTION", userMems);
      const finalMems = snap ? [...userMems, snap.snapshot] : userMems;
      memories = finalMems;
      knowsYou = computeScoreboard(finalMems);
      if (snap) {
        roast = snap.roast;
        appendUserMemory(userId, snap.snapshot);
        primeRoastCache(userId, snap.roast, finalMems); // so bootstrap returns the fresh verdict
      }
    } catch (e) {
      console.error("prediction snapshot failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Prediction saved to Walrus",
      blob_id: job.job_id,
      prediction: { userId, matchId, homeTeam, awayTeam, predictedWinner, confidence },
      roast,
      memories,
      knowsYou,
    });

  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    );
  }
}