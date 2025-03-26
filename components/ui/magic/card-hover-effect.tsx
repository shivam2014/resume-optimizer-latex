"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CardHoverEffectProps {
  items: {
    id: string
    title: string
    description: string
    image?: string
  }[]
  className?: string
  onSelect?: (id: string) => void
  selectedId?: string
}

export function CardHoverEffect({ items, className, onSelect, selectedId }: CardHoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            "group relative flex flex-col justify-between rounded-xl border p-4 hover:shadow-xl transition-all duration-300 cursor-pointer",
            selectedId === item.id && "ring-2 ring-primary shadow-lg",
          )}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onSelect?.(item.id)}
        >
          {item.image && (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg mb-4">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {selectedId === item.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div
            className={cn(
              "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-300",
              hoveredIndex === idx && "opacity-10",
              selectedId === item.id ? "from-primary/20 to-primary/10" : "from-primary/10 to-primary/5",
            )}
          />
        </div>
      ))}
    </div>
  )
}

