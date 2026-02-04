// Spaced Repetition System Service
// Implements SM-2 algorithm for optimal review scheduling

import type { SRSState } from '@/types';

// SM-2 Algorithm Constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1; // days
const SECOND_INTERVAL = 6; // days

/**
 * Quality ratings for SM-2 algorithm (0-5 scale)
 * 5: Perfect response
 * 4: Correct response after hesitation
 * 3: Correct response with serious difficulty
 * 2: Incorrect response; correct one seemed easy to recall
 * 1: Incorrect response; correct one remembered when shown
 * 0: Complete blackout
 */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Creates initial SRS state for a new word
 */
export function getInitialSRSState(): SRSState {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: Date.now(), // Due immediately for first review
    lastReviewDate: 0,
  };
}

/**
 * Calculates the next SRS state based on review quality
 * Implements the SM-2 algorithm
 */
export function calculateNextReview(
  currentSRS: SRSState,
  quality: ReviewQuality
): SRSState {
  const now = Date.now();
  
  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = currentSRS.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ensure ease factor doesn't go below minimum
  if (newEaseFactor < MIN_EASE_FACTOR) {
    newEaseFactor = MIN_EASE_FACTOR;
  }
  
  let newInterval: number;
  let newRepetitions: number;
  
  // If quality < 3, the response was incorrect - reset
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = INITIAL_INTERVAL;
  } else {
    // Successful recall
    newRepetitions = currentSRS.repetitions + 1;
    
    if (newRepetitions === 1) {
      newInterval = INITIAL_INTERVAL;
    } else if (newRepetitions === 2) {
      newInterval = SECOND_INTERVAL;
    } else {
      // For subsequent reviews: I = I * EF
      newInterval = Math.round(currentSRS.interval * newEaseFactor);
    }
  }
  
  // Calculate next review date
  const nextReviewDate = now + (newInterval * 24 * 60 * 60 * 1000); // Convert days to ms
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    lastReviewDate: now,
  };
}

/**
 * Checks if a word is due for review
 */
export function isWordDueForReview(srs: SRSState): boolean {
  return Date.now() >= srs.nextReviewDate;
}

/**
 * Gets words that are due for review today
 */
export function getDueWords<T extends { srs: SRSState }>(words: T[]): T[] {
  return words.filter((word) => isWordDueForReview(word.srs));
}

/**
 * Sorts words by review priority (most overdue first, then by ease factor)
 */
export function sortByReviewPriority<T extends { srs: SRSState }>(words: T[]): T[] {
  return [...words].sort((a, b) => {
    // First, prioritize overdue words
    const aOverdue = Date.now() - a.srs.nextReviewDate;
    const bOverdue = Date.now() - b.srs.nextReviewDate;
    
    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue; // More overdue first
    }
    
    // Then by ease factor (lower ease = harder = higher priority)
    return a.srs.easeFactor - b.srs.easeFactor;
  });
}

/**
 * Maps quiz/flashcard results to quality ratings
 */
export function mapResultToQuality(isCorrect: boolean, wasHesitant: boolean = false): ReviewQuality {
  if (!isCorrect) {
    return 2; // Incorrect, but correct answer was shown
  }
  return wasHesitant ? 4 : 5; // Correct with or without hesitation
}

/**
 * Gets human-readable time until next review
 */
export function getTimeUntilReview(srs: SRSState): string {
  const now = Date.now();
  const diff = srs.nextReviewDate - now;
  
  if (diff <= 0) {
    return 'Due now';
  }
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}
