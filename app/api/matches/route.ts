import { NextRequest, NextResponse } from "next/server"
import { matches, getUpcomingMatches, getCompletedMatches } from "../../lib/matches"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  if (searchParams.has("upcoming")) {
    return NextResponse.json({ matches: getUpcomingMatches() })
  }

  if (searchParams.has("completed")) {
    return NextResponse.json({ matches: getCompletedMatches() })
  }

  return NextResponse.json({ matches })
}
