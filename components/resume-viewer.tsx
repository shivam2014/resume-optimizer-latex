interface ResumeViewerProps {
  content: string
}

export function ResumeViewer({ content }: ResumeViewerProps) {
  // Split the content by newlines and preserve them
  const lines = content.split("\n")

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="font-mono text-sm whitespace-pre-wrap text-zinc-300">
        {lines.map((line, index) => (
          <div key={index} className={line.trim() === "" ? "h-4" : ""}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

