interface RoastCardProps {
  roast: string
  memoriesUsed: number
  subtitle?: string
}

export default function RoastCard({ roast, memoriesUsed, subtitle }: RoastCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/3 backdrop-blur-xl border border-white/10"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4 select-none">
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold shadow-md shadow-[#3B82F6]/10"
          style={{ width: 32, height: 32, background: "#3B82F6", fontSize: 12, flexShrink: 0 }}
        >
          VAR
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

      <div className="flex items-center gap-1.5 select-none">
        <div
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }}
          className="animate-pulse"
        />
        <span className="text-[11px] text-neutral-500">
          Based on {memoriesUsed} {memoriesUsed === 1 ? "memory" : "memories"} · Stored on Walrus Mainnet
        </span>
      </div>
    </div>
  )
}
