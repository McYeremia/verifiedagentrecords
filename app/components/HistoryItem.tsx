interface HistoryItemProps {
  matchName: string
  pick: string
  confidence: string
  status: "correct" | "wrong" | "pending"
  actualResult?: string
}

const dotConfig = {
  correct: { bg: "#EAF3DE", color: "#3B6D11", text: "✓" },
  wrong: { bg: "#FAECE7", color: "#993C1D", text: "✗" },
  pending: { bg: "var(--color-background-secondary)", color: "var(--color-text-tertiary)", text: "·" },
}

export default function HistoryItem({ matchName, pick, confidence, status, actualResult }: HistoryItemProps) {
  const dot = dotConfig[status]

  return (
    <div
      className="flex items-center gap-2.5 py-2.5"
      style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div
        className="flex items-center justify-center rounded-full text-[11px] font-medium flex-shrink-0"
        style={{ width: 20, height: 20, background: dot.bg, color: dot.color }}
      >
        {dot.text}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-medium truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {matchName}
        </div>
        <div className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          Pick: {pick}
          {actualResult ? ` · Result: ${actualResult}` : ""}
        </div>
      </div>

      <span
        className="text-[11px] font-medium flex-shrink-0"
        style={{
          padding: "2px 8px",
          borderRadius: 99,
          background: "var(--color-background-secondary)",
          color: "var(--color-text-secondary)",
        }}
      >
        {confidence}
      </span>
    </div>
  )
}
