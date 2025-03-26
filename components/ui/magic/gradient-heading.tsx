import type React from "react"
import { cn } from "@/lib/utils"

interface GradientHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  gradient?: "blue" | "purple" | "cyan" | "pink" | "teal" | "custom"
  customGradient?: string
  animate?: boolean
}

export function GradientHeading({
  as: Component = "h1",
  gradient = "blue",
  customGradient,
  animate = false,
  className,
  children,
  ...props
}: GradientHeadingProps) {
  const gradientMap = {
    blue: "from-blue-600 via-blue-500 to-cyan-500",
    purple: "from-purple-600 via-pink-500 to-blue-500",
    cyan: "from-cyan-500 via-teal-500 to-emerald-500",
    pink: "from-pink-500 via-rose-500 to-purple-500",
    teal: "from-teal-500 via-emerald-500 to-green-500",
    custom: customGradient,
  }

  const selectedGradient = gradientMap[gradient] || gradientMap.blue

  return (
    <Component
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r font-bold",
        selectedGradient,
        animate && "animate-text",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

