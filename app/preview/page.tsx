"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { PdfViewer } from "@/components/pdf-viewer"
import { ArrowLeft, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PreviewPage() {
  const [latexContent, setLatexContent] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [activeTab, setActiveTab] = useState("pdf")
  const router = useRouter()
  const { toast } = useToast()
  const latexEditorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Get LaTeX content from localStorage
    const savedLatex = localStorage.getItem("latexContent")

    if (savedLatex) {
      setLatexContent(savedLatex)
      // For demo purposes, we'll use a placeholder PDF
      setPdfUrl("/placeholder.svg?height=800&width=600")
    } else {
      toast({
        title: "Missing Data",
        description: "LaTeX data not found. Please start from the beginning.",
        variant: "destructive",
      })
      router.push("/upload")
    }
  }, [router, toast])

  const handleCompilePdf = async () => {
    try {
      setIsCompiling(true)

      // Call the API to compile LaTeX to PDF
      const response = await fetch("https://github.com/shivam2014/resume-optimize-AI/compile-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex_content: latexContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to compile LaTeX")
      }

      const data = await response.json()

      // Update the PDF URL
      setPdfUrl(data.pdf_url)
      setActiveTab("pdf")

      toast({
        title: "Compilation Successful",
        description: "Your resume has been compiled to PDF.",
      })
    } catch (error) {
      console.error("Error compiling LaTeX:", error)
      toast({
        title: "Compilation Failed",
        description: "There was an error compiling the LaTeX. Please check for syntax errors.",
        variant: "destructive",
      })
    } finally {
      setIsCompiling(false)
    }
  }

  const handleDownloadLatex = () => {
    const blob = new Blob([latexContent], { type: "application/x-tex" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.tex"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = () => {
    // In a real implementation, this would download the actual PDF
    // For demo purposes, we'll just show a toast
    toast({
      title: "Download Started",
      description: "Your resume PDF is being downloaded.",
    })
  }

  return (
    <div className="mesh-gradient min-h-screen py-12 px-4">
      <div className="dark-card rounded-xl w-full max-w-5xl mx-auto shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Preview and Download</h1>
            <p className="text-white/70">Review your resume, make final edits, and download the files</p>
          </div>

          <Tabs defaultValue="pdf" onValueChange={setActiveTab} className="text-white">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 text-white">
              <TabsTrigger value="pdf" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                PDF Preview
              </TabsTrigger>
              <TabsTrigger value="latex" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                LaTeX Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="pt-4">
              <div className="flex justify-center">
                <PdfViewer pdfUrl={pdfUrl} />
              </div>
            </TabsContent>

            <TabsContent value="latex" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCompilePdf}
                    disabled={isCompiling}
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    {isCompiling ? <LoadingSpinner /> : "Compile PDF"}
                  </Button>
                </div>
                <Textarea
                  ref={latexEditorRef}
                  className="min-h-[600px] font-mono text-sm bg-white/10 border-white/20 text-white"
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/templates")}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleDownloadLatex}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download LaTeX
              </Button>
              <Button onClick={handleDownloadPdf} className="bg-white text-black hover:bg-white/90">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

