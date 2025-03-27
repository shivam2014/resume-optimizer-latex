import axios, { AxiosError } from 'axios';
import { ConversionResult, ResumeSection } from '@/types';
import { extractTextWithMistral, LLMProvider, ProgressCallback } from './mistral';

export interface ProgressInfo {
  loaded: number;
  total: number;
  progress: number;
}

// Supported file types and their MIME types
export const ALLOWED_FILE_TYPES = [
  'pdf',
  'docx',
  'txt',
  'md'
] as const;

export const MIME_TYPES = {
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'md': 'text/plain'
} as const;

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];
type AllowedMimeType = typeof MIME_TYPES[AllowedFileType];

// API Response types
interface ConversionMetadata {
  original_filename: string;
  file_type: string;
  conversion_time: number;
  text_length: number;
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
}

interface ConversionResponse {
  status: 'success';
  text: string;
  sections: ResumeSection[];
  metadata: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
}

interface ErrorResponse {
  error: string;
}

type APIResponse = ConversionResponse | ErrorResponse;

// Custom error types
export class DocumentConverterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentConverterError';
  }
}

export class ConnectionError extends DocumentConverterError {
  constructor() {
    super('Could not connect to the document converter service');
    this.name = 'ConnectionError';
  }
}

export class UnsupportedFileTypeError extends DocumentConverterError {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}. Supported types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
    this.name = 'UnsupportedFileTypeError';
  }
}

export class ConversionError extends Error {
  constructor(message: string) {
    super(`Document conversion failed: ${message}`);
    this.name = 'ConversionError';
  }
}
/**
 * Convert a document file to text using the active LLM provider
 * @param file - The file to convert
 * @returns The extracted text and metadata
 * @throws {UnsupportedFileTypeError} If the file type is not supported
 * @throws {ConnectionError} If the service is not available
 * @throws {ConversionError} If the conversion fails or no active provider is configured
 */
export async function convertDocument(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<{
  text: string;
  sections: ResumeSection[];
  metadata: ConversionMetadata;
}> {
  // Progress adapter function to convert between progress formats
  const progressAdapter: ProgressCallback = (stage: string, progress: number) => {
    if (onProgress) {
      switch (stage) {
        case 'upload-start':
          onProgress({ loaded: 0, total: 100, progress: 0 });
          break;
        case 'uploading':
          onProgress({ loaded: progress, total: 100, progress });
          break;
        case 'upload-complete':
          onProgress({ loaded: 100, total: 100, progress: 100 });
          break;
        case 'processing-start':
          onProgress({ loaded: 0, total: 100, progress: 0 });
          break;
        case 'processing-complete':
          onProgress({ loaded: 100, total: 100, progress: 100 });
          break;
        default:
          onProgress({ loaded: progress, total: 100, progress });
      }
    }
  };

  // Validate file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() as AllowedFileType;
  if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
    throw new UnsupportedFileTypeError(fileExtension);
  }

  // Get active provider from localStorage
  const savedProviders = localStorage.getItem("apiProviders");
  if (!savedProviders) {
    throw new ConversionError('API providers not configured. Please set up your API keys in Settings.');
  }

  const providers = JSON.parse(savedProviders) as LLMProvider[];
  const activeProvider = providers.find(p => p.isActive);

  if (!activeProvider || !activeProvider.apiKey) {
    throw new ConversionError('No active API provider found. Please configure a provider in Settings.');
  }

  if (!activeProvider.models || activeProvider.models.length === 0) {
    throw new ConversionError('No model selected. Please select a model in Settings.');
  }

  const startTime = Date.now();

  try {
    console.log('Converting file:', {
      name: file.name,
      type: MIME_TYPES[fileExtension],
      size: file.size,
      extension: fileExtension
    });

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

     console.log('Calling extractTextWithMistral with:', { // Added logging
      fileBuffer: fileBuffer,
      apiKey: activeProvider.apiKey
    });

    // Call extractTextWithMistral with progress adapter
    const extractedText = await extractTextWithMistral(
      fileBuffer,
      activeProvider.apiKey,
      progressAdapter
    );

    // Process and return the result
    return {
      text: extractedText,
      sections: [], // Parse sections from extractedText if needed
      metadata: {
        original_filename: file.name,
        file_type: fileExtension,
        conversion_time: Date.now() - startTime,
        text_length: extractedText.length,
      }
    };

  } catch (error) {
    // Handle network errors
    if (error instanceof AxiosError) {
      if (!error.response) {
        throw new ConnectionError();
      }

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 400:
          throw new ConversionError(error.response.data?.error || 'Invalid file format');
        case 401:
          throw new ConversionError('Invalid or missing API key');
        case 413:
          throw new ConversionError('File size too large');
        case 415:
          throw new ConversionError('Unsupported file type');
        case 429:
          throw new ConversionError('Rate limit exceeded. Please try again later');
        case 500:
          throw new ConversionError('Service error during conversion');
        default:
          throw new ConversionError(`Error: ${error.response.data?.error || error.message}`);
      }
    }

    // Re-throw custom errors
    if (error instanceof DocumentConverterError) {
      throw error;
    }

    // Handle unexpected errors
    console.error('Unexpected conversion error:', error);
    throw new ConversionError('An unexpected error occurred during conversion');
  }
}