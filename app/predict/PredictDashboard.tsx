"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Navbar from "../components/Navbar"
import StatCard from "../components/StatCard"
import RoastCard from "../components/RoastCard"
import HistoryItem from "../components/HistoryItem"
import MatchHeroCard from "../components/MatchHeroCard"
import Link from "next/link"
import type { Match } from "../lib/matches"
import { getTLA } from "../lib/matches"
import FlagImg from "../components/FlagImg"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function parseMemories(memories: string[]) {
  const resultMap: Record<string, { isCorrect: boolean; actualWinner: string; score: string }> = {}

  for (const text of memories) {
    if (!text.startsWith("[RESULT]")) continue
    const midM = text.match(/Match ([\w_]+)/)
    const correctM = text.match(/(CORRECT|WRONG)/)
    const winnerM = text.match(/ended: (.+?) won (\d+)-(\d+)/)
    if (midM && correctM && winnerM) {
      resultMap[midM[1]] = {
        isCorrect: correctM[1] === "CORRECT",
        actualWinner: winnerM[1],
        score: `${winnerM[2]}-${winnerM[3]}`,
      }
    }
  }

  return memories
    .filter(t => t.startsWith("[PREDICTION]"))
    .map(text => {
      const midM = text.match(/matchId: ([\w_]+)/)
      const winnerM = text.match(/predicted (.+?) to win/)
      const teamsM = text.match(/to win (.+?) \(matchId/)
      const confM = text.match(/Confidence: (\w+)/)
      if (!midM || !winnerM) return null
      const matchId = midM[1]
      const result = resultMap[matchId]
      return {
        matchId,
        matchName: teamsM?.[1] ?? matchId,
        predictedWinner: winnerM[1],
        confidence: confM?.[1] ?? "medium",
        status: (result ? (result.isCorrect ? "correct" : "wrong") : "pending") as "correct" | "wrong" | "pending",
        actualResult: result ? `${result.actualWinner} won ${result.score}` : undefined,
      }
    })
    .filter(Boolean) as Array<{
      matchId: string
      matchName: string
      predictedWinner: string
      confidence: string
      status: "correct" | "wrong" | "pending"
      actualResult?: string
    }>
}

function computeStats(memories: string[]) {
  const total = memories.filter(m => m.startsWith("[PREDICTION]")).length
  const correct = memories.filter(m => m.startsWith("[RESULT]") && m.includes("CORRECT")).length
  const wrong = memories.filter(m => m.startsWith("[RESULT]") && m.includes("WRONG")).length
  return { total, correct, wrong }
}

export default function PredictDashboard() {
  const searchParams = useSearchParams()
  const account = useCurrentAccount()
  const userId = account?.address ?? null

  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [roast, setRoast] = useState<string | null>(null)
  const [memoriesUsed, setMemoriesUsed] = useState(0)
  const [memories, setMemories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/matches?upcoming")
      .then(r => r.json())
      .then(data => {
        const list: Match[] = data.matches || []
        setAllMatches(list)
        const urlMatch = searchParams.get("match")
        const target = urlMatch ? list.find(m => m.id === urlMatch) : null
        const first = target ?? list[0] ?? null
        setSelectedMatch(first)
        if (first) setSelectedGroup(first.group)
      })
      .catch(() => {})
  }, [searchParams])

  const loadRoast = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/roast?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      setRoast(data.roast ?? null)
      setMemoriesUsed(data.memoriesUsed ?? 0)
      setMemories(data.memories ?? [])
    } catch {
      setRoast("VAR is loading its verdict...")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) loadRoast()
  }, [userId, loadRoast])

  const handleSubmitPrediction = async (pick: string, confidence: string) => {
    if (!userId || !selectedMatch) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          matchId: selectedMatch.id,
          homeTeam: selectedMatch.homeTeam,
          awayTeam: selectedMatch.awayTeam,
          predictedWinner: pick,
          confidence,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        await loadRoast()
        const groupMatches = allMatches.filter(m => m.group === selectedGroup)
        const idx = groupMatches.findIndex(m => m.id === selectedMatch.id)
        if (idx >= 0 && idx < groupMatches.length - 1) setSelectedMatch(groupMatches[idx + 1])
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stats = computeStats(memories)
  const predictions = parseMemories(memories)
  const groups = [...new Set(allMatches.map(m => m.group))].sort()
  const groupMatches = allMatches.filter(m => m.group === selectedGroup)

  // ── Wallet not connected ────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="dark bg-grid-pattern relative overflow-hidden flex flex-col justify-center" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
          {/* Ambient Glow */}
          <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.06] dark:opacity-[0.1] blur-[100px] pointer-events-none -z-10 animate-pulse-glow" />

          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-6 text-center animate-fade-in-up relative" style={{ zIndex: 1 }}>
            <div
              className="flex items-center justify-center rounded-full border border-[#3B82F6]/25"
              style={{
                width: 72,
                height: 72,
                background: "rgba(59,130,246,0.10)",
              }}
            >
              <i className="ti ti-wallet text-[#3B82F6]" style={{ fontSize: 32 }} />
            </div>
            <div>
              <h1 className="text-[26px] font-semibold text-white">
                Connect your Sui wallet to start predicting
              </h1>
              <p className="text-[14px] mt-2 max-w-sm mx-auto text-neutral-400">
                VAR will remember your predictions permanently on Walrus Mainnet — verified through your wallet address.
              </p>
            </div>
            <div className="hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 transition-all rounded-full">
              <ConnectButton
                connectText="Connect Sui Wallet"
                style={{
                  background: "#3B82F6",
                  color: "white",
                  borderRadius: "99px",
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "10px 24px",
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </div>
            <p className="text-[12px] text-neutral-500">
              No gas fees · Sui Wallet, Suiet, or Phantom supported
            </p>
          </main>
        </div>
      </>
    )
  }

  // ── Main dashboard ──────────────────────────────────────────
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

                {/* Wallet card */}
                <div
                  className="rounded-2xl p-4 border border-white/10 backdrop-blur-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0 border border-[#3B82F6]/20 select-none"
                      style={{ width: 36, height: 36, background: "rgba(59,130,246,0.12)" }}
                    >
                      <i className="ti ti-wallet text-[#3B82F6]" style={{ fontSize: 16 }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-white truncate font-mono">
                        {truncateAddress(userId)}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Sui · World Cup 2026
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 select-none">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} className="animate-pulse" />
                    <span className="text-[11px] text-neutral-400">
                      Memory stored on Walrus Mainnet
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <StatCard value={stats.total} label="Total" variant="neutral" />
                  <StatCard value={stats.correct} label="Correct" variant="correct" />
                  <StatCard value={stats.wrong} label="Wrong" variant="wrong" />
                </div>

                {/* Champion pick CTA */}
                <Link
                  href="/champion"
                  className="group flex items-center gap-3 rounded-2xl p-4 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <span style={{ fontSize: 22 }} className="select-none transition-transform group-hover:scale-110">🏆</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white">Pick the champion</div>
                    <div className="text-[11px] text-neutral-400">
                      Lock in your World Cup winner
                    </div>
                  </div>
                  <i className="ti ti-arrow-right flex-shrink-0 text-neutral-500 group-hover:text-white transition-all group-hover:translate-x-0.5" style={{ fontSize: 13 }} />
                </Link>

                {/* Group Stage selector */}
                {allMatches.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <i className="ti ti-layout-grid text-[#3B82F6]" style={{ fontSize: 11 }} />
                      Group Stage
                    </div>

                    {/* Group pills — 6×2 grid */}
                    <div
                      className="rounded-2xl p-3 border border-white/10 backdrop-blur-xl"
                      style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                      <div className="grid grid-cols-6 gap-1.5">
                        {groups.map(g => {
                          const letter = g.replace("Group ", "")
                          const active = selectedGroup === g
                          return (
                            <button
                              key={g}
                              onClick={() => {
                                setSelectedGroup(g)
                                const first = allMatches.find(m => m.group === g) ?? null
                                setSelectedMatch(first)
                                setSubmitted(false)
                              }}
                              className="flex items-center justify-center py-1.5 rounded-lg text-[12px] font-bold transition-all duration-150 active:scale-95"
                              style={{
                                background: active ? "rgba(59, 130, 246, 0.20)" : "rgba(255, 255, 255, 0.04)",
                                color: active ? "#93C5FD" : "rgba(255, 255, 255, 0.45)",
                                border: active ? "1px solid rgba(59, 130, 246, 0.40)" : "0.5px solid rgba(255, 255, 255, 0.07)",
                              }}
                            >
                              {letter}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Matches in selected group */}
                    {groupMatches.length > 0 ? (
                      <div
                        className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                      >
                        {groupMatches.map((m, i) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedMatch(m); setSubmitted(false) }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                            style={{
                              borderBottom: i < groupMatches.length - 1 ? "0.5px solid rgba(255, 255, 255, 0.05)" : undefined,
                              background: selectedMatch?.id === m.id ? "rgba(59, 130, 246, 0.12)" : "transparent",
                            }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <FlagImg team={m.homeTeam} height={14} />
                                <span
                                  className="text-[11px] font-bold tracking-wide"
                                  style={{ color: selectedMatch?.id === m.id ? "#93C5FD" : "rgba(255, 255, 255, 0.85)" }}
                                >
                                  {getTLA(m.homeTeam)}
                                </span>
                                <span className="text-[10px] text-neutral-500 mx-0.5">vs</span>
                                <span
                                  className="text-[11px] font-bold tracking-wide"
                                  style={{ color: selectedMatch?.id === m.id ? "#93C5FD" : "rgba(255, 255, 255, 0.85)" }}
                                >
                                  {getTLA(m.awayTeam)}
                                </span>
                                <FlagImg team={m.awayTeam} height={14} />
                              </div>
                              <span className="text-[10px] text-neutral-500 truncate">
                                {m.homeTeam} vs {m.awayTeam}
                              </span>
                              <span className="text-[10px] text-neutral-500">{m.date} · {m.time}</span>
                            </div>
                            {selectedMatch?.id === m.id && (
                              <i className="ti ti-chevron-right text-[12px] text-[#3B82F6] flex-shrink-0 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-neutral-500 px-1">
                        All matches in this group are complete.
                      </p>
                    )}
                  </div>
                )}

                {/* History in sidebar */}
                {predictions.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400"
                    >
                      Prediction history
                    </div>
                    <div
                      className="rounded-2xl px-4 py-1.5 border border-white/10 backdrop-blur-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      {predictions.map((pred, i) => (
                        <HistoryItem
                          key={i}
                          matchName={pred.matchName}
                          pick={pred.predictedWinner}
                          confidence={pred.confidence}
                          status={pred.status}
                          actualResult={pred.actualResult}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main content ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col gap-6 min-w-0 animate-fade-in-up delay-200 w-full">

              {submitted && (
                <div
                  className="rounded-2xl p-3.5 text-[13px] font-medium flex items-center gap-2 border border-[#1D9E75]/25 shadow-md shadow-[#1D9E75]/5 animate-fade-in-up"
                  style={{ background: "rgba(29, 158, 117, 0.12)", color: "#34D399" }}
                >
                  <i className="ti ti-check text-[15px]" />
                  Prediction saved to Walrus! VAR has taken note.
                </div>
              )}

              {selectedMatch ? (
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none"
                  >
                    <i className="ti ti-bolt text-[#3B82F6]" />
                    Next match
                  </div>
                  <MatchHeroCard
                    match={selectedMatch}
                    redirectOnSubmit={false}
                    onSubmit={handleSubmitPrediction}
                    isSubmitting={submitting}
                  />
                </div>
              ) : (
                <div
                  className="rounded-2xl p-10 text-center border border-white/10 backdrop-blur-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <p className="text-[14px] text-neutral-400">
                    No matches available at this time.
                  </p>
                </div>
              )}

              <div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none"
                >
                  <i className="ti ti-quote text-[#3B82F6]" />
                  VAR says
                </div>
                {loading ? (
                  <div
                    className="rounded-2xl p-8 text-center border border-white/10 backdrop-blur-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <span className="text-[13px] text-neutral-400">
                      Loading verdict...
                    </span>
                  </div>
                ) : roast ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#3B82F6]/3 rounded-2xl filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <RoastCard roast={roast} memoriesUsed={memoriesUsed} />
                  </div>
                ) : null}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
