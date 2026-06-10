"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Deterministic identicon-style gradient derived from a wallet address.
function addressGradient(addr: string) {
  let h = 0
  for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) % 360
  const h2 = (h + 45) % 360
  return `linear-gradient(135deg, hsl(${h}, 72%, 56%), hsl(${h2}, 76%, 46%))`
}

export default function WalletButton() {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  // ── Not connected ──────────────────────────────────────────────
  if (!account) {
    return (
      <ConnectModal
        trigger={
          <button
            className="group inline-flex items-center gap-2 text-white text-[13px] font-medium transition-all duration-300 active:scale-[0.97] hover:shadow-[0_0_18px_rgba(59,130,246,0.40)]"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              borderRadius: 99,
              padding: "8px 18px",
              border: "0.5px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
            }}
          >
            <i className="ti ti-wallet text-[14px] transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Connect Sui Wallet</span>
            <span className="sm:hidden">Connect</span>
          </button>
        }
      />
    )
  }

  // ── Connected ──────────────────────────────────────────────────
  const addr = account.address

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="group inline-flex items-center gap-2 transition-all duration-300 active:scale-[0.97] hover:bg-[#3B82F6]/[0.16]"
        style={{
          background: "rgba(59,130,246,0.10)",
          border: "0.5px solid rgba(59,130,246,0.30)",
          borderRadius: 99,
          padding: "5px 12px 5px 5px",
        }}
      >
        <span
          className="flex-shrink-0 rounded-full select-none transition-transform duration-200 group-hover:scale-105"
          style={{
            width: 24,
            height: 24,
            background: addressGradient(addr),
            boxShadow: "0 0 0 1px rgba(255,255,255,0.14), 0 1px 4px rgba(0,0,0,0.35)",
          }}
        />
        <span className="text-[13px] font-medium font-mono text-[#93C5FD] hidden sm:inline">
          {truncateAddress(addr)}
        </span>
        <i
          className={`ti ti-chevron-down text-[12px] text-[#93C5FD]/70 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-2xl p-2 backdrop-blur-xl animate-fade-in-up z-[60]"
          style={{
            background: "rgba(10, 16, 30, 0.96)",
            border: "0.5px solid rgba(255,255,255,0.10)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
          }}
        >
          {/* Account header */}
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <span
              className="flex-shrink-0 rounded-full select-none"
              style={{
                width: 36,
                height: 36,
                background: addressGradient(addr),
                boxShadow: "0 0 0 1px rgba(255,255,255,0.14)",
              }}
            />
            <div className="min-w-0">
              <div className="text-[13px] font-mono text-white truncate">{truncateAddress(addr)}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#1D9E75" }} className="animate-pulse" />
                <span className="text-[11px] text-neutral-400">Sui Mainnet</span>
              </div>
            </div>
          </div>

          <div className="h-px my-1.5" style={{ background: "rgba(255,255,255,0.07)" }} />

          {/* Copy address */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(addr)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] text-neutral-300 hover:bg-white/[0.06] transition-colors"
          >
            <i className={`ti ${copied ? "ti-check text-[#1D9E75]" : "ti-copy"} text-[14px]`} />
            {copied ? "Copied!" : "Copy address"}
          </button>

          {/* My history */}
          <Link
            href={`/history?userId=${addr}`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] text-neutral-300 hover:bg-white/[0.06] transition-colors"
          >
            <i className="ti ti-history text-[14px]" />
            My history
          </Link>

          {/* Disconnect */}
          <button
            onClick={() => {
              disconnect()
              setMenuOpen(false)
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] transition-colors hover:bg-[#EF4444]/10"
            style={{ color: "#F87171" }}
          >
            <i className="ti ti-logout text-[14px]" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
