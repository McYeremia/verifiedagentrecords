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
    let cancelled = false

    // Instant paint from a clean card cache (stale-while-revalidate). We do NOT
    // read `var-history-roast` anymore — it could hold a stale "over capacity"
    // fallback. `/api/card-data` only ever returns a real [ROAST_SNAPSHOT].
    let hadCache = false
    try {
      const hit = localStorage.getItem(`var-card-${userId}`)
      if (hit) {
        const c = JSON.parse(hit)
        if (c?.roast) { setRoast(c.roast); setStats(c.stats ?? null); hadCache = true }
      }
    } catch { /* ignore */ }
    if (!hadCache) setLoading(true)

    fetch(`/api/card-data?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.roast) return
        setRoast(data.roast)
        // The "predictions" count comes from the snapshot (predictionCount = actual
        // predictions made). stats.total is the [LEADERBOARD] RESOLVED count and
        // stays 0 until a match result comes in, so it must not drive this number.
        const stats = { total: data.predictionCount ?? data.stats?.total ?? 0, accuracy: data.stats?.accuracy ?? 0 }
        setStats(stats)
        try { localStorage.setItem(`var-card-${userId}`, JSON.stringify({ roast: data.roast, stats })) } catch { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
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
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 30, height: 30, background: "#3B82F6" }}
                >
                  <img src="/logo.svg" alt="VAR" style={{ width: 18, height: "auto" }} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">Verified Agent Records</div>
                  <div className="text-[11px] text-neutral-500">
                    Live verdict{stats && stats.total > 0 ? ` · ${stats.total} prediction${stats.total !== 1 ? "s" : ""}` : ""}
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
                    {stats && stats.total > 0 ? `${stats.total} predictions · ${stats.accuracy}% accuracy · ` : ""}Walrus Mainnet
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
