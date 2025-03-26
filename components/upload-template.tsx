"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./file-uploader"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface UploadTemplateProps {
  onAddTemplate: (template: any) => void
}

export function UploadTemplate({ onAddTemplate }: UploadTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const handleTemplateUpload = (file: File) => {
    setTemplateFile(file)
  }

  const handlePreviewUpload = (file: File) => {
    setPreviewImage(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !templateFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Simulate upload progress
    setIsUploading(true)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      // Create a new template object
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name,
        description,
        image: previewImage ? URL.createObjectURL(previewImage) : "/placeholder.svg?height=400&width=300",
        path: `templates/latex/custom/${templateFile.name}`,
      }

      onAddTemplate(newTemplate)

      // Reset form
      setName("")
      setDescription("")
      setTemplateFile(null)
      setPreviewImage(null)
      setIsUploading(false)
      setUploadProgress(0)
      setIsExpanded(false)

      toast({
        title: "Template Added",
        description: "Your custom template has been added successfully.",
      })
    }, 2000)
  }

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg">
      <div className="p-4">
        <h3 className="text-white text-lg font-bold mb-2">Add Custom Template</h3>
        <p className="text-white/70 text-sm mb-4">Upload your own LaTeX template</p>

        {isExpanded ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name" className="text-white">
                  Template Name
                </Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Professional Template"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="template-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your template..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">LaTeX Template File (.tex)</Label>
                <FileUploader
                  onFileSelect={handleTemplateUpload}
                  isUploading={isUploading}
                  progress={uploadProgress}
                  acceptedFileTypes={[".tex"]}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Preview Image (Optional)</Label>
                <FileUploader
                  onFileSelect={handlePreviewUpload}
                  isUploading={isUploading}
                  progress={uploadProgress}
                  acceptedFileTypes={[".jpg", ".jpeg", ".png"]}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  disabled={isUploading}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !name || !description || !templateFile}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {isUploading ? "Uploading..." : "Add Template"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload New Template
          </Button>
        )}
      </div>
    </div>
  )
}

