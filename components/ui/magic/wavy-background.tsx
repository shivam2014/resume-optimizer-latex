"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface WavyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "medium" | "fast"
  waveOpacity?: number
  animated?: boolean
}

export function WavyBackground({
  children,
  className,
  containerClassName,
  colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  waveWidth = 50,
  backgroundFill = "white",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  animated = true,
  ...props
}: WavyBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [waveHeight, setWaveHeight] = useState(0)
  const [path, setPath] = useState("")
  const [svgWidth, setSvgWidth] = useState(0)

  const speedMap = {
    slow: 15,
    medium: 10,
    fast: 5,
  }

  const animationDuration = speedMap[speed]

  useEffect(() => {
    if (!containerRef.current) return

    const updateWaveDimensions = () => {
      if (!containerRef.current) return

      const height = containerRef.current.offsetHeight
      const width = containerRef.current.offsetWidth

      setWaveHeight(height)
      setSvgWidth(width)

      const wavePoints = Math.ceil(width / waveWidth) + 1
      const points = Array.from({ length: wavePoints }, (_, i) => {
        const x = i * waveWidth
        const y = height / 2 + Math.sin(i) * (height / 8)
        return `${x},${y}`
      }).join(" ")

      setPath(`M0,${height} L0,0 L${width},0 L${width},${height} Z`)
    }

    updateWaveDimensions()
    window.addEventListener("resize", updateWaveDimensions)

    return () => {
      window.removeEventListener("resize", updateWaveDimensions)
    }
  }, [waveWidth])

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", containerClassName)} {...props}>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ filter: `blur(${blur}px)` }}
        viewBox={`0 0 ${svgWidth} ${waveHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          {colors.map((color, i) => (
            <linearGradient key={`gradient-${i}`} id={`gradient-${i}`} gradientTransform={`rotate(${i * 45})`}>
              <stop offset="0%" stopColor={color} stopOpacity={waveOpacity} />
              <stop offset="50%" stopColor={color} stopOpacity={waveOpacity / 2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <rect x="0" y="0" width={svgWidth} height={waveHeight} fill={backgroundFill} />
        {colors.map((_, i) => (
          <path
            key={`wave-${i}`}
            d={path}
            fill={`url(#gradient-${i})`}
            style={{
              transform: `translateX(${i * 10}px)`,
              animation: animated ? `wave-${i} ${animationDuration}s ease-in-out infinite alternate` : undefined,
            }}
          />
        ))}
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

