"use client"

import Link from "next/link"
import { ConnectButton } from "@mysten/dapp-kit"

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
          <Link href="/leaderboard" className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Leaderboard
          </Link>
        </div>

        <ConnectButton
          connectText="Connect Sui Wallet"
          style={{
            background: "#D85A30",
            color: "white",
            borderRadius: "99px",
            fontSize: "13px",
            fontWeight: "500",
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
          }}
        />
      </div>
    </nav>
  )
}
