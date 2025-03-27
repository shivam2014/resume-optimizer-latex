import { NextRequest } from 'next/server'
import { extractTextWithMistral } from '@/lib/api/mistral'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const mistralApiKey = req.headers.get('x-mistral-api-key')
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!mistralApiKey) {
      return new Response(
        JSON.stringify({ error: 'Mistral API key not provided' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Get file buffer to send to Mistral API
    const fileBuffer = await file.arrayBuffer();

    try {
      console.log('Sending to Mistral API...');
      const extractedText = await extractTextWithMistral(fileBuffer, mistralApiKey);
      console.log('Text extraction successful, length:', extractedText.length);

      // Return the extracted text
      return new Response(
        JSON.stringify({ 
          text: extractedText,
          sections: [], // Initialize empty sections array
          metadata: {} // Initialize empty metadata object
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (apiError: any) {
      console.error('Mistral API error:', apiError);
      return new Response(
        JSON.stringify({ 
          error: apiError.message,
          details: apiError.response?.data || 'No additional details available'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (err: any) {
    console.error('Request processing error:', err);
    return new Response(
      JSON.stringify({ 
        error: `Failed to process file: ${err.message}`,
        details: err.stack || 'No stack trace available'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}