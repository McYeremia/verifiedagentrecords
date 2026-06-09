import Link from "next/link"
import { getUpcomingMatches, getTLA } from "../lib/matches"
import FlagImg from "./FlagImg"

interface UpcomingListProps {
  skipFirst?: boolean
  limit?: number
}

export default function UpcomingList({ skipFirst = true, limit = 3 }: UpcomingListProps) {
  const all = getUpcomingMatches()
  const upcoming = skipFirst ? all.slice(1, limit + 1) : all.slice(0, limit)

  if (upcoming.length === 0) return null

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/3 backdrop-blur-xl border border-white/10"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-1.5 border-b border-white/5"
        style={{ background: "rgba(255, 255, 255, 0.02)" }}
      >
        <i className="ti ti-calendar-event text-[11px] text-neutral-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Upcoming matches
        </span>
      </div>

      {/* Items */}
      {upcoming.map((match, i) => (
        <div
          key={match.id}
          className="flex items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.05]"
          style={{
            borderBottom: i < upcoming.length - 1 ? "0.5px solid rgba(255, 255, 255, 0.05)" : undefined,
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
              {match.date}
            </span>
            <Link
              href={`/predict?match=${match.id}`}
              className="text-[12px] font-semibold transition-all duration-200 hover:translate-x-1 flex items-center gap-0.5"
              style={{ color: "#3B82F6" }}
            >
              Predict
              <i className="ti ti-chevron-right text-[10px]" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
