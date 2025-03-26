"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface PdfViewerProps {
  pdfUrl: string
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className="bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="border border-white/20 rounded-md overflow-hidden bg-white"
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "600px",
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No PDF to display</div>
        )}
      </div>
    </div>
  )
}

