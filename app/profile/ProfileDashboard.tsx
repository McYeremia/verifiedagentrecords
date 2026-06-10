"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Link from "next/link"
import Navbar from "../components/Navbar"
import PageBg from "../components/PageBg"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

type TraitTone = "blue" | "violet" | "green" | "amber" | "coral"

interface Trait {
  id: string
  label: string
  icon: string
  blurb: string
  evidence: string
  tone: TraitTone
}

interface ConfBucket {
  level: string
  label: string
  total: number
  correct: number
  accuracy: number
}

interface ProfileData {
  profile: {
    predictionCount: number
    resultCount: number
    accuracyPct: number
    homeBiasPct: number
    drawRatePct: number
    topTeam: string | null
    topTeamCount: number
  }
  calibration: {
    buckets: ConfBucket[]
    resolvedCount: number
    verdict: string | null
    overconfident: boolean
  }
  traits: Trait[]
  traitsMin: number
}

const TONE: Record<TraitTone, { color: string; bg: string; border: string }> = {
  blue:   { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.22)" },
  violet: { color: "#C4B5FD", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.22)" },
  green:  { color: "#34D399", bg: "rgba(29,158,117,0.08)",  border: "rgba(29,158,117,0.22)" },
  amber:  { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.22)" },
  coral:  { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.22)" },
}

function accuracyColor(pct: number) {
  return pct >= 60 ? "#1D9E75" : pct >= 40 ? "#93C5FD" : "#F87171"
}

export default function ProfileDashboard() {
  const searchParams = useSearchParams()
  const account = useCurrentAccount()
  const urlUserId = searchParams.get("userId")
  const walletUserId = account?.address ?? null
  const userId = urlUserId || walletUserId

  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetch(`/api/profile?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && !d.error) setData(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  // ── No wallet / no userId ──────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PageBg />
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#A78BFA] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-28 flex flex-col items-center gap-6 text-center relative animate-fade-in-up" style={{ zIndex: 1 }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.18)" }}>
              <i className="ti ti-file-search" style={{ fontSize: 32, color: "#A78BFA" }} />
            </div>
            <h1 className="text-[28px] font-medium text-white">VAR&apos;s file on you</h1>
            <p className="text-[14px] max-w-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              Connect your Sui wallet to see the prediction profile VAR has built from your history on Walrus.
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

  const notEnough = !loading && data && data.profile.predictionCount < data.traitsMin

  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)" }}>
        <PageBg />
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#A78BFA] opacity-[0.04] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative" style={{ zIndex: 1 }}>

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.55)" }}>
              VAR Rap Sheet
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-medium text-white leading-tight mb-2">
              VAR&apos;s file on you
            </h1>
            <p className="text-[13px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              {truncateAddress(userId)}
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl p-12 text-center border border-white/10 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <i className="ti ti-loader animate-slow-spin text-[20px]" style={{ color: "rgba(255,255,255,0.25)" }} />
              <p className="text-[13px] text-neutral-400 mt-3">VAR is pulling your file...</p>
            </div>
          ) : notEnough ? (
            <div className="rounded-2xl p-10 text-center border animate-fade-in-up" style={{ background: "rgba(167,139,250,0.05)", borderColor: "rgba(167,139,250,0.20)" }}>
              <i className="ti ti-file-search text-[28px]" style={{ color: "#A78BFA" }} />
              <h2 className="text-[18px] font-medium text-white mt-3 mb-1.5">VAR is still building your file</h2>
              <p className="text-[13px] max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.40)" }}>
                {`${data!.profile.predictionCount} of ${data!.traitsMin} predictions logged. Make a few more and VAR will start profiling your habits.`}
              </p>
              <Link href="/predict" className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-medium px-5 py-2.5 rounded-full text-white" style={{ background: "#3B82F6" }}>
                <i className="ti ti-target text-[13px]" />
                Make predictions
              </Link>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-8">

              {/* Trait grid */}
              <section className="animate-fade-in-up">
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-neutral-400 flex items-center gap-1.5">
                  <i className="ti ti-fingerprint text-[#A78BFA]" />
                  Detected traits
                </div>
                {data.traits.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {data.traits.map(t => {
                      const tone = TONE[t.tone]
                      return (
                        <div key={t.id} className="rounded-2xl p-4 border backdrop-blur-xl flex gap-3" style={{ background: tone.bg, borderColor: tone.border }}>
                          <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${tone.border}` }}>
                            <i className={`ti ti-${t.icon}`} style={{ fontSize: 18, color: tone.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold" style={{ color: tone.color }}>{t.label}</div>
                            <div className="text-[12px] text-neutral-300 leading-snug">{t.blurb}</div>
                            <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>{t.evidence}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl p-6 text-center border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[13px] text-neutral-400">No strong patterns yet — you&apos;re keeping VAR guessing.</p>
                  </div>
                )}
              </section>

              {/* Overconfidence Index (#2) */}
              <section className="animate-fade-in-up delay-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-neutral-400 flex items-center gap-1.5">
                  <i className="ti ti-gauge text-[#FCD34D]" />
                  Overconfidence index
                </div>
                <div className="rounded-2xl p-5 border border-white/10 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  {data.calibration.resolvedCount > 0 ? (
                    <>
                      <div className="flex flex-col gap-3">
                        {data.calibration.buckets.map(b => (
                          <div key={b.level} className="flex items-center gap-3">
                            <span className="text-[12px] w-16 flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }}>{b.label}</span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${b.accuracy}%`, background: accuracyColor(b.accuracy) }} />
                            </div>
                            <span className="text-[12px] font-semibold tabular-nums w-20 text-right flex-shrink-0" style={{ color: accuracyColor(b.accuracy) }}>
                              {b.accuracy}% <span className="text-neutral-500 font-normal">({b.total})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {data.calibration.verdict && (
                        <p className="text-[13px] leading-relaxed mt-4 pt-4 border-t border-white/5 italic" style={{ color: data.calibration.overconfident ? "#FCD34D" : "rgba(255,255,255,0.55)" }}>
                          &ldquo;{data.calibration.verdict}&rdquo;
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-neutral-400">
                      No resolved predictions yet. Once your matches finish, VAR will grade your confidence against reality.
                    </p>
                  )}
                </div>
              </section>

              {/* Quick stats */}
              <section className="animate-fade-in-up delay-200">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl p-4 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-[22px] font-bold text-white">{data.profile.predictionCount}</div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Predictions</div>
                  </div>
                  <div className="rounded-2xl p-4 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-[22px] font-bold" style={{ color: accuracyColor(data.profile.accuracyPct) }}>{data.profile.accuracyPct}%</div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Accuracy</div>
                  </div>
                  <div className="rounded-2xl p-4 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-[22px] font-bold text-white">{data.profile.homeBiasPct}%</div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wider">Home bias</div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-5">
                  <Link href={`/history?userId=${encodeURIComponent(userId)}`} className="text-[12px] px-3 py-1.5 rounded-full border border-transparent transition-all duration-200 hover:text-white hover:border-white/20 hover:bg-white/[0.07]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Full history
                  </Link>
                  <Link href={`/card?userId=${encodeURIComponent(userId)}`} className="text-[12px] px-3 py-1.5 rounded-full border border-transparent transition-all duration-200 hover:text-white hover:border-white/20 hover:bg-white/[0.07]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Share card
                  </Link>
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-2xl p-10 text-center border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[13px] text-neutral-400">VAR could not load this file. Try again shortly.</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
