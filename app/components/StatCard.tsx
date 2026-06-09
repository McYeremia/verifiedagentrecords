interface StatCardProps {
  value: number | string
  label: string
  variant?: "neutral" | "correct" | "wrong"
}

const valueColors = {
  neutral: "#FFFFFF",
  correct: "#34D399",
  wrong: "#EF4444",
}

export default function StatCard({ value, label, variant = "neutral" }: StatCardProps) {
  return (
    <div
      className="rounded-2xl text-center transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#3B82F6]/3 cursor-default border border-white/10 backdrop-blur-xl"
      style={{
        padding: "1rem",
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      <div
        className="text-[20px] font-bold"
        style={{ color: valueColors[variant] }}
      >
        {value}
      </div>
      <div className="text-[11px] mt-1 text-neutral-400 font-semibold uppercase tracking-wider select-none">
        {label}
      </div>
    </div>
  )
}
