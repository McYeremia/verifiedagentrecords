import { NextResponse } from "next/server"
import { getMemWal } from "../../lib/memwal"

export async function GET() {
  try {
    const mem = getMemWal()
    const result = await mem.recall({
      query: "LEADERBOARD user predictions correct accuracy",
    })

    const texts = (result.results || []).map((m: { text: string }) => m.text)
    return NextResponse.json({ texts })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ texts: [] })
  }
}
