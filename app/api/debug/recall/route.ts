import { NextRequest, NextResponse } from "next/server"
import { getMemWal } from "../../../lib/memwal"

// Admin-only debug endpoint — runs an arbitrary MemWal recall and returns
// the raw results so we can diagnose what's actually stored in Walrus.
// Usage: GET /api/debug/recall?query=...&limit=20
// Header: x-admin-secret: var-admin-2026
export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") ?? "PREDICTION User predicted"
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 200)

  try {
    const mem = getMemWal()
    const res = await mem.recall({ query, limit })
    const results = (res.results ?? []).map((r: { text: string; blob_id?: string }) => ({
      preview: r.text.slice(0, 200),
      full: r.text,
      blob_id: r.blob_id ?? "",
      type: r.text.match(/^\[(\w+)\]/)?.[1] ?? "UNKNOWN",
    }))

    return NextResponse.json({
      query,
      limit,
      count: results.length,
      results,
    })
  } catch (err) {
    console.error("[debug/recall] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
