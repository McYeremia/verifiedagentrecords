import Link from "next/link"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getMemWal } from "../lib/memwal"
import Navbar from "../components/Navbar"
import RoastCard from "../components/RoastCard"
import HistoryItem from "../components/HistoryItem"

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

function parseHistoryMemories(memories: string[]) {
  const resultMap: Record<string, { isCorrect: boolean; actualWinner: string; score: string }> = {}

  for (const text of memories) {
    if (!text.startsWith("[RESULT]")) continue
    const midM = text.match(/Match ([\w_]+)/)
    const correctM = text.match(/(CORRECT|WRONG)/)
    const winnerM = text.match(/ended: (.+?) won (\d+)-(\d+)/)
    if (midM && correctM && winnerM) {
      resultMap[midM[1]] = {
        isCorrect: correctM[1] === "CORRECT",
        actualWinner: winnerM[1],
        score: `${winnerM[2]}-${winnerM[3]}`,
      }
    }
  }

  return memories
    .filter(t => t.startsWith("[PREDICTION]"))
    .map(text => {
      const midM = text.match(/matchId: ([\w_]+)/)
      const winnerM = text.match(/predicted (.+?) to win/)
      const teamsM = text.match(/to win (.+?) \(matchId/)
      const confM = text.match(/Confidence: (\w+)/)
      if (!midM || !winnerM) return null
      const matchId = midM[1]
      const result = resultMap[matchId]
      return {
        matchName: teamsM?.[1] ?? matchId,
        predictedWinner: winnerM[1],
        confidence: confM?.[1] ?? "medium",
        status: (result ? (result.isCorrect ? "correct" : "wrong") : "pending") as "correct" | "wrong" | "pending",
        actualResult: result ? `${result.actualWinner} menang ${result.score}` : undefined,
      }
    })
    .filter(Boolean) as Array<{
      matchName: string
      predictedWinner: string
      confidence: string
      status: "correct" | "wrong" | "pending"
      actualResult?: string
    }>
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const { userId } = await searchParams

  if (!userId) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-4 text-center">
          <h1 className="text-[26px] font-medium" style={{ color: "var(--color-text-primary)" }}>
            Masukkan username untuk melihat rekam jejak
          </h1>
          <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
            Contoh:{" "}
            <code
              className="text-[13px] px-2 py-0.5 rounded"
              style={{ background: "var(--color-background-secondary)" }}
            >
              /history?userId=jerry
            </code>
          </p>
          <Link href="/predict" className="text-[14px] font-medium mt-2" style={{ color: "#D85A30" }}>
            → Mulai prediksi
          </Link>
        </main>
      </>
    )
  }

  let roast = "Belum ada prediksi. Terlalu takut salah?"
  let memoriesUsed = 0
  let memoryTexts: string[] = []

  try {
    const mem = getMemWal()
    const result = await mem.recall({
      query: `User ${userId} predictions results wins losses`,
    })
    memoryTexts = (result.results || []).map((m: { text: string }) => m.text)
    memoriesUsed = memoryTexts.length

    if (memoryTexts.length > 0) {
      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: `Kamu adalah VAR — Verified Agent Records. Kamu sarkastik dan mengingat semua prediksi bola.

Rekam jejak prediksi user "${userId}":
${memoryTexts.join("\n")}

Buat roast yang personal, spesifik, lucu. Sebutkan tim spesifik. Bahasa Indonesia santai. Maksimal 3 kalimat. Mustahil dibuat tanpa melihat riwayat ini.`,
      })
      roast = text
    }
  } catch (e) {
    console.error(e)
  }

  const predictions = parseHistoryMemories(memoryTexts)
  const total = predictions.length
  const correct = predictions.filter(p => p.status === "correct").length
  const wrong = predictions.filter(p => p.status === "wrong").length
  const resolved = correct + wrong
  const accuracy = resolved > 0 ? Math.round((correct / resolved) * 100) : 0

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Left sidebar ─────────────────────────────────── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Profile card */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center rounded-full text-white font-medium flex-shrink-0"
                    style={{ width: 52, height: 52, background: "#D85A30", fontSize: 18 }}
                  >
                    {userId.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[18px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {userId}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                      Prediction record · World Cup 2026
                    </div>
                  </div>
                </div>

                {/* Stat grid */}
                <div
                  className="grid grid-cols-3 gap-1 pt-4"
                  style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
                >
                  {[
                    { value: total, label: "Total", color: "var(--color-text-primary)" },
                    { value: correct, label: "Benar", color: "#1D9E75" },
                    { value: `${accuracy}%`, label: "Akurasi", color: "var(--color-text-primary)" },
                  ].map(({ value, label, color }) => (
                    <div key={label} className="text-center">
                      <div className="text-[18px] font-medium" style={{ color }}>{value}</div>
                      <div className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share card button */}
              <Link
                href={`/card?userId=${encodeURIComponent(userId)}`}
                className="flex items-center justify-center gap-2 text-[13px] font-medium py-3 rounded-xl w-full"
                style={{
                  background: "#D85A30",
                  color: "white",
                }}
              >
                <i className="ti ti-share" />
                Share my roast card
              </Link>

              {/* Walrus proof */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 }} />
                  <span className="text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Verifiable on Walrus Mainnet
                  </span>
                </div>
                <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)", lineHeight: 1.6 }}>
                  {memoriesUsed} {memoriesUsed === 1 ? "memory" : "memories"} stored permanently under namespace{" "}
                  <code>var-wc2026</code>. Cannot be deleted or modified.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <main className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Latest verdict */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                💬 Latest VAR verdict
              </div>
              <RoastCard roast={roast} memoriesUsed={memoriesUsed} />
            </div>

            {/* Full history */}
            {predictions.length > 0 ? (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                  📋 Full prediction history
                </div>
                <div
                  className="rounded-xl px-4"
                  style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {predictions.map((pred, i) => (
                    <HistoryItem
                      key={i}
                      matchName={pred.matchName}
                      pick={pred.predictedWinner}
                      confidence={pred.confidence}
                      status={pred.status}
                      actualResult={pred.actualResult}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-8 text-center"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                  Belum ada prediksi.{" "}
                  <Link href="/predict" style={{ color: "#D85A30" }}>
                    Mulai prediksi sekarang →
                  </Link>
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
