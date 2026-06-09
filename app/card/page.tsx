import type { Metadata } from "next"
import { Suspense } from "react"
import CardContent from "./CardContent"
import Navbar from "../components/Navbar"

type Props = {
  searchParams: Promise<{ userId?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const userId = params.userId ?? ""
  const truncated = userId.length > 10
    ? `${userId.slice(0, 6)}...${userId.slice(-4)}`
    : userId || "Anonymous"

  // Fetch roast server-side so X crawler gets an OG image with the actual verdict
  let roast = ""
  if (userId) {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : "http://localhost:3000")
      const res  = await fetch(`${siteUrl}/api/card-data?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
      const data = await res.json()
      roast = (data.roast as string) ?? ""
    } catch { /* non-critical — OG image falls back to generic design */ }
  }

  const ogImageUrl = `/api/og?userId=${encodeURIComponent(userId)}&roast=${encodeURIComponent(roast.slice(0, 300))}`

  return {
    title: `${truncated} — Roast Card`,
    description: roast
      ? `"${roast.slice(0, 120)}..." — VAR verdict for ${truncated}. World Cup 2026.`
      : `VAR has receipts on ${truncated}. World Cup 2026 predictions, remembered forever on Walrus Mainnet.`,
    openGraph: {
      title: `${truncated} — VAR has receipts`,
      description: roast ? `"${roast.slice(0, 120)}..."` : "World Cup 2026 prediction record, stored permanently on Walrus Mainnet.",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${truncated} — VAR has receipts`,
      description: roast ? `"${roast.slice(0, 120)}..."` : "World Cup 2026 prediction record.",
      images: [ogImageUrl],
    },
  }
}

function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-[680px] mx-auto w-full px-5 py-8">
        <div className="text-[14px]" style={{ color: "var(--color-text-tertiary)" }}>
          Loading card...
        </div>
      </main>
    </>
  )
}

export default function CardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CardContent />
    </Suspense>
  )
}
