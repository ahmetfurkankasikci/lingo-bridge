// Phase 2: Gemini Service for AI-powered vocabulary generation
// Handles API communication with Google Gemini 2.5 Flash

import { Config } from '@/constants/config';
import { createB1BridgePrompt, createRegeneratePrompt, createWordCardPrompt } from '@/constants/prompts';
import type { B1BridgeResult, WordCardContent } from '@/types';

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

  /**
   * Phase 3: Regenerate ONLY the example sentence for weekly context evolution.
   * Keeps the existing Turkish meaning but generates a fresh sentence.
   * @param word - The English word
   * @param meaningTr - The existing Turkish translation to preserve
   * @returns New example sentence string
   */
  async regenerateWordContext(word: string, meaningTr: string): Promise<string> {
    // Generate the regeneration prompt
    const prompt = createRegeneratePrompt(word, meaningTr);

    // Call Gemini API
    const responseText = await this.generateContent(prompt);

    // Parse JSON response
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanedResponse) as { exampleSentence: string };

      if (!parsed.exampleSentence) {
        throw new Error('Missing exampleSentence in Gemini response');
      }

      return parsed.exampleSentence;
    } catch (error) {
      console.error('Failed to parse regeneration response:', cleanedResponse, error);
      throw new Error('Invalid response format from Gemini API');
    }
  }

  /**
   * Phase 4: B1 Bridge - Transform simple A2 phrase to natural B1 equivalent.
   * @param phrase - The simple A2-level phrase to transform
   * @returns B1BridgeResult with upgraded phrase and explanation
   */
  async transformToB1(phrase: string): Promise<B1BridgeResult> {
    // Generate the B1 Bridge prompt
    const prompt = createB1BridgePrompt(phrase);

    // Call Gemini API
    const responseText = await this.generateContent(prompt);

    // Parse JSON response
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanedResponse) as B1BridgeResult;

      if (!parsed.b1Phrase || !parsed.explanation) {
        throw new Error('Missing fields in B1 Bridge response');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse B1 Bridge response:', cleanedResponse, error);
      throw new Error('Invalid response format from Gemini API');
    }
  }
}

export const geminiService = GeminiService.getInstance();
