import { Config } from '@/constants/config';

/**
 * Example service demonstrating how to use the Gemini API key.
 * This is a template - implement your actual Gemini API logic here.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Generates text content using the Gemini API.
   * @param prompt - The text prompt to send to Gemini
   * @returns The generated text response
   */
  async generateContent(prompt: string): Promise<string> {
    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-2.5-flash:generateContent?key=${Config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    return text;
  }
}

export const geminiService = GeminiService.getInstance();
