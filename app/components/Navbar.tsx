"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletButton from "./WalletButton"

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "Predict", href: "/predict" },
  { name: "History", href: "/history" },
  { name: "Leaderboard", href: "/leaderboard" },
]

const moreLinks = [
  { name: "Champion", href: "/champion", icon: "trophy" },
  { name: "Profile", href: "/profile", icon: "fingerprint" },
  { name: "H2H", href: "/h2h", icon: "swords" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }
  const moreActive = moreLinks.some(l => isActive(l.href))

  // Close the "More" dropdown on outside click.
  useEffect(() => {
    if (!moreOpen) return
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [moreOpen])

  // Close both menus on navigation.
  useEffect(() => { setMoreOpen(false); setIsOpen(false) }, [pathname])

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
          {primaryLinks.map((link) => {
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

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              className={`flex items-center gap-1 text-[12px] px-4 py-1.5 rounded-full font-medium transition-all duration-250 ${
                moreActive || moreOpen
                  ? "bg-[#3B82F6]/15 text-[#93C5FD] border border-[#3B82F6]/20 shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              More
              <i className={`ti ti-chevron-down text-[11px] transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
            </button>

            {moreOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-2xl p-1.5 backdrop-blur-xl animate-fade-in-up z-[60]"
                style={{
                  background: "rgba(10, 16, 30, 0.96)",
                  border: "0.5px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
                }}
              >
                {moreLinks.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                        active ? "text-[#93C5FD]" : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                      }`}
                      style={active ? { background: "rgba(59,130,246,0.12)" } : undefined}
                    >
                      <i className={`ti ti-${link.icon} text-[14px] ${active ? "text-[#93C5FD]" : "text-neutral-500"}`} />
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Connected Sui Wallet + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <WalletButton />

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
          {primaryLinks.map((link) => {
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

          <div className="text-[10px] font-semibold uppercase tracking-wider px-4 pt-2 pb-0.5 text-neutral-500 select-none">
            More
          </div>
          {moreLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 text-[13px] px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#3B82F6]/10 text-[#93C5FD] border border-[#3B82F6]/10 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <i className={`ti ti-${link.icon} text-[14px] ${active ? "text-[#93C5FD]" : "text-neutral-500"}`} />
                {link.name}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
