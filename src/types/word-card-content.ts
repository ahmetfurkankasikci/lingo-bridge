// Phase 2: Type definitions for AI-generated vocabulary content
// This represents the raw output from Gemini API

export interface WordCardContent {
  meaningTr: string; // Turkish translation of the word
  context: string; // Daily-life scenario (e.g., "ordering food at a restaurant")
  exampleSentence: string; // Example sentence using the word in context
}
