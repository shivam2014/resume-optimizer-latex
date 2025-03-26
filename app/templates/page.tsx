"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { UploadTemplate } from "@/components/upload-template"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

// Template data
const defaultTemplates = [
  {
    id: "default",
    name: "Default Resume",
    description: "A traditional resume layout with a clean design",
    image: "/templates/latex/Default_Resume-template.jpg",
    path: "templates/latex/Default_Resume-template.tex",
  },
  {
    id: "miller",
    name: "John Miller CV",
    description: "A contemporary design with a sleek layout",
    image: "/templates/latex/John_Miller_CV.jpeg",
    path: "templates/latex/John_Miller_CV.tex",
  },
  {
    id: "modular",
    name: "Modular Professional",
    description: "A sophisticated template for experienced professionals",
    image: "/templates/latex/Modular_professional_CV.jpeg",
    path: "templates/latex/Modular_professional_CV.tex",
  }
]

export default function TemplatesPage() {
  const [resumeContent, setResumeContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templates, setTemplates] = useState(defaultTemplates)
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("default")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get resume content from localStorage
    const finalResume = localStorage.getItem("finalResume")

    if (finalResume) {
      setResumeContent(finalResume)
    } else {
      toast({
        title: "Missing Data",
        description: "Resume data not found. Please start from the beginning.",
        variant: "destructive",
      })
      router.push("/upload")
    }

    // Load custom templates from localStorage if any
    const savedCustomTemplates = localStorage.getItem("customTemplates")
    if (savedCustomTemplates) {
      setCustomTemplates(JSON.parse(savedCustomTemplates))
    }
  }, [router, toast])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleAddCustomTemplate = (template: any) => {
    const newCustomTemplates = [...customTemplates, template]
    setCustomTemplates(newCustomTemplates)
    localStorage.setItem("customTemplates", JSON.stringify(newCustomTemplates))
    setActiveTab("custom")
    toast({
      title: "Template Added",
      description: "Your custom template has been added successfully.",
    })
  }

  const handleRemoveCustomTemplate = (templateId: string) => {
    const newCustomTemplates = customTemplates.filter((t) => t.id !== templateId)
    setCustomTemplates(newCustomTemplates)
    localStorage.setItem("customTemplates", JSON.stringify(newCustomTemplates))
    toast({
      title: "Template Removed",
      description: "Your custom template has been removed.",
    })
  }

  const handleGenerateLatex = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to continue.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)

      // Find the selected template
      const template = [...templates, ...customTemplates].find((t) => t.id === selectedTemplate)

      if (!template) {
        throw new Error("Template not found")
      }

      // Call the API to generate LaTeX
      const response = await fetch("https://github.com/shivam2014/resume-optimize-AI/generate-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_content: resumeContent,
          template_path: template.path,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate LaTeX")
      }

      const data = await response.json()

      // Store the LaTeX content in localStorage for the next step
      localStorage.setItem("latexContent", data.latex_content)

      // Navigate to the next step
      router.push("/preview")
    } catch (error) {
      console.error("Error generating LaTeX:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating the LaTeX. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDemoGenerate = () => {
    // Store demo LaTeX for the next step (same as before)
    localStorage.setItem(
      "latexContent",
      `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape John Doe} \\\\ \\vspace{1pt}
    \\small 
    \\faIcon{envelope} \\href{mailto:johndoe@email.com}{johndoe@email.com} $|$ 
    \\faIcon{phone} (123) 456-7890 $|$
    \\faIcon{linkedin} \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe} $|$
    \\faIcon{github} \\href{https://github.com/johndoe}{github.com/johndoe}
\\end{center}

%----------SUMMARY----------
\\section{Professional Summary}
\\begin{flushleft}
Results-driven Software Engineer with 5+ years of experience developing cloud-based applications and RESTful APIs. Expertise in React, Node.js, and modern CI/CD practices with a proven track record of reducing deployment times and mentoring junior developers.
\\end{flushleft}

%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart

\\resumeSubheading
{Senior Software Engineer}{2020 - Present}
{ABC Tech}{Remote}
\\resumeItemListStart
\\resumeItem{Architected and implemented scalable cloud-based applications using React and Node.js, resulting in 30\\% improved performance}
\\resumeItem{Established automated CI/CD pipelines with GitHub Actions and Docker, reducing deployment time by 40\\%}
\\resumeItem{Led a team of 5 developers, providing technical mentorship and conducting regular code reviews}
\\resumeItem{Implemented microservices architecture to improve system modularity and maintainability}
\\resumeItemListEnd

\\resumeSubheading
{Software Developer}{2018 - 2020}
{XYZ Solutions}{San Francisco, CA}
\\resumeItemListStart
\\resumeItem{Developed and maintained RESTful APIs using Express.js and MongoDB, serving 10,000+ daily users}
\\resumeItem{Collaborated with UX designers to implement responsive web interfaces, improving user engagement by 25\\%}
\\resumeItem{Participated in Agile development processes, consistently delivering features ahead of schedule}
\\resumeItem{Optimized database queries, reducing response times by 35\\%}
\\resumeItemListEnd

\\resumeSubHeadingListEnd

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
\\resumeSubheading
{Bachelor of Science in Computer Science}{2014 - 2018}
{University of Technology}{San Francisco, CA}
\\resumeItemListStart
\\resumeItem{GPA: 3.8/4.0}
\\resumeItem{Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems}
\\resumeItemListEnd
\\resumeSubHeadingListEnd

%-----------SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Frontend}{: JavaScript, TypeScript, React, Redux, HTML5, CSS3} \\\\
     \\textbf{Backend}{: Node.js, Express.js, RESTful APIs} \\\\
     \\textbf{Databases}{: MongoDB, PostgreSQL} \\\\
     \\textbf{DevOps}{: AWS, Docker, Kubernetes, CI/CD, Git} \\\\
     \\textbf{Methodologies}{: Agile, Scrum, Test-Driven Development}
    }}
\\end{itemize}

\\end{document}`,
    )

    router.push("/preview")
  }

  return (
    <div className="writora-gradient min-h-screen py-12 px-4">
      <div className="card-glow w-full max-w-5xl mx-auto shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Select a Template</h1>
            <p className="text-zinc-400">Choose a LaTeX template for your optimized resume</p>
          </div>

          <Tabs defaultValue="default" onValueChange={setActiveTab} className="text-white">
            <TabsList className="bg-zinc-800 text-zinc-400 border border-zinc-700">
              <TabsTrigger
                value="default"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                Default Templates
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                Custom Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="default" className="pt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`glow-border group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer ${
                        selectedTemplate === template.id ? "ring-2 ring-purple-500 shadow-lg" : ""
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <Image
                          src={template.image || "/placeholder.svg"}
                          alt={template.name}
                          fill
                          priority={true}
                          loading="eager"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {selectedTemplate === template.id && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-purple-500 rounded-full p-2">
                              <Check className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold">{template.name}</h3>
                        <p className="text-zinc-400 text-sm">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom" className="pt-4">
              <ScrollArea className="h-[500px] pr-4">
                {customTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`glow-border group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer ${
                          selectedTemplate === template.id ? "ring-2 ring-purple-500 shadow-lg" : ""
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={template.image || "/placeholder.svg"}
                            alt={template.name}
                            fill
                            priority={true}
                            loading="eager"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {selectedTemplate === template.id && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="bg-purple-500 rounded-full p-2">
                                <Check className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-bold">{template.name}</h3>
                          <p className="text-zinc-400 text-sm">{template.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">No custom templates added yet.</p>
                  </div>
                )}
                <div className="mt-6">
                  <UploadTemplate onAddTemplate={handleAddCustomTemplate} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/compare")}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleDemoGenerate}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Demo
              </Button>
              <button
                className="shimmer-button"
                onClick={handleGenerateLatex}
                disabled={isGenerating || !selectedTemplate}
              >
                {isGenerating ? <LoadingSpinner /> : "Generate Resume"}
                {!isGenerating && <ArrowRight className="w-4 h-4 ml-2 inline" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

