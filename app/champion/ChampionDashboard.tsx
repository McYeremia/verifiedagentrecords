"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import Navbar from "../components/Navbar"
import PageBg from "../components/PageBg"
import { matches as allMatches, getTLA } from "../lib/matches"
import FlagImg from "../components/FlagImg"

// Derive all 48 unique teams from the fixture list — stays in sync with matches.ts
const teamNames = new Set<string>()
for (const m of allMatches) {
  teamNames.add(m.homeTeam)
  teamNames.add(m.awayTeam)
}
const TEAMS = [...teamNames]
  .map(name => ({ name }))
  .sort((a, b) => a.name.localeCompare(b.name))

export default function ChampionDashboard() {
  const account = useCurrentAccount()
  const userId = account?.address ?? null

  const [currentPick, setCurrentPick] = useState<string | null>(null)
  const [lockedAt, setLockedAt] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Reset so a wallet switch never shows the previous account's pick.
    setCurrentPick(null)
    setLockedAt(null)

    // A champion pick is locked forever (immutable), so once we know it we can
    // cache it permanently — returning users see their pick instantly, with no
    // Walrus round-trip and no loading state on screen.
    try {
      const hit = localStorage.getItem(`var-champion-${userId}`)
      if (hit) {
        const cached = JSON.parse(hit)
        if (cached?.pick) {
          setCurrentPick(cached.pick)
          setLockedAt(cached.lockedAt ?? null)
          return
        }
      }
    } catch { /* ignore localStorage errors */ }

    // No cache — check Walrus silently in the background (no visible loader).
    let cancelled = false
    fetch(`/api/champion?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled || !data.pick) return
        setCurrentPick(data.pick)
        setLockedAt(data.lockedAt ?? null)
        try {
          localStorage.setItem(
            `var-champion-${userId}`,
            JSON.stringify({ pick: data.pick, lockedAt: data.lockedAt ?? null }),
          )
        } catch { /* ignore */ }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  const handleLockIn = async () => {
    if (!userId || !selectedTeam) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/champion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, team: selectedTeam }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        const at = new Date().toISOString()
        setCurrentPick(selectedTeam)
        setLockedAt(at)
        try {
          localStorage.setItem(
            `var-champion-${userId}`,
            JSON.stringify({ pick: selectedTeam, lockedAt: at }),
          )
        } catch { /* ignore */ }
      } else if (res.status === 409 && data?.pick) {
        // Already locked on the server — reconcile to the original pick.
        const at = data.lockedAt ?? new Date().toISOString()
        setCurrentPick(data.pick)
        setLockedAt(at)
        try {
          localStorage.setItem(
            `var-champion-${userId}`,
            JSON.stringify({ pick: data.pick, lockedAt: at }),
          )
        } catch { /* ignore */ }
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Already locked in — show pick (instant for cached users, no loading state)
  if (userId && currentPick) {
    return (
      <>
        <Navbar />
        <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PageBg />
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-8 text-center relative animate-fade-in-up" style={{ zIndex: 1 }}>
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-widest mb-6"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                World Cup 2026 · Your Champion Pick
              </div>
              <div
                className="flex items-center justify-center rounded-full mx-auto mb-2"
                style={{ width: 64, height: 64, background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.18)" }}
              >
                <i className="ti ti-trophy" style={{ fontSize: 28, color: "#3B82F6" }} />
              </div>
            </div>

            <div
              className="w-full max-w-xs rounded-2xl p-8 flex flex-col items-center gap-4"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.22)",
                boxShadow: "0 0 60px rgba(59,130,246,0.06)",
              }}
            >
              <FlagImg team={currentPick} height={64} />
              <div className="text-[30px] font-bold text-white tracking-widest">
                {getTLA(currentPick)}
              </div>
              <div className="text-[14px] text-neutral-400">{currentPick}</div>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "#93C5FD",
                  border: "0.5px solid rgba(59,130,246,0.22)",
                }}
              >
                <i className="ti ti-lock" style={{ fontSize: 10 }} />
                Locked in forever
              </div>
              {lockedAt && (
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                  {new Date(lockedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
              {`VAR has recorded this on Walrus Mainnet. If ${currentPick} doesn't win, VAR will never let you forget.`}
            </p>

            <div className="flex items-center gap-2">
              <div
                className="animate-pulse"
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#1D9E75" }}
              />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                Stored on Walrus Mainnet · namespace var-wc2026
              </span>
            </div>
          </main>
        </div>
      </>
    )
  }

  // Pick form — show immediately; grid is disabled/dimmed while checking
  return (
    <>
      <Navbar />
      <div className="dark bg-grid-pattern relative overflow-hidden" style={{ background: "#040810", minHeight: "calc(100vh - 65px)" }}>
        <PageBg />
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] dark:opacity-[0.1] blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#1D9E75] opacity-[0.03] dark:opacity-[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse-glow delay-300" />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-32 relative" style={{ zIndex: 1 }}>

          {/* Header */}
          <div className="text-center mb-14 animate-fade-in-up">
            <div
              className="text-[11px] font-semibold uppercase tracking-widest mb-5"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              World Cup 2026 · Champion Pick · {TEAMS.length} Teams
            </div>
            <h1 className="text-[44px] sm:text-[58px] font-medium leading-tight mb-4">
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Pick your </span>
              <span
                className="font-extrabold"
                style={{
                  color: "#FBBF24",
                  textShadow: "0 0 40px rgba(251,191,36,0.55), 0 0 80px rgba(245,158,11,0.30)",
                }}
              >
                Champion
              </span>
            </h1>
            <p className="text-[15px] max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.38)" }}>
              Pick one team. Your call is locked in forever on Walrus Mainnet —
              VAR will remember no matter what happens.
            </p>
          </div>

          {/* Team grid — rendered immediately */}
          <div
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 mb-10 animate-fade-in-up delay-100"
          >
            {TEAMS.map(team => {
              const isSelected = selectedTeam === team.name
              return (
                <button
                  key={team.name}
                  onClick={() => setSelectedTeam(isSelected ? null : team.name)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: isSelected ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "1px solid rgba(59,130,246,0.38)"
                      : "0.5px solid rgba(255,255,255,0.07)",
                    boxShadow: isSelected ? "0 0 20px rgba(59,130,246,0.10)" : "none",
                  }}
                >
                  <FlagImg team={team.name} height={28} />
                  <span
                    className="text-[11px] font-bold tracking-widest leading-tight"
                    style={{ color: isSelected ? "#93C5FD" : "rgba(255,255,255,0.75)" }}
                  >
                    {getTLA(team.name)}
                  </span>
                  <span
                    className="text-[9px] leading-tight text-center w-full truncate"
                    style={{ color: isSelected ? "#93C5FD" : "rgba(255,255,255,0.35)" }}
                  >
                    {team.name}
                  </span>
                </button>
              )
            })}
          </div>
        </main>

        {/* Sticky bottom bar */}
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-4 flex justify-center"
          style={{
            background: "rgba(6, 12, 24, 0.92)",
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 50,
          }}
        >
          <div className="max-w-md w-full flex items-center justify-between gap-4">
            {selectedTeam ? (
              <>
                <div className="flex items-center gap-3">
                  <FlagImg team={selectedTeam} height={26} />
                  <div>
                    <div className="text-[15px] font-bold text-white tracking-widest">
                      {getTLA(selectedTeam)}
                    </div>
                    <div className="text-[11px] text-neutral-400">{selectedTeam}</div>
                  </div>
                </div>
                {userId ? (
                  <button
                    onClick={handleLockIn}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 text-white text-[13px] font-medium transition-all active:scale-[0.97] hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#3B82F6", padding: "11px 28px", borderRadius: 99 }}
                  >
                    <i
                      className={`ti ${submitting ? "ti-loader animate-slow-spin" : "ti-lock"}`}
                      style={{ fontSize: 14 }}
                    />
                    {submitting ? "Confirming..." : "Lock In Pick"}
                  </button>
                ) : (
                  <ConnectButton
                    connectText="Connect to Lock In"
                    style={{
                      background: "#3B82F6",
                      color: "white",
                      borderRadius: "99px",
                      fontSize: "13px",
                      fontWeight: "500",
                      padding: "11px 28px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  />
                )}
              </>
            ) : (
              <p
                className="text-[13px] mx-auto text-center"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Select a team above to lock in your pick
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
