"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert } from "@/components/ui/alert"
import { AlertCircle, FileText, Upload } from "lucide-react"
import {
  convertDocument,
  DocumentConverterError,
  ALLOWED_FILE_TYPES,
  MIME_TYPES
} from "@/lib/api/documentConverter"
interface ResumeSection {
  sectionName: string;
  content: string;
  confidenceScore: number;
}

export interface ConversionResult {
  text: string;
  sections: ResumeSection[];
  metadata: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
}

interface FileUploaderProps {
  onConversionComplete: (result: ConversionResult) => void
}

type ProgressInfo = {
  loaded: number;
  total: number;
  progress: number;
}

export function FileUploader({ onConversionComplete }: FileUploaderProps) {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      await handleFile(file)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      await handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (!fileExtension || !ALLOWED_FILE_TYPES.includes(fileExtension as any)) {
      setError(`File type not supported. Please upload one of the following: ${ALLOWED_FILE_TYPES.join(", ")}`)
      return
    }

    setSelectedFile(file)
    setError(null)
    await handleConversion(file)
  }

  const handleConversion = async (file: File) => {
    setIsConverting(true)
    setConversionProgress(0)
    setError(null)

    try {
      console.log('Starting file conversion:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      const result = await convertDocument(file, (progressEvent: ProgressInfo) => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setConversionProgress(progress);
      });

      console.log('Conversion successful:', {
        textLength: result.text.length,
        metadata: result.metadata
      });

      setConversionProgress(100);
      // Call onConversionComplete and wait for the next tick before navigation
      onConversionComplete({
        text: result.text,
        sections: result.sections || [],
        metadata: result.metadata || {}
      });
      
      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        router.push("/optimize");
      }, 0);
    } catch (err) {
      console.error('File conversion error:', err);
      
      if (err instanceof DocumentConverterError || err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while converting the document");
      }
      setSelectedFile(null);
      setConversionProgress(0);
    } finally {
      setIsConverting(false);
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const acceptedFileTypes = ALLOWED_FILE_TYPES.map(type => `.${type}`)

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={acceptedFileTypes.join(",")}
        disabled={isConverting}
      />

      <div
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? "border-purple-400 bg-purple-400/10" : "border-zinc-700"
        } ${isConverting ? "pointer-events-none" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isConverting ? (
          <div className="flex flex-col items-center space-y-4 w-4/5">
            <FileText className="w-12 h-12 text-purple-400" />
            <p className="text-sm text-center text-zinc-400">Converting {selectedFile?.name}...</p>
            <Progress value={conversionProgress} className="w-full h-2 bg-zinc-800" indicatorClassName="bg-purple-500" />
            <p className="text-sm text-zinc-400">{conversionProgress}%</p>
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

      {selectedFile && !isConverting && (
        <div className="flex items-center mt-4 p-2 border rounded-md border-zinc-700 bg-zinc-800/50">
          <FileText className="w-5 h-5 mr-2 text-purple-400" />
          <span className="text-sm truncate text-zinc-300">{selectedFile.name}</span>
        </div>
      )}
    </div>
  )
}