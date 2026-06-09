"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Match } from "../lib/matches"

interface MatchHeroCardProps {
  match: Match
  redirectOnSubmit?: boolean
  onSubmit?: (pick: string, confidence: string) => Promise<void>
  isSubmitting?: boolean
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
      className="inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{
        background: "#FAECE7",
        color: "#993C1D",
        border: "0.5px solid #F0997B",
        padding: "3px 10px",
        borderRadius: 99,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D85A30", display: "inline-block" }} />
      {timeLeft}
    </span>
  )
}

const CONFIDENCE_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "all-in", label: "All in 🔥" },
]

export default function MatchHeroCard({
  match,
  redirectOnSubmit = true,
  onSubmit,
  isSubmitting,
}: MatchHeroCardProps) {
  const router = useRouter()
  const [pick, setPick] = useState<string | null>(null)
  const [confidence, setConfidence] = useState("medium")

  const handleSubmit = async () => {
    if (!pick) return
    if (redirectOnSubmit) {
      router.push(`/predict?match=${match.id}&pick=${encodeURIComponent(pick)}&confidence=${confidence}`)
    } else if (onSubmit) {
      await onSubmit(pick, confidence)
    }
  }

  const teams = [
    { team: match.homeTeam, flag: match.homeFlag },
    { team: match.awayTeam, flag: match.awayFlag },
  ]

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
        }}
      >
        <div className="flex items-center gap-2">
          <i className="ti ti-calendar-event" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }} />
          <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
            {match.date} · {match.time} · {match.venue}
          </span>
        </div>
        <Countdown targetDate={`${match.date}T00:00:00`} />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Teams row */}
        <div className="flex items-center gap-4">
          {teams.map(({ team, flag }, i) => (
            <div key={team} className="flex items-center gap-2 flex-1">
              <span style={{ fontSize: 32 }}>{flag}</span>
              <div>
                <div className="text-[15px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {team}
                </div>
                <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {match.group}
                </div>
              </div>
              {i === 0 && (
                <span
                  className="mx-auto text-[13px] font-medium"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  VS
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Pick buttons */}
        <div className="grid grid-cols-2 gap-2">
          {teams.map(({ team, flag }) => {
            const selected = pick === team
            return (
              <button
                key={team}
                onClick={() => setPick(team)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: selected ? "#FAECE7" : "var(--color-background-secondary)",
                  color: selected ? "#993C1D" : "var(--color-text-primary)",
                  border: selected ? "1.5px solid #D85A30" : "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <span>{flag}</span>
                {team}
              </button>
            )
          })}
        </div>

        {/* Draw button */}
        <button
          onClick={() => setPick("Draw")}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background: pick === "Draw" ? "#FAECE7" : "var(--color-background-secondary)",
            color: pick === "Draw" ? "#993C1D" : "var(--color-text-secondary)",
            border: pick === "Draw" ? "1.5px solid #D85A30" : "0.5px solid var(--color-border-tertiary)",
          }}
        >
          Draw
        </button>

        {/* Confidence */}
        <div>
          <div
            className="text-[11px] font-medium uppercase tracking-wide mb-2"
            style={{ color: "var(--color-text-tertiary)" }}
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
                  className="text-[13px] font-medium transition-all"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    background: active ? "#FAECE7" : "var(--color-background-secondary)",
                    color: active ? "#D85A30" : "var(--color-text-secondary)",
                    border: active ? "0.5px solid #D85A30" : "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!pick || isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-[14px] font-medium"
          style={{
            background: "#D85A30",
            opacity: !pick ? 0.45 : 1,
            cursor: !pick ? "not-allowed" : "pointer",
          }}
        >
          <i className="ti ti-lock" />
          {isSubmitting ? "Saving..." : "Lock in — VAR is watching"}
        </button>
      </div>
    </div>
  )
}
