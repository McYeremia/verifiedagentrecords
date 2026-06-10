"use client"
import { useEffect, useState } from "react"

export default function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-50 h-[2px] pointer-events-none"
      style={{
        width: `${pct}%`,
        background: "linear-gradient(90deg, #3B82F6, #60A5FA, #F59E0B)",
        transition: "width 0.1s linear",
      }}
    />
  )
}
