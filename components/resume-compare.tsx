"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ResumeCompareProps {
  original: string
  optimized: string
}

export function ResumeCompare({ original, optimized }: ResumeCompareProps) {
  const [view, setView] = useState<"side-by-side" | "unified">("side-by-side")

  // Split the content by newlines and preserve them
  const originalLines = original.split("\n")
  const optimizedLines = optimized.split("\n")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs defaultValue="side-by-side" onValueChange={(value) => setView(value as any)} className="text-white">
          <TabsList className="bg-zinc-800 text-zinc-400 border border-zinc-700">
            <TabsTrigger
              value="side-by-side"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              Side by Side
            </TabsTrigger>
            <TabsTrigger
              value="unified"
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              Unified
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "side-by-side" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg">
            <div className="p-4">
              <h3 className="text-white text-lg font-medium mb-2">Original Resume</h3>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm whitespace-pre-wrap text-zinc-300">
                  {originalLines.map((line, index) => (
                    <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                      {line}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg">
            <div className="p-4">
              <h3 className="text-white text-lg font-medium mb-2">Optimized Resume</h3>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm whitespace-pre-wrap text-zinc-300">
                  {optimizedLines.map((line, index) => (
                    <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                      {line}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg">
          <div className="p-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">Original Resume</h3>
                  <div className="font-mono text-sm whitespace-pre-wrap bg-zinc-800 p-4 rounded-md text-zinc-300">
                    {originalLines.map((line, index) => (
                      <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white text-lg font-medium mb-2">Optimized Resume</h3>
                  <div className="font-mono text-sm whitespace-pre-wrap bg-purple-900/20 p-4 rounded-md text-zinc-300">
                    {optimizedLines.map((line, index) => (
                      <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}

