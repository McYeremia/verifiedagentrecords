import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "VAR — Verified Agent Records"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060C18",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial accent */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -80,
            bottom: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 65%)",
          }}
        />

        {/* VAR badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44 }}>
          <div
            style={{
              background: "#3B82F6",
              color: "white",
              fontSize: 20,
              fontWeight: 800,
              padding: "8px 20px",
              borderRadius: 8,
              letterSpacing: 2,
            }}
          >
            VAR
          </div>
          <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 18 }}>
            Verified Agent Records
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 70,
            fontWeight: 600,
            color: "white",
            lineHeight: 1.05,
            marginBottom: 28,
            maxWidth: 760,
          }}
        >
          Your wrong calls.
          <br />
          <span style={{ color: "rgba(255,255,255,0.28)" }}>Remembered forever.</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.42)", marginBottom: 52 }}>
          World Cup 2026 predictions · Walrus Mainnet
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D9E75" }} />
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 16 }}>
            Powered by Walrus Memory · Built for Walrus Memory World Cup 2026
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
