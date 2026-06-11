"use client"

import { useEffect, useRef } from "react"
import {
  useCurrentAccount,
  useDisconnectWallet,
  useAutoConnectWallet,
} from "@mysten/dapp-kit"

const SESSION_KEY = "var-wallet-session-start"
const SESSION_MS = 24 * 60 * 60 * 1000 // 24 hours — fixed window from connect

// Increment this whenever the Walrus namespace changes so all cached data
// (leaderboard, card, champion, predicted-matches, history) is wiped automatically.
const STORAGE_VERSION = "v2"
const STORAGE_VERSION_KEY = "var-storage-version"

function clearStaleStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_VERSION_KEY)
    if (stored === STORAGE_VERSION) return
    // Version mismatch — clear every var-* key except the version marker itself
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("var-") && key !== STORAGE_VERSION_KEY) toRemove.push(key)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
  } catch { /* ignore */ }
}

// Run immediately at module load (client-side) so stale cache is wiped before
// any component reads localStorage — prevents a flash of old namespace data.
if (typeof window !== "undefined") clearStaleStorage()

/**
 * Gives the wallet connection a 24-hour session. The session starts when the
 * wallet connects and is stored in localStorage so it survives reloads. Once
 * 24 hours pass the wallet is auto-disconnected and the user must reconnect.
 *
 * Renders nothing — mount it once inside <WalletProvider>.
 */
export default function WalletSessionGuard() {
  const account = useCurrentAccount()
  const autoConnectStatus = useAutoConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Wait until the auto-connect attempt has settled. Acting earlier would wipe
    // a still-valid session during the brief window before the wallet is
    // restored on reload.
    if (autoConnectStatus !== "attempted" && autoConnectStatus !== "disabled") return

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    // No wallet connected → genuinely disconnected; reset so next connect is fresh.
    if (!account) {
      try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
      clearTimer()
      return
    }

    // Connected → make sure a session start timestamp exists.
    let start = NaN
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      start = stored ? parseInt(stored, 10) : NaN
      if (!stored || Number.isNaN(start)) {
        start = Date.now()
        localStorage.setItem(SESSION_KEY, start.toString())
      }
    } catch {
      start = Date.now()
    }

    const elapsed = Date.now() - start

    // Session already expired → drop it and disconnect now.
    if (elapsed >= SESSION_MS) {
      try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
      clearTimer()
      disconnect()
      return
    }

    // Otherwise schedule the auto-disconnect for the remaining time.
    clearTimer()
    timerRef.current = setTimeout(() => {
      try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
      disconnect()
    }, SESSION_MS - elapsed)

    return clearTimer
  }, [account, autoConnectStatus, disconnect])

  return null
}
