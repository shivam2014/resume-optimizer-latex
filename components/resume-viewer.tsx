import { LoadingSpinner } from "./loading-spinner"

interface ResumeViewerProps {
  /** The raw text content of the resume */
  content: string
  /** Whether the resume content is currently loading */
  isLoading?: boolean
  /** Any error that occurred while loading the resume */
  error?: string
}

export function ResumeViewer({ content, isLoading, error }: ResumeViewerProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 bg-zinc-900 border border-zinc-700 rounded-lg">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-red-700 rounded-lg p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <pre className="whitespace-pre-wrap font-sans text-zinc-300">
        {content}
      </pre>
    </div>
  )
}
