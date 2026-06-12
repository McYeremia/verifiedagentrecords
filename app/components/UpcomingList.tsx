import Link from "next/link"
import { getTLA, getUpcomingMatches } from "../lib/matches"
import FlagImg from "./FlagImg"

interface UpcomingListProps {
  skipFirst?: boolean
  limit?: number
}

export default function UpcomingList({ skipFirst = true, limit = 3 }: UpcomingListProps) {
  // getUpcomingMatches() already filters to pre-kickoff only and sorts by kickoff asc
  const all = getUpcomingMatches()
  const displayed = (skipFirst ? all.slice(1) : all).slice(0, limit)

  if (displayed.length === 0) {
    return (
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div
          className="px-4 py-3.5 flex items-center gap-1.5 border-b border-white/5"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <i className="ti ti-trophy text-[11px] text-neutral-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            All prediction windows closed
          </span>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            The group stage is underway — check the leaderboard or your history.
          </p>
          <Link
            href="/leaderboard"
            className="text-[13px] font-medium transition-colors hover:text-white"
            style={{ color: "#3B82F6" }}
          >
            View Leaderboard &rarr;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-1.5 border-b border-white/5"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <i className="ti ti-calendar-event text-[11px] text-neutral-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Upcoming matches
        </span>
      </div>

      {/* Rows — sorted nearest first by getUpcomingMatches() */}
      {displayed.map((match, i) => (
        <div
          key={match.id}
          className="flex items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.05]"
          style={{
            borderBottom: i < displayed.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : undefined,
          }}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <FlagImg team={match.homeTeam} height={16} />
              <span className="text-[12px] font-bold text-white tracking-wide">{getTLA(match.homeTeam)}</span>
              <span className="text-[10px] text-neutral-500">vs</span>
              <span className="text-[12px] font-bold text-white tracking-wide">{getTLA(match.awayTeam)}</span>
              <FlagImg team={match.awayTeam} height={16} />
            </div>
            <div className="text-[10px] text-neutral-500 truncate">
              {match.homeTeam} vs {match.awayTeam}
            </div>
          </div>

          <div className="flex items-center gap-3.5 flex-shrink-0">
            <span className="text-[12px] hidden sm:block text-neutral-400">
              {match.date} · {match.time}
            </span>
            <Link
              href={`/predict?match=${match.id}`}
              className="text-[12px] font-semibold transition-colors duration-200 hover:text-white"
              style={{ color: "#3B82F6" }}
            >
              Predict
            </Link>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div
        className="px-5 py-3.5 flex justify-center"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
      >
        <Link
          href="/predict"
          className="text-[12px] font-medium transition-opacity hover:opacity-100 flex items-center gap-1.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <i className="ti ti-arrow-right" />
          View all matches &amp; make predictions
        </Link>
      </div>
    </div>
  )
}
