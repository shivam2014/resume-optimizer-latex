"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ApiKeyForm } from "@/components/api-key-form"
import { ArrowLeft, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Default API providers
const defaultProviders = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4", "gpt-3.5-turbo"],
    isActive: true,
    apiKey: "",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    url: "https://api.mistral.ai/v1",
    models: ["mistral-large", "mistral-medium", "mistral-small"],
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
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load saved providers from localStorage if any
    const savedProviders = localStorage.getItem("apiProviders")
    if (savedProviders) {
      setProviders(JSON.parse(savedProviders))
    }
  }, [])

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
    const updatedProviders = providers.map((provider) =>
      provider.id === providerId ? { ...provider, ...updates } : provider,
    )
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

  return (
    <div className="mesh-gradient min-h-screen py-12 px-4">
      <div className="dark-card rounded-xl w-full max-w-4xl mx-auto shadow-2xl">
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
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2"
                  >
                    {provider.name}
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

                <div className="space-y-2">
                  <Label className="text-white">Available Models</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {provider.models.map((model, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 border rounded-md border-white/20 bg-white/5"
                      >
                        <Input
                          value={model}
                          onChange={(e) => {
                            const updatedModels = [...provider.models]
                            updatedModels[index] = e.target.value
                            handleUpdateProvider(provider.id, { models: updatedModels })
                          }}
                          className="h-8 bg-white/10 border-white/20 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedModels = provider.models.filter((_, i) => i !== index)
                            handleUpdateProvider(provider.id, { models: updatedModels })
                          }}
                          className="h-8 w-8 p-0 text-white hover:bg-white/10"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const updatedModels = [...provider.models, "new-model"]
                        handleUpdateProvider(provider.id, { models: updatedModels })
                      }}
                      className="h-8 bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      Add Model
                    </Button>
                  </div>
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

