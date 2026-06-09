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
      .catch(() => setRoast("VAR is unreachable at the moment."))
      .finally(() => setLoading(false))
  }, [userId])

  const shareText = encodeURIComponent(
    `VAR verdict for ${userId}: "${roast.slice(0, 120)}..." 🤣 #Walrus #WorldCup2026`
  )
  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`

  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
        {/* Glow Spots */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* Left — card preview */}
            <div className="flex-1 flex flex-col items-center gap-6 animate-fade-in-up delay-100 w-full">
              <div className="text-[11px] font-semibold uppercase tracking-wider self-start text-neutral-400 select-none flex items-center gap-1.5">
                <i className="ti ti-share text-[#3B82F6]" />
                Share card · @{userId}
              </div>

              {/* Card */}
              <div
                id="roast-card"
                className="relative overflow-hidden rounded-2xl w-full border border-white/10 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/5"
                style={{
                  maxWidth: 600,
                  minHeight: 340,
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "2rem",
                }}
              >
                {/* Decoration */}
                <div
                  className="absolute right-[-20px] top-[50%] -translate-y-1/2 text-[200px] opacity-[0.02] pointer-events-none select-none animate-float"
                  style={{
                    lineHeight: 1,
                  }}
                >
                  ⚽
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex items-center justify-center rounded-lg text-white font-semibold shadow-md shadow-[#3B82F6]/10"
                      style={{ width: 34, height: 34, background: "#3B82F6", fontSize: 13, flexShrink: 0 }}
                    >
                      VAR
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">Verified Agent Records</div>
                      <div className="text-[11px] text-neutral-400">
                        World Cup 2026
                      </div>
                    </div>
                  </div>
                  <div className="text-[14px] font-semibold text-neutral-400 font-mono">
                    @{userId}
                  </div>
                </div>

                {/* Quote */}
                {loading ? (
                  <div className="text-neutral-400 text-[14px] animate-pulse">Loading verdict...</div>
                ) : (
                  <blockquote
                    className="text-[15px] leading-[1.65] text-neutral-200 mb-8"
                    style={{ borderLeft: "2px solid #3B82F6", paddingLeft: 14 }}
                  >
                    {roast}
                  </blockquote>
                )}

                {/* Stats */}
                <div className="flex gap-8 mb-6 border-t border-white/5 pt-6">
                  {[
                    { value: stats.total, label: "predictions", color: "white" },
                    { value: `${stats.accuracy}%`, label: "accuracy", color: "#1D9E75" },
                    { value: stats.wrong, label: "wrong calls", color: "#93C5FD" },
                  ].map(({ value, label, color }) => (
                    <div key={label}>
                      <div className="text-[20px] font-bold" style={{ color }}>{value}</div>
                      <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-4 border-t border-white/5"
                >
                  <div className="flex items-center gap-1.5 select-none">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} className="animate-pulse" />
                    <span className="text-[11px] text-neutral-500">
                      walrus.xyz · Verified Agent Records
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-semibold">
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
                  className="group inline-flex items-center gap-2.5 text-white text-[14px] font-semibold transition-all duration-300 active:scale-[0.97] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                  style={{ background: "#3B82F6", padding: "11px 26px", borderRadius: 99 }}
                >
                  <i className="ti ti-share transition-transform group-hover:rotate-12" />
                  Share on X
                </a>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold transition-all duration-300 active:scale-[0.97] hover:bg-white/5 hover:border-white/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    color: "white",
                    border: "0.5px solid border-white/10",
                    padding: "11px 26px",
                    borderRadius: 99,
                  }}
                >
                  <i className="ti ti-device-floppy" />
                  Save image
                </button>
              </div>
              <p className="text-[12px] text-neutral-500 select-none">
                Screenshot the card above to share on X with #Walrus
              </p>
            </div>

            {/* Right — instructions / info */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 animate-fade-in-up delay-200">
              <div
                className="rounded-2xl p-5 sticky top-20 flex flex-col gap-5 border border-white/10 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                }}
              >
                <div>
                  <div className="text-[15px] font-semibold mb-1 text-white">
                    How to share
                  </div>
                  <p className="text-[13px] leading-relaxed text-neutral-400">
                    Click <strong>Share on X</strong> to post directly, or screenshot the card and upload manually with the hashtag #Walrus.
                  </p>
                </div>

                <div className="border-t border-white/5" />

                <div className="flex flex-col gap-3">
                  {[
                    { icon: "lock", text: "All predictions stored permanently on Walrus Mainnet" },
                    { icon: "brain", text: "Roasts based on real memory — not generic" },
                    { icon: "speakerphone", text: "More predictions, more savage the verdict" },
                  ].map(({ icon, text }) => (
                    <div key={icon} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 border border-[#3B82F6]/20"
                        style={{ width: 28, height: 28, background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                      >
                        <i className={`ti ti-${icon}`} style={{ fontSize: 14 }} />
                      </div>
                      <p className="text-[13px] leading-relaxed text-neutral-400">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5" />

                <div className="flex items-center gap-1.5 select-none">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                  <span className="text-[12px] text-neutral-500">
                    Powered by Walrus Memory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
