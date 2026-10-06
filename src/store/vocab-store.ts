// Phase 1: State Management & Persistence
// This file creates a Zustand store with MMKV persistence for vocabulary management

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { calculateNextReview, getInitialSRSState, type ReviewQuality } from '@/services/srs-service';
import type { WordCard } from '@/types';

import { zustandStorage } from './mmkv-storage';

// Store interface defining state and actions
interface VocabState {
  words: WordCard[]; // Array of all vocabulary cards
  addWord: (word: WordCard) => void; // Add new word to the beginning of list
  removeWord: (id: string) => void; // Delete word by ID
  updateWord: (id: string, updates: Partial<WordCard>) => void; // Update specific fields
  getWord: (id: string) => WordCard | undefined; // Retrieve single word by ID
  recordReview: (id: string, quality: ReviewQuality) => void; // Record SRS review result
}

/**
 * Migrates existing words to include SRS state
 * Called on store hydration for backwards compatibility
 */
function migrateWordsWithSRS(words: WordCard[]): WordCard[] {
  return words.map((word) => {
    if (!word.srs) {
      return {
        ...word,
        srs: getInitialSRSState(),
      };
    }
    return word;
  });
}

// Create the Zustand store with MMKV persistence
export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      words: [], // Initial state: empty array

      addWord: (word) => set((state) => ({ words: [word, ...state.words] })), // Prepend new word

      removeWord: (id) => set((state) => ({ words: state.words.filter((w) => w.id !== id) })), // Filter out deleted word

      updateWord: (id, updates) =>
        set((state) => ({
          words: state.words.map((w) => (w.id === id ? { ...w, ...updates } : w)), // Merge updates for matching ID
        })),

      getWord: (id) => get().words.find((w) => w.id === id), // Find word by ID

      recordReview: (id, quality) =>
        set((state) => ({
          words: state.words.map((w) => {
            if (w.id !== id) return w;
            const newSRS = calculateNextReview(w.srs, quality);
            // Also update mastery level based on repetitions
            const newMastery = Math.min(5, Math.floor(newSRS.repetitions / 2));
            return { ...w, srs: newSRS, masteryLevel: newMastery };
          }),
        })),
    }),
    {
      name: 'vocab-storage', // Key used in MMKV
      storage: createJSONStorage(() => zustandStorage), // Use our MMKV adapter
      onRehydrateStorage: () => (state) => {
        // Migrate existing words on rehydration
        if (state) {
          state.words = migrateWordsWithSRS(state.words);
        }
      },
    }
  )
);
