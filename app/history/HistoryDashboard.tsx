"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Link from "next/link"
import Navbar from "../components/Navbar"
import RoastCard from "../components/RoastCard"
import HistoryItem from "../components/HistoryItem"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function parseHistoryMemories(memories: string[]) {
  const resultMap: Record<string, { isCorrect: boolean; actualWinner: string; score: string }> = {}

  for (const text of memories) {
    if (!text.startsWith("[RESULT]")) continue
    const midM = text.match(/Match ([\w_]+)/)
    const correctM = text.match(/(CORRECT|WRONG)/)
    const winnerM = text.match(/ended: (.+?) won (\d+)-(\d+)/)
    if (midM && correctM && winnerM) {
      resultMap[midM[1]] = {
        isCorrect: correctM[1] === "CORRECT",
        actualWinner: winnerM[1],
        score: `${winnerM[2]}-${winnerM[3]}`,
      }
    }
  }

  return memories
    .filter(t => t.startsWith("[PREDICTION]"))
    .map(text => {
      const midM = text.match(/matchId: ([\w_]+)/)
      const winnerM = text.match(/predicted (.+?) to win/)
      const teamsM = text.match(/to win (.+?) \(matchId/)
      const confM = text.match(/Confidence: (\w+)/)
      if (!midM || !winnerM) return null
      const matchId = midM[1]
      const result = resultMap[matchId]
      return {
        matchName: teamsM?.[1] ?? matchId,
        predictedWinner: winnerM[1],
        confidence: confM?.[1] ?? "medium",
        status: (result ? (result.isCorrect ? "correct" : "wrong") : "pending") as "correct" | "wrong" | "pending",
        actualResult: result ? `${result.actualWinner} won ${result.score}` : undefined,
      }
    })
    .filter(Boolean) as Array<{
      matchName: string
      predictedWinner: string
      confidence: string
      status: "correct" | "wrong" | "pending"
      actualResult?: string
    }>
}

export default function HistoryDashboard() {
  const searchParams = useSearchParams()
  const account = useCurrentAccount()

  const urlUserId = searchParams.get("userId")
  const walletUserId = account?.address ?? null
  const userId = urlUserId || walletUserId

  const [roast, setRoast] = useState<string>("No predictions yet. Too scared to be wrong?")
  const [memoriesUsed, setMemoriesUsed] = useState(0)
  const [memories, setMemories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetch(`/api/roast?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        setRoast(data.roast || "No predictions yet. Too scared to be wrong?")
        setMemoriesUsed(data.memoriesUsed || 0)
        setMemories(data.memories || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  // Wallet not connected and no userId in URL
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="dark bg-grid-pattern relative overflow-hidden flex flex-col justify-center" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
          {/* Ambient Glow */}
          <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.06] dark:opacity-[0.1] blur-[100px] pointer-events-none -z-10 animate-pulse-glow" />

          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-6 text-center animate-fade-in-up relative" style={{ zIndex: 1 }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 72,
                height: 72,
                background: "rgba(59,130,246,0.10)",
                border: "0.5px solid rgba(59,130,246,0.22)",
              }}
            >
              <i className="ti ti-wallet text-[#3B82F6]" style={{ fontSize: 32 }} />
            </div>
            <div>
              <h1 className="text-[26px] font-semibold mb-2 text-white">
                Connect your wallet
              </h1>
              <p className="text-[14px] max-w-sm mx-auto text-neutral-400">
                Connect your Sui wallet to see your prediction history, or share a direct link with a wallet address.
              </p>
            </div>
            <div className="hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 transition-all rounded-full">
              <ConnectButton
                connectText="Connect Sui Wallet"
                style={{
                  background: "#3B82F6",
                  color: "white",
                  borderRadius: "99px",
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "10px 24px",
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </div>
            <p className="text-[12px] text-neutral-500">
              Or view anyone&apos;s record via{" "}
              <code
                className="text-[11px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
              >
                /history?userId=0x...
              </code>
            </p>
          </main>
        </div>
      </>
    )
  }

  const predictions = parseHistoryMemories(memories)
  const total = predictions.length
  const correct = predictions.filter(p => p.status === "correct").length
  const accuracy = correct + (predictions.filter(p => p.status === "wrong").length) > 0
    ? Math.round((correct / (correct + predictions.filter(p => p.status === "wrong").length)) * 100)
    : 0

  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#060C18", minHeight: "calc(100vh - 65px)" }}>
        {/* Glow Spots */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* Left sidebar */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 animate-fade-in-up delay-100">
              <div className="flex flex-col gap-4 lg:sticky lg:top-20">

                {/* Profile card */}
                <div
                  className="rounded-2xl p-5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#3B82F6]/3"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className="flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0 border border-[#3B82F6]/25 select-none"
                      style={{ width: 52, height: 52, background: "rgba(59, 130, 246, 0.12)", fontSize: 18 }}
                    >
                      {userId.slice(2, 4).toUpperCase() || "AN"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold font-mono text-white truncate">
                        {truncateAddress(userId)}
                      </div>
                      <div className="text-[12px] text-neutral-400">
                        Prediction record · 2026
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-1 pt-4 border-t border-white/5"
                  >
                    {[
                      { value: total, label: "Total", color: "white" },
                      { value: correct, label: "Correct", color: "#1D9E75" },
                      { value: `${accuracy}%`, label: "Accuracy", color: "#93C5FD" },
                    ].map(({ value, label, color }) => (
                      <div key={label} className="text-center">
                        <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
                        <div className="text-[11px] text-neutral-400">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share card button */}
                <Link
                  href={`/card?userId=${encodeURIComponent(userId)}`}
                  className="group flex items-center justify-center gap-2 text-[13px] font-semibold py-3 rounded-full w-full transition-all duration-300 active:scale-[0.97] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                  style={{ background: "#3B82F6", color: "white" }}
                >
                  <i className="ti ti-share transition-transform group-hover:rotate-12" />
                  Share my roast card
                </Link>

                {/* Walrus proof */}
                <div
                  className="rounded-2xl p-4 border border-white/10 backdrop-blur-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                    <span className="text-[12px] font-semibold text-neutral-300">
                      Verifiable on Walrus Mainnet
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral-400 leading-relaxed">
                    {memoriesUsed} {memoriesUsed === 1 ? "memory" : "memories"} stored permanently under namespace{" "}
                    <code className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/5">var-wc2026</code>. Cannot be deleted or modified.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col gap-6 min-w-0 animate-fade-in-up delay-200 w-full">

              <div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none"
                >
                  <i className="ti ti-quote text-[#3B82F6]" />
                  Latest VAR verdict
                </div>
                {loading ? (
                  <div
                    className="rounded-2xl p-8 text-center border border-white/10 backdrop-blur-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <span className="text-[13px] text-neutral-400">
                      Loading verdict...
                    </span>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#3B82F6]/3 rounded-2xl filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <RoastCard roast={roast} memoriesUsed={memoriesUsed} />
                  </div>
                )}
              </div>

              {predictions.length > 0 ? (
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-neutral-400 flex items-center gap-1.5 select-none"
                  >
                    <i className="ti ti-history text-[#3B82F6]" />
                    Full prediction history
                  </div>
                  <div
                    className="rounded-2xl px-5 py-2 border border-white/10 backdrop-blur-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {predictions.map((pred, i) => (
                      <HistoryItem
                        key={i}
                        matchName={pred.matchName}
                        pick={pred.predictedWinner}
                        confidence={pred.confidence}
                        status={pred.status}
                        actualResult={pred.actualResult}
                      />
                    ))}
                  </div>
                </div>
              ) : !loading ? (
                <div
                  className="rounded-2xl p-10 text-center border border-white/10 backdrop-blur-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <p className="text-[14px] text-neutral-400">
                    No predictions yet.{" "}
                    <Link href="/predict" className="font-semibold transition-colors text-[#3B82F6] hover:text-[#93C5FD]">
                      Start predicting now →
                    </Link>
                  </p>
                </div>
              ) : null}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
