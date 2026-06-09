interface RoastCardProps {
  roast: string
  memoriesUsed: number
  subtitle?: string
}

export default function RoastCard({ roast, memoriesUsed, subtitle }: RoastCardProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="flex items-center justify-center rounded-full text-white font-medium"
          style={{ width: 32, height: 32, background: "#D85A30", fontSize: 12, flexShrink: 0 }}
        >
          VAR
        </div>
        <div>
          <div className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
            Verified Agent Records
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            {subtitle || "Official verdict"}
          </div>
        </div>
      </div>

      <blockquote
        className="text-[14px] leading-[1.65] mb-4"
        style={{
          borderLeft: "2px solid #D85A30",
          paddingLeft: 12,
          color: "var(--color-text-primary)",
        }}
      >
        {roast}
      </blockquote>

      <div className="flex items-center gap-1.5">
        <div
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }}
        />
        <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          Based on {memoriesUsed} {memoriesUsed === 1 ? "memory" : "memories"} · Stored on Walrus Mainnet
        </span>
      </div>
    </div>
  )
}
