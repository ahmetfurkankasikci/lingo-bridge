// Phase 1: State Management & Persistence
// This file creates a Zustand store with MMKV persistence for vocabulary management

import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Initialize MMKV for high-performance local storage
export const storage = createMMKV();

// WordCard represents a single vocabulary entry with AI-generated content
export interface WordCard {
  id: string; // Unique identifier
  word: string; // English word to learn
  meaningTr: string; // Turkish translation
  context: string; // Daily-life scenario (e.g., "Ordering Coffee", "Airport")
  exampleSentence: string; // AI-generated sentence using the word in context
  createdAt: number; // Timestamp when word was added
  lastContextUpdate: number; // Timestamp of last context refresh (for weekly evolution)
  masteryLevel: number; // User's proficiency: 0 (New) to 5 (Mastered)
}

// Store interface defining state and actions
interface VocabState {
  words: WordCard[]; // Array of all vocabulary cards
  addWord: (word: WordCard) => void; // Add new word to the beginning of list
  removeWord: (id: string) => void; // Delete word by ID
  updateWord: (id: string, updates: Partial<WordCard>) => void; // Update specific fields
  getWord: (id: string) => WordCard | undefined; // Retrieve single word by ID
}

// Adapter to make MMKV compatible with Zustand's persist middleware
const zustandStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value); // Save JSON string to MMKV
  },
  getItem: (name: string) => {
    const value = storage.getString(name); // Retrieve JSON string from MMKV
    return value ?? null; // Return null if not found (Zustand expects this)
  },
  removeItem: (name: string) => {
    storage.remove(name); // Delete from MMKV
    return Promise.resolve(); // Zustand expects a Promise
  },
};

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
    }),
    {
      name: 'vocab-storage', // Key used in MMKV
      storage: createJSONStorage(() => zustandStorage), // Use our MMKV adapter
    }
  )
);
