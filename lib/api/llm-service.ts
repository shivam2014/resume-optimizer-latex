import axios from 'axios';

// Provider-specific API endpoints
const API_ENDPOINTS = {
    mistral: 'https://api.mistral.ai/v1',
    openai: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com/v1',
    claude: 'https://api.anthropic.com/v1'
};

export interface LLMProvider {
    id: string;
    name: string;
    url: string;
    models: string[];
    isActive: boolean;
    apiKey: string;
}

interface ChatMessage {
    role: string;
    content: string | MessageContent[];
}

interface MessageContent {
    type: string;
    text?: string;
    base64_data?: string;
}

// Provider-specific request formatters
const requestFormatters = {
    mistral: (model: string, messages: ChatMessage[], base64Content?: string) => {
        // Validate base64Content if provided
        if (base64Content !== undefined) {
            if (typeof base64Content !== 'string' || !base64Content) {
                throw new Error('Invalid base64 content provided');
            }

            // Basic base64 format validation
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
                throw new Error('Invalid base64 format');
            }
        }

        // Format messages based on content type
        const formattedMessages = base64Content ? [{
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Extract and return all the text content from this PDF document represented as a base64 string."
                },
                {
                    type: "image_url",  // Use "image_url" type
                    image_url: `data:application/pdf;base64,${base64Content}` // Create data URL
                }
            ]
        }] : messages;

        // Validate message structure
        if (!Array.isArray(formattedMessages) || formattedMessages.length === 0) {
            throw new Error('Messages must be a non-empty array');
        }

        return {
            model,
            messages: formattedMessages,
            temperature: 0.1,
            max_tokens: 4000
        };
    },

    openai: (model: string, messages: ChatMessage[], base64Content?: string) => ({
        model,
        messages: base64Content ? [{
            role: "user",
            content: [
                { type: "text", text: "Extract and return all the text content from this PDF document" },
                { type: "image_url", url: `data:application/pdf;base64,${base64Content}` }
            ]
        }] : messages,
        temperature: 0.1,
        max_tokens: 4000
    }),

    deepseek: (model: string, messages: ChatMessage[], base64Content?: string) => ({
        model,
        messages: base64Content ? [{
            role: "user",
            content: [
                { type: "text", text: "Extract and return all the text content from this PDF document" },
                { type: "image", data: base64Content }
            ]
        }] : messages,
        temperature: 0.1,
        max_tokens: 4000
    }),

    claude: (model: string, messages: ChatMessage[], base64Content?: string) => ({
        model,
        messages: base64Content ? [{
            role: "user",
            content: [
                { type: "text", text: "Extract and return all the text content from this PDF document" },
                { type: "image", source: { type: "base64", data: base64Content } }
            ]
        }] : messages,
        temperature: 0.1,
        max_tokens: 4000
    })
};

export async function getAvailableModels(provider: string, apiKey: string): Promise<string[]> {
    if (!apiKey) {
        throw new Error(`${provider} API key not provided`);
    }

    try {
        const response = await axios.get(
            `${API_ENDPOINTS[provider as keyof typeof API_ENDPOINTS]}/models`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                }
            }
        );

        // Handle provider-specific model filtering
        switch (provider) {
            case 'mistral':
                return response.data.data
                    .filter((model: any) => model.capabilities?.completion_chat)
                    .map((model: any) => model.id);
            case 'openai':
                return response.data.data
                    .filter((model: any) => model.capabilities?.includes('vision'))
                    .map((model: any) => model.id);
            case 'deepseek':
                return response.data.models
                    .filter((model: any) => model.capabilities.includes('vision'))
                    .map((model: any) => model.id);
            case 'claude':
                return response.data.models
                    .filter((model: any) => model.capabilities.includes('vision'))
                    .map((model: any) => model.id);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    } catch (error: any) {
        console.error(`Error fetching ${provider} models:`, error);
        throw new Error(`Failed to fetch available models from ${provider} API`);
    }
}

async function getSelectedModel(provider: string): Promise<string> {
    try {
        const savedProviders = localStorage.getItem("apiProviders");
        if (!savedProviders) {
            throw new Error('API providers not configured');
        }

        const providers = JSON.parse(savedProviders) as LLMProvider[];
        const selectedProvider = providers.find(p => p.id === provider);

        if (!selectedProvider) {
            throw new Error(`${provider} provider not found`);
        }

        if (!selectedProvider.isActive) {
            throw new Error(`${provider} provider is not active`);
        }

        // Use the first model in the list, or fallback to provider-specific defaults
        const defaultModels = {
            mistral: "mistral-small-latest",
            openai: "gpt-4-vision-preview",
            deepseek: "deepseek-vision",
            claude: "claude-3-opus-20240229"
        };

        return selectedProvider.models[0] || defaultModels[provider as keyof typeof defaultModels];
    } catch (error) {
        console.warn('Error getting selected model:', error);
        throw error;
    }
}

export async function extractTextWithLLM(
    fileContent: ArrayBuffer,
    provider: string,
    apiKey: string
): Promise<string> {
    if (!apiKey) {
        throw new Error(`${provider} API key not provided`);
    }

    try {
        // Validate input
        if (!fileContent || !(fileContent instanceof ArrayBuffer)) {
            throw new Error('Input must be a valid ArrayBuffer');
        }

        if (fileContent.byteLength === 0) {
            throw new Error('Input file is empty');
        }

        // Convert ArrayBuffer to Base64 with robust validation
        let base64Content: string;
        try {
            // Add debug log before conversion
            console.debug('[DEBUG] Pre-conversion:', {
                fileContentType: Object.prototype.toString.call(fileContent),
                byteLength: fileContent.byteLength
            });

            base64Content = Buffer.from(fileContent).toString('base64');

            if (!base64Content) {
                throw new Error('Base64 conversion failed');
            }

            // Validate base64 format
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
                throw new Error('Invalid base64 format generated');
            }

            // Add post-conversion debug log
            console.debug('[DEBUG] Post-conversion:', {
                base64Length: base64Content.length,
                sample: base64Content.substring(0, 100),
                contentPrefix: base64Content.startsWith('JVBERi0') ? 'Valid PDF prefix' : 'Invalid PDF prefix'
            });

            console.debug('[DEBUG] Base64 Content validation:', {
                inputSize: fileContent.byteLength,
                base64Length: base64Content.length,
                isValidFormat: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Content),
                truncatedContent: base64Content.slice(0, 50) + '...'
            });
        } catch (error: any) {
            throw new Error(`Failed to convert file to base64: ${error.message}`);
        }

        // Get the selected model
        const selectedModel = await getSelectedModel(provider);
        console.log(`Using ${provider} model:`, selectedModel);

        const formatter = requestFormatters[provider as keyof typeof requestFormatters];
        if (!formatter) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        const requestData = formatter(selectedModel, [], base64Content);
        console.debug('[DEBUG] Raw Mistral API Request:', JSON.stringify(requestData, null, 2)); // Pretty-print the JSON

        // Make the API call
        const response = await axios.post(
            `${API_ENDPOINTS[provider as keyof typeof API_ENDPOINTS]}/chat/completions`,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        // Handle provider-specific response formats
        let extractedText = '';
        switch (provider) {
            case 'mistral':
            case 'openai':
                extractedText = response.data?.choices?.[0]?.message?.content;
                break;
            case 'deepseek':
                extractedText = response.data?.output?.content;
                break;
            case 'claude':
                extractedText = response.data?.content?.[0]?.text;
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        if (!extractedText) {
            console.error('API response:', response.data);
            throw new Error(`Invalid ${provider} API response format`);
        }

        return extractedText;

    } catch (error: any) {
        console.error(`${provider} API error:`, error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.detail?.[0]?.msg || error.message;
        throw new Error(`Failed to extract text using ${provider} API: ${errorMessage}`);
    }
}