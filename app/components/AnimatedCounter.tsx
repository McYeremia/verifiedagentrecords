"use client"
import { useEffect, useRef, useState } from "react"

interface Props {
  to: number
  suffix?: string
  duration?: number
  separator?: boolean
}

export default function AnimatedCounter({ to, suffix = "", duration = 1600, separator = false }: Props) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setCount(Math.round(eased * to))
            if (t < 1) requestAnimationFrame(tick)
            else setCount(to)
          }
          requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])

  const display = separator ? count.toLocaleString() : String(count)
  return <span ref={ref}>{display}{suffix}</span>
}
