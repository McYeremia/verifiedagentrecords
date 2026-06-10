"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Match } from "../lib/matches"
import { getTLA, getKickoff } from "../lib/matches"
import FlagImg from "./FlagImg"

interface MatchHeroCardProps {
  match: Match
  redirectOnSubmit?: boolean
  onSubmit?: (pick: string, confidence: string) => Promise<void>
  isSubmitting?: boolean
  alreadyPredicted?: boolean
  existingPick?: string | null
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Kickoff!"); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`)
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
      style={{
        background: "rgba(59, 130, 246, 0.12)",
        color: "#93C5FD",
        border: "0.5px solid rgba(59, 130, 246, 0.28)",
        padding: "4px 12px",
        borderRadius: 99,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", display: "inline-block" }} className="animate-pulse" />
      {timeLeft}
    </span>
  )
}

const CONFIDENCE_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "all-in", label: "All-In" },
]

const STAGES = [
  { icon: "ti-cloud-upload", text: "Recording to Walrus...",        ms: 2200 },
  { icon: "ti-brain",        text: "VAR is reviewing your file...", ms: 2800 },
  { icon: "ti-sparkles",     text: "Generating your verdict...",    ms: 99999 },
]

export default function MatchHeroCard({
  match,
  redirectOnSubmit = true,
  onSubmit,
  isSubmitting,
  alreadyPredicted = false,
  existingPick = null,
}: MatchHeroCardProps) {
  const router = useRouter()
  const kickoffMs = getKickoff(match).getTime()
  const [pick, setPick] = useState<string | null>(null)
  const [confidence, setConfidence] = useState("medium")
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!isSubmitting) { setStageIdx(0); setProgress(0); return }

    // advance through stages at the timing defined above
    let idx = 0
    setStageIdx(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = 0
    for (const stage of STAGES.slice(0, -1)) {
      elapsed += stage.ms
      timers.push(setTimeout(() => { idx++; setStageIdx(idx) }, elapsed))
    }

    // smooth progress bar over ~9 s (slightly longer than typical response so it never "completes" early)
    const TOTAL_MS = 9000
    const TICK_MS  = 80
    let ticks = 0
    const prog = setInterval(() => {
      ticks++
      const raw = ticks * TICK_MS / TOTAL_MS
      // ease-out curve so it slows near the end and never fully reaches 100
      setProgress(Math.min(raw < 0.85 ? raw : 0.85 + (raw - 0.85) * 0.15, 0.97))
    }, TICK_MS)

    return () => { timers.forEach(clearTimeout); clearInterval(prog) }
  }, [isSubmitting])

  // Predictions lock at kickoff. Re-checks on a timer and resets when the match changes.
  useEffect(() => {
    if (!Number.isFinite(kickoffMs)) { setClosed(false); return }
    const past = () => Date.now() >= kickoffMs
    setClosed(past())
    if (past()) return
    const id = setInterval(() => { if (past()) setClosed(true) }, 30000)
    return () => clearInterval(id)
  }, [kickoffMs])

  const handleSubmit = async () => {
    if (!pick || closed) return
    if (redirectOnSubmit) {
      router.push(`/predict?match=${match.id}&pick=${encodeURIComponent(pick)}&confidence=${confidence}`)
    } else if (onSubmit) {
      await onSubmit(pick, confidence)
    }
  }

  const teams = [match.homeTeam, match.awayTeam]

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/5 backdrop-blur-xl border border-white/10"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/5"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div className="flex items-center gap-2">
          <i className="ti ti-calendar-event text-[12px] text-neutral-400" />
          <span className="text-[12px] text-neutral-400">
            {match.date} · {match.time} · {match.venue}
          </span>
        </div>
        <Countdown targetDate={Number.isFinite(kickoffMs) ? new Date(kickoffMs).toISOString() : `${match.date}T00:00:00`} />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-5">
        {/* Teams row */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <FlagImg team={match.homeTeam} height={32} />
            <div className="min-w-0">
              <div className="text-[18px] font-bold text-white tracking-widest leading-tight">
                {getTLA(match.homeTeam)}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">{match.homeTeam}</div>
            </div>
          </div>
          {/* VS */}
          <div className="flex-shrink-0 px-2">
            <span className="text-[11px] font-bold text-neutral-500 tracking-widest select-none">VS</span>
          </div>
          {/* Away */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <div className="text-[18px] font-bold text-white tracking-widest leading-tight">
                {getTLA(match.awayTeam)}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">{match.awayTeam}</div>
            </div>
            <FlagImg team={match.awayTeam} height={32} />
          </div>
        </div>

        {alreadyPredicted ? (
        /* Locked — one prediction per match, forever */
        <div
          className="flex flex-col items-center gap-3 py-6 rounded-xl text-center"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.22)",
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
            style={{
              background: "rgba(59,130,246,0.12)",
              color: "#93C5FD",
              border: "0.5px solid rgba(59,130,246,0.22)",
            }}
          >
            <i className="ti ti-lock" style={{ fontSize: 10 }} />
            Prediction locked
          </div>
          {existingPick && (
            <div className="flex items-center gap-2.5">
              {existingPick !== "Draw" && <FlagImg team={existingPick} height={28} />}
              <div className="text-left">
                <div className="text-[18px] font-bold text-white tracking-widest leading-tight">
                  {existingPick === "Draw" ? "DRAW" : getTLA(existingPick)}
                </div>
                {existingPick !== "Draw" && (
                  <div className="text-[11px] text-neutral-400">{existingPick}</div>
                )}
              </div>
            </div>
          )}
          <p className="text-[12px] max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
            You already called this one. VAR keeps every prediction on record — no take-backs.
          </p>
        </div>
        ) : closed ? (
        /* Locked at kickoff — predictions close once the match starts */
        <div
          className="flex flex-col items-center gap-3 py-6 rounded-xl text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            <i className="ti ti-clock-x" style={{ fontSize: 10 }} />
            Predictions closed
          </div>
          <p className="text-[12px] max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
            This match has kicked off. VAR locks every call at kickoff — no predicting after the whistle.
          </p>
        </div>
        ) : (
        <>
        {/* Pick buttons */}
        <div className="grid grid-cols-2 gap-2">
          {teams.map((team) => {
            const selected = pick === team
            return (
              <button
                key={team}
                onClick={() => setPick(team)}
                className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-xl transition-all duration-200 active:scale-95 hover:bg-white/[0.06]"
                style={{
                  background: selected ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.03)",
                  border: selected ? "1.5px solid #3B82F6" : "0.5px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <span
                  className="text-[16px] font-bold tracking-widest leading-tight"
                  style={{ color: selected ? "#93C5FD" : "rgba(255, 255, 255, 0.9)" }}
                >
                  {getTLA(team)}
                </span>
                <span
                  className="text-[12px] leading-tight"
                  style={{ color: selected ? "#93C5FD" : "rgba(255, 255, 255, 0.5)" }}
                >
                  {team}
                </span>
              </button>
            )
          })}
        </div>

        {/* Draw button */}
        <button
          onClick={() => setPick("Draw")}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-95 hover:bg-white/[0.06]"
          style={{
            background: pick === "Draw" ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.03)",
            color: pick === "Draw" ? "#93C5FD" : "rgba(255, 255, 255, 0.5)",
            border: pick === "Draw" ? "1.5px solid #3B82F6" : "0.5px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          Draw
        </button>

        {/* Confidence */}
        <div>
          <div
            className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 text-neutral-400"
          >
            Confidence
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONFIDENCE_OPTIONS.map(({ value, label }) => {
              const active = confidence === value
              return (
                <button
                  key={value}
                  onClick={() => setConfidence(value)}
                  className="text-[12px] font-medium transition-all duration-200 active:scale-95 hover:bg-white/[0.06]"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    background: active ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.03)",
                    color: active ? "#93C5FD" : "rgba(255, 255, 255, 0.6)",
                    border: active ? "0.5px solid #3B82F6" : "0.5px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit button + progress */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={!pick || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-[14px] font-medium transition-all duration-300 active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/20"
            style={{
              background: isSubmitting ? "rgba(59,130,246,0.70)" : "#3B82F6",
              opacity: !pick && !isSubmitting ? 0.45 : 1,
              cursor: !pick || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <>
                <i
                  className={`ti ${STAGES[stageIdx].icon} text-[15px] transition-all duration-300`}
                  style={{ animationDuration: stageIdx === 0 ? "0.9s" : undefined }}
                />
                <span className="transition-all duration-300">{STAGES[stageIdx].text}</span>
              </>
            ) : (
              <>
                <i className="ti ti-lock" />
                <span>Lock In Prediction</span>
              </>
            )}
          </button>

          {/* Progress bar — only visible while submitting */}
          <div
            className="w-full rounded-full overflow-hidden transition-all duration-300"
            style={{ height: isSubmitting ? 3 : 0, background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                transition: "width 0.08s linear",
              }}
            />
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
