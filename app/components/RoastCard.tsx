interface RoastCardProps {
  roast: string
  memoriesUsed: number
  predictionCount?: number
  subtitle?: string
  timestamp?: number | null
}

export default function RoastCard({ roast, memoriesUsed, predictionCount, subtitle, timestamp }: RoastCardProps) {
  const tsLabel = timestamp
    ? (() => {
        const d = new Date(timestamp)
        const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        return `${date} · ${time}`
      })()
    : null

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/3 backdrop-blur-xl border border-white/10"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4 select-none">
        <div
          className="flex items-center justify-center rounded-full shadow-md shadow-[#3B82F6]/10"
          style={{ width: 32, height: 32, background: "#3B82F6", flexShrink: 0 }}
        >
          <img src="/logo.svg" alt="VAR" style={{ width: 20, height: "auto" }} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">
            Verified Agent Records
          </div>
          <div className="text-[11px] text-neutral-400">
            {subtitle || "Official verdict"}
          </div>
        </div>
      </div>

      <blockquote
        className="text-[14px] leading-[1.65] mb-4 transition-all duration-300 hover:pl-4 text-neutral-200"
        style={{
          borderLeft: "2px solid #3B82F6",
          paddingLeft: 12,
        }}
      >
        {roast}
      </blockquote>

      <div className="flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }}
            className="animate-pulse"
          />
          <span className="text-[11px] text-neutral-500">
            {predictionCount !== undefined && predictionCount > 0
              ? `${predictionCount} prediction${predictionCount !== 1 ? "s" : ""} · ${memoriesUsed} on-chain records`
              : `Based on ${memoriesUsed} ${memoriesUsed === 1 ? "record" : "records"}`
            }{" · Walrus Mainnet"}
          </span>
        </div>
        {tsLabel && (
          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "rgba(255,255,255,0.20)" }}>
            {tsLabel}
          </span>
        )}
      </div>
    </div>
  )
}
