"use client"

import Image from "next/image"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Trash2 } from "lucide-react"

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string
    image: string
    path: string
  }
  isSelected: boolean
  onSelect: (id: string) => void
  onRemove?: (id: string) => void
  removable?: boolean
}

export function TemplateCard({ template, isSelected, onSelect, onRemove, removable = false }: TemplateCardProps) {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image src={template.image || "/placeholder.svg"} alt={template.name} fill className="object-cover" />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              <Check className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant={isSelected ? "default" : "outline"} onClick={() => onSelect(template.id)}>
          {isSelected ? "Selected" : "Select"}
        </Button>
        {removable && onRemove && (
          <Button variant="ghost" size="icon" onClick={() => onRemove(template.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

