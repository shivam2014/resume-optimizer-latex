"use client"

import "./styles.css"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiKeyForm } from "@/components/api-key-form"
import { ArrowLeft, Check, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAvailableModels } from "@/lib/api/llm-service"

// Default API providers
const defaultProviders = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://api.openai.com/v1",
    models: ["gpt-4", "gpt-3.5-turbo"],
    isActive: true,
    apiKey: "",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    url: "https://api.mistral.ai/v1",
    models: ["mistral-small-latest"],
    isActive: false,
    apiKey: "",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://api.deepseek.com/v1",
    models: ["deepseek-coder", "deepseek-chat"],
    isActive: false,
    apiKey: "",
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://api.anthropic.com/v1",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    isActive: false,
    apiKey: "",
  },
]

export default function SettingsPage() {
  const [providers, setProviders] = useState(defaultProviders)
  const [activeProvider, setActiveProvider] = useState("openai")
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load saved providers from localStorage if any
    const savedProviders = localStorage.getItem("apiProviders")
    if (savedProviders) {
      setProviders(JSON.parse(savedProviders))
    }
  }, [])

  const updateMistralModels = async (apiKey: string) => {
    if (!apiKey) return

    setIsLoadingModels(true)
    try {
      const models = await getAvailableModels("mistral", apiKey)
      handleUpdateProvider("mistral", { models })
      toast({
        title: "Models Updated",
        description: `Successfully fetched ${models.length} models from Mistral API.`,
      })
    } catch (error: any) {
      toast({
        title: "Error Fetching Models",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleSaveSettings = () => {
    // Save providers to localStorage
    localStorage.setItem("apiProviders", JSON.stringify(providers))

    toast({
      title: "Settings Saved",
      description: "Your API settings have been saved successfully.",
    })

    router.push("/")
  }

  const handleUpdateProvider = (providerId: string, updates: any) => {
    const updatedProviders = providers.map((provider) => {
      // If we're updating isActive to true for a provider
      if (updates.isActive === true) {
        if (provider.id === providerId) {
          // This is the provider being activated
          const updatedProvider = { ...provider, ...updates }
          // If updating API key for Mistral, fetch models
          if (updates.apiKey && providerId === "mistral") {
            updateMistralModels(updates.apiKey)
          }
          return updatedProvider
        } else {
          // Set all other providers to inactive
          return { ...provider, isActive: false }
        }
      }
      
      // Handle non-isActive updates normally
      if (provider.id === providerId) {
        const updatedProvider = { ...provider, ...updates }
        if (updates.apiKey && providerId === "mistral") {
          updateMistralModels(updates.apiKey)
        }
        return updatedProvider
      }
      return provider
    })
    setProviders(updatedProviders)
  }

  const handleAddCustomProvider = (newProvider: any) => {
    setProviders([...providers, newProvider])
    setActiveProvider(newProvider.id)

    toast({
      title: "Provider Added",
      description: `${newProvider.name} has been added successfully.`,
    })
  }

  const handleRemoveProvider = (providerId: string) => {
    const updatedProviders = providers.filter((provider) => provider.id !== providerId)
    setProviders(updatedProviders)
    setActiveProvider(updatedProviders[0]?.id || "")

    toast({
      title: "Provider Removed",
      description: "The API provider has been removed.",
    })
  }

  const handleModelSelectChange = (providerId: string, selectedModel: string) => {
      handleUpdateProvider(providerId, { models: [selectedModel] }); // Store selected model
  };

  return (
    <div className="writora-gradient min-h-screen py-12 px-4">
      <div className="card-glow rounded-xl w-full max-w-4xl mx-auto shadow-2xl">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">API Settings</h1>
            <p className="text-white/70">Configure your API providers for resume optimization</p>
          </div>

          <Tabs defaultValue={activeProvider} onValueChange={setActiveProvider} className="text-white">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-white/10 text-white">
                {providers.map((provider) => (
                  <TabsTrigger
                    key={provider.id}
                    value={provider.id}
                    className={`
                      provider-tab
                      ${provider.isActive && provider.id === activeProvider ? 'provider-tab-active-selected' : ''}
                      ${!provider.isActive && provider.id === activeProvider ? 'provider-tab-selected' : ''}
                    `}
                  >
                    {provider.isActive && (
                      <Check className="provider-check" />
                    )}
                    <span className="provider-name">
                      {provider.name}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                variant="outline"
                onClick={() => {
                  const newId = `custom-${Date.now()}`
                  handleAddCustomProvider({
                    id: newId,
                    name: "Custom Provider",
                    url: "",
                    models: ["default-model"],
                    isActive: false,
                    apiKey: "",
                  })
                }}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Add Custom
              </Button>
            </div>

            {providers.map((provider) => (
              <TabsContent key={provider.id} value={provider.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-name`} className="text-white">
                      Provider Name
                    </Label>
                    <Input
                      id={`${provider.id}-name`}
                      value={provider.name}
                      onChange={(e) => handleUpdateProvider(provider.id, { name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-url`} className="text-white">
                      API URL
                    </Label>
                    <Input
                      id={`${provider.id}-url`}
                      value={provider.url}
                      onChange={(e) => handleUpdateProvider(provider.id, { url: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <ApiKeyForm
                  providerId={provider.id}
                  apiKey={provider.apiKey}
                  onUpdate={(apiKey) => handleUpdateProvider(provider.id, { apiKey })}
                />

                {/* Refactored Available Models Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-white">Available Model</Label>
                    {provider.id === "mistral" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMistralModels(provider.apiKey)}
                        disabled={isLoadingModels || !provider.apiKey}
                        className="h-8 bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        {isLoadingModels ? "Loading..." : "Fetch Models"}
                      </Button>
                    )}
                  </div>

                  <Select
                    value={provider.models[0] || ""} // Currently selected model
                    onValueChange={(value) => handleModelSelectChange(provider.id, value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${provider.id}-active`}
                    checked={provider.isActive}
                    onCheckedChange={(checked) => handleUpdateProvider(provider.id, { isActive: checked })}
                  />
                  <Label htmlFor={`${provider.id}-active`} className="text-white">
                    Active
                  </Label>
                </div>

                {provider.id !== "openai" && (
                  <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleRemoveProvider(provider.id)}>
                      Remove Provider
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-white text-black hover:bg-white/90">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
