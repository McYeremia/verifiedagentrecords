"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import Link from "next/link"

export default function LiveRoastBanner() {
  const account = useCurrentAccount()
  const userId  = account?.address ?? null

  const [roast,   setRoast]   = useState<string | null>(null)
  const [stats,   setStats]   = useState<{ total: number; accuracy: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setRoast(null); setStats(null); return }
    setLoading(true)

    // LocalStorage fast-path — same cache used by /history and /card
    try {
      const hit = localStorage.getItem(`var-history-roast-${userId}`)
      if (hit) {
        const cached = JSON.parse(hit)
        if (cached?.roast) {
          const mems: string[] = cached.memories ?? []
          const total   = mems.filter(t => t.startsWith("[PREDICTION]")).length
          const correct = mems.filter(t => t.startsWith("[RESULT]") && t.includes("CORRECT")).length
          const wrong   = mems.filter(t => t.startsWith("[RESULT]") && t.includes("WRONG")).length
          const accuracy = (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0
          setRoast(cached.roast)
          setStats({ total, accuracy })
          setLoading(false)
          return
        }
      }
    } catch { /* ignore */ }

    fetch(`/api/card-data?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.roast) { setRoast(data.roast); setStats(data.stats ?? null) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId || (!roast && !loading)) return null

  const truncated = `${userId.slice(0, 6)}...${userId.slice(-4)}`

  return (
    <div className="mt-10 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
            Live · Your current verdict
          </span>
          <span className="text-[11px] font-mono ml-1" style={{ color: "rgba(255,255,255,0.18)" }}>{truncated}</span>
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col gap-4 border"
          style={{ background: "rgba(29,78,216,0.05)", borderColor: "rgba(59,130,246,0.20)" }}
        >
          {loading ? (
            <div className="text-[14px] text-neutral-500 animate-pulse">VAR is loading your verdict...</div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
                  style={{ width: 30, height: 30, background: "#3B82F6", fontSize: 10 }}
                >
                  VAR
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">Verified Agent Records</div>
                  <div className="text-[11px] text-neutral-500">
                    Live verdict · {stats?.total ?? 0} prediction{(stats?.total ?? 0) !== 1 ? "s" : ""}
                  </div>
                </div>
                <Link
                  href={`/history?userId=${encodeURIComponent(userId)}`}
                  className="ml-auto text-[11px] transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                >
                  View history
                </Link>
              </div>

              <blockquote
                className="text-[15px] leading-relaxed text-neutral-300 italic"
                style={{ borderLeft: "2px solid #3B82F6", paddingLeft: 14 }}
              >
                &ldquo;{roast}&rdquo;
              </blockquote>

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "0.5px solid rgba(59,130,246,0.12)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} className="animate-pulse" />
                  <span className="text-[11px] text-neutral-500">
                    {stats?.total ?? 0} predictions · {stats?.accuracy ?? 0}% accuracy · Walrus Mainnet
                  </span>
                </div>
                <Link
                  href={`/card?userId=${encodeURIComponent(userId)}`}
                  className="text-[11px] font-semibold transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                >
                  Share card
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
