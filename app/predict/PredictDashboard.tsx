"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Navbar from "../components/Navbar"
import PageBg from "../components/PageBg"
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
  const urlUserId = searchParams.get("userId")
  const walletUserId = account?.address ?? null
  const userId = urlUserId || walletUserId

  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [roast, setRoast] = useState<string | null>(null)
  const [memoriesUsed, setMemoriesUsed] = useState(0)
  const [memories, setMemories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pickStat, setPickStat] = useState<string | null>(null)
  // matchId → pick for matches this user has already predicted (device-local cache).
  // Merged with memory-derived predictions to lock each match (one prediction, forever).
  const [localPicks, setLocalPicks] = useState<Record<string, string>>({})

  // VAR Pre-Cog state
  const [precog, setPrecog] = useState<
    { ready: boolean; pick?: string; line?: string; remaining?: number } | null
  >(null)
  const [precogLoading, setPrecogLoading] = useState(false)
  const [reveal, setReveal] = useState<{ hit: boolean; pick: string } | null>(null)
  const [knowsYou, setKnowsYou] = useState<{ total: number; hits: number; knowsYouPct: number } | null>(null)
  const [championPick, setChampionPick] = useState<string | null>(null)

  const roastRef = useRef<string | null>(null)  // latest roast (avoids spinner on match switch)
  const reqIdRef = useRef(0)                     // guards against stale bootstrap responses

  // Always land at the top — arriving with ?match= from the landing page can
  // otherwise leave the scroll position mid/bottom of the page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!userId) { setLocalPicks({}); return }
    try {
      const hit = localStorage.getItem(`var-predicted-matches-${userId}`)
      setLocalPicks(hit ? JSON.parse(hit) : {})
    } catch { setLocalPicks({}) }
  }, [userId])

  const rememberLocalPick = useCallback((matchId: string, pick: string) => {
    setLocalPicks(prev => {
      const next = { ...prev, [matchId]: pick }
      try { localStorage.setItem(`var-predicted-matches-${userId}`, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [userId])

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

  // ONE consolidated call: roast + full memories + per-match Pre-Cog + scoreboard.
  // Collapsing these into a single endpoint means one Walrus recall per page
  // interaction — robust even on serverless where in-memory caches aren't shared.
  const loadBootstrap = useCallback(async (matchId?: string, bust = false) => {
    if (!userId) return
    const myReq = ++reqIdRef.current
    // Big verdict spinner only on the first load; match switches keep the verdict
    // and just refresh the small Pre-Cog area.
    if (!roastRef.current) setLoading(true)
    if (matchId) setPrecogLoading(true)
    try {
      const url = `/api/bootstrap?userId=${encodeURIComponent(userId)}${matchId ? `&matchId=${matchId}` : ""}${bust ? "&bust=1" : ""}`
      const res = await fetch(url)
      const data = await res.json()
      if (myReq !== reqIdRef.current) return // a newer request superseded this one
      if (data.roast) { setRoast(data.roast); roastRef.current = data.roast }
      setMemoriesUsed(data.memoriesUsed ?? 0)
      if (Array.isArray(data.memories)) setMemories(data.memories)
      if (data.knowsYou) setKnowsYou(data.knowsYou)
      setPrecog(data.precog ?? null)
    } catch {
      if (!roastRef.current) setRoast("VAR is loading its verdict...")
    } finally {
      if (myReq === reqIdRef.current) { setLoading(false); setPrecogLoading(false) }
    }
  }, [userId])

  // Reset per-user view when the wallet changes, then reload champion pick from cache.
  useEffect(() => {
    roastRef.current = null
    setRoast(null); setMemories([]); setMemoriesUsed(0); setPrecog(null); setKnowsYou(null); setChampionPick(null)
    if (!userId) return
    try {
      const hit = localStorage.getItem(`var-champion-${userId}`)
      const cached = hit ? JSON.parse(hit) : null
      if (cached?.pick) setChampionPick(cached.pick)
    } catch { /* ignore */ }
  }, [userId])

  // Persist memory-derived predictions into localStorage so a match stays locked
  // even if a later recall returns empty/degraded (rate limit).
  useEffect(() => {
    if (!userId || memories.length === 0) return
    const fromMemory = parseMemories(memories)
    if (fromMemory.length === 0) return
    setLocalPicks(prev => {
      let changed = false
      const next = { ...prev }
      for (const p of fromMemory) {
        if (next[p.matchId] !== p.predictedWinner) { next[p.matchId] = p.predictedWinner; changed = true }
      }
      if (!changed) return prev
      try { localStorage.setItem(`var-predicted-matches-${userId}`, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [userId, memories])

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
      // Already predicted (409) — lock the UI; VAR keeps the original call.
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        rememberLocalPick(selectedMatch.id, data.predictedWinner ?? pick)
        setSubmitted(false)
        return
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({} as {
          roast?: string | null
          memories?: string[] | null
          knowsYou?: { total: number; hits: number; knowsYouPct: number }
        }))
        setSubmitted(true)
        setPickStat(null)
        rememberLocalPick(selectedMatch.id, pick)
        // Pre-Cog reveal — did VAR call your pick before you made it?
        if (precog?.ready && precog.pick) {
          setReveal({ hit: precog.pick === pick, pick: precog.pick })
        }
        // Mark new prediction so history page knows to invalidate its 1h cache
        try { localStorage.setItem(`var-last-prediction-${userId}`, Date.now().toString()) } catch { /* ignore */ }
        // The POST already generated a fresh verdict + [ROAST_SNAPSHOT] and primed
        // the server cache; reuse its results instantly (no second Groq call).
        if (data.roast) { setRoast(data.roast); roastRef.current = data.roast }
        if (Array.isArray(data.memories)) setMemories(data.memories)
        if (data.knowsYou) setKnowsYou(data.knowsYou)
        setTimeout(() => {
          fetch(`/api/predictions/stats?matchId=${selectedMatch.id}`)
            .then(r => r.json())
            .then(data => {
              const pct: number = data.picks?.[pick] ?? 0
              const total: number = data.total ?? 0
              if (total === 1) {
                setPickStat(`You're the first to predict this match`)
              } else if (total > 1) {
                setPickStat(`${pct}% of ${total} predictors picked ${getTLA(pick)}`)
              }
            })
            .catch(() => {})
        }, 2500)
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

  // Merge memory-derived predictions with the device-local cache so every
  // already-predicted match is locked (one prediction per match, forever).
  const predictedPicks: Record<string, string> = { ...localPicks }
  for (const p of predictions) predictedPicks[p.matchId] = p.predictedWinner

  const selId = selectedMatch?.id
  const selPredicted = selId ? !!predictedPicks[selId] : false

  // One bootstrap fetch per user/match change → roast + memories + Pre-Cog + scoreboard.
  // (selPredicted in deps so the banner clears once a match becomes locked.)
  useEffect(() => {
    if (!userId) return
    loadBootstrap(selId)
  }, [userId, selId, selPredicted, loadBootstrap])

  // ── Wallet not connected ────────────────────────────────────
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PageBg />
          {/* Glow Spots */}
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-28 flex flex-col items-center gap-6 text-center relative animate-fade-in-up" style={{ zIndex: 1 }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 72, height: 72, background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.18)" }}
            >
              <i className="ti ti-target" style={{ fontSize: 32, color: "#3B82F6" }} />
            </div>
            <h1 className="text-[28px] font-medium text-white">Start predicting matches</h1>
            <p className="text-[14px] max-w-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              Connect your Sui wallet to predict World Cup 2026 matches. VAR will remember your calls forever on Walrus.
            </p>
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
          </main>
        </div>
      </>
    )
  }

  // ── Main dashboard ──────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)" }}>
        <PageBg />
        {/* Glow Spots */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 items-start">

            {/* ── Main content (rendered first) ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col gap-6 min-w-0 animate-fade-in-up delay-200 w-full">

              {submitted && (
                <div className="flex flex-col gap-2 animate-fade-in-up">
                  <div
                    className="rounded-2xl p-3.5 text-[13px] font-medium flex items-center gap-2 border border-[#1D9E75]/25 shadow-md shadow-[#1D9E75]/5"
                    style={{ background: "rgba(29, 158, 117, 0.12)", color: "#34D399" }}
                  >
                    <i className="ti ti-check text-[15px] flex-shrink-0" />
                    <span>
                      Prediction saved to Walrus! VAR has taken note.
                      {pickStat && (
                        <span className="ml-2 opacity-60 font-normal">· {pickStat}</span>
                      )}
                    </span>
                  </div>

                  {/* Pre-Cog reveal */}
                  {reveal && (
                    <div
                      className="rounded-2xl p-3.5 text-[13px] font-medium flex items-center gap-2 border"
                      style={
                        reveal.hit
                          ? { background: "rgba(167,139,250,0.12)", borderColor: "rgba(167,139,250,0.30)", color: "#C4B5FD" }
                          : { background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.28)", color: "#FCD34D" }
                      }
                    >
                      <i className={`ti ${reveal.hit ? "ti-eye-check" : "ti-eye-off"} text-[15px] flex-shrink-0`} />
                      <span>
                        {reveal.hit
                          ? `Called it. VAR knew you'd pick ${getTLA(reveal.pick)} before you clicked.`
                          : `VAR guessed ${getTLA(reveal.pick)} — you surprised it this time.`}
                      </span>
                    </div>
                  )}
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

                  {/* VAR Pre-Cog — VAR guesses your pick before you make it */}
                  {!predictedPicks[selectedMatch.id] && (precog || precogLoading) && (
                    <div className="mb-3">
                      {precogLoading ? (
                        <div
                          className="rounded-2xl p-4 border flex items-center gap-2 animate-fade-in-up"
                          style={{ background: "rgba(167,139,250,0.05)", borderColor: "rgba(167,139,250,0.18)" }}
                        >
                          <i className="ti ti-loader animate-slow-spin text-[14px]" style={{ color: "#A78BFA" }} />
                          <span className="text-[12px]" style={{ color: "rgba(196,181,253,0.7)" }}>
                            VAR is reading your file...
                          </span>
                        </div>
                      ) : precog?.ready ? (
                        <div
                          className="rounded-2xl p-4 border animate-fade-in-up"
                          style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.22)" }}
                        >
                          <div
                            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                            style={{ color: "#A78BFA" }}
                          >
                            <i className="ti ti-eye" />
                            VAR Pre-Cog
                          </div>
                          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                            {precog.line}
                          </p>
                        </div>
                      ) : precog && !precog.ready && (precog.remaining ?? 0) > 0 ? (
                        <div
                          className="rounded-2xl px-4 py-2.5 border flex items-center gap-2 animate-fade-in-up"
                          style={{ background: "rgba(167,139,250,0.04)", borderColor: "rgba(167,139,250,0.16)" }}
                        >
                          <i className="ti ti-eye-cog text-[13px]" style={{ color: "#A78BFA" }} />
                          <span className="text-[12px]" style={{ color: "rgba(196,181,253,0.7)" }}>
                            VAR is still studying you — {precog.remaining} more prediction{(precog.remaining ?? 0) > 1 ? "s" : ""} to go.
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <MatchHeroCard
                    match={selectedMatch}
                    redirectOnSubmit={false}
                    onSubmit={handleSubmitPrediction}
                    isSubmitting={submitting}
                    alreadyPredicted={!!predictedPicks[selectedMatch.id]}
                    existingPick={predictedPicks[selectedMatch.id] ?? null}
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

            {/* ── Left sidebar (rendered second) ─────────────────────────────────── */}
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

                {/* VAR knows you — Pre-Cog scoreboard */}
                {knowsYou && knowsYou.total > 0 && (
                  <div
                    className="rounded-2xl p-4 border backdrop-blur-xl"
                    style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.22)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ti ti-eye text-[15px]" style={{ color: "#A78BFA" }} />
                      <span className="text-[12px] font-semibold" style={{ color: "#C4B5FD" }}>
                        VAR knows you {knowsYou.knowsYouPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${knowsYou.knowsYouPct}%`, background: "linear-gradient(90deg, #8B5CF6, #A78BFA)" }}
                      />
                    </div>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                      VAR guessed {knowsYou.hits} of your last {knowsYou.total} picks before you made them.
                    </p>
                  </div>
                )}

                {/* Champion pick CTA / locked display */}
                {championPick ? (
                  <Link
                    href="/champion"
                    className="flex items-center gap-3 rounded-2xl p-4 border backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06]"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(245,158,11,0.30)" }}
                  >
                    <i className="ti ti-trophy flex-shrink-0" style={{ fontSize: 20, color: "#F59E0B" }} />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FlagImg team={championPick} height={24} />
                      <div className="min-w-0">
                        <div className="text-[12px] font-extrabold text-white leading-tight">{getTLA(championPick)}</div>
                        <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>{championPick}</div>
                      </div>
                    </div>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
                    >
                      Locked
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/champion"
                    className="group flex items-center gap-3 rounded-2xl p-4 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <i className="ti ti-trophy select-none transition-transform group-hover:scale-110 text-[#3B82F6]" style={{ fontSize: 22 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-white">Pick the champion</div>
                      <div className="text-[11px] text-neutral-400">Lock in your World Cup winner</div>
                    </div>
                  </Link>
                )}

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
                                setSubmitted(false); setPickStat(null); setReveal(null)
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
                            onClick={() => { setSelectedMatch(m); setSubmitted(false); setPickStat(null); setReveal(null) }}
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
                            {predictedPicks[m.id] ? (
                              <i className="ti ti-lock text-[12px] text-[#1D9E75] flex-shrink-0 ml-2" title="Already predicted" />
                            ) : null}
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

          </div>
        </div>
      </div>
    </>
  )
}
