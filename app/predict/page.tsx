import { Suspense } from "react"
import PredictDashboard from "./PredictDashboard"
import Navbar from "../components/Navbar"

function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-[680px] mx-auto w-full px-5 py-8">
        <div className="text-[14px]" style={{ color: "var(--color-text-tertiary)" }}>
          Loading...
        </div>
      </main>
    </>
  )
}

export default function PredictPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PredictDashboard />
    </Suspense>
  )
}
