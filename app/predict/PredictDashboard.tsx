"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "../components/Navbar"
import StatCard from "../components/StatCard"
import RoastCard from "../components/RoastCard"
import HistoryItem from "../components/HistoryItem"
import MatchHeroCard from "../components/MatchHeroCard"
import type { Match } from "../lib/matches"

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
        actualResult: result ? `${result.actualWinner} menang ${result.score}` : undefined,
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

  const [userId, setUserId] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [roast, setRoast] = useState<string | null>(null)
  const [memoriesUsed, setMemoriesUsed] = useState(0)
  const [memories, setMemories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const urlUserId = searchParams.get("userId")
    const stored = typeof window !== "undefined" ? localStorage.getItem("var-userId") : null
    if (urlUserId) {
      setUserId(urlUserId)
      localStorage.setItem("var-userId", urlUserId)
    } else if (stored) {
      setUserId(stored)
    }
  }, [searchParams])

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
      setRoast("VAR sedang loading verdictnya...")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) loadRoast()
  }, [userId, loadRoast])

  const handleSetUserId = () => {
    const trimmed = userInput.trim().toLowerCase().replace(/\s+/g, "_")
    if (!trimmed) return
    localStorage.setItem("var-userId", trimmed)
    setUserId(trimmed)
  }

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

  // ── Username setup ──────────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-6 text-center">
          <div
            className="flex items-center justify-center rounded-full text-white font-medium"
            style={{ width: 72, height: 72, background: "#D85A30", fontSize: 22 }}
          >
            VAR
          </div>
          <div>
            <h1 className="text-[28px] font-medium" style={{ color: "var(--color-text-primary)" }}>
              Siapa nama kamu?
            </h1>
            <p className="text-[14px] mt-2 max-w-xs mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Username ini akan jadi identitas rekam jejakmu di Walrus Mainnet.
            </p>
          </div>
          <div className="flex gap-2 w-full max-w-sm">
            <input
              type="text"
              placeholder="masukkan username..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSetUserId()}
              className="flex-1 px-4 py-3 rounded-xl text-[14px] outline-none"
              style={{
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              onClick={handleSetUserId}
              className="px-6 py-3 rounded-xl text-white text-[14px] font-medium"
              style={{ background: "#D85A30" }}
            >
              Masuk
            </button>
          </div>
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

              {/* User card */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex items-center justify-center rounded-full text-white font-medium flex-shrink-0"
                      style={{ width: 36, height: 36, background: "#D85A30", fontSize: 13 }}
                    >
                      {userId.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {userId}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        World Cup 2026
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { localStorage.removeItem("var-userId"); setUserId(null) }}
                    className="text-[11px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Ganti
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
                  <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Memory tersimpan di Walrus Mainnet
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard value={stats.total} label="Total" variant="neutral" />
                <StatCard value={stats.correct} label="Benar ✓" variant="correct" />
                <StatCard value={stats.wrong} label="Salah ✗" variant="wrong" />
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
                    style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      Pilih laga
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

              {/* History (sidebar on desktop) */}
              {predictions.length > 0 && (
                <div>
                  <div className="text-[13px] font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
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

            {/* Success notice */}
            {submitted && (
              <div
                className="rounded-xl p-3 text-[13px] flex items-center gap-2"
                style={{ background: "#E1F5EE", color: "#1D9E75" }}
              >
                <i className="ti ti-check" />
                Prediksi tersimpan di Walrus! VAR sudah mencatat.
              </div>
            )}

            {/* Prediction form */}
            {selectedMatch ? (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
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
                  Tidak ada laga yang tersedia saat ini.
                </p>
              </div>
            )}

            {/* VAR Says */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
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
                    Memuat verdict...
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
