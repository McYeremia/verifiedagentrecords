import { Suspense } from "react"
import H2HContent from "./H2HContent"


export default function H2HPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ background: "#040810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Loading...
          </p>
        </div>
      }
    >
      <H2HContent />
    </Suspense>
  )
}
