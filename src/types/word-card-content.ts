// Phase 2: Type definitions for AI-generated vocabulary content
// This represents the raw output from Gemini API

export interface WordCardContent {
  meaningTr: string; // Turkish translation of the word
  exampleSentence: string; // B1-level example sentence with conjunction
}
