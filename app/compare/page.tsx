"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResumeCompare } from "@/components/resume-compare"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ComparePage() {
  const [originalResume, setOriginalResume] = useState("")
  const [optimizedResume, setOptimizedResume] = useState("")
  const [editedResume, setEditedResume] = useState("")
  const [activeTab, setActiveTab] = useState("compare")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get resume content from localStorage
    const original = localStorage.getItem("originalResume")
    const optimized = localStorage.getItem("optimizedResume")

    if (original && optimized) {
      setOriginalResume(original)
      setOptimizedResume(optimized)
      setEditedResume(optimized) // Initialize edited with optimized
    } else {
      toast({
        title: "Missing Data",
        description: "Resume data not found. Please start from the beginning.",
        variant: "destructive",
      })
      router.push("/upload")
    }
  }, [router, toast])

  const handleContinue = () => {
    // Store the final edited resume for the next step
    localStorage.setItem("finalResume", editedResume)
    router.push("/templates")
  }

  return (
    <div className="writora-gradient min-h-screen py-12 px-4">
      <div className="card-glow w-full max-w-5xl mx-auto shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Compare and Edit</h1>
            <p className="text-zinc-400">Review the changes and make any final edits to your optimized resume</p>
          </div>

          <Tabs defaultValue="compare" onValueChange={setActiveTab} className="text-white">
            <TabsList className="bg-zinc-800 text-zinc-400 border border-zinc-700">
              <TabsTrigger
                value="compare"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                Compare
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="pt-4">
              <ResumeCompare original={originalResume} optimized={optimizedResume} />
            </TabsContent>

            <TabsContent value="edit" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-white text-lg font-medium">Edit Your Optimized Resume</h3>
                <Textarea
                  className="min-h-[500px] font-mono dark-input"
                  value={editedResume}
                  onChange={(e) => setEditedResume(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/optimize")}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <button className="shimmer-button" onClick={handleContinue}>
              Continue to Templates
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

