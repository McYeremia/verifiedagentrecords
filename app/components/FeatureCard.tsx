interface FeatureCardProps {
  icon: string
  title: string
  description: string
  iconVariant?: "coral" | "teal" | "blue" | "amber"
}

const iconStyles = {
  coral: { bg: "#EFF6FF", color: "#3B82F6" },
  teal: { bg: "#E1F5EE", color: "#1D9E75" },
  blue: { bg: "#E6F1FB", color: "#185FA5" },
  amber: { bg: "#FAEEDA", color: "#BA7517" },
}

export default function FeatureCard({ icon, title, description, iconVariant = "coral" }: FeatureCardProps) {
  const style = iconStyles[iconVariant]

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/5 group cursor-default"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg mb-3 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
        style={{ width: 36, height: 36, background: style.bg, color: style.color }}
      >
        <i className={`ti ti-${icon}`} style={{ fontSize: 18 }} />
      </div>
      <div
        className="text-[15px] font-medium mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </div>
      <div
        className="text-[13px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {description}
      </div>
    </div>
  )
}
