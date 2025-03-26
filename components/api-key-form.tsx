"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"

interface ApiKeyFormProps {
  providerId: string
  apiKey: string
  onUpdate: (apiKey: string) => void
}

export function ApiKeyForm({ providerId, apiKey, onUpdate }: ApiKeyFormProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)

  const handleToggleVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onUpdate(e.target.value)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${providerId}-api-key`} className="text-white">
        API Key
      </Label>
      <div className="flex">
        <div className="relative flex-grow">
          <Input
            id={`${providerId}-api-key`}
            type={showApiKey ? "text" : "password"}
            value={inputValue}
            onChange={handleChange}
            placeholder="Enter your API key"
            className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full text-white hover:bg-white/10"
            onClick={handleToggleVisibility}
          >
            {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

