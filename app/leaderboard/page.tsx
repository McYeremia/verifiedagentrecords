import Link from "next/link"
import { getMemWal } from "../lib/memwal"
import Navbar from "../components/Navbar"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function parseLeaderboardEntry(text: string) {
  const userMatch = text.match(/User (0x[a-fA-F0-9]+)/)
  const predMatch = text.match(/(\d+) predictions/)
  const correctMatch = text.match(/(\d+) correct/)
  const accuracyMatch = text.match(/(\d+)% accuracy/)
  if (!userMatch) return null
  return {
    userId: userMatch[1],
    predictions: parseInt(predMatch?.[1] ?? "0"),
    correct: parseInt(correctMatch?.[1] ?? "0"),
    accuracy: parseInt(accuracyMatch?.[1] ?? "0"),
  }
}

const rankColors = ["#D85A30", "#999999", "#BA7517"]
const rankLabels = ["🥇", "🥈", "🥉"]

export default async function LeaderboardPage() {
  let entries: Array<{
    userId: string
    predictions: number
    correct: number
    accuracy: number
  }> = []

  try {
    const mem = getMemWal()
    const result = await mem.recall({
      query: "LEADERBOARD user predictions correct accuracy",
    })

    entries = (result.results || [])
      .map((m: { text: string }) => parseLeaderboardEntry(m.text))
      .filter(Boolean)
      .sort((a, b) => b!.accuracy - a!.accuracy || b!.predictions - a!.predictions) as typeof entries
  } catch (e) {
    console.error(e)
  }

  const totalPredictions = entries.reduce((s, e) => s + e.predictions, 0)

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Left sidebar ─────────────────────────────────── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Header card */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ width: 44, height: 44, background: "#FAECE7", fontSize: 22 }}
                  >
                    🏆
                  </div>
                  <div>
                    <div className="text-[18px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      Leaderboard
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                      World Cup 2026 · Walrus Mainnet
                    </div>
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 gap-1 pt-4"
                  style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
                >
                  <div className="text-center">
                    <div className="text-[20px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {entries.length}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                      Players
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[20px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {totalPredictions}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                      Predictions
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 3 podium */}
              {entries.slice(0, 3).map((entry, i) => (
                <div
                  key={entry.userId}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "var(--color-background-primary)",
                    border: i === 0 ? "0.5px solid #F0997B" : "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{rankLabels[i]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {truncateAddress(entry.userId)}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                      {entry.predictions} predictions
                    </div>
                  </div>
                  <div
                    className="text-[16px] font-medium"
                    style={{ color: rankColors[i] }}
                  >
                    {entry.accuracy}%
                  </div>
                </div>
              ))}

              {/* Walrus proof */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} />
                  <span className="text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Powered by Walrus Memory
                  </span>
                </div>
                <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)", lineHeight: 1.6 }}>
                  Rankings sourced from LEADERBOARD memories on Walrus Mainnet — no external database.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              🏆 Full rankings
            </div>

            {entries.length === 0 ? (
              <div
                className="rounded-xl p-10 text-center"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                  No data yet. Leaderboard updates after matches are resolved.
                </p>
                <Link href="/predict" className="inline-block mt-3 text-[13px] font-medium" style={{ color: "#D85A30" }}>
                  → Start predicting now
                </Link>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                {/* Header row */}
                <div
                  className="grid px-5 py-3"
                  style={{
                    gridTemplateColumns: "2rem 1fr 5rem 5rem 5rem",
                    gap: "1rem",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-secondary)",
                  }}
                >
                  {["#", "Wallet", "Predictions", "Correct", "Accuracy"].map(h => (
                    <div key={h} className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Data rows */}
                {entries.map((entry, i) => (
                  <div
                    key={entry.userId}
                    className="grid items-center px-5 py-3.5"
                    style={{
                      gridTemplateColumns: "2rem 1fr 5rem 5rem 5rem",
                      gap: "1rem",
                      borderBottom: i < entries.length - 1 ? "0.5px solid var(--color-border-tertiary)" : undefined,
                      background: i === 0 ? "#FAECE7" : "transparent",
                    }}
                  >
                    {/* Rank */}
                    <div
                      className="text-[13px] font-medium"
                      style={{ color: i < 3 ? rankColors[i] : "var(--color-text-tertiary)" }}
                    >
                      {i < 3 ? rankLabels[i] : `${i + 1}`}
                    </div>

                    {/* Address */}
                    <Link
                      href={`/history?userId=${entry.userId}`}
                      className="text-[13px] font-medium"
                      style={{ color: "var(--color-text-primary)", fontFamily: "monospace" }}
                    >
                      {truncateAddress(entry.userId)}
                    </Link>

                    {/* Predictions */}
                    <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                      {entry.predictions}
                    </div>

                    {/* Correct */}
                    <div className="text-[13px] font-medium" style={{ color: "#1D9E75" }}>
                      {entry.correct}
                    </div>

                    {/* Accuracy */}
                    <div
                      className="text-[14px] font-medium"
                      style={{ color: entry.accuracy >= 60 ? "#1D9E75" : entry.accuracy >= 40 ? "var(--color-text-primary)" : "#D85A30" }}
                    >
                      {entry.accuracy}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
