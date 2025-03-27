import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertResumeTextToMarkdown(text: string): string {
  // Convert section headers (lines in all caps)
  let result = text.replace(/^([A-Z][A-Z\s]+)$/gm, '## $1')

  // Convert bullet points
  result = result.replace(/^•\s*/gm, '- ')

  // Preserve line breaks between sections
  result = result.replace(/\n{2,}/g, '\n\n')

  // Handle special characters (escape markdown special chars)
  const specialChars = ['\\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '#', '+', '-', '.', '!']
  specialChars.forEach(char => {
    result = result.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`)
  })

  return result.trim()
}
