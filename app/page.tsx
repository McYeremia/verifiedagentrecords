import Link from "next/link"
import Navbar from "./components/Navbar"
import MatchHeroCard from "./components/MatchHeroCard"
import UpcomingList from "./components/UpcomingList"
import CountdownTimer from "./components/CountdownTimer"
import ScrollProgress from "./components/ScrollProgress"
import AnimatedSection from "./components/AnimatedSection"
import AnimatedCounter from "./components/AnimatedCounter"
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
      <ScrollProgress />
      <Navbar />

      {/* Single unified background — no hard section breaks */}
      <div style={{ background: "#040810", color: "white", position: "relative", overflow: "hidden" }}>

        {/* ── Scrollable section blobs (absolute = scroll with page) ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
          {/* Hero — blue right accent */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: 0,
              right: "-10%",
              width: "70%",
              height: "110vh",
              background: "radial-gradient(ellipse 800px 600px at 70% 35%, rgba(29,78,216,0.24), transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Hero — bottom-left blue base */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "30vh",
              left: "-10%",
              width: "55%",
              height: "80vh",
              background: "radial-gradient(ellipse 600px 500px at 22% 55%, rgba(29,78,216,0.60) 0%, rgba(37,99,235,0.32) 35%, transparent 70%)",
              filter: "blur(70px)",
              animationDelay: "-6s",
            }}
          />
          {/* Features section — violet/indigo accent */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "100vh",
              left: "-5%",
              width: "65%",
              height: "110vh",
              background: "radial-gradient(ellipse 700px 550px at 18% 50%, rgba(124,58,237,0.22), transparent 70%)",
              filter: "blur(80px)",
              animationDelay: "-4s",
            }}
          />
          {/* Features — right counter-balance */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "130vh",
              right: "-8%",
              width: "50%",
              height: "80vh",
              background: "radial-gradient(ellipse 550px 420px at 82% 50%, rgba(79,70,229,0.15), transparent 70%)",
              filter: "blur(90px)",
              animationDelay: "-10s",
            }}
          />
          {/* Blue bridge — features → memory */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "190vh",
              left: "20%",
              width: "60%",
              height: "90vh",
              background: "radial-gradient(ellipse 700px 500px at 50% 50%, rgba(29,78,216,0.15), transparent 70%)",
              filter: "blur(90px)",
              animationDelay: "-2s",
            }}
          />
          {/* Memory section — warm red tint (Day 7+ theme) */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "215vh",
              right: "-10%",
              width: "70%",
              height: "110vh",
              background: "radial-gradient(ellipse 750px 560px at 78% 45%, rgba(220,38,38,0.18), transparent 70%)",
              filter: "blur(85px)",
              animationDelay: "-9s",
            }}
          />
          {/* Memory — left counter */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "255vh",
              left: "-8%",
              width: "50%",
              height: "80vh",
              background: "radial-gradient(ellipse 560px 420px at 18% 55%, rgba(239,68,68,0.11), transparent 70%)",
              filter: "blur(90px)",
              animationDelay: "-5s",
            }}
          />
          {/* Matches section — teal accent */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "320vh",
              left: "-10%",
              width: "65%",
              height: "110vh",
              background: "radial-gradient(ellipse 700px 520px at 16% 50%, rgba(20,184,166,0.21), transparent 70%)",
              filter: "blur(80px)",
              animationDelay: "-7s",
            }}
          />
          {/* Matches — right blue counter */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "360vh",
              right: "-8%",
              width: "50%",
              height: "80vh",
              background: "radial-gradient(ellipse 560px 420px at 82% 50%, rgba(29,78,216,0.17), transparent 70%)",
              filter: "blur(85px)",
              animationDelay: "-11s",
            }}
          />
          {/* CTA — strong blue from bottom */}
          <div
            className="absolute"
            style={{
              bottom: 0,
              left: "-10%",
              right: "-10%",
              height: "65vh",
              background: "radial-gradient(ellipse 100% 80% at 55% 100%, rgba(29,78,216,0.60) 0%, rgba(37,99,235,0.32) 32%, rgba(59,130,246,0.10) 62%, transparent 80%)",
              filter: "blur(45px)",
            }}
          />
          {/* Trophy gold shimmer — hero upper-mid */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "5vh",
              left: "30%",
              width: "45%",
              height: "65vh",
              background: "radial-gradient(ellipse 550px 380px at 50% 38%, rgba(245,158,11,0.09), transparent 70%)",
              filter: "blur(85px)",
              animationDelay: "-3s",
            }}
          />
          {/* Gold accent — features section */}
          <div
            className="absolute animate-wave-shift"
            style={{
              top: "160vh",
              right: "-5%",
              width: "50%",
              height: "80vh",
              background: "radial-gradient(ellipse 560px 420px at 78% 48%, rgba(245,158,11,0.08), transparent 70%)",
              filter: "blur(90px)",
              animationDelay: "-6s",
            }}
          />
        </div>

        {/* ── Dot grid pattern ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage: "radial-gradient(rgba(59,130,246,0.09) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            zIndex: 0,
          }}
        />

        {/* ── Floating particles (blue + gold mix) ────────────────── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
          {([
            { top: "7vh",   left: "6%",  size: 3, delay: "0s",    gold: false },
            { top: "19vh",  left: "87%", size: 5, delay: "-2.2s", gold: true  },
            { top: "36vh",  left: "92%", size: 2, delay: "-4.0s", gold: false },
            { top: "63vh",  left: "4%",  size: 4, delay: "-1.5s", gold: true  },
            { top: "79vh",  left: "49%", size: 3, delay: "-3.5s", gold: false },
            { top: "96vh",  left: "78%", size: 4, delay: "-0.3s", gold: true  },
            { top: "112vh", left: "93%", size: 4, delay: "-0.8s", gold: false },
            { top: "147vh", left: "7%",  size: 2, delay: "-5.0s", gold: true  },
            { top: "179vh", left: "73%", size: 3, delay: "-2.8s", gold: false },
            { top: "210vh", left: "18%", size: 4, delay: "-1.6s", gold: true  },
            { top: "240vh", left: "5%",  size: 5, delay: "-1.2s", gold: false },
            { top: "288vh", left: "95%", size: 3, delay: "-4.5s", gold: true  },
            { top: "320vh", left: "42%", size: 2, delay: "-2.0s", gold: false },
            { top: "365vh", left: "91%", size: 4, delay: "-0.5s", gold: true  },
            { top: "408vh", left: "6%",  size: 2, delay: "-3.2s", gold: false },
            { top: "450vh", left: "58%", size: 3, delay: "-4.8s", gold: true  },
            { top: "490vh", left: "89%", size: 3, delay: "-1.8s", gold: false },
            { top: "528vh", left: "13%", size: 5, delay: "-6.0s", gold: true  },
          ] as { top: string; left: string; size: number; delay: string; gold: boolean }[]).map(
            ({ top, left, size, delay, gold }, i) => (
              <div
                key={i}
                className="absolute animate-float rounded-full"
                style={{
                  top,
                  left,
                  width: size,
                  height: size,
                  background: gold ? "rgba(251,191,36,0.65)" : "rgba(96,165,250,0.55)",
                  boxShadow: gold
                    ? `0 0 ${size * 3}px ${size}px rgba(245,158,11,0.25)`
                    : `0 0 ${size * 3}px ${size}px rgba(59,130,246,0.22)`,
                  animationDelay: delay,
                }}
              />
            )
          )}
        </div>

        {/* ── Floating football decorations ───────────────────────── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
          {([
            { top: "10vh",  left: "1.5%", size: 52, delay: "-0.5s" },
            { top: "50vh",  left: "95%",  size: 38, delay: "-3.0s" },
            { top: "88vh",  left: "2%",   size: 44, delay: "-1.8s" },
            { top: "160vh", left: "94%",  size: 36, delay: "-4.5s" },
            { top: "270vh", left: "1.5%", size: 48, delay: "-2.2s" },
            { top: "390vh", left: "93%",  size: 40, delay: "-5.5s" },
          ] as { top: string; left: string; size: number; delay: string }[]).map(
            ({ top, left, size, delay }, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{ top, left, animationDelay: delay, opacity: 0.07 }}
              >
                <i className="ti ti-ball-football" style={{ fontSize: size, color: "white" }} />
              </div>
            )
          )}
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
                  <h1 className="text-[50px] sm:text-[64px] lg:text-[78px] leading-[0.97] tracking-tight">
                    <span className="font-normal" style={{ color: "rgba(255,255,255,0.22)" }}>Your wrong calls.</span>
                    <br />
                    <span className="font-extrabold text-white">Remembered</span>
                    <br />
                    <span className="font-extrabold text-white">forever.</span>
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
                  { node: <AnimatedCounter to={2841} separator />, label: "Predictions locked" },
                  { node: <AnimatedCounter to={104} />,            label: "Matches to predict" },
                  { node: <AnimatedCounter to={100} suffix="%" />, label: "On Walrus Mainnet" },
                  { node: <>Day 7+</>,                             label: "Roasts get brutal" },
                ].map(({ node, label }) => (
                  <div key={label}>
                    <div className="text-[30px] sm:text-[38px] font-medium text-white leading-none tabular-nums">{node}</div>
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
            <AnimatedSection>
              <div className="mb-16">
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  How it works
                </div>
                <h2 className="text-[34px] sm:text-[46px] leading-tight">
                  <span className="font-normal" style={{ color: "rgba(255,255,255,0.30)" }}>More predictions,</span>
                  <br className="hidden sm:block" />
                  {" "}<span className="font-bold text-white">sharper roasts</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
                {FEATURES.map(({ icon, title, desc }) => (
                  <div key={title} className="flex flex-col gap-4 group transition-transform duration-300 hover:-translate-y-2 cursor-default">
                    <div
                      className="flex items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(59,130,246,0.18)]"
                      style={{
                        width: 46,
                        height: 46,
                        background: "rgba(59, 130, 246, 0.07)",
                        border: "0.5px solid rgba(59, 130, 246, 0.15)",
                        color: "rgba(255,255,255,0.65)",
                        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
                      }}
                    >
                      <i className={`ti ti-${icon}`} style={{ fontSize: 20 }} />
                    </div>
                    <div className="text-[16px] font-medium text-white transition-colors duration-300 group-hover:text-[#93C5FD]">{title}</div>
                    <div className="text-[14px] leading-relaxed transition-colors duration-300 group-hover:text-[rgba(255,255,255,0.55)]" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
            </div>
          </section>

          {/* ── Memory evolution demo ───────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <AnimatedSection>
              <div className="mb-14">
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Memory in action
                </div>
                <h2 className="text-[34px] sm:text-[46px] leading-tight">
                  <span className="font-normal" style={{ color: "rgba(255,255,255,0.30)" }}>The longer VAR watches,</span>
                  <br className="hidden sm:block" />
                  {" "}<span className="font-bold text-white">the more it hurts</span>
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
            </AnimatedSection>
            </div>
          </section>

          {/* ── Countdown ───────────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            <AnimatedSection>
              <div className="mb-8 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                  World Cup 2026
                </div>
                <h2 className="text-[30px] sm:text-[38px] leading-tight">
                  <span className="font-normal" style={{ color: "rgba(255,255,255,0.30)" }}>The clock</span>
                  {" "}<span className="font-bold text-white">is ticking</span>
                </h2>
              </div>
              <CountdownTimer />
            </AnimatedSection>
            </div>
          </section>

          {/* ── Upcoming matches ────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Matches
                  </div>
                  <h2 className="text-[34px] sm:text-[46px]">
                    <span className="font-normal" style={{ color: "rgba(255,255,255,0.30)" }}>Make your</span>
                    {" "}<span className="font-bold text-white">calls</span>
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
            </AnimatedSection>
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────────────── */}
          <section>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center gap-8">
            <AnimatedSection className="flex flex-col items-center gap-8 w-full">
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

              <h2 className="text-[40px] sm:text-[58px] leading-tight max-w-2xl">
                <span className="font-normal" style={{ color: "rgba(255,255,255,0.30)" }}>Ready to be</span>
                <br />
                <span className="font-extrabold text-white">judged?</span>
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
            </AnimatedSection>
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
