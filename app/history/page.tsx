import { Suspense } from "react"
import HistoryDashboard from "./HistoryDashboard"

export default function HistoryPage() {
  return (
    <Suspense>
      <HistoryDashboard />
    </Suspense>
  )
}
