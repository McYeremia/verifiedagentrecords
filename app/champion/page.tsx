import { Suspense } from "react"
import ChampionDashboard from "./ChampionDashboard"

export default function ChampionPage() {
  return (
    <Suspense>
      <ChampionDashboard />
    </Suspense>
  )
}
