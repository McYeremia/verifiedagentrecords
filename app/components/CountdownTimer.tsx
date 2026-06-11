"use client"
import { useEffect, useState } from "react"
import { matches, getKickoff } from "../lib/matches"

// Derived from matches[0] so this always matches the predict-page deadline exactly.
const FIRST_MATCH = matches[0] // Mexico vs South Africa, 2026-06-12 02:00 WIB
const KICKOFF = getKickoff(FIRST_MATCH)                // 2026-06-12T02:00:00+07:00 = Jun 11 19:00 UTC
const FINAL   = new Date("2026-07-19T15:00:00-04:00") // World Cup Final, MetLife Stadium, 15:00 EDT

// Format "2026-06-12" → "12 Jun 2026"
function fmtDate(dateStr: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const [, mm, dd] = dateStr.split("-")
  return `${parseInt(dd)} ${months[parseInt(mm) - 1]} 2026`
}

function useCountdown(target: Date) {
  const [diff, setDiff] = useState<number | null>(null)

  useEffect(() => {
    setDiff(Math.max(0, target.getTime() - Date.now()))
    const id = setInterval(
      () => setDiff(Math.max(0, target.getTime() - Date.now())),
      1000
    )
    return () => clearInterval(id)
  }, [target])

  if (diff === null) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: false, ready: false }
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  /    60_000),
    seconds: Math.floor((diff %    60_000)  /     1_000),
    over: diff === 0,
    ready: true,
  }
}

function Block({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[44px]">
      <span className="text-[36px] sm:text-[46px] font-extrabold text-white leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.32)" }}
      >
        {label}
      </span>
    </div>
  )
}

function Sep({ gold }: { gold?: boolean }) {
  return (
    <span
      className="text-[24px] sm:text-[30px] font-bold mb-4 select-none"
      style={{ color: gold ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.20)" }}
    >
      :
    </span>
  )
}

export default function CountdownTimer() {
  const kickoff = useCountdown(KICKOFF)
  const final   = useCountdown(FINAL)
  const ready   = kickoff.ready

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">

      {/* Kickoff */}
      <div
        className="rounded-2xl px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        style={{ background: "rgba(59,130,246,0.06)", border: "0.5px solid rgba(59,130,246,0.20)" }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3B82F6]" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.75)" }}>
              Kickoff · {fmtDate(FIRST_MATCH.date)}
            </span>
          </div>
          <p className="text-[15px] font-medium text-white">
            Opening match — {FIRST_MATCH.homeTeam} vs {FIRST_MATCH.awayTeam}
          </p>
        </div>
        {kickoff.over ? (
          <p className="text-white font-bold text-[15px]"><i className="ti ti-ball-football mr-1.5" />Tournament underway!</p>
        ) : (
          <div className="flex items-end gap-2 sm:gap-3" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}>
            <Block value={kickoff.days}    label="days" />
            <Sep />
            <Block value={kickoff.hours}   label="hrs" />
            <Sep />
            <Block value={kickoff.minutes} label="min" />
            <Sep />
            <Block value={kickoff.seconds} label="sec" />
          </div>
        )}
      </div>

      {/* Final */}
      <div
        className="rounded-2xl px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        style={{ background: "rgba(245,158,11,0.05)", border: "0.5px solid rgba(245,158,11,0.20)" }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F59E0B]" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(245,158,11,0.80)" }}>
              The Final · 19 Jul 2026
            </span>
          </div>
          <p className="text-[15px] font-medium text-white">World Cup Final — MetLife Stadium</p>
        </div>
        {final.over ? (
          <p className="font-bold text-[15px]" style={{ color: "#F59E0B" }}><i className="ti ti-trophy mr-1.5" />Champion crowned!</p>
        ) : (
          <div className="flex items-end gap-2 sm:gap-3" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}>
            <Block value={final.days}    label="days" />
            <Sep gold />
            <Block value={final.hours}   label="hrs" />
            <Sep gold />
            <Block value={final.minutes} label="min" />
            <Sep gold />
            <Block value={final.seconds} label="sec" />
          </div>
        )}
      </div>

    </div>
  )
}
