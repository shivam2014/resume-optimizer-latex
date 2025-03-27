import axios from 'axios';

const MISTRAL_API_BASE = 'https://api.mistral.ai/v1';
const MISTRAL_API_CHAT = `${MISTRAL_API_BASE}/chat/completions`;

export interface LLMProvider {
  id: string;
  name: string;
  url: string;
  models: string[];
  isActive: boolean;
  apiKey: string;
}

export async function getMistralModels(apiKey: string): Promise<string[]> {
  try {
    const response = await axios.get(
      `${MISTRAL_API_BASE}/models`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      }
    );

    if (!response.data?.data) {
      throw new Error('Invalid response format from Mistral API');
    }

    // Extract model IDs from the response
    const models = response.data.data
      .filter((model: any) => model.capabilities?.completion_chat)
      .map((model: any) => model.id);

    return models;
  } catch (error: any) {
    console.error('Error fetching Mistral models:', error);
    throw new Error('Failed to fetch available models from Mistral API');
  }
}

async function getSelectedModel(): Promise<string> {
  try {
    const savedProviders = localStorage.getItem("apiProviders");
    if (!savedProviders) {
      throw new Error('API providers not configured');
    }

    const providers = JSON.parse(savedProviders) as LLMProvider[];
    const mistralProvider = providers.find(p => p.id === "mistral");

    if (!mistralProvider) {
      throw new Error('Mistral provider not found');
    }

    if (!mistralProvider.isActive) {
      throw new Error('Mistral provider is not active');
    }

    // Use the first model in the list, or fallback to a default
    const selectedModel = mistralProvider.models[0] || "mistral-small-latest";
    return selectedModel;
  } catch (error) {
    console.warn('Error getting selected model:', error);
    return "mistral-small-latest"; // Fallback to default model
  }
}

export interface ProgressCallback {
  (stage: string, progress: number): void;
}

export async function extractTextWithMistral(
  fileContent: ArrayBuffer,
  apiKey: string,
  onProgress?: ProgressCallback
): Promise<string> {
  if (!apiKey) {
    throw new Error('Mistral API key not provided');
  }

  try {
    // Get the selected model from settings
    const selectedModel = await getSelectedModel();
    console.log('Using model:', selectedModel);

    // First upload the file
    const formData = new FormData();
    const file = new Blob([fileContent], { type: 'application/pdf' });
    formData.append('file', file);
    formData.append('purpose', 'ocr');  // Corrected 'purpose' value

    onProgress?.('upload-start', 0);
    console.log('Uploading file...');
    const uploadResponse = await axios.post(
      `${MISTRAL_API_BASE}/files`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = (progressEvent.loaded * 100) / (progressEvent.total ?? 100);
          onProgress?.('uploading', Math.min(percentCompleted, 99));
        }
      }
    );
    onProgress?.('upload-complete', 100);

    if (!uploadResponse.data?.id) {
      console.error('Upload response:', uploadResponse.data);
      throw new Error('Failed to upload file');
    }

    const fileId = uploadResponse.data.id;
    console.log('File uploaded successfully, ID:', fileId);

    // Get a signed URL for the file
    const signedUrlResponse = await axios.get(
      `${MISTRAL_API_BASE}/files/${fileId}/url`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        params: {
          expiry: 1 // URL valid for 1 hour
        }
      }
    );

    if (!signedUrlResponse.data?.url) {
      throw new Error('Failed to get signed URL for file');
    }

    const signedUrl = signedUrlResponse.data.url;
    console.log('Got signed URL for file');
    onProgress?.('processing-start', 0);

    // Use the chat completion endpoint with the selected model
    const chatResponse = await axios.post(
      MISTRAL_API_CHAT,
      {
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract and return all the text content from this PDF document"
              },
              {
                type: "document_url",
                document_url: signedUrl
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!chatResponse.data?.choices?.[0]?.message?.content) {
      console.error('Chat response:', chatResponse.data);
      throw new Error('Invalid chat completion response format');
    }

    onProgress?.('processing-complete', 100);
    return chatResponse.data.choices[0].message.content;

  } catch (error: any) {
    console.error('Mistral API error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.detail?.[0]?.msg || error.message;
    throw new Error(`Failed to extract text using Mistral API: ${errorMessage}`);
  }
}