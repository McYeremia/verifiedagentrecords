"use client"

import { useState, useEffect } from "react"
import { getTLA } from "../lib/matches"

interface LiveMatchData {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
}

export default function LiveTicker() {
  const [liveMatches, setLiveMatches] = useState<LiveMatchData[]>([])

  useEffect(() => {
    function poll() {
      fetch("/api/matches?live")
        .then(r => r.json())
        .then(data => setLiveMatches(data.matches ?? []))
        .catch(() => {})
    }
    poll()
    const id = setInterval(poll, 60_000)
    return () => clearInterval(id)
  }, [])

  if (liveMatches.length === 0) return null

  // Duplicate items for seamless infinite scroll
  const items = [...liveMatches, ...liveMatches, ...liveMatches]

  return (
    <div
      className="w-full overflow-hidden flex items-center gap-3"
      style={{
        background: "rgba(29, 158, 117, 0.10)",
        borderBottom: "0.5px solid rgba(29, 158, 117, 0.22)",
        height: 36,
      }}
    >
      {/* LIVE badge — fixed left */}
      <div className="flex items-center gap-1.5 px-3 flex-shrink-0">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
          style={{ background: "#1D9E75" }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#1D9E75" }}
        >
          Live
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 16, background: "rgba(29,158,117,0.25)", flexShrink: 0 }} />

      {/* Scrolling matches */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker gap-8 items-center">
          {items.map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 flex-shrink-0 px-2"
            >
              <span
                className="text-[11px] font-bold tracking-wider"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {getTLA(m.homeTeam)}
              </span>
              <span
                className="text-[12px] font-bold tabular-nums"
                style={{ color: "#1D9E75" }}
              >
                {m.homeScore}–{m.awayScore}
              </span>
              <span
                className="text-[11px] font-bold tracking-wider"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {getTLA(m.awayTeam)}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.20)" }}
              >
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
