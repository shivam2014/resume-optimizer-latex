import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Resume Optimization",
  description: "Optimize your resume for job applications using AI",
}

export default function HomePage() {
  return (
    <div className="writora-gradient min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="gradient-text text-5xl sm:text-6xl font-bold tracking-tight">Resume Optimization</h1>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Enhance your resume with AI to match job descriptions and increase your chances of getting hired.
        </p>
      </div>

      <div className="mt-12 w-full max-w-md">
        <div className="card-glow shadow-2xl">
          <div className="p-6">
            <h2 className="text-white text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-zinc-400 text-sm mb-8">
              Upload your resume and optimize it for your target job position
            </p>

            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="w-16 h-16 text-purple-400 mb-6" />
              <p className="text-center text-zinc-400 text-sm max-w-xs">
                Our AI-powered tool will analyze your resume and suggest improvements based on the job description.
              </p>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Link href="/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </Button>

              <Link href="/upload">
                <Button className="shimmer-button group">
                  Start Optimization
                  <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

