import { Suspense } from "react"
import CardContent from "./CardContent"
import Navbar from "../components/Navbar"

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
