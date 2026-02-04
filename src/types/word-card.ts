// Phase 1: Type definitions for complete vocabulary card with metadata
// This represents the full stored vocabulary entry

import { WordCardContent } from './word-card-content';

// Spaced Repetition System state for each word
export interface SRSState {
  easeFactor: number;     // EF: starts at 2.5, minimum 1.3
  interval: number;       // Days until next review
  repetitions: number;    // Count of successful consecutive reviews
  nextReviewDate: number; // Timestamp when word should be reviewed next
  lastReviewDate: number; // Timestamp of last review (0 if never reviewed)
}

export interface WordCard {
  id: string; // Unique identifier (UUID)
  word: string; // English word to learn
  content: WordCardContent; // AI-generated content (meaning, context, sentence)
  createdAt: number; // Timestamp when word was added
  lastContextUpdate: number; // Timestamp of last context refresh (for weekly evolution)
  masteryLevel: number; // User's proficiency: 0 (New) to 5 (Mastered)
  srs: SRSState; // Spaced repetition state
}
