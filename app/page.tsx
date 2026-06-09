import Link from "next/link"
import Navbar from "./components/Navbar"
import MatchHeroCard from "./components/MatchHeroCard"
import RoastCard from "./components/RoastCard"
import FeatureCard from "./components/FeatureCard"
import UpcomingList from "./components/UpcomingList"
import { getUpcomingMatches } from "./lib/matches"

export default function Home() {
  const nextMatch = getUpcomingMatches()[0]

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div
              className="inline-flex items-center gap-2 self-start text-[11px] font-medium uppercase tracking-wide"
              style={{
                background: "#FAECE7",
                color: "#993C1D",
                border: "0.5px solid #F0997B",
                padding: "4px 12px",
                borderRadius: 99,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D85A30", display: "inline-block" }} />
              World Cup 2026 · 48 teams · 104 matches
            </div>

            <div>
              <h1 className="text-[36px] sm:text-[44px] font-medium leading-tight" style={{ color: "var(--color-text-primary)" }}>
                Your predictions.<br />
                <span style={{ color: "#D85A30" }}>Remembered forever.</span>
              </h1>
              <p className="text-[15px] leading-relaxed mt-4" style={{ color: "var(--color-text-secondary)", maxWidth: 480 }}>
                Simpan prediksi Piala Dunia 2026 kamu di Walrus Mainnet — permanen, tak terhapus.
                Makin banyak prediksi yang salah, makin savage roast dari VAR.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 text-white text-[14px] font-medium"
                style={{ background: "#D85A30", padding: "11px 26px", borderRadius: 99 }}
              >
                <i className="ti ti-lock" />
                Lock in a prediction
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 text-[14px] font-medium"
                style={{
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  padding: "11px 26px",
                  borderRadius: 99,
                }}
              >
                View my record
              </Link>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-6 pt-6"
              style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
            >
              {[
                { value: "2,841", label: "Predictions locked" },
                { value: "104", label: "Matches to predict" },
                { value: "100%", label: "On Walrus Mainnet" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-[20px] font-medium" style={{ color: "var(--color-text-primary)" }}>{value}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — MatchHeroCard + upcoming */}
          <div className="flex flex-col gap-3">
            {nextMatch ? (
              <>
                <MatchHeroCard match={nextMatch} redirectOnSubmit={true} />
                <UpcomingList skipFirst={true} limit={3} />
              </>
            ) : (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}
              >
                <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                  Semua prediksi sudah dikunci. Tunggu laga berikutnya.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }} />

        {/* ── How it works ────────────────────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mb-6">
            <div className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--color-text-tertiary)" }}>
              ✨ How it works
            </div>
            <h2 className="text-[22px] font-medium" style={{ color: "var(--color-text-primary)" }}>
              More predictions, sharper roasts
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <FeatureCard icon="lock" title="Lock your call" description="Prediksi kamu disimpan ke Walrus Mainnet — permanen, tidak bisa dihapus." iconVariant="coral" />
            <FeatureCard icon="brain" title="VAR remembers" description="Setiap prediksi dan hasil diingat lintas sesi. VAR tidak pernah lupa." iconVariant="teal" />
            <FeatureCard icon="speakerphone" title="Get roasted" description="Makin banyak data, makin savage roast-nya. Hari pertama sopan, hari ke-4 habis." iconVariant="amber" />
            <FeatureCard icon="share" title="Share the shame" description="Export roast card dan posting ke X dengan #Walrus. Let them know." iconVariant="blue" />
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }} />

        {/* ── Latest verdict + All matches ────────────────────── */}
        <section className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          {/* Verdict */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--color-text-tertiary)" }}>
              💬 Latest verdict
            </div>
            <h2 className="text-[22px] font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
              VAR is not impressed
            </h2>
            <RoastCard
              roast="Belum ada prediksi sama sekali. Takut ketahuan salah, ya? Lock in dulu baru ngomong."
              memoriesUsed={0}
            />
          </div>

          {/* All upcoming */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--color-text-tertiary)" }}>
              📅 All matches
            </div>
            <h2 className="text-[22px] font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
              Make your calls
            </h2>
            <UpcomingList skipFirst={false} limit={7} />
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }} />

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="py-16 flex flex-col items-center text-center gap-5">
          <h2 className="text-[28px] font-medium" style={{ color: "var(--color-text-primary)" }}>
            Ready to be judged?
          </h2>
          <p className="text-[15px] max-w-md" style={{ color: "var(--color-text-secondary)" }}>
            Kickoff sudah dekat. Prediksi sekarang sebelum terlambat — dan biarkan VAR mengingat semua kesalahanmu.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 text-white text-[14px] font-medium"
            style={{ background: "#D85A30", padding: "12px 32px", borderRadius: 99 }}
          >
            <i className="ti ti-arrow-right" />
            Start predicting — it&apos;s free
          </Link>
          <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            No wallet needed · All memory stored on Walrus Mainnet
          </p>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="py-6 px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} />
            <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              Powered by Walrus Memory · Built for Walrus Memory World Cup 2026
            </span>
          </div>
          <span className="text-[12px] hidden sm:block" style={{ color: "var(--color-text-tertiary)" }}>
            VAR · Verified Agent Records
          </span>
        </div>
      </footer>
    </>
  )
}
