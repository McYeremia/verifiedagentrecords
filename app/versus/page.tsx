import { Suspense } from "react"
import VersusContent from "./VersusContent"

export default function VersusPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ background: "#060C18", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Loading...
          </p>
        </div>
      }
    >
      <VersusContent />
    </Suspense>
  )
}
