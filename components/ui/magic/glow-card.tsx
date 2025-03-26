import type React from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: "blue" | "purple" | "cyan" | "pink" | "teal" | "custom"
  customGradient?: string
  glowSize?: "sm" | "md" | "lg"
}

export function GlowCard({
  gradient = "blue",
  customGradient,
  glowSize = "md",
  className,
  children,
  ...props
}: GlowCardProps) {
  const gradientMap = {
    blue: "from-blue-500/20 via-cyan-500/20 to-sky-500/20",
    purple: "from-purple-500/20 via-pink-500/20 to-fuchsia-500/20",
    cyan: "from-cyan-500/20 via-teal-500/20 to-emerald-500/20",
    pink: "from-pink-500/20 via-rose-500/20 to-red-500/20",
    teal: "from-teal-500/20 via-emerald-500/20 to-green-500/20",
    custom: customGradient,
  }

  const glowSizeMap = {
    sm: "blur-sm",
    md: "blur-md",
    lg: "blur-xl",
  }

  const selectedGradient = gradientMap[gradient] || gradientMap.blue
  const selectedGlowSize = glowSizeMap[glowSize] || glowSizeMap.md

  return (
    <div className="relative group">
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r rounded-xl opacity-75 group-hover:opacity-100 transition duration-300",
          selectedGradient,
          selectedGlowSize,
        )}
      />
      <div className={cn("relative bg-background rounded-lg p-6", className)} {...props}>
        {children}
      </div>
    </div>
  )
}

