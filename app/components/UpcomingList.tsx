import Link from "next/link"
import { getUpcomingMatches } from "../lib/matches"

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
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-1.5"
        style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}
      >
        <i className="ti ti-calendar-event" style={{ fontSize: 11, color: "var(--color-text-tertiary)" }} />
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
          Upcoming matches
        </span>
      </div>
      {upcoming.map((match, i) => (
        <div
          key={match.id}
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: i < upcoming.length - 1 ? "0.5px solid var(--color-border-tertiary)" : undefined,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span>{match.homeFlag}</span>
            <span
              className="text-[13px] font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {match.homeTeam} vs {match.awayTeam}
            </span>
            <span>{match.awayFlag}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[12px] hidden sm:block" style={{ color: "var(--color-text-tertiary)" }}>
              {match.date}
            </span>
            <Link
              href={`/predict?match=${match.id}`}
              className="text-[12px] font-medium"
              style={{ color: "#D85A30" }}
            >
              Predict →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
