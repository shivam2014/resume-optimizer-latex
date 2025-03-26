"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTabsProps {
  tabs: {
    id: string
    label: string
  }[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, defaultValue, onChange, className }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.id)
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (activeTabIndex !== -1 && tabsRef.current[activeTabIndex]) {
      const tabElement = tabsRef.current[activeTabIndex]
      if (tabElement) {
        const { offsetLeft, offsetWidth } = tabElement
        setIndicatorStyle({
          left: offsetLeft,
          width: offsetWidth,
        })
      }
    }
  }, [activeTab, tabs])

  const handleTabClick = (value: string) => {
    setActiveTab(value)
    onChange?.(value)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex space-x-1 border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabsRef.current[index] = el)}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  )
}

