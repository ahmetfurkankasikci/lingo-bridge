// Phase 2: Gemini Service for AI-powered vocabulary generation
// Handles API communication with Google Gemini 2.5 Flash

import { Config } from '@/constants/config';
import { createWordCardPrompt } from '@/constants/prompts';
import type { WordCardContent } from '@/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Response structure from Gemini API
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

  /**
   * Generate a vocabulary card with Turkish meaning and B1-level example sentence.
   * Sentences are 10-20 words with at least one conjunction for B1 complexity.
   * @param word - The English word to learn
   * @returns WordCardContent with Turkish meaning and example sentence
   */
  async generateWordCard(word: string): Promise<WordCardContent> {
    // Generate the prompt
    const prompt = createWordCardPrompt(word);

    // Call Gemini API
    const responseText = await this.generateContent(prompt);

    // Parse JSON response (remove any markdown formatting if present)
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '') // Remove ```json
      .replace(/```\n?/g, '') // Remove ```
      .trim();

    try {
      const parsed: WordCardContent = JSON.parse(cleanedResponse);

      // Validate required fields
      if (!parsed.meaningTr || !parsed.exampleSentence) {
        throw new Error('Missing required fields in Gemini response');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini response:', cleanedResponse, error);
      throw new Error('Invalid response format from Gemini API');
    }
  }
}

export const geminiService = GeminiService.getInstance();
