interface StatCardProps {
  value: number | string
  label: string
  variant?: "neutral" | "correct" | "wrong"
}

const valueColors = {
  neutral: "var(--color-text-primary)",
  correct: "#1D9E75",
  wrong: "#D85A30",
}

export default function StatCard({ value, label, variant = "neutral" }: StatCardProps) {
  return (
    <div
      className="rounded-lg text-center"
      style={{
        padding: "1rem",
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="text-[22px] font-medium"
        style={{ color: valueColors[variant] }}
      >
        {value}
      </div>
      <div className="text-[11px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </div>
    </div>
  )
}
