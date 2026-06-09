"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"
import Navbar from "../components/Navbar"

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

interface VersusStats {
  predictions: number
  correct: number
  wrong: number
  accuracy: number
  streak: { len: number; type: "winning" | "losing" } | null
}

interface UserData {
  userId: string
  roast: string
  stats: VersusStats
  loading: boolean
  error?: string
}

function parseStats(memories: string[]): VersusStats {
  const results = memories.filter(m => m.startsWith("[RESULT]"))
  const correct = results.filter(m => m.includes("— CORRECT")).length
  const wrong = results.filter(m => m.includes("— WRONG")).length
  const predictions = memories.filter(m => m.startsWith("[PREDICTION]")).length
  const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0

  const streaks = memories.filter(m => m.startsWith("[STREAK]")).sort()
  const latest = streaks[streaks.length - 1] ?? ""
  const sm = latest.match(/on a (\d+)-game (winning|losing) streak/)
  const streak = sm ? { len: parseInt(sm[1]), type: sm[2] as "winning" | "losing" } : null

  return { predictions, correct, wrong, accuracy, streak }
}

function emptyUser(userId: string, loading = false): UserData {
  return { userId, roast: "", stats: parseStats([]), loading }
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
      <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</span>
      <span
        className="text-[13px] font-semibold tabular-nums"
        style={{ color: highlight ? "#1D9E75" : "rgba(255,255,255,0.85)" }}
      >
        {value}
      </span>
    </div>
  )
}

function UserCard({
  data,
  isWinner,
  side,
}: {
  data: UserData
  isWinner: boolean
  side: "left" | "right"
}) {
  const borderColor = isWinner ? "rgba(29, 158, 117, 0.35)" : "rgba(255, 255, 255, 0.06)"
  const bgColor = isWinner ? "rgba(29, 158, 117, 0.05)" : "rgba(255, 255, 255, 0.02)"
  const glowColor = isWinner ? "0 0 40px rgba(29,158,117,0.08)" : "none"

  return (
    <div
      className="flex-1 rounded-2xl p-6 flex flex-col gap-4 min-w-0 transition-all duration-300"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: glowColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            background: isWinner ? "rgba(29,158,117,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isWinner ? "rgba(29,158,117,0.30)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <span className="text-[11px] font-bold" style={{ color: isWinner ? "#1D9E75" : "rgba(255,255,255,0.50)" }}>
            {data.userId ? data.userId.slice(2, 4).toUpperCase() : "??"}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-white truncate">
            {truncateAddress(data.userId)}
          </div>
          {isWinner && (
            <div
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#1D9E75" }}
            >
              <i className="ti ti-trophy" style={{ fontSize: 9 }} />
              VAR winner
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {data.loading ? (
        <div className="flex items-center justify-center py-8">
          <i className="ti ti-loader animate-slow-spin text-[18px]" style={{ color: "rgba(255,255,255,0.20)" }} />
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <StatRow label="Predictions" value={data.stats.predictions} />
            <StatRow label="Correct" value={data.stats.correct} highlight={data.stats.correct > 0} />
            <StatRow label="Wrong" value={data.stats.wrong} />
            <StatRow
              label="Accuracy"
              value={`${data.stats.accuracy}%`}
              highlight={data.stats.accuracy >= 50}
            />
            {data.stats.streak && (
              <StatRow
                label="Streak"
                value={`${data.stats.streak.len}× ${data.stats.streak.type}`}
                highlight={data.stats.streak.type === "winning"}
              />
            )}
          </div>

          {/* VAR Roast */}
          {data.roast && (
            <div
              className="rounded-xl p-4 text-[12px] leading-relaxed italic"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "0.5px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
                borderLeft: `2px solid ${isWinner ? "rgba(29,158,117,0.40)" : "rgba(59,130,246,0.30)"}`,
              }}
            >
              &ldquo;{data.roast}&rdquo;
            </div>
          )}

          {/* Share own history link */}
          <a
            href={`/history?userId=${data.userId}`}
            className="text-[11px] transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            View full history →
          </a>
        </>
      )}
    </div>
  )
}

export default function VersusContent() {
  const searchParams = useSearchParams()
  const account = useCurrentAccount()
  const walletAddress = account?.address ?? ""

  const addrA = searchParams.get("a") ?? ""
  const addrB = searchParams.get("b") ?? ""

  const [inputA, setInputA] = useState(addrA || walletAddress)
  const [inputB, setInputB] = useState(addrB)

  const [dataA, setDataA] = useState<UserData>(emptyUser(addrA))
  const [dataB, setDataB] = useState<UserData>(emptyUser(addrB))

  const fetchUser = useCallback(async (userId: string, setter: (d: UserData) => void) => {
    if (!userId) return
    setter(emptyUser(userId, true))
    try {
      const res = await fetch(`/api/roast?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      const memories: string[] = data.memories ?? []
      setter({
        userId,
        roast: data.roast ?? "No predictions yet — too scared to be wrong?",
        stats: parseStats(memories),
        loading: false,
      })
    } catch {
      setter({
        userId,
        roast: "Failed to load VAR verdict.",
        stats: parseStats([]),
        loading: false,
        error: "error",
      })
    }
  }, [])

  useEffect(() => {
    if (addrA) fetchUser(addrA, setDataA)
    if (addrB) fetchUser(addrB, setDataB)
  }, [addrA, addrB, fetchUser])

  // Update inputA when wallet connects and no param set
  useEffect(() => {
    if (!addrA && walletAddress) setInputA(walletAddress)
  }, [walletAddress, addrA])

  const handleCompare = () => {
    const a = inputA.trim()
    const b = inputB.trim()
    if (!a || !b) return
    window.location.href = `/versus?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`
  }

  const showComparison = !!(addrA && addrB)

  // Determine winner
  const aWins = !dataA.loading && !dataB.loading && addrA && addrB &&
    dataA.stats.accuracy > dataB.stats.accuracy
  const bWins = !dataA.loading && !dataB.loading && addrA && addrB &&
    dataB.stats.accuracy > dataA.stats.accuracy
  const tied = !dataA.loading && !dataB.loading && addrA && addrB &&
    dataA.stats.accuracy === dataB.stats.accuracy && (dataA.stats.predictions + dataB.stats.predictions) > 0

  return (
    <>
      <Navbar />
      <div
        className="dark bg-grid-pattern relative overflow-hidden"
        style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}
      >
        {/* Glow spots */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative" style={{ zIndex: 1 }}>

          {/* Header */}
          <div className="text-center mb-10">
            <div
              className="text-[10px] font-semibold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              VAR · Head to Head
            </div>
            <h1 className="text-[38px] sm:text-[48px] font-medium text-white leading-tight mb-3">
              Who predicts better?
            </h1>
            <p className="text-[14px] max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
              Compare two wallets side by side. VAR keeps the score — permanently.
            </p>
          </div>

          {/* Input form — always visible at top */}
          {!showComparison && (
            <div
              className="max-w-xl mx-auto rounded-2xl p-6 flex flex-col gap-4 mb-10"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Player 1 — Wallet Address
                  </label>
                  <input
                    type="text"
                    value={inputA}
                    onChange={e => setInputA(e.target.value)}
                    placeholder="0x..."
                    className="w-full text-[13px] font-mono outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.10)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      color: "rgba(255,255,255,0.80)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Player 2 — Wallet Address
                  </label>
                  <input
                    type="text"
                    value={inputB}
                    onChange={e => setInputB(e.target.value)}
                    placeholder="0x..."
                    className="w-full text-[13px] font-mono outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.10)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      color: "rgba(255,255,255,0.80)",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleCompare}
                disabled={!inputA.trim() || !inputB.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: "#3B82F6" }}
              >
                <i className="ti ti-swords" style={{ fontSize: 14 }} />
                Compare
              </button>
            </div>
          )}

          {/* Comparison layout */}
          {showComparison && (
            <>
              {/* Change addresses link */}
              <div className="flex justify-center mb-6">
                <a
                  href="/versus"
                  className="inline-flex items-center gap-1.5 text-[11px] transition-colors"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                >
                  <i className="ti ti-refresh" style={{ fontSize: 11 }} />
                  Change players
                </a>
              </div>

              {/* Winner banner */}
              {(aWins || bWins || tied) && (
                <div
                  className="text-center mb-6 py-3 px-6 rounded-full mx-auto inline-flex items-center gap-2 text-[12px] font-semibold"
                  style={{
                    display: "flex",
                    maxWidth: "fit-content",
                    margin: "0 auto 24px",
                    background: tied ? "rgba(59,130,246,0.10)" : "rgba(29,158,117,0.10)",
                    border: `0.5px solid ${tied ? "rgba(59,130,246,0.25)" : "rgba(29,158,117,0.25)"}`,
                    color: tied ? "#93C5FD" : "#1D9E75",
                  }}
                >
                  <i className={`ti ${tied ? "ti-equal" : "ti-trophy"}`} style={{ fontSize: 13 }} />
                  {tied
                    ? "Equally terrible — VAR cannot decide"
                    : aWins
                    ? `${truncateAddress(addrA)} leads in accuracy`
                    : `${truncateAddress(addrB)} leads in accuracy`}
                </div>
              )}

              {/* Side-by-side cards */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <UserCard data={dataA} isWinner={!!aWins} side="left" />

                {/* VS divider */}
                <div className="flex sm:flex-col items-center justify-center gap-2 flex-shrink-0">
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.06)" }} className="hidden sm:block" />
                  <span
                    className="text-[11px] font-bold tracking-widest select-none"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    VS
                  </span>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.06)" }} className="hidden sm:block" />
                </div>

                <UserCard data={dataB} isWinner={!!bWins} side="right" />
              </div>

              {/* Share URL */}
              <div
                className="mt-8 rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <i className="ti ti-link text-[14px]" style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                <span
                  className="text-[11px] font-mono truncate flex-1"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {typeof window !== "undefined" ? window.location.href : ""}
                </span>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href).catch(() => {})
                    }
                  }}
                  className="text-[11px] flex-shrink-0 transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Copy
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}
