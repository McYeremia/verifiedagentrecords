interface HistoryItemProps {
  matchName: string
  pick: string
  confidence: string
  status: "correct" | "wrong" | "pending"
  actualResult?: string
}

const dotConfig = {
  correct: { bg: "rgba(52, 211, 153, 0.12)", color: "#34D399", border: "0.5px solid rgba(52, 211, 153, 0.25)", text: "✓" },
  wrong: { bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444", border: "0.5px solid rgba(239, 68, 68, 0.25)", text: "✗" },
  pending: { bg: "rgba(255, 255, 255, 0.04)", color: "rgba(255, 255, 255, 0.4)", border: "0.5px solid rgba(255, 255, 255, 0.08)", text: "·" },
}

export default function HistoryItem({ matchName, pick, confidence, status, actualResult }: HistoryItemProps) {
  const dot = dotConfig[status]

  return (
    <div
      className="flex items-center gap-2.5 py-3.5 transition-colors duration-200 hover:bg-white/[0.04] px-3 -mx-3 rounded-xl"
      style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.05)" }}
    >
      <div
        className="flex items-center justify-center rounded-full text-[11px] font-bold flex-shrink-0 select-none"
        style={{ width: 20, height: 20, background: dot.bg, color: dot.color, border: dot.border }}
      >
        {dot.text}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-medium truncate text-white"
        >
          {matchName}
        </div>
        <div className="text-[12px] text-neutral-400">
          Pick: {pick}
          {actualResult ? ` · Result: ${actualResult}` : ""}
        </div>
      </div>

      <span
        className="text-[11px] font-medium flex-shrink-0 uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.04] text-neutral-300"
      >
        {confidence}
      </span>
    </div>
  )
}
