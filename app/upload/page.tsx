"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/file-uploader"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Call the Flask API to extract resume content
      const response = await fetch("https://github.com/shivam2014/doc2text", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Failed to extract resume content")
      }

      const data = await response.json()

      // Store the extracted content in localStorage for the next step
      localStorage.setItem("resumeContent", data.content)

      // Navigate to the next step
      router.push("/optimize")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
      setUploadProgress(0)
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
            onFileSelect={handleUpload}
            isUploading={isUploading}
            progress={uploadProgress}
            acceptedFileTypes={[".pdf", ".docx", ".txt", ".md"]}
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
              disabled={isUploading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              {isUploading ? <LoadingSpinner /> : "Skip (Demo)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

