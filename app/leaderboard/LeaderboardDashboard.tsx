"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const rankColors = ["#3B82F6", "#999999", "#BA7517"]
const rankLabels = ["1st Place", "2nd Place", "3rd Place"]

type LeaderboardEntry = {
  userId: string
  predictions: number
  correct: number
  accuracy: number
}

function parseLeaderboardEntry(text: string): LeaderboardEntry | null {
  const userMatch = text.match(/User (0x[a-fA-F0-9]+)/)
  const predMatch = text.match(/(\d+) predictions/)
  const correctMatch = text.match(/(\d+) correct/)
  const accuracyMatch = text.match(/(\d+)% accuracy/)
  if (!userMatch) return null
  return {
    userId: userMatch[1],
    predictions: parseInt(predMatch?.[1] ?? "0"),
    correct: parseInt(correctMatch?.[1] ?? "0"),
    accuracy: parseInt(accuracyMatch?.[1] ?? "0"),
  }
}

export default function LeaderboardDashboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(data => {
        const raw: string[] = data.texts || []
        const parsed = raw
          .map(t => parseLeaderboardEntry(t))
          .filter(Boolean) as LeaderboardEntry[]

        // Deduplicate by userId
        const uniqueMap = new Map<string, LeaderboardEntry>()
        for (const entry of parsed) {
          const existing = uniqueMap.get(entry.userId)
          if (!existing || entry.predictions > existing.predictions) {
            uniqueMap.set(entry.userId, entry)
          }
        }

        setEntries(
          Array.from(uniqueMap.values())
            .sort((a, b) => b.accuracy - a.accuracy || b.predictions - a.predictions)
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalPredictions = entries.reduce((s, e) => s + e.predictions, 0)

  // ── Main leaderboard ──────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
        {/* Glow Spots */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* ── Left sidebar ─────────────────────────────────── */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 animate-fade-in-up delay-100">
              <div className="flex flex-col gap-4 lg:sticky lg:top-20">

                {/* Header card */}
                <div
                  className="rounded-2xl p-5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/3"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className="flex items-center justify-center rounded-xl font-semibold border border-[#3B82F6]/25 select-none"
                      style={{ width: 44, height: 44, background: "rgba(59, 130, 246, 0.12)" }}
                    >
                      <i className="ti ti-trophy text-[#3B82F6]" style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <div className="text-[18px] font-semibold text-white">
                        Leaderboard
                      </div>
                      <div className="text-[12px] text-neutral-400">
                        World Cup 2026 · Walrus
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-[20px] font-medium text-white">
                        {loading ? "—" : entries.length}
                      </div>
                      <div className="text-[11px] text-neutral-400">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[20px] font-medium text-white">
                        {loading ? "—" : totalPredictions}
                      </div>
                      <div className="text-[11px] text-neutral-400">Predictions</div>
                    </div>
                  </div>
                </div>

                {/* Top 3 podium */}
                {entries.slice(0, 3).map((entry, i) => (
                  <div
                    key={entry.userId}
                    className="rounded-2xl p-4 flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderColor: i === 0 ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <span className="text-[12px] font-bold uppercase tracking-wider text-neutral-400 min-w-[3.25rem] select-none">{rankLabels[i]}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/history?userId=${entry.userId}`}
                        className="text-[13px] font-medium text-white hover:text-[#93C5FD] transition-colors truncate block"
                      >
                        {truncateAddress(entry.userId)}
                      </Link>
                      <div className="text-[11px] text-neutral-400">
                        {entry.predictions} predictions
                      </div>
                    </div>
                    <div
                      className="text-[15px] font-bold"
                      style={{ color: i === 0 ? "#93C5FD" : rankColors[i] }}
                    >
                      {entry.accuracy}%
                    </div>
                  </div>
                ))}

                {/* Walrus proof */}
                <div
                  className="rounded-2xl p-4 border border-white/10 backdrop-blur-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                    <span className="text-[12px] font-semibold text-neutral-300">
                      Powered by Walrus Memory
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral-400 leading-relaxed">
                    Rankings sourced from LEADERBOARD memories on Walrus Mainnet — no external database.
                  </p>
                </div>
              </div>
            </aside>

            {/* ── Main content ─────────────────────────────────── */}
            <main className="flex-1 min-w-0 animate-fade-in-up delay-200 w-full">
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3.5 text-neutral-400 flex items-center gap-1.5 select-none">
                <i className="ti ti-trophy text-[#3B82F6]" />
                Full rankings
              </div>

              {loading ? (
                <div
                  className="rounded-2xl p-12 text-center border border-white/10 backdrop-blur-xl"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  <p className="text-[14px] text-neutral-400">Loading leaderboard...</p>
                </div>
              ) : entries.length === 0 ? (
                <div
                  className="rounded-2xl p-12 text-center border border-white/10 backdrop-blur-xl"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  <p className="text-[14px] text-neutral-400">
                    No data yet. Leaderboard updates after matches are resolved.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                  style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                  {/* Header row */}
                  <div
                    className="grid px-5 py-3.5 border-b border-white/5"
                    style={{
                      gridTemplateColumns: "3rem 1fr 6rem 5rem 5rem",
                      gap: "1rem",
                      background: "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    {["#", "Wallet Address", "Predictions", "Correct", "Accuracy"].map(h => (
                      <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Data rows */}
                  {entries.map((entry, i) => (
                    <div
                      key={entry.userId}
                      className="grid items-center px-5 py-4 transition-colors duration-200 hover:bg-white/[0.05]"
                      style={{
                        gridTemplateColumns: "3rem 1fr 6rem 5rem 5rem",
                        gap: "1rem",
                        borderBottom: i < entries.length - 1 ? "0.5px solid rgba(255, 255, 255, 0.05)" : undefined,
                        background: i === 0 ? "rgba(59, 130, 246, 0.08)" : "transparent",
                      }}
                    >
                      <div
                        className="text-[13px] font-bold"
                        style={{ color: i < 3 ? rankColors[i] : "rgba(255, 255, 255, 0.3)" }}
                      >
                        {i < 3 ? (i === 0 ? "1st" : i === 1 ? "2nd" : "3rd") : `${i + 1}`}
                      </div>
                      <Link
                        href={`/history?userId=${entry.userId}`}
                        className="text-[13px] font-medium font-mono text-neutral-200 hover:text-[#3B82F6] transition-colors truncate"
                      >
                        {truncateAddress(entry.userId)}
                      </Link>
                      <div className="text-[13px] text-neutral-300">{entry.predictions}</div>
                      <div className="text-[13px] font-semibold text-[#1D9E75]">{entry.correct}</div>
                      <div
                        className="text-[14px] font-bold"
                        style={{ color: entry.accuracy >= 60 ? "#1D9E75" : entry.accuracy >= 40 ? "#93C5FD" : "#3B82F6" }}
                      >
                        {entry.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
