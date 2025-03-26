"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterEffectProps {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}

export function TypewriterEffect({ words, className, cursorClassName }: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const word = words[currentWordIndex]?.text || ""

    const timeout = setTimeout(() => {
      // If deleting
      if (isDeleting) {
        setCurrentText(word.substring(0, currentText.length - 1))
        setTypingSpeed(50)

        // If deleted completely, start typing next word
        if (currentText.length === 0) {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
          setTypingSpeed(150)
        }
      }
      // If typing
      else {
        setCurrentText(word.substring(0, currentText.length + 1))

        // If typed completely, pause then start deleting
        if (currentText.length === word.length) {
          setTypingSpeed(2000)
          setTimeout(() => {
            setIsDeleting(true)
            setTypingSpeed(50)
          }, 2000)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, typingSpeed, words])

  return (
    <div className={cn("inline-flex", className)}>
      <span className="mr-2">{currentText}</span>
      <span className={cn("animate-pulse", cursorClassName)}>|</span>
    </div>
  )
}

