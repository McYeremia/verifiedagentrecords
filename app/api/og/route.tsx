import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId") ?? ""
  const roast  = searchParams.get("roast")  ?? ""

  const truncated = userId.length > 10
    ? `${userId.slice(0, 8)}...${userId.slice(-6)}`
    : userId || "Anonymous"

  // 380 chars fits ~7-8 lines at fontSize 20, lineHeight 1.6 within available canvas
  const roastDisplay = roast.length > 380 ? roast.slice(0, 377) + "..." : roast
  const hasRoast     = roastDisplay.trim().length > 0

  // Scale font: shorter text gets bigger treatment
  const fontSize = roastDisplay.length > 260 ? 19
    : roastDisplay.length > 160 ? 22
    : 26

  return new ImageResponse(
    (
      <div
        style={{
          background: "#060C18",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent — top right */}
        <div style={{
          position: "absolute", right: -80, top: -80,
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)",
        }} />

        {/* ── Header (fixed height ~52px) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            background: "#3B82F6", color: "white",
            fontSize: 14, fontWeight: 800,
            padding: "4px 12px", borderRadius: 5, letterSpacing: 2,
          }}>
            VAR
          </div>
          <span style={{ color: "rgba(255,255,255,0.30)", fontSize: 13 }}>
            Verified Agent Records | World Cup 2026
          </span>
        </div>

        {/* ── Verdict (fills remaining space) ── */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 12 }}>
          {hasRoast ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3 }}>
                OFFICIAL VAR VERDICT
              </div>
              <div style={{
                display: "flex",
                borderLeft: "3px solid #3B82F6",
                paddingLeft: 20,
              }}>
                <div style={{
                  fontSize,
                  color: "rgba(255,255,255,0.90)",
                  lineHeight: 1.65,
                  maxWidth: 1000,
                  overflow: "hidden",
                }}>
                  {`"${roastDisplay}"`}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.22)", letterSpacing: 2 }}>
                VAR HAS A FILE ON
              </div>
              <div style={{ fontSize: 46, fontWeight: 700, color: "white" }}>
                {truncated}
              </div>
              <div style={{ fontSize: 17, color: "rgba(255,255,255,0.35)", maxWidth: 560, lineHeight: 1.5 }}>
                World Cup 2026 prediction record - stored permanently on Walrus Mainnet.
              </div>
            </div>
          )}
        </div>

        {/* ── Footer (fixed height ~44px) ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 24, paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12 }}>
              Powered by Walrus Memory
            </span>
          </div>
          {userId && (
            <span style={{
              color: "rgba(255,255,255,0.25)", fontSize: 11,
              background: "rgba(255,255,255,0.06)",
              padding: "3px 9px", borderRadius: 4,
            }}>
              {truncated}
            </span>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
