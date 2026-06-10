import Link from "next/link"
import Navbar from "./components/Navbar"
import MatchHeroCard from "./components/MatchHeroCard"
import UpcomingList from "./components/UpcomingList"
import { getUpcomingMatches } from "./lib/matches"

const FEATURES = [
  {
    icon: "lock",
    title: "Lock your call",
    desc: "Your prediction is stored permanently on Walrus Mainnet — immutable, undeletable, on-chain.",
  },
  {
    icon: "database",
    title: "Walrus remembers",
    desc: "Every prediction and match result is stored as a memory. VAR builds your track record over time.",
  },
  {
    icon: "brain",
    title: "Patterns emerge",
    desc: "After 3 resolved predictions, VAR analyses your bias and generates a pattern profile just for you.",
  },
  {
    icon: "speakerphone",
    title: "Get roasted",
    desc: "Day 1 is polite. Day 4 is personal. The more data VAR has, the more savage the verdict.",
  },
  {
    icon: "trophy",
    title: "Leaderboard",
    desc: "Rankings built entirely from Walrus memories — no database. Verifiable on-chain by wallet address.",
  },
  {
    icon: "share",
    title: "Share the shame",
    desc: "Export your roast card and post it to X with #Walrus. Let the world see your wrong calls.",
  },
]

export default function Home() {
  const nextMatch = getUpcomingMatches()[0]

  return (
    <>
      <Navbar />

      {/* Single unified background — no hard section breaks */}
      <div style={{ background: "#060C18", color: "white", position: "relative", overflow: "hidden" }}>

        {/* ── Global wave blobs (span the full page) ─────────────── */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
          {/* Hero right glow */}
          <div
            className="absolute animate-wave-shift"
            style={{
              right: "-10%",
              top: "0%",
              width: "70%",
              height: "80vh",
              background: "radial-gradient(ellipse 900px 700px at 65% 35%, rgba(20, 55, 160, 0.13), transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Hero secondary highlight */}
          <div
            className="absolute animate-wave-shift"
            style={{
              right: "5%",
              top: "10%",
              width: "50%",
              height: "60vh",
              background: "radial-gradient(ellipse 600px 450px at 60% 25%, rgba(10, 100, 200, 0.08), transparent 70%)",
              filter: "blur(100px)",
              animationDelay: "-5s",
            }}
          />
          {/* Mid-page accent */}
          <div
            className="absolute animate-wave-shift"
            style={{
              left: "-15%",
              top: "45%",
              width: "65%",
              height: "60vh",
              background: "radial-gradient(ellipse 800px 600px at 30% 50%, rgba(10, 40, 160, 0.09), transparent 70%)",
              filter: "blur(100px)",
              animationDelay: "-9s",
            }}
          />
          {/* Bottom / CTA glow */}
          <div
            className="absolute animate-wave-shift"
            style={{
              right: "-10%",
              bottom: "0%",
              width: "75%",
              height: "50vh",
              background: "radial-gradient(ellipse 1000px 600px at 65% 70%, rgba(20, 55, 160, 0.11), transparent 70%)",
              filter: "blur(90px)",
              animationDelay: "-3s",
            }}
          />
        </div>

        {/* ── Content layers ──────────────────────────────────────── */}
        <div className="relative" style={{ zIndex: 1 }}>

          {/* ── Hero ────────────────────────────────────────────── */}
          <section className="min-h-[calc(100vh-65px)] flex flex-col justify-center">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-28">

                {/* Left copy */}
                <div className="flex flex-col gap-8 animate-fade-in-up">
                  {/* Badge */}
                  <div className="self-start">
                    <span
                      className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest"
                      style={{
                        background: "rgba(59, 130, 246, 0.12)",
                        border: "0.5px solid rgba(59, 130, 246, 0.28)",
                        color: "#93C5FD",
                        padding: "6px 16px",
                        borderRadius: 99,
                      }}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3B82F6]" />
                      </span>
                      World Cup 2026 · Walrus Mainnet
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-[50px] sm:text-[64px] lg:text-[78px] font-medium leading-[0.97] tracking-tight">
                    <span style={{ color: "rgba(255,255,255,0.32)" }}>Your wrong calls.</span>
                    <br />
                    <span className="text-white">Remembered</span>
                    <br />
                    <span className="text-white">forever.</span>
                  </h1>

                  {/* Subtext */}
                  <p className="text-[16px] sm:text-[17px] leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.46)" }}>
                    Lock in your World Cup 2026 predictions on Walrus Mainnet.
                    The more wrong calls you make, the more savage VAR&apos;s verdict gets.
                  </p>

                  {/* CTAs */}
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href="/predict"
                      className="group inline-flex items-center gap-2.5 text-white text-[14px] font-medium transition-all active:scale-[0.97] hover:opacity-90 hover:shadow-lg hover:shadow-[#3B82F6]/20"
                      style={{ background: "#3B82F6", padding: "13px 30px", borderRadius: 99 }}
                    >
                      <i className="ti ti-lock" />
                      Lock in a prediction
                      <i className="ti ti-arrow-right opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                    <Link
                      href="/leaderboard"
                      className="inline-flex items-center gap-2.5 text-[14px] font-medium transition-all active:scale-[0.97]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.6)",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                        padding: "13px 30px",
                        borderRadius: 99,
                      }}
                    >
                      <i className="ti ti-trophy" />
                      Leaderboard
                    </Link>
                  </div>
                </div>

                {/* Right: match card */}
                <div className="w-full animate-fade-in-up delay-200">
                  {nextMatch ? (
                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                      <MatchHeroCard match={nextMatch} redirectOnSubmit={true} />
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl p-10 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
                    >
                      <p style={{ color: "rgba(255,255,255,0.3)" }}>All predictions locked in.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats bar */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 animate-fade-in-up delay-400"
                style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                {[
                  { value: "2,841",  label: "Predictions locked" },
                  { value: "104",    label: "Matches to predict" },
                  { value: "100%",   label: "On Walrus Mainnet" },
                  { value: "Day 7+", label: "Roasts get brutal" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-[30px] sm:text-[38px] font-medium text-white leading-none">{value}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider mt-2" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── How VAR Works ─────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="mb-16">
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  How it works
                </div>
                <h2 className="text-[34px] sm:text-[46px] font-medium text-white leading-tight">
                  More predictions,<br className="hidden sm:block" /> sharper roasts
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
                {FEATURES.map(({ icon, title, desc }) => (
                  <div key={title} className="flex flex-col gap-4 group">
                    <div
                      className="flex items-center justify-center rounded-xl transition-all duration-300 group-hover:border-[#3B82F6]/30"
                      style={{
                        width: 46,
                        height: 46,
                        background: "rgba(59, 130, 246, 0.07)",
                        border: "0.5px solid rgba(59, 130, 246, 0.15)",
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      <i className={`ti ti-${icon}`} style={{ fontSize: 20 }} />
                    </div>
                    <div className="text-[16px] font-medium text-white">{title}</div>
                    <div className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Memory evolution demo ───────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="mb-14">
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Memory in action
                </div>
                <h2 className="text-[34px] sm:text-[46px] font-medium text-white leading-tight">
                  The longer VAR watches,<br className="hidden sm:block" /> the more it hurts
                </h2>
                <p className="text-[16px] mt-4 max-w-xl" style={{ color: "rgba(255,255,255,0.36)" }}>
                  Day 1 VAR is polite. Day 7 VAR has read your pattern, named your bias, and has zero mercy.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Day 1 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(148,163,184,0.10)",
                        color: "#94A3B8",
                        border: "0.5px solid rgba(148,163,184,0.18)",
                      }}
                    >
                      Day 1 · 1 prediction · No results yet
                    </span>
                  </div>
                  <div
                    className="rounded-2xl p-6 flex flex-col gap-4 flex-1"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "0.5px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
                        style={{ width: 30, height: 30, background: "#3B82F6", fontSize: 10 }}
                      >
                        VAR
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white">Verified Agent Records</div>
                        <div className="text-[11px] text-neutral-500">Official verdict · 1 record</div>
                      </div>
                    </div>
                    <blockquote
                      className="text-[15px] leading-relaxed text-neutral-300 italic"
                      style={{ borderLeft: "2px solid #3B82F6", paddingLeft: 14 }}
                    >
                      &ldquo;Brazil in the opener — noted. VAR has recorded this prediction and will be watching closely. Make a few more calls and we&apos;ll have a real conversation.&rdquo;
                    </blockquote>
                    <div
                      className="flex items-center gap-1.5 pt-3"
                      style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#94A3B8", flexShrink: 0 }} />
                      <span className="text-[11px] text-neutral-500">Polite. Observational. Waiting.</span>
                    </div>
                  </div>
                </div>

                {/* Day 7+ */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(239,68,68,0.10)",
                        color: "#EF4444",
                        border: "0.5px solid rgba(239,68,68,0.20)",
                      }}
                    >
                      Day 7+ · 6 predictions · Pattern detected
                    </span>
                  </div>
                  <div
                    className="rounded-2xl p-6 flex flex-col gap-4 flex-1"
                    style={{
                      background: "rgba(239,68,68,0.03)",
                      border: "0.5px solid rgba(239,68,68,0.16)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
                        style={{ width: 30, height: 30, background: "#EF4444", fontSize: 10 }}
                      >
                        VAR
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white">Verified Agent Records</div>
                        <div className="text-[11px] text-neutral-500">Official verdict · 14 records</div>
                      </div>
                    </div>
                    <blockquote
                      className="text-[15px] leading-relaxed text-neutral-300 italic"
                      style={{ borderLeft: "2px solid #EF4444", paddingLeft: 14 }}
                    >
                      &ldquo;Brazil, Argentina, Spain, Germany — you&apos;ve backed legacy names in 5 of 6 matches and gotten 1 right. VAR has seen this pattern before: you trust reputation over form. That&apos;s not analysis, that&apos;s nostalgia.&rdquo;
                    </blockquote>
                    <div
                      className="flex items-center gap-1.5 pt-3"
                      style={{ borderTop: "0.5px solid rgba(239,68,68,0.12)" }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                      <span className="text-[11px] text-neutral-500">Savage. Pattern-aware. Personal.</span>
                    </div>
                  </div>
                </div>
              </div>

              <p
                className="text-center text-[12px] mt-8"
                style={{ color: "rgba(255,255,255,0.20)" }}
              >
                Example roasts — with your actual history, VAR gets more specific and more brutal.
              </p>
            </div>
          </section>

          {/* ── Upcoming matches ────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Matches
                  </div>
                  <h2 className="text-[34px] sm:text-[46px] font-medium text-white">
                    Make your calls
                  </h2>
                </div>
                <Link
                  href="/predict"
                  className="text-[13px] font-medium transition-opacity hover:opacity-100 self-start sm:self-auto"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Open Prediction Dashboard
                </Link>
              </div>
              <UpcomingList skipFirst={false} limit={8} />
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center gap-8">
              <span
                className="text-[11px] uppercase tracking-widest font-semibold"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#93C5FD",
                  border: "0.5px solid rgba(59,130,246,0.28)",
                  padding: "6px 18px",
                  borderRadius: 99,
                }}
              >
                Kickoff approaches
              </span>

              <h2 className="text-[40px] sm:text-[58px] font-medium text-white leading-tight max-w-2xl">
                Ready to be judged?
              </h2>

              <p className="text-[16px] max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Kickoff is approaching. Predict now before it&apos;s too late — and let VAR remember every wrong call you make.
              </p>

              <Link
                href="/predict"
                className="group inline-flex items-center gap-2.5 text-white text-[14px] font-medium transition-all active:scale-[0.97] hover:opacity-90 hover:shadow-lg hover:shadow-[#3B82F6]/25"
                style={{ background: "#3B82F6", padding: "14px 36px", borderRadius: 99 }}
              >
                Start predicting — it&apos;s free
                <i className="ti ti-arrow-right transition-transform group-hover:translate-x-1" />
              </Link>

              <div
                className="flex flex-wrap items-center justify-center gap-6 text-[12px]"
                style={{ color: "rgba(255,255,255,0.26)" }}
              >
                <span className="flex items-center gap-1.5">
                  <i className="ti ti-wallet" style={{ color: "#3B82F6" }} /> No gas fees
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <i className="ti ti-database" style={{ color: "#3B82F6" }} /> Stored on Walrus Mainnet
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <i className="ti ti-shield-check" style={{ color: "#3B82F6" }} /> Verified by wallet address
                </span>
              </div>
            </div>
          </section>

          {/* ── Footer ──────────────────────────────────────────── */}
          <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }}
                  className="animate-pulse"
                />
                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Powered by Walrus Memory · Built for Walrus Memory World Cup 2026
                </span>
              </div>
              <span className="text-[12px] hidden sm:block" style={{ color: "rgba(255,255,255,0.15)" }}>
                VAR · Verified Agent Records
              </span>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
