"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Navbar from "../components/Navbar"
import StatCard from "../components/StatCard"
import RoastCard from "../components/RoastCard"
import HistoryItem from "../components/HistoryItem"
import MatchHeroCard from "../components/MatchHeroCard"
import type { Match } from "../lib/matches"

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

  const [matches, setMatches] = useState<Match[]>([])
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
        setMatches(list)
        const urlMatch = searchParams.get("match")
        if (urlMatch) {
          const m = list.find(m => m.id === urlMatch)
          setSelectedMatch(m ?? list[0] ?? null)
        } else {
          setSelectedMatch(list[0] ?? null)
        }
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
        const idx = matches.findIndex(m => m.id === selectedMatch.id)
        if (idx >= 0 && idx < matches.length - 1) setSelectedMatch(matches[idx + 1])
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stats = computeStats(memories)
  const predictions = parseMemories(memories)

  // ── Wallet not connected ────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-6 text-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, background: "#FAECE7" }}
          >
            <i className="ti ti-wallet" style={{ fontSize: 32, color: "#D85A30" }} />
          </div>
          <div>
            <h1 className="text-[26px] font-medium" style={{ color: "var(--color-text-primary)" }}>
              Connect your Sui wallet to start predicting
            </h1>
            <p className="text-[14px] mt-2 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              VAR will remember your predictions permanently on Walrus Mainnet — verified through your wallet address.
            </p>
          </div>
          <ConnectButton connectText="Connect Sui Wallet" />
          <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            No gas fees · Sui Wallet, Suiet, or Phantom supported
          </p>
        </main>
      </>
    )
  }

  // ── Main dashboard ──────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Left sidebar ─────────────────────────────────── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Wallet card */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 36, height: 36, background: "#FAECE7" }}
                  >
                    <i className="ti ti-wallet" style={{ fontSize: 16, color: "#D85A30" }} />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {truncateAddress(userId)}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      Sui · World Cup 2026
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
                  <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Memory stored on Walrus Mainnet
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard value={stats.total} label="Total" variant="neutral" />
                <StatCard value={stats.correct} label="Correct ✓" variant="correct" />
                <StatCard value={stats.wrong} label="Wrong ✗" variant="wrong" />
              </div>

              {/* Match selector */}
              {matches.length > 0 && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <div
                    className="px-4 py-2.5"
                    style={{
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      background: "var(--color-background-secondary)",
                    }}
                  >
                    <span
                      className="text-[11px] font-medium uppercase tracking-wide"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Select match
                    </span>
                  </div>
                  {matches.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMatch(m); setSubmitted(false) }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                      style={{
                        borderBottom: i < matches.length - 1 ? "0.5px solid var(--color-border-tertiary)" : undefined,
                        background: selectedMatch?.id === m.id ? "#FAECE7" : "transparent",
                      }}
                    >
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: selectedMatch?.id === m.id ? "#993C1D" : "var(--color-text-primary)" }}
                      >
                        {m.homeFlag} {m.homeTeam} vs {m.awayTeam} {m.awayFlag}
                      </span>
                      {selectedMatch?.id === m.id && (
                        <i className="ti ti-chevron-right" style={{ fontSize: 12, color: "#D85A30" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* History in sidebar */}
              {predictions.length > 0 && (
                <div>
                  <div
                    className="text-[11px] font-medium uppercase tracking-wide mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Prediction history
                  </div>
                  <div
                    className="rounded-xl px-4"
                    style={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
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
          <main className="flex-1 flex flex-col gap-6 min-w-0">

            {submitted && (
              <div
                className="rounded-xl p-3 text-[13px] flex items-center gap-2"
                style={{ background: "#E1F5EE", color: "#1D9E75" }}
              >
                <i className="ti ti-check" />
                Prediction saved to Walrus! VAR has taken note.
              </div>
            )}

            {selectedMatch ? (
              <div>
                <div
                  className="text-[11px] font-medium uppercase tracking-wide mb-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  ⚡ Next match
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
                className="rounded-xl p-8 text-center"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                  No matches available at this time.
                </p>
              </div>
            )}

            <div>
              <div
                className="text-[11px] font-medium uppercase tracking-wide mb-2"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                💬 VAR says
              </div>
              {loading ? (
                <div
                  className="rounded-xl p-6 text-center"
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Loading verdict...
                  </span>
                </div>
              ) : roast ? (
                <RoastCard roast={roast} memoriesUsed={memoriesUsed} />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
