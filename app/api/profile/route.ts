import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../lib/memwal"
import {
  computeBiasProfile,
  computeConfidenceCalibration,
  detectTraits,
  TRAITS_MIN_PREDICTIONS,
} from "../../lib/bias"

// VAR's dossier on a user — bias traits (#3 Rap Sheet) + confidence calibration
// (#2 Overconfidence Index). Zero Groq; pure aggregation of existing memories.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const mem = getMemWal()
  let memories: string[] = []
  try {
    const res = await mem.recall({ query: `User ${userId} predictions results confidence streak` })
    memories = (res.results ?? [])
      .map((m: { text: string }) => m.text)
      .filter((t: string) => t.includes(userId))
  } catch (e) {
    console.error("profile recall failed:", e)
    return NextResponse.json({ error: "recall failed" }, { status: 500 })
  }

  const profile = computeBiasProfile(memories)
  const calibration = computeConfidenceCalibration(memories)
  const traits = detectTraits(profile, calibration, memories)

  return NextResponse.json({
    profile: {
      predictionCount: profile.predictionCount,
      resultCount: profile.resultCount,
      accuracyPct: profile.accuracyPct,
      homeBiasPct: profile.homeBiasPct,
      drawRatePct: profile.drawRatePct,
      topTeam: profile.topTeam,
      topTeamCount: profile.topTeamCount,
    },
    calibration,
    traits,
    traitsMin: TRAITS_MIN_PREDICTIONS,
  })
}
