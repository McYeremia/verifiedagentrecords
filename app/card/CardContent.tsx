"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "../components/Navbar"

export default function CardContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId") || "anon"

  const [roast, setRoast] = useState("")
  const [stats, setStats] = useState({ total: 0, correct: 0, wrong: 0, accuracy: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/roast?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        setRoast(data.roast || "")
        const mems: string[] = data.memories || []
        const total = mems.filter(m => m.startsWith("[PREDICTION]")).length
        const correct = mems.filter(m => m.startsWith("[RESULT]") && m.includes("CORRECT")).length
        const wrong = mems.filter(m => m.startsWith("[RESULT]") && m.includes("WRONG")).length
        const resolved = correct + wrong
        setStats({ total, correct, wrong, accuracy: resolved > 0 ? Math.round((correct / resolved) * 100) : 0 })
      })
      .catch(() => setRoast("VAR tidak bisa dihubungi saat ini."))
      .finally(() => setLoading(false))
  }, [userId])

  const shareText = encodeURIComponent(
    `VAR verdict untuk @${userId}: "${roast.slice(0, 120)}..." 🤣 #Walrus #WorldCup2026`
  )
  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Left — card preview */}
          <div className="flex-1 flex flex-col items-center gap-6">
            <div className="text-[11px] font-medium uppercase tracking-wide self-start" style={{ color: "var(--color-text-tertiary)" }}>
              Share card · @{userId}
            </div>

            {/* Card */}
            <div
              id="roast-card"
              className="relative overflow-hidden rounded-xl w-full"
              style={{
                maxWidth: 600,
                minHeight: 340,
                background: "#111111",
                border: "0.5px solid rgba(255,255,255,0.08)",
                padding: "2rem",
              }}
            >
              {/* Decoration */}
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 200,
                  opacity: 0.025,
                  userSelect: "none",
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                ⚽
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-lg text-white font-medium"
                    style={{ width: 34, height: 34, background: "#D85A30", fontSize: 13, flexShrink: 0 }}
                  >
                    VAR
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">Verified Agent Records</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      World Cup 2026
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  @{userId}
                </div>
              </div>

              {/* Quote */}
              {loading ? (
                <div className="text-white text-[14px]">Loading verdict...</div>
              ) : (
                <blockquote
                  className="text-[16px] leading-relaxed text-white mb-6"
                  style={{ borderLeft: "2px solid #D85A30", paddingLeft: 14 }}
                >
                  {roast}
                </blockquote>
              )}

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                {[
                  { value: stats.total, label: "predictions", color: "white" },
                  { value: `${stats.accuracy}%`, label: "accuracy", color: "#1D9E75" },
                  { value: stats.wrong, label: "wrong calls", color: "#D85A30" },
                ].map(({ value, label, color }) => (
                  <div key={label}>
                    <div className="text-[20px] font-medium" style={{ color }}>{value}</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    walrus.xyz · Verified Agent Records
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  #Walrus
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white text-[14px] font-medium"
                style={{ background: "#D85A30", padding: "10px 24px", borderRadius: 99 }}
              >
                <i className="ti ti-share" />
                Share on X
              </a>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-[14px] font-medium"
                style={{
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  padding: "10px 24px",
                  borderRadius: 99,
                }}
              >
                <i className="ti ti-device-floppy" />
                Save image
              </button>
            </div>
            <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              Screenshot card di atas untuk share ke X dengan #Walrus
            </p>
          </div>

          {/* Right — instructions / info */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div
              className="rounded-xl p-5 sticky top-6 flex flex-col gap-5"
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div>
                <div className="text-[15px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                  Cara share
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  Klik <strong>Share on X</strong> untuk posting langsung, atau screenshot card lalu upload manual dengan hashtag #Walrus.
                </p>
              </div>

              <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }} />

              <div className="flex flex-col gap-3">
                {[
                  { icon: "lock", text: "Semua prediksi tersimpan permanen di Walrus Mainnet" },
                  { icon: "brain", text: "Roast berdasarkan memori nyata — bukan generik" },
                  { icon: "speakerphone", text: "Makin banyak prediksi, makin savage verdictnya" },
                ].map(({ icon, text }) => (
                  <div key={icon} className="flex items-start gap-2.5">
                    <div
                      className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                      style={{ width: 28, height: 28, background: "#FAECE7", color: "#D85A30" }}
                    >
                      <i className={`ti ti-${icon}`} style={{ fontSize: 14 }} />
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }} />

              <div className="flex items-center gap-1.5">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} />
                <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  Powered by Walrus Memory
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
