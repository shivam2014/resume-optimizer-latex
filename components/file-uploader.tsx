"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  isUploading: boolean
  progress: number
  acceptedFileTypes: string[]
}

export function FileUploader({ onFileSelect, isUploading, progress, acceptedFileTypes }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

    if (acceptedFileTypes.includes(fileExtension)) {
      setSelectedFile(file)
      onFileSelect(file)
    } else {
      alert(`File type not supported. Please upload one of the following: ${acceptedFileTypes.join(", ")}`)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={acceptedFileTypes.join(",")}
        disabled={isUploading}
      />

      <div
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? "border-purple-400 bg-purple-400/10" : "border-zinc-700"
        } ${isUploading ? "pointer-events-none" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4 w-4/5">
            <FileText className="w-12 h-12 text-purple-400" />
            <p className="text-sm text-center text-zinc-400">Uploading {selectedFile?.name}...</p>
            <Progress value={progress} className="w-full h-2 bg-zinc-800" indicatorClassName="bg-purple-500" />
            <p className="text-sm text-zinc-400">{progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Upload className="w-12 h-12 text-purple-400" />
            <p className="text-sm text-center text-zinc-400">Drag and drop your resume file here, or click to select</p>
            <p className="text-xs text-center text-zinc-500">Supported formats: {acceptedFileTypes.join(", ")}</p>
            <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700">Select File</Button>
          </div>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="flex items-center mt-4 p-2 border rounded-md border-zinc-700 bg-zinc-800/50">
          <FileText className="w-5 h-5 mr-2 text-purple-400" />
          <span className="text-sm truncate text-zinc-300">{selectedFile.name}</span>
        </div>
      )}
    </div>
  )
}

