"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: "sm" | "md" | "lg"
  borderRadius?: "sm" | "md" | "lg" | "full"
  shimmerDuration?: number
  children: React.ReactNode
}

export function ShimmerButton({
  className,
  shimmerColor = "#ffffff",
  shimmerSize: shimmerSizeProp = "md",
  borderRadius = "md",
  shimmerDuration = 2,
  children,
  ...props
}: ShimmerButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const sizeMap = {
    sm: "100px",
    md: "150px",
    lg: "200px",
  }

  const radiusMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }

  const shimmerSize = sizeMap[shimmerSizeProp] || sizeMap.md
  const buttonRadius = radiusMap[borderRadius] || radiusMap.md

  return (
    <button
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 font-medium transition-colors",
        buttonRadius,
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          mask: `radial-gradient(${shimmerSize} circle at ${position.x}px ${position.y}px, transparent 0%, black 100%)`,
          WebkitMask: `radial-gradient(${shimmerSize} circle at ${position.x}px ${position.y}px, transparent 0%, black 100%)`,
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            opacity: 0.2,
            transform: "translateX(-100%)",
            animation: `shimmer ${shimmerDuration}s infinite`,
          }}
        />
      </div>
      {children}
    </button>
  )
}

