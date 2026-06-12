import Link from "next/link"
import { getTLA, matches, isPredictionClosed, getKickoff } from "../lib/matches"
import FlagImg from "./FlagImg"

interface UpcomingListProps {
  skipFirst?: boolean
  limit?: number
}

export default function UpcomingList({ skipFirst = true, limit = 3 }: UpcomingListProps) {
  const now = Date.now()

  // Sort all 72 fixtures by kickoff ascending, then show a window centred on
  // "now": up to 2 recently kicked-off matches (Locked) + the rest upcoming.
  const sorted = [...matches].sort((a, b) => getKickoff(a).getTime() - getKickoff(b).getTime())

  // Find the first match whose kickoff is still in the future
  const firstUpcomingIdx = sorted.findIndex(m => getKickoff(m).getTime() > now)

  // Window start: up to 2 matches before the first upcoming (so recently locked
  // matches appear at the top of the list)
  const windowStart = Math.max(0, firstUpcomingIdx === -1 ? sorted.length - limit : firstUpcomingIdx - 2)

  let displayed = sorted.slice(windowStart)
  if (skipFirst) displayed = displayed.slice(1)
  displayed = displayed.slice(0, limit)

  // Fallback: if window is empty (all matches over and skipFirst consumed all),
  // show the last `limit` matches as Locked.
  if (displayed.length === 0) {
    displayed = sorted.slice(-limit)
  }

  const hasUpcoming = displayed.some(m => !isPredictionClosed(m))

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
        <i className={`ti ${hasUpcoming ? "ti-calendar-event" : "ti-check"} text-[11px] text-neutral-400`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          {hasUpcoming ? "Upcoming matches" : "Matches in progress"}
        </span>
      </div>

      {/* Rows */}
      {displayed.map((match, i) => {
        const locked = isPredictionClosed(match)
        return (
          <div
            key={match.id}
            className="flex items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.05]"
            style={{
              borderBottom: i < displayed.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : undefined,
              opacity: locked ? 0.72 : 1,
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
              {locked ? (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    color: "#EF4444",
                    border: "0.5px solid rgba(239,68,68,0.20)",
                  }}
                >
                  Locked
                </span>
              ) : (
                <Link
                  href={`/predict?match=${match.id}`}
                  className="text-[12px] font-semibold transition-colors duration-200 hover:text-white"
                  style={{ color: "#3B82F6" }}
                >
                  Predict
                </Link>
              )}
            </div>
          </div>
        )
      })}

      {/* Footer link */}
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
          View all matches &amp; results
        </Link>
      </div>
    </div>
  )
}
