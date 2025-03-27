"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/file-uploader"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleConversionComplete = (result: ConversionResult) => {
    try {
      // Store the structured resume data in localStorage
      localStorage.setItem("resumeData", JSON.stringify({
        text: result.text,
        sections: result.sections,
        metadata: result.metadata
      }))
      
      toast({
        title: "Success",
        description: `Resume processed successfully! Extracted ${result.sections.length} sections.`,
      })
      
      // Router.push is handled by the FileUploader component
    } catch (error) {
      console.error("Error storing resume content:", error)
      toast({
        title: "Error",
        description: "Failed to process your resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSkipDemo = () => {
    router.push("/optimize")
  }

  return (
    <div className="writora-gradient min-h-screen flex items-center justify-center p-4">
      <div className="card-glow w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Upload Your Resume</h1>
            <p className="text-zinc-400">Supported formats: PDF, DOCX, TXT, MD</p>
          </div>

          <FileUploader
            onConversionComplete={handleConversionComplete}
          />

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleSkipDemo}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              Skip (Demo)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

