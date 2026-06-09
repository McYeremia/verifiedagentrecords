"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@mysten/dapp-kit"

interface NavbarProps {
  dark?: boolean
}

export default function Navbar({ dark = false }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: "Home", href: "/" },
    { name: "Predict", href: "/predict" },
    { name: "Champion", href: "/champion" },
    { name: "History", href: "/history" },
    { name: "Leaderboard", href: "/leaderboard" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md transition-all duration-300 border-b border-white/5 shadow-lg shadow-black/10"
      style={{
        background: "rgba(6, 12, 24, 0.85)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group transition-transform duration-300 active:scale-95">
          <div
            className="flex items-center justify-center rounded-lg text-white font-semibold transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105 shadow-md shadow-[#3B82F6]/10"
            style={{ width: 34, height: 34, background: "#3B82F6", fontSize: 13, flexShrink: 0 }}
          >
            VAR
          </div>
          <span
            className="text-[14px] font-medium text-white transition-colors group-hover:text-[#93C5FD]"
          >
            Verified Agent Records
          </span>
        </Link>

        {/* Desktop Navigation Link Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-full border border-white/5 shadow-inner">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[12px] px-4 py-1.5 rounded-full font-medium transition-all duration-250 ${
                  active
                    ? "bg-[#3B82F6]/15 text-[#93C5FD] border border-[#3B82F6]/20 shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Right Actions: Connected Sui Wallet + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <div className="transition-all duration-300 active:scale-[0.97] hover:shadow-[0_0_15px_rgba(59,130,246,0.35)] rounded-full">
            <ConnectButton
              connectText="Connect Sui Wallet"
              style={{
                background: "#3B82F6",
                color: "white",
                borderRadius: "99px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "8px 18px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          </div>

          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 md:hidden transition-all duration-200 flex items-center justify-center border border-transparent hover:border-white/5"
            aria-label="Toggle navigation menu"
          >
            <i className={`ti ${isOpen ? "ti-x animate-slow-spin" : "ti-menu-2"} text-[18px]`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden pt-3.5 pb-2.5 flex flex-col gap-1.5 border-t border-white/5 mt-3 animate-fade-in-up">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-[13px] px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#3B82F6]/10 text-[#93C5FD] border border-[#3B82F6]/10 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
