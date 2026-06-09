import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Providers } from "./providers"
import LiveTicker from "./components/LiveTicker"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

// Resolves relative OG image paths to absolute URLs — required by X/Twitter crawler
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VAR — Verified Agent Records",
    template: "%s — VAR",
  },
  description: "Your World Cup 2026 predictions. Remembered forever. Roasted harder every time.",
  openGraph: {
    title: "VAR — Verified Agent Records",
    description: "Your World Cup 2026 predictions. Remembered forever. Roasted harder every time.",
    type: "website",
    siteName: "VAR — Verified Agent Records",
  },
  twitter: {
    card: "summary_large_image",
    title: "VAR — Verified Agent Records",
    description: "Your World Cup 2026 predictions. Remembered forever. Roasted harder every time.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <LiveTicker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
