// Background decoration for inner pages — drop as first child inside any
// `relative overflow-hidden` wrapper. All children are absolute, so they
// never affect the surrounding flex/grid layout.

const PARTICLES: { top: string; left: string; size: number; delay: string; gold: boolean }[] = [
  { top: "7vh",   left: "5%",  size: 3, delay: "0s",    gold: false },
  { top: "20vh",  left: "88%", size: 4, delay: "-2.2s", gold: true  },
  { top: "38vh",  left: "93%", size: 2, delay: "-4.0s", gold: false },
  { top: "54vh",  left: "3%",  size: 4, delay: "-1.5s", gold: true  },
  { top: "70vh",  left: "48%", size: 3, delay: "-3.5s", gold: false },
  { top: "86vh",  left: "79%", size: 3, delay: "-0.8s", gold: true  },
  { top: "112vh", left: "6%",  size: 2, delay: "-5.0s", gold: false },
  { top: "135vh", left: "91%", size: 4, delay: "-2.8s", gold: true  },
]

const BALLS: { top: string; left: string; size: number; delay: string }[] = [
  { top: "10vh", left: "1.5%", size: 44, delay: "-0.5s" },
  { top: "68vh", left: "95%",  size: 36, delay: "-3.0s" },
]

export default function PageBg() {
  return (
    <>
      {/* ── Ambient blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
        {/* Top-right hero accent */}
        <div
          className="absolute animate-wave-shift"
          style={{
            top: 0, right: "-10%", width: "65%", height: "80vh",
            background: "radial-gradient(ellipse 800px 600px at 70% 30%, rgba(29,78,216,0.20), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Left mid accent — violet */}
        <div
          className="absolute animate-wave-shift"
          style={{
            top: "30vh", left: "-8%", width: "55%", height: "70vh",
            background: "radial-gradient(ellipse 650px 500px at 18% 50%, rgba(124,58,237,0.13), transparent 70%)",
            filter: "blur(90px)",
            animationDelay: "-5s",
          }}
        />
        {/* Bottom blue wave */}
        <div
          className="absolute"
          style={{
            bottom: 0, left: "-10%", right: "-10%", height: "50vh",
            background: "radial-gradient(ellipse 100% 80% at 55% 100%, rgba(29,78,216,0.50) 0%, rgba(37,99,235,0.25) 35%, transparent 75%)",
            filter: "blur(45px)",
          }}
        />
        {/* Gold shimmer */}
        <div
          className="absolute animate-wave-shift"
          style={{
            top: "15vh", left: "35%", width: "40%", height: "55vh",
            background: "radial-gradient(ellipse 500px 350px at 50% 38%, rgba(245,158,11,0.07), transparent 70%)",
            filter: "blur(85px)",
            animationDelay: "-3s",
          }}
        />
      </div>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: "radial-gradient(rgba(59,130,246,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
        {PARTICLES.map(({ top, left, size, delay, gold }, i) => (
          <div
            key={i}
            className="absolute animate-float rounded-full"
            style={{
              top, left, width: size, height: size,
              background: gold ? "rgba(251,191,36,0.65)" : "rgba(96,165,250,0.55)",
              boxShadow: gold
                ? `0 0 ${size * 3}px ${size}px rgba(245,158,11,0.25)`
                : `0 0 ${size * 3}px ${size}px rgba(59,130,246,0.22)`,
              animationDelay: delay,
            }}
          />
        ))}
      </div>

      {/* ── Floating footballs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
        {BALLS.map(({ top, left, size, delay }, i) => (
          <div key={i} className="absolute animate-float" style={{ top, left, animationDelay: delay, opacity: 0.07 }}>
            <i className="ti ti-ball-football" style={{ fontSize: size, color: "white" }} />
          </div>
        ))}
      </div>
    </>
  )
}
