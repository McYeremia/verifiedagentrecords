"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Link from "next/link"
import Navbar from "../components/Navbar"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function CardContent() {
  const searchParams  = useSearchParams()
  const account       = useCurrentAccount()
  const urlUserId     = searchParams.get("userId")
  const walletUserId  = account?.address ?? null
  const userId        = urlUserId || walletUserId

  const [roast, setRoast]     = useState("")
  const [stats, setStats]     = useState({ total: 0, correct: 0, wrong: 0, accuracy: 0 })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const [shareUrl, setShareUrl] = useState("#")

  useEffect(() => {
    if (!userId) return

    // Read from localStorage first — same data as history page, no extra API call
    try {
      const hit = localStorage.getItem(`var-history-roast-${userId}`)
      if (hit) {
        const cached = JSON.parse(hit)
        if (Array.isArray(cached.memories) && cached.roast) {
          const mems: string[] = cached.memories
          const total   = mems.filter(t => t.startsWith("[PREDICTION]")).length
          const correct = mems.filter(t => t.startsWith("[RESULT]") && t.includes("CORRECT")).length
          const wrong   = mems.filter(t => t.startsWith("[RESULT]") && t.includes("WRONG")).length
          const accuracy = (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0
          setRoast(cached.roast)
          setStats({ total, correct, wrong, accuracy })
          setLoading(false)
          return
        }
      }
    } catch { /* ignore localStorage errors */ }

    // Fallback: fetch from /api/card-data (uses stored snapshots + leaderboard)
    fetch(`/api/card-data?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        setRoast(data.roast || "")
        setStats(data.stats ?? { total: 0, correct: 0, wrong: 0, accuracy: 0 })
      })
      .catch(() => setRoast(""))
      .finally(() => setLoading(false))
  }, [userId])

  const truncated = userId ? truncateAddress(userId) : ""

  // Compute share URL client-side only — avoids SSR/client hydration mismatch
  useEffect(() => {
    if (!userId) return
    const text    = encodeURIComponent(`VAR verdict: "${roast.slice(0, 120)}..." #Walrus #WorldCup2026`)
    const cardUrl = `${window.location.origin}/card?userId=${encodeURIComponent(userId)}`
    setShareUrl(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(cardUrl)}`)
  }, [userId, roast])

  const downloadCard = async () => {
    if (!userId || downloading) return
    setDownloading(true)
    setDownloadError(false)
    try {
      // Send a little over the 700-char cap — /api/og does the word-boundary trim.
      const params = new URLSearchParams({ userId, roast: roast.slice(0, 800) })
      const res    = await fetch(`/api/og?${params.toString()}`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const blob = await res.blob()
      const a    = document.createElement("a")
      a.href     = URL.createObjectURL(blob)
      a.download = `var-${truncated}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch {
      setDownloadError(true)
    } finally {
      setDownloading(false)
    }
  }

  // ── No wallet / no userId ──────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <div
          className="dark bg-grid-pattern relative overflow-hidden"
          style={{ background: "#060C18", minHeight: "calc(100vh - 65px)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-28 flex flex-col items-center gap-6 text-center relative animate-fade-in-up" style={{ zIndex: 1 }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 72, height: 72, background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.18)" }}
            >
              <i className="ti ti-id" style={{ fontSize: 32, color: "#3B82F6" }} />
            </div>
            <h1 className="text-[28px] font-medium text-white">Get your roast card</h1>
            <p className="text-[14px] max-w-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              Connect your Sui wallet to generate a shareable verdict card based on your prediction history on Walrus.
            </p>
            <ConnectButton
              connectText="Connect Sui Wallet"
              style={{ background: "#3B82F6", color: "white", borderRadius: "99px", fontSize: "13px", fontWeight: "500", padding: "10px 24px", border: "none", cursor: "pointer" }}
            />
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* Left — card preview */}
            <div className="flex-1 flex flex-col items-center gap-6 animate-fade-in-up delay-100 w-full">
              <div className="self-start flex items-center justify-between w-full">
                <Link
                  href={`/history?userId=${encodeURIComponent(userId)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <i className="ti ti-arrow-left" style={{ fontSize: 11 }} />
                  Back to history
                </Link>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 select-none flex items-center gap-1.5">
                  <i className="ti ti-share text-[#3B82F6]" />
                  Share card · {truncated}
                </div>
              </div>

              {/* Card */}
              <div
                id="roast-card"
                className="relative overflow-hidden rounded-2xl w-full border border-white/10 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/5"
                style={{ maxWidth: 560, background: "rgba(255,255,255,0.03)", padding: "1.75rem" }}
              >
                {/* Decoration */}
                <div
                  className="absolute right-[-40px] top-[50%] -translate-y-1/2 opacity-[0.02] pointer-events-none select-none animate-float"
                  style={{ color: "#ffffff" }}
                >
                  <i className="ti ti-target" style={{ fontSize: 200 }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex items-center justify-center rounded-lg text-white font-semibold flex-shrink-0 shadow-md shadow-[#3B82F6]/10"
                      style={{ width: 32, height: 32, background: "#3B82F6", fontSize: 11 }}
                    >
                      VAR
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-white truncate">Verified Agent Records</div>
                      <div className="text-[11px] text-neutral-500">World Cup 2026</div>
                    </div>
                  </div>
                  <div
                    className="text-[11px] font-semibold text-neutral-500 font-mono flex-shrink-0 px-2 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                  >
                    {truncated}
                  </div>
                </div>

                {/* Quote */}
                {loading ? (
                  <div className="text-neutral-400 text-[14px] animate-pulse mb-8">Loading verdict...</div>
                ) : roast ? (
                  <blockquote
                    className="text-[15px] leading-[1.65] text-neutral-200 mb-7"
                    style={{ borderLeft: "2px solid #3B82F6", paddingLeft: 14 }}
                  >
                    {roast}
                  </blockquote>
                ) : (
                  <div className="text-[14px] leading-relaxed text-neutral-500 mb-7 italic" style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 14 }}>
                    No verdict yet — make some predictions first so VAR has something to say.
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-6 mb-5 pt-5 border-t border-white/5">
                  {[
                    { value: stats.total,        label: "predictions", color: "white"   },
                    { value: `${stats.accuracy}%`, label: "accuracy",  color: "#1D9E75" },
                    { value: stats.wrong,         label: "wrong calls", color: "#93C5FD" },
                  ].map(({ value, label, color }) => (
                    <div key={label}>
                      <div className="text-[20px] font-bold" style={{ color }}>{value}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 select-none">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                    <span className="text-[11px] text-neutral-500">Walrus Mainnet · var-wc2026</span>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.20)" }}>#Walrus</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap justify-center">
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
                  onClick={downloadCard}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold transition-all duration-300 active:scale-[0.97]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: downloading ? "rgba(255,255,255,0.35)" : "white",
                    border: "0.5px solid rgba(255,255,255,0.10)",
                    padding: "11px 26px",
                    borderRadius: 99,
                    cursor: downloading ? "not-allowed" : "pointer",
                  }}
                >
                  <i className={`ti ${downloading ? "ti-loader animate-slow-spin" : "ti-download"}`} />
                  {downloading ? "Downloading..." : "Save image"}
                </button>
              </div>

              {downloadError ? (
                <p className="text-[12px] text-center max-w-sm" style={{ color: "#EF4444" }}>
                  Download failed — screenshot the card above instead.
                </p>
              ) : (
                <p className="text-[12px] text-neutral-500 select-none text-center max-w-sm">
                  <span className="text-neutral-400 font-semibold">Share on X</span> attaches a link preview with your verdict.{" "}
                  <span className="text-neutral-400 font-semibold">Save image</span> downloads as PNG.
                </p>
              )}
            </div>

            {/* Right — instructions */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 animate-fade-in-up delay-200">
              <div
                className="rounded-2xl p-5 sticky top-20 flex flex-col gap-5 border border-white/10 backdrop-blur-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div>
                  <div className="text-[15px] font-semibold mb-1 text-white">How to share</div>
                  <p className="text-[13px] leading-relaxed text-neutral-400">
                    Click <strong className="text-neutral-300">Share on X</strong> to post directly, or <strong className="text-neutral-300">Save image</strong> to download as PNG and upload manually with <strong className="text-neutral-300">#Walrus</strong>.
                  </p>
                </div>

                <div className="border-t border-white/5" />

                <div className="flex flex-col gap-3">
                  {[
                    { icon: "lock",        text: "All predictions stored permanently on Walrus Mainnet" },
                    { icon: "brain",       text: "Roasts based on real memory — not generic" },
                    { icon: "speakerphone", text: "More predictions, more savage the verdict" },
                  ].map(({ icon, text }) => (
                    <div key={icon} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 border border-[#3B82F6]/20"
                        style={{ width: 28, height: 28, background: "rgba(59,130,246,0.10)", color: "#3B82F6" }}
                      >
                        <i className={`ti ti-${icon}`} style={{ fontSize: 14 }} />
                      </div>
                      <p className="text-[13px] leading-relaxed text-neutral-400">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5" />

                <div className="flex items-center gap-1.5 select-none">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                  <span className="text-[12px] text-neutral-500">Powered by Walrus Memory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
