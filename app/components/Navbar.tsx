import Link from "next/link"

export default function Navbar() {
  return (
    <nav
      style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}
      className="px-4 sm:px-6 lg:px-8 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg text-white font-medium"
            style={{ width: 34, height: 34, background: "#D85A30", fontSize: 13, flexShrink: 0 }}
          >
            VAR
          </div>
          <span
            className="text-[14px] font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Verified Agent Records
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Home
          </Link>
          <Link href="/history" className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            History
          </Link>
          <Link href="#" className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Leaderboard
          </Link>
        </div>

        <Link
          href="/predict"
          className="inline-flex items-center gap-2 text-white text-[13px] font-medium"
          style={{ background: "#D85A30", padding: "8px 18px", borderRadius: 99 }}
        >
          <i className="ti ti-lock" style={{ fontSize: 12 }} />
          Start predicting
        </Link>
      </div>
    </nav>
  )
}
