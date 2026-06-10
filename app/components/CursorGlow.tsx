"use client"
import { useEffect, useRef } from "react"

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return
      ref.current.style.transform = `translate(${e.clientX - 350}px, ${e.clientY - 350}px)`
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, rgba(59,130,246,0.05) 45%, transparent 70%)",
        zIndex: 2,
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
    />
  )
}
