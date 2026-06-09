import Image from "next/image"
import { getFlagUrl, getTLA } from "../lib/matches"

interface FlagImgProps {
  team: string
  height?: number
}

export default function FlagImg({ team, height = 28 }: FlagImgProps) {
  const url = getFlagUrl(team, 80)
  const width = Math.round(height * 1.5)

  if (!url) {
    return (
      <div
        className="flex items-center justify-center rounded font-bold flex-shrink-0"
        style={{
          width,
          height,
          background: "rgba(255,255,255,0.07)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          fontSize: height * 0.33,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.05em",
        }}
      >
        {getTLA(team)}
      </div>
    )
  }

  return (
    <Image
      src={url}
      alt={team}
      width={width}
      height={height}
      unoptimized
      className="flex-shrink-0"
      style={{
        width,
        height,
        objectFit: "cover",
        borderRadius: 4,
        border: "0.5px solid rgba(255,255,255,0.14)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        display: "inline-block",
      }}
    />
  )
}
