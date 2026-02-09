// Streak Store - Tracks daily quiz and word addition streaks
// Uses Zustand with MMKV persistence

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from './vocab-store';

interface StreakStore {
  quizStreak: number;
  wordStreak: number;
  lastQuizDate: string | null;
  lastWordDate: string | null;
  recordQuizCompletion: () => void;
  recordWordAddition: () => void;
  checkAndResetStreaks: () => void;
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Zustand storage adapter for MMKV
const zustandStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
    return Promise.resolve();
  },
};

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      quizStreak: 0,
      wordStreak: 0,
      lastQuizDate: null,
      lastWordDate: null,

      recordQuizCompletion: () => {
        const today = getToday();
        const yesterday = getYesterday();
        const { lastQuizDate, quizStreak } = get();

        // Already recorded today
        if (lastQuizDate === today) return;

        // Streak continues
        if (lastQuizDate === yesterday) {
          set({ quizStreak: quizStreak + 1, lastQuizDate: today });
        } else {
          // New streak starts
          set({ quizStreak: 1, lastQuizDate: today });
        }
      },

      recordWordAddition: () => {
        const today = getToday();
        const yesterday = getYesterday();
        const { lastWordDate, wordStreak } = get();

        // Already recorded today
        if (lastWordDate === today) return;

        // Streak continues
        if (lastWordDate === yesterday) {
          set({ wordStreak: wordStreak + 1, lastWordDate: today });
        } else {
          // New streak starts
          set({ wordStreak: 1, lastWordDate: today });
        }
      },

      checkAndResetStreaks: () => {
        const today = getToday();
        const yesterday = getYesterday();
        const { lastQuizDate, lastWordDate } = get();

        const updates: Partial<StreakStore> = {};

        // Reset quiz streak if missed
        if (lastQuizDate !== today && lastQuizDate !== yesterday) {
          updates.quizStreak = 0;
        }

        // Reset word streak if missed
        if (lastWordDate !== today && lastWordDate !== yesterday) {
          updates.wordStreak = 0;
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
