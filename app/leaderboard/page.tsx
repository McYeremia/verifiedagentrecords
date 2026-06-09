import { Suspense } from "react"
import LeaderboardDashboard from "./LeaderboardDashboard"

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardDashboard />
    </Suspense>
  )
}
