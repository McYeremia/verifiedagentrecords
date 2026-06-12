"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Link from "next/link"
import Navbar from "../components/Navbar"
import PageBg from "../components/PageBg"
import RoastCard from "../components/RoastCard"
import { getMatchById, isPredictionClosed } from "../lib/matches"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// On-chain proof: every memory lives in a real Walrus blob on Mainnet.
// Walruscan is the canonical Walrus explorer; the aggregator serves the raw
// (SEAL-encrypted) bytes the SDK itself downloads — proof the blob exists.
const walruscanUrl = (blobId: string) => `https://walruscan.com/mainnet/blob/${blobId}`
const shortBlob = (blobId: string) => `${blobId.slice(0, 6)}…${blobId.slice(-4)}`

type RecalledMem = { text: string; blob_id: string }

interface RoastSnapshot {
  roast: string
  trigger: string
  predictionCount: number
  timestamp: string
}

// ─── Timeline item types ───────────────────────────────────────────────────

type PredictionItem = {
  kind: "prediction"
  matchName: string
  predictedWinner: string
  confidence: string
  timestamp: string
  blobId?: string
}

type ResultItem = {
  kind: "result"
  matchName: string
  actualWinner: string
  score: string
  predictedWinner: string
  isCorrect: boolean
  timestamp: string
}

type SnapshotItem = {
  kind: "snapshot"
  roast: string
  trigger: string
  predictionCount: number
  timestamp: string
}

type ChampionItem = {
  kind: "champion"
  team: string
  status: "locked" | "correct" | "wrong"
  actualWinner?: string
  timestamp: string
  blobId?: string
}

type TimelineItem = PredictionItem | ResultItem | SnapshotItem | ChampionItem

// ─── Parsers ───────────────────────────────────────────────────────────────

function buildTimeline(
  memories: string[],
  snapshots: RoastSnapshot[],
  blobMap: Map<string, string>,
): TimelineItem[] {
  // Prediction items — always shown as "prediction" regardless of result
  const predItems: PredictionItem[] = memories
    .filter(t => t.startsWith("[PREDICTION]"))
    .map(text => {
      const midM    = text.match(/matchId: ([\w_]+)/)
      const winnerM = text.match(/predicted (.+?) to win/)
      const teamsM  = text.match(/to win (.+?) \(matchId/)
      const confM   = text.match(/Confidence: (\w+)/)
      const tsM     = text.match(/Timestamp: (.+)$/)
      if (!midM || !winnerM) return null
      return {
        kind: "prediction" as const,
        matchName: teamsM?.[1] ?? midM[1],
        predictedWinner: winnerM[1],
        confidence: confM?.[1] ?? "medium",
        timestamp: tsM?.[1]?.trim() ?? "",
        blobId: blobMap.get(text),
      }
    })
    .filter(Boolean) as PredictionItem[]

  // Result items — separate bubble per resolved match (deduplicated by matchId)
  const seenResultIds = new Set<string>()
  const resultItems: ResultItem[] = []
  for (const text of memories) {
    if (!text.startsWith("[RESULT]")) continue
    const midM     = text.match(/Match ([\w_]+)/)
    if (!midM || seenResultIds.has(midM[1])) continue
    seenResultIds.add(midM[1])
    const matchNameM  = text.match(/Match [\w_]+ \((.+?)\) ended/)
    const winnerM     = text.match(/ended: (.+?) won (\d+)-(\d+)/)
    const predictedM  = text.match(/predicted (.+?) —/)
    const correctM    = text.match(/(CORRECT|WRONG)/)
    const tsM         = text.match(/Timestamp: (.+)$/)
    if (!winnerM || !tsM) continue
    resultItems.push({
      kind: "result",
      matchName: matchNameM?.[1] ?? midM[1],
      actualWinner: winnerM[1],
      score: `${winnerM[2]}-${winnerM[3]}`,
      predictedWinner: predictedM?.[1] ?? "",
      isCorrect: correctM?.[1] === "CORRECT",
      timestamp: tsM[1].trim(),
    })
  }

  const snapItems: SnapshotItem[] = snapshots.map(s => ({
    kind: "snapshot" as const,
    roast: s.roast,
    trigger: s.trigger,
    predictionCount: s.predictionCount,
    timestamp: s.timestamp,
  }))

  // Parse champion pick — one per user
  const championResultText = memories.find(t => t.startsWith("[CHAMPION_RESULT]"))
  const championPickText   = memories.find(t => t.startsWith("[CHAMPION_PICK]"))
  const championItems: ChampionItem[] = []
  if (championPickText) {
    const teamM   = championPickText.match(/predicts (.+?) will win/)
    const tsM     = championPickText.match(/Locked in: (.+)$/)
    if (teamM && tsM) {
      let status: ChampionItem["status"] = "locked"
      let actualWinner: string | undefined
      if (championResultText) {
        const outcomeM = championResultText.match(/(CORRECT|WRONG)/)
        const actualM  = championResultText.match(/Actual winner: (.+?)\. Timestamp/)
        status = outcomeM?.[1] === "CORRECT" ? "correct" : "wrong"
        actualWinner = actualM?.[1]
      }
      championItems.push({
        kind: "champion",
        team: teamM[1],
        status,
        actualWinner,
        timestamp: tsM[1].trim(),
        blobId: blobMap.get(championPickText),
      })
    }
  }

  return [...predItems, ...resultItems, ...snapItems, ...championItems].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

function computeStats(memories: string[]) {
  // Total = every prediction the user has ever made, resolved or not
  const total = new Set(
    memories
      .filter(t => t.startsWith("[PREDICTION]"))
      .map(t => t.match(/matchId: ([\w_]+)/)?.[1])
      .filter(Boolean)
  ).size

  // Correct + accuracy: prefer [LEADERBOARD] record (authoritative, written by resolve)
  const lbTexts = memories
    .filter(t => t.startsWith("[LEADERBOARD]"))
    .sort((a, b) => {
      const tsA = a.match(/Last updated: (.+)/)?.[1] ?? ""
      const tsB = b.match(/Last updated: (.+)/)?.[1] ?? ""
      return tsB.localeCompare(tsA)
    })

  if (lbTexts.length > 0) {
    const latest   = lbTexts[0]
    const correctM = latest.match(/(\d+) correct/)
    const pctM     = latest.match(/(\d+)% accuracy/)
    if (correctM && pctM) {
      return { total, correct: parseInt(correctM[1]), accuracy: parseInt(pctM[1]) }
    }
  }

  // Fallback: compute correct/accuracy from [RESULT] records
  const resultMap: Record<string, boolean> = {}
  for (const text of memories) {
    if (!text.startsWith("[RESULT]")) continue
    const midM    = text.match(/Match ([\w_]+)/)
    const correctM = text.match(/(CORRECT|WRONG)/)
    if (midM && correctM) resultMap[midM[1]] = correctM[1] === "CORRECT"
  }
  const predIds  = memories.filter(t => t.startsWith("[PREDICTION]")).map(t => t.match(/matchId: ([\w_]+)/)?.[1]).filter(Boolean) as string[]
  const resolved = predIds.filter(id => id in resultMap)
  const correct  = resolved.filter(id => resultMap[id]).length
  return {
    total,
    correct,
    accuracy: resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : 0,
  }
}

// ─── Styled helpers ────────────────────────────────────────────────────────

const CONFIDENCE_COLORS: Record<string, string> = {
  low: "#94A3B8",
  medium: "#93C5FD",
  high: "#34D399",
  "all-in": "#FBBF24",
}

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  correct: { color: "#1D9E75", bg: "rgba(29,158,117,0.12)", icon: "ti-check",        label: "Correct" },
  wrong:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  icon: "ti-x",            label: "Wrong"   },
  pending: { color: "#94A3B8", bg: "rgba(148,163,184,0.10)", icon: "ti-clock-hour-4", label: "Pending" },
}

const TRIGGER_META: Record<string, { label: string; color: string; icon: string }> = {
  PREDICTION: { label: "VAR snapshot",      color: "#3B82F6", icon: "ti-quote"    },
  RESULT:     { label: "After result",      color: "#EAB308", icon: "ti-trophy"   },
  PATTERN:    { label: "Pattern detected",  color: "#EF4444", icon: "ti-flame"    },
}

// Tiny "verify this exact record on Walrus" link — appears on every memory that
// carries a real blob_id. Clicking opens the blob on Walruscan (the explorer),
// proving this individual prediction lives on Walrus Mainnet, not a database.
function BlobProofLink({ blobId }: { blobId: string }) {
  return (
    <a
      href={walruscanUrl(blobId)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      title={`Verify on Walrus — blob ${blobId}`}
      className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors duration-200"
      style={{ background: "rgba(29,158,117,0.10)", color: "#34D399", border: "0.5px solid rgba(29,158,117,0.25)" }}
    >
      <i className="ti ti-shield-check" style={{ fontSize: 9 }} />
      {shortBlob(blobId)}
    </a>
  )
}

// ─── Unified Timeline ──────────────────────────────────────────────────────

function UnifiedTimeline({ items, loading }: { items: TimelineItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <i className="ti ti-loader animate-slow-spin text-[14px]" style={{ color: "rgba(255,255,255,0.20)" }} />
        <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Loading VAR records...
        </span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          No history yet.{" "}
          <Link href="/predict" className="underline transition-colors duration-200 hover:text-white" style={{ color: "#3B82F6" }}>
            Make Predictions
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-px"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />

      <div className="flex flex-col gap-0">
        {items.map((item, i) => {
          const isLast = i === 0
          const ts = item.timestamp ? new Date(item.timestamp) : null
          const dateStr = ts ? ts.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""
          const timeStr = ts ? ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""

          if (item.kind === "prediction") {
            const confColor = CONFIDENCE_COLORS[item.confidence] ?? "#93C5FD"
            return (
              <div key={i} className="flex gap-3.5 pb-4 relative">
                {/* Dot — always blue (prediction is immutable, result is a separate bubble) */}
                <div
                  className="w-[23px] h-[23px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}
                >
                  <i className="ti ti-target" style={{ fontSize: 10, color: "#3B82F6" }} />
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>
                      Prediction
                    </span>
                    {dateStr && (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                        {dateStr} · {timeStr}
                      </span>
                    )}
                    {item.blobId && <BlobProofLink blobId={item.blobId} />}
                  </div>
                  <div
                    className="rounded-xl p-3.5 flex items-start justify-between gap-3"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "0.5px solid rgba(255,255,255,0.06)",
                      borderLeft: "2px solid rgba(59,130,246,0.5)",
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] text-neutral-400 truncate">{item.matchName}</div>
                      <div className="text-[14px] font-semibold text-white mt-0.5">{item.predictedWinner}</div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${confColor}15`, color: confColor }}
                    >
                      {item.confidence}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          if (item.kind === "result") {
            const color = item.isCorrect ? "#1D9E75" : "#EF4444"
            const icon  = item.isCorrect ? "ti-check" : "ti-x"
            const label = item.isCorrect ? "Correct" : "Wrong"
            return (
              <div key={`result-${i}`} className="flex gap-3.5 pb-4 relative">
                <div
                  className="w-[23px] h-[23px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                  style={{
                    background: isLast ? color : `${color}18`,
                    border: `1px solid ${isLast ? color : `${color}40`}`,
                    boxShadow: isLast ? `0 0 10px ${color}55` : "none",
                  }}
                >
                  <i className={`ti ${icon}`} style={{ fontSize: 10, color: isLast ? "white" : color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>
                      Result
                    </span>
                    {dateStr && (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                        {dateStr} · {timeStr}
                      </span>
                    )}
                  </div>
                  <div
                    className="rounded-xl p-3.5 flex items-start justify-between gap-3"
                    style={{
                      background: `${color}06`,
                      border: `0.5px solid ${color}25`,
                      borderLeft: `2px solid ${color}`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] text-neutral-400 truncate">{item.matchName}</div>
                      <div className="text-[14px] font-semibold text-white mt-0.5">
                        {item.actualWinner} won {item.score}
                      </div>
                      {item.predictedWinner && (
                        <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                          You picked {item.predictedWinner}
                        </div>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${color}18`, color }}
                    >
                      <i className={`ti ${icon}`} style={{ fontSize: 9 }} />
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          // Champion item
          if (item.kind === "champion") {
            const champColor = item.status === "correct" ? "#1D9E75" : item.status === "wrong" ? "#EF4444" : "#FBBF24"
            const champIcon  = item.status === "correct" ? "ti-check" : item.status === "wrong" ? "ti-x" : "ti-lock"
            const champLabel = item.status === "correct" ? "Correct" : item.status === "wrong" ? "Wrong" : "Locked in"
            return (
              <div key={i} className="flex gap-3.5 pb-4 relative">
                <div
                  className="w-[23px] h-[23px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                  style={{
                    background: isLast ? champColor : `${champColor}20`,
                    border: `1px solid ${isLast ? champColor : `${champColor}45`}`,
                    boxShadow: isLast ? `0 0 10px ${champColor}55` : "none",
                  }}
                >
                  <i className={`ti ${champIcon}`} style={{ fontSize: 10, color: isLast ? "white" : champColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${champColor}15`, color: champColor, border: `0.5px solid ${champColor}30` }}
                    >
                      <i className="ti ti-trophy mr-1" style={{ fontSize: 9 }} />
                      WC 2026 Champion Pick
                    </span>
                    {dateStr && (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                        {dateStr} · {timeStr}
                      </span>
                    )}
                    {item.blobId && <BlobProofLink blobId={item.blobId} />}
                  </div>
                  <div
                    className="rounded-xl p-3.5 flex items-start justify-between gap-3"
                    style={{
                      background: isLast ? `${champColor}06` : "rgba(255,255,255,0.02)",
                      border: `0.5px solid ${isLast ? `${champColor}20` : "rgba(255,255,255,0.06)"}`,
                      borderLeft: `2px solid ${champColor}`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400">World Cup 2026 winner</div>
                      <div className="text-[15px] font-bold text-white mt-0.5">{item.team}</div>
                      {item.actualWinner && item.status !== "locked" && (
                        <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.30)" }}>
                          Actual winner: {item.actualWinner}
                        </div>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${champColor}18`, color: champColor }}
                    >
                      <i className={`ti ${champIcon}`} style={{ fontSize: 9 }} />
                      {champLabel}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          // Snapshot item
          const meta = TRIGGER_META[item.trigger] ?? TRIGGER_META.PREDICTION
          return (
            <div key={i} className="flex gap-3.5 pb-4 relative">
              {/* Dot */}
              <div
                className="w-[23px] h-[23px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                style={{
                  background: isLast ? meta.color : `${meta.color}18`,
                  border: `1px solid ${isLast ? meta.color : `${meta.color}40`}`,
                  boxShadow: isLast ? `0 0 10px ${meta.color}55` : "none",
                }}
              >
                <i className={`ti ${meta.icon}`} style={{ fontSize: 10, color: isLast ? "white" : meta.color }} />
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: `${meta.color}15`,
                      color: meta.color,
                      border: `0.5px solid ${meta.color}30`,
                    }}
                  >
                    {meta.label}
                  </span>
                  {dateStr && (
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                      {dateStr} · {timeStr}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.15)" }}>
                    · {item.predictionCount} pred{item.predictionCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className="rounded-xl px-4 py-3 text-[13px] leading-relaxed italic"
                  style={{
                    background: isLast ? `${meta.color}08` : "rgba(255,255,255,0.02)",
                    border: `0.5px solid ${isLast ? `${meta.color}25` : "rgba(255,255,255,0.06)"}`,
                    borderLeft: `2px solid ${meta.color}`,
                    color: isLast ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.42)",
                  }}
                >
                  &ldquo;{item.roast}&rdquo;
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function HistoryDashboard() {
  const searchParams  = useSearchParams()
  const account       = useCurrentAccount()
  const urlUserId     = searchParams.get("userId")
  const walletUserId  = account?.address ?? null
  const userId        = urlUserId || walletUserId

  const [roast, setRoast]               = useState<string>("No predictions yet. Too scared to be wrong?")
  const [memoriesUsed, setMemoriesUsed] = useState(0)
  const [memories, setMemories]         = useState<string[]>([])
  const [records, setRecords]           = useState<RecalledMem[]>([])
  const [snapshots, setSnapshots]       = useState<RoastSnapshot[]>([])
  const [roastTs, setRoastTs]           = useState<number | null>(null)
  const [loading, setLoading]           = useState(false)
  const [snapshotsLoading, setSnapshotsLoading] = useState(false)
  const [syncing, setSyncing]           = useState(false)
  const [refreshKey, setRefreshKey]     = useState(0)
  const autoSyncAttempted               = useRef(false)
  const [calibration, setCalibration]   = useState<{
    buckets: { level: string; label: string; total: number; correct: number; accuracy: number }[]
    resolvedCount: number
    verdict: string | null
    overconfident: boolean
  } | null>(null)
  // Fires at most once per mount — prevents repeated Groq calls on state re-renders
  const gapFillAttempted = useRef(false)

  useEffect(() => {
    if (!userId) { setCalibration(null); return }
    let cancelled = false
    fetch(`/api/profile?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.calibration) setCalibration(d.calibration) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  // Gap detection: fires ONLY for [PREDICTION] gaps — when a predict submit failed
  // to save its snapshot (Walrus timeout, Groq failure).
  // [RESULT] gaps are NOT handled here: resolve always writes a ROAST_SNAPSHOT,
  // so /api/roast/history will return the fresh one shortly. Triggering gap-fill
  // on RESULT gaps causes a race condition where a stale Groq call overrides the
  // correct PATTERN snapshot that /api/roast/history delivers.
  useEffect(() => {
    if (!userId || memories.length === 0 || gapFillAttempted.current) return

    // Only check PREDICTION timestamps — RESULT gaps are resolved by /api/roast/history
    const latestPredTs = memories
      .filter(m => m.startsWith("[PREDICTION]"))
      .map(m => m.match(/Timestamp: (.+)/)?.[1] ?? "")
      .filter(Boolean)
      .sort()
      .at(-1)
    if (!latestPredTs) return

    const latestSnapshotTs = snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : ""
    if (latestSnapshotTs >= latestPredTs) return // snapshot covers all predictions

    gapFillAttempted.current = true

    // 1. Try localStorage verdict from predict page (same roast, zero network call)
    try {
      const stored = localStorage.getItem(`var-predict-roast-${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored) as { roast: string; timestamp: string }
        if (parsed.roast && parsed.timestamp > latestSnapshotTs) {
          setRoast(parsed.roast)
          return
        }
      }
    } catch { /* ignore */ }

    // 2. Last resort: generate via getRoast only if no localStorage entry exists
    // (prediction gap with no stored verdict — rare, only when predict page failed)
    fetch(`/api/roast?userId=${encodeURIComponent(userId)}&bust=1`)
      .then(r => r.json())
      .then(d => { if (d.roast) setRoast(d.roast) })
      .catch(() => {})
  }, [userId, memories, snapshots])

  // Auto-sync: when user has predictions for finished matches with no [RESULT] yet,
  // trigger /api/matches/sync in the background and refetch after Walrus indexes.
  useEffect(() => {
    if (!userId || memories.length === 0 || autoSyncAttempted.current) return

    const pendingMatchIds = memories
      .filter(m => m.startsWith("[PREDICTION]"))
      .map(m => m.match(/matchId: ([\w_]+)/)?.[1])
      .filter((mid): mid is string => !!mid)
      .filter(mid => !memories.some(m => m.startsWith("[RESULT]") && m.includes(`Match ${mid}`)))

    const hasFinishedUnresolved = pendingMatchIds.some(mid => {
      const match = getMatchById(mid)
      return match ? isPredictionClosed(match) : false
    })

    if (!hasFinishedUnresolved) return

    autoSyncAttempted.current = true
    setSyncing(true)

    fetch("/api/matches/sync")
      .then(() => {
        // First refresh after sync completes — Walrus may still be indexing
        setTimeout(() => {
          setSyncing(false)
          setRefreshKey(k => k + 1)
        }, 20_000)
        // Second silent refresh after Walrus indexing window (~45s)
        setTimeout(() => setRefreshKey(k => k + 1), 55_000)
      })
      .catch(() => setSyncing(false))
  }, [userId, memories])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const cacheKey = `var-history-data-${userId}`
    const patchCache = (patch: Record<string, unknown>) => {
      try {
        const prev = JSON.parse(localStorage.getItem(cacheKey) || "null") || {}
        localStorage.setItem(cacheKey, JSON.stringify({ ...prev, ...patch }))
      } catch { /* ignore */ }
    }

    // Instant paint from cache (stale-while-revalidate): navigating in from ANY
    // page (home, leaderboard, …) shows data immediately — never a flash of zeros,
    // never blocked on a possibly rate-limited recall. The fetches below refresh it.
    let hadCache = false
    try {
      const hit = localStorage.getItem(cacheKey)
      if (hit) {
        const c = JSON.parse(hit) as { memories?: string[]; records?: RecalledMem[]; snapshots?: RoastSnapshot[] }
        if (Array.isArray(c.memories)) { setMemories(c.memories); setMemoriesUsed(c.memories.length) }
        if (Array.isArray(c.records)) setRecords(c.records)
        if (Array.isArray(c.snapshots)) {
          setSnapshots(c.snapshots)
          const latest = c.snapshots[c.snapshots.length - 1]
          if (latest?.roast) { setRoast(latest.roast); setRoastTs(new Date(latest.timestamp).getTime() || null) }
        }
        hadCache = true
      }
    } catch { /* ignore */ }
    if (!hadCache) { setLoading(true); setSnapshotsLoading(true) }

    // Timeline memories — fresh, zero Groq. Keep current data on an empty/rate-limited reply.
    fetch(`/api/memories?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (Array.isArray(d.memories) && !(d.rateLimited && d.memories.length === 0)) {
          setMemories(d.memories); setMemoriesUsed(d.memories.length)
          const recs: RecalledMem[] = Array.isArray(d.records) ? d.records : []
          setRecords(recs)
          patchCache({ memories: d.memories, records: recs })
        }
      })
      .catch(() => {})

    // Live verdict + snapshots — the LATEST [ROAST_SNAPSHOT] (zero Groq), written on
    // each prediction + result. Same verdict as /predict; never generates here.
    fetch(`/api/roast/history?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.rateLimited && (data.snapshots?.length ?? 0) === 0) return
        const snaps: RoastSnapshot[] = data.snapshots ?? []
        setSnapshots(snaps)
        const latest = snaps[snaps.length - 1] // /api/roast/history returns oldest→newest
        if (latest?.roast) {
          setRoast(latest.roast)
          setRoastTs(new Date(latest.timestamp).getTime() || null)
        } else if (!hadCache) {
          setRoast("No predictions yet. Too scared to be wrong?")
        }
        patchCache({ snapshots: snaps })
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setLoading(false); setSnapshotsLoading(false) } })

    return () => { cancelled = true }
  }, [userId, refreshKey])

  if (!userId) {
    return (
      <>
        <Navbar />
        <div
          className="dark bg-grid-pattern relative overflow-hidden"
          style={{ background: "#040810", minHeight: "calc(100vh - 65px)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <PageBg />
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-28 flex flex-col items-center gap-6 text-center relative animate-fade-in-up" style={{ zIndex: 1 }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 72, height: 72, background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.18)" }}
            >
              <i className="ti ti-history" style={{ fontSize: 32, color: "#3B82F6" }} />
            </div>
            <h1 className="text-[28px] font-medium text-white">View your prediction history</h1>
            <p className="text-[14px] max-w-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              Connect your Sui wallet to see your full prediction record and how VAR&apos;s verdict evolved.
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

  const { total, correct, accuracy } = computeStats(memories)
  const blobMap = new Map(records.filter(r => r.blob_id).map(r => [r.text, r.blob_id]))
  const timeline = buildTimeline(memories, snapshots, blobMap)
  const timelineLoading = loading || snapshotsLoading
  // A real blob to anchor the sidebar proof link — prefer the user's own
  // prediction, fall back to any record that carries a blob_id.
  const verifiableBlob =
    records.find(r => r.blob_id && r.text.startsWith("[PREDICTION]"))?.blob_id ??
    records.find(r => r.blob_id)?.blob_id ?? null

  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)" }}>
        <PageBg />
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* Sidebar */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 animate-fade-in-up delay-100">
              <div className="flex flex-col gap-4 lg:sticky lg:top-20">

                {/* Profile */}
                <div className="rounded-2xl p-5 border border-white/10 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className="flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0 border border-[#3B82F6]/25 select-none"
                      style={{ width: 52, height: 52, background: "rgba(59,130,246,0.12)", fontSize: 18 }}
                    >
                      {userId.slice(2, 4).toUpperCase() || "AN"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold font-mono text-white truncate">{truncateAddress(userId)}</div>
                      <div className="text-[12px] text-neutral-400">Prediction record · 2026</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-4 border-t border-white/5">
                    {[
                      { value: total,         label: "Total",    color: "white"   },
                      { value: correct,       label: "Correct",  color: "#1D9E75" },
                      { value: `${accuracy}%`, label: "Accuracy", color: "#93C5FD" },
                    ].map(({ value, label, color }) => (
                      <div key={label} className="text-center">
                        <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
                        <div className="text-[11px] text-neutral-400">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share — only shown for own profile */}
                {(!urlUserId || urlUserId === walletUserId) && (
                  <Link
                    href={`/card?userId=${encodeURIComponent(userId)}`}
                    className="group flex items-center justify-center gap-2 text-[13px] font-semibold py-3 rounded-full w-full transition-all duration-300 active:scale-[0.97] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                    style={{ background: "#3B82F6", color: "white" }}
                  >
                    <i className="ti ti-share transition-transform group-hover:rotate-12" />
                    Share Verdict Card
                  </Link>
                )}

                {/* Walrus proof */}
                <div className="rounded-2xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} className="animate-pulse flex-shrink-0" />
                    <span className="text-[12px] font-semibold text-neutral-300">Stored on Walrus Mainnet</span>
                  </div>
                  <p className="text-[12px] text-neutral-400 leading-relaxed">
                    {memoriesUsed > 0
                      ? <>VAR is holding <span className="text-white font-semibold">{memoriesUsed}</span> {memoriesUsed === 1 ? "record" : "records"} against you — stored permanently on Walrus Mainnet.</>
                      : <>No records yet. Make a prediction and VAR will track it forever.</>
                    }
                  </p>

                  {verifiableBlob && (
                    <>
                      <a
                        href={walruscanUrl(verifiableBlob)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-colors duration-200"
                        style={{ background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.22)" }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <i className="ti ti-shield-check flex-shrink-0" style={{ fontSize: 13, color: "#34D399" }} />
                          <span className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold" style={{ color: "#34D399" }}>Verify on Walrus Explorer</span>
                            <span className="text-[10px] font-mono truncate" style={{ color: "rgba(255,255,255,0.30)" }}>{shortBlob(verifiableBlob)}</span>
                          </span>
                        </span>
                        <i className="ti ti-external-link flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }} />
                      </a>
                      <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                        Each record is encrypted (SEAL) on-chain — the explorer proves the blob exists; VAR decrypts it for you here.
                      </p>
                    </>
                  )}
                </div>

                {/* VAR signal key */}
                <div className="rounded-2xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                    VAR signal key
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { color: "#3B82F6", icon: "ti-target",       label: "Prediction"          },
                      { color: "#1D9E75", icon: "ti-check",        label: "Correct result"      },
                      { color: "#EF4444", icon: "ti-x",            label: "Wrong result"        },
                      { color: "#FBBF24", icon: "ti-lock",         label: "Champion pick"       },
                      { color: "#3B82F6", icon: "ti-quote",        label: "VAR snapshot"        },
                      { color: "#EAB308", icon: "ti-trophy",       label: "After match result"  },
                      { color: "#EF4444", icon: "ti-flame",        label: "Pattern detected"    },
                    ].map(({ color, icon, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}18`, border: `1px solid ${color}40` }}
                        >
                          <i className={`ti ${icon}`} style={{ fontSize: 8, color }} />
                        </div>
                        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col gap-6 min-w-0 animate-fade-in-up delay-200 w-full">

              {/* Latest roast */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none">
                  <i className="ti ti-quote text-[#3B82F6]" />
                  Latest VAR verdict
                </div>
                {loading ? (
                  <div className="rounded-2xl p-8 text-center border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[13px] text-neutral-400">Loading verdict...</span>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#3B82F6]/3 rounded-2xl filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <RoastCard
                      roast={roast}
                      memoriesUsed={memoriesUsed}
                      predictionCount={memories.filter(m => m.startsWith("[PREDICTION]")).length}
                      timestamp={roastTs}
                    />
                  </div>
                )}
              </div>

              {/* Overconfidence index (#2) */}
              {calibration && calibration.resolvedCount > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none">
                    <i className="ti ti-gauge text-[#FCD34D]" />
                    Overconfidence index
                    <Link href={`/profile?userId=${encodeURIComponent(userId!)}`} className="ml-auto text-[10px] font-medium transition-colors duration-200 hover:text-white" style={{ color: "rgba(255,255,255,0.30)" }}>
                      View Profile
                    </Link>
                  </div>
                  <div className="rounded-2xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex flex-col gap-3">
                      {calibration.buckets.map(b => {
                        const col = b.accuracy >= 60 ? "#1D9E75" : b.accuracy >= 40 ? "#93C5FD" : "#F87171"
                        return (
                          <div key={b.level} className="flex items-center gap-3">
                            <span className="text-[12px] w-16 flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }}>{b.label}</span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${b.accuracy}%`, background: col }} />
                            </div>
                            <span className="text-[12px] font-semibold tabular-nums w-20 text-right flex-shrink-0" style={{ color: col }}>
                              {b.accuracy}% <span className="text-neutral-500 font-normal">({b.total})</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {calibration.verdict && (
                      <p className="text-[13px] leading-relaxed mt-4 pt-4 border-t border-white/5 italic" style={{ color: calibration.overconfident ? "#FCD34D" : "rgba(255,255,255,0.55)" }}>
                        &ldquo;{calibration.verdict}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-sync indicator */}
              {syncing && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(59,130,246,0.07)", border: "0.5px solid rgba(59,130,246,0.18)" }}
                >
                  <i className="ti ti-loader animate-slow-spin flex-shrink-0" style={{ fontSize: 13, color: "#3B82F6" }} />
                  <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                    VAR is checking match results — updating your record...
                  </span>
                </div>
              )}

              {/* Unified timeline */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-neutral-400 flex items-center gap-1.5 select-none">
                  <i className="ti ti-timeline text-[#3B82F6]" />
                  Prediction &amp; roast history
                  {timeline.length > 0 && (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(59,130,246,0.12)", color: "#93C5FD", border: "0.5px solid rgba(59,130,246,0.20)" }}
                    >
                      {timeline.length}
                    </span>
                  )}
                </div>
                <div className="rounded-2xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <UnifiedTimeline items={timeline} loading={timelineLoading} />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
