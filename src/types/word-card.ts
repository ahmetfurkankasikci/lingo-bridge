// Phase 1: Type definitions for complete vocabulary card with metadata
// This represents the full stored vocabulary entry

import { WordCardContent } from './word-card-content';

export interface WordCard {
  id: string; // Unique identifier (UUID)
  word: string; // English word to learn
  content: WordCardContent; // AI-generated content (meaning, context, sentence)
  createdAt: number; // Timestamp when word was added
  lastContextUpdate: number; // Timestamp of last context refresh (for weekly evolution)
  masteryLevel: number; // User's proficiency: 0 (New) to 5 (Mastered)
}
