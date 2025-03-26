"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResumeViewer } from "@/components/resume-viewer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OptimizePage() {
  const [resumeContent, setResumeContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [apiProvider, setApiProvider] = useState("openai")
  const [model, setModel] = useState("gpt-4o")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [inputMethod, setInputMethod] = useState("text")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get resume content from localStorage
    const savedContent = localStorage.getItem("resumeContent")
    if (savedContent) {
      setResumeContent(savedContent)
    } else {
      // Demo content if nothing is in localStorage
      setResumeContent(`John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer, ABC Tech (2020-Present)
- Led development of cloud-based applications using React and Node.js
- Implemented CI/CD pipelines reducing deployment time by 40%
- Mentored junior developers and conducted code reviews

Software Developer, XYZ Solutions (2018-2020)
- Developed RESTful APIs using Express.js and MongoDB
- Collaborated with UX designers to implement responsive web interfaces
- Participated in Agile development processes

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)

SKILLS
JavaScript, TypeScript, React, Node.js, Express, MongoDB, AWS, Docker, Git`)
    }
  }, [])

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true)

      // Prepare the job description based on input method
      let finalJobDescription = jobDescription
      if (inputMethod === "url" && jobUrl) {
        // In a real implementation, you would fetch the job description from the URL
        // For demo purposes, we'll just use a placeholder
        finalJobDescription = "Job description extracted from URL: " + jobUrl
      }

      // Call the Flask API to optimize the resume
      const response = await fetch("https://github.com/shivam2014/resume-optimize-AI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          job_description: finalJobDescription,
          api_provider: apiProvider,
          model: model,
          additional_instructions: additionalInstructions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize resume")
      }

      const data = await response.json()

      // Store the original and optimized content in localStorage for the next step
      localStorage.setItem("originalResume", resumeContent)
      localStorage.setItem("optimizedResume", data.optimized_content)

      // Navigate to the next step
      router.push("/compare")
    } catch (error) {
      console.error("Error optimizing resume:", error)
      toast({
        title: "Optimization Failed",
        description: "There was an error optimizing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleDemoOptimize = () => {
    // Store demo data for the next step
    localStorage.setItem("originalResume", resumeContent)
    localStorage.setItem(
      "optimizedResume",
      `John Doe
Senior Software Engineer

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience developing cloud-based applications and RESTful APIs. Expertise in React, Node.js, and modern CI/CD practices with a proven track record of reducing deployment times and mentoring junior developers.

EXPERIENCE
Senior Software Engineer, ABC Tech (2020-Present)
- Architected and implemented scalable cloud-based applications using React and Node.js, resulting in 30% improved performance
- Established automated CI/CD pipelines with GitHub Actions and Docker, reducing deployment time by 40%
- Led a team of 5 developers, providing technical mentorship and conducting regular code reviews
- Implemented microservices architecture to improve system modularity and maintainability

Software Developer, XYZ Solutions (2018-2020)
- Developed and maintained RESTful APIs using Express.js and MongoDB, serving 10,000+ daily users
- Collaborated with UX designers to implement responsive web interfaces, improving user engagement by 25%
- Participated in Agile development processes, consistently delivering features ahead of schedule
- Optimized database queries, reducing response times by 35%

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)
- GPA: 3.8/4.0
- Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems

TECHNICAL SKILLS
- Frontend: JavaScript, TypeScript, React, Redux, HTML5, CSS3
- Backend: Node.js, Express.js, RESTful APIs
- Databases: MongoDB, PostgreSQL
- DevOps: AWS, Docker, Kubernetes, CI/CD, Git
- Methodologies: Agile, Scrum, Test-Driven Development`,
    )

    router.push("/compare")
  }

  return (
    <div className="writora-gradient min-h-screen py-12 px-4">
      <div className="card-glow w-full max-w-4xl mx-auto shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Optimize Your Resume</h1>
            <p className="text-zinc-400">Review your resume and provide job details for optimization</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg font-medium mb-2">Your Resume</h3>
              <ResumeViewer content={resumeContent} />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-lg font-medium">Job Details</h3>

              <Tabs defaultValue="text" onValueChange={setInputMethod} className="text-white">
                <TabsList className="bg-zinc-800 text-zinc-400 border border-zinc-700 w-full">
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 flex-1"
                  >
                    Enter Text
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 flex-1"
                  >
                    Enter URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="job-description" className="text-white">
                      Job Description
                    </Label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the job description here..."
                      className="dark-input min-h-[200px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="job-url" className="text-white">
                      Job Posting URL
                    </Label>
                    <Input
                      id="job-url"
                      placeholder="https://example.com/job-posting"
                      className="dark-input"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-provider" className="text-white">
                    API Provider
                  </Label>
                  <Select value={apiProvider} onValueChange={setApiProvider}>
                    <SelectTrigger id="api-provider" className="dark-input">
                      <SelectValue placeholder="Select API Provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="mistral">Mistral AI</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-white">
                    Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="dark-input">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {apiProvider === "openai" && (
                        <>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </>
                      )}
                      {apiProvider === "mistral" && (
                        <>
                          <SelectItem value="mistral-large">Mistral Large</SelectItem>
                          <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                          <SelectItem value="mistral-small">Mistral Small</SelectItem>
                        </>
                      )}
                      {apiProvider === "deepseek" && (
                        <>
                          <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                          <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                        </>
                      )}
                      {apiProvider === "claude" && (
                        <>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </>
                      )}
                      {apiProvider === "custom" && <SelectItem value="custom-model">Custom Model</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-instructions" className="text-white">
                  Additional Instructions (Optional)
                </Label>
                <Textarea
                  id="additional-instructions"
                  placeholder="Any specific requirements or focus areas for the optimization..."
                  className="dark-input"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/upload")}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleDemoOptimize}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Demo
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                onClick={handleOptimize}
                disabled={isOptimizing || (!jobDescription && !jobUrl)}
              >
                {isOptimizing ? <LoadingSpinner /> : "Optimize Resume"}
                {!isOptimizing && <ArrowRight className="w-4 h-4 ml-2 inline" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

