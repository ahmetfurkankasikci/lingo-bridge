// Streak Store - Tracks daily quiz and word addition streaks
// Uses Zustand with MMKV persistence

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from './mmkv-storage';

export interface StreakResult {
  increased: boolean;
  newStreak: number;
}

export interface QuizScore {
  correct: number;
  total: number;
  date: string; // "YYYY-MM-DD"
}

interface StreakStore {
  quizStreak: number;
  wordStreak: number;
  lastQuizDate: string | null;
  lastWordDate: string | null;
  lastQuizScore: QuizScore | null;
  recordQuizCompletion: () => StreakResult;
  recordWordAddition: () => StreakResult;
  checkAndResetStreaks: () => void;
  saveQuizScore: (correct: number, total: number) => void;
}

// Format a date as YYYY-MM-DD in the device's local timezone
// (toISOString would use UTC and shift the day for e.g. UTC+3 users after midnight)
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return toLocalDateString(new Date());
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toLocalDateString(yesterday);
}

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      quizStreak: 0,
      wordStreak: 0,
      lastQuizDate: null,
      lastWordDate: null,
      lastQuizScore: null,

      recordQuizCompletion: (): StreakResult => {
        const today = getToday();
        const yesterday = getYesterday();
        const { lastQuizDate, quizStreak } = get();

        // Already recorded today
        if (lastQuizDate === today) {
          return { increased: false, newStreak: quizStreak };
        }

        // Streak continues
        if (lastQuizDate === yesterday) {
          const newStreak = quizStreak + 1;
          set({ quizStreak: newStreak, lastQuizDate: today });
          return { increased: true, newStreak };
        } else {
          // New streak starts
          set({ quizStreak: 1, lastQuizDate: today });
          return { increased: true, newStreak: 1 };
        }
      },

      recordWordAddition: (): StreakResult => {
        const today = getToday();
        const yesterday = getYesterday();
        const { lastWordDate, wordStreak } = get();

        // Already recorded today
        if (lastWordDate === today) {
          return { increased: false, newStreak: wordStreak };
        }

        // Streak continues
        if (lastWordDate === yesterday) {
          const newStreak = wordStreak + 1;
          set({ wordStreak: newStreak, lastWordDate: today });
          return { increased: true, newStreak };
        } else {
          // New streak starts
          set({ wordStreak: 1, lastWordDate: today });
          return { increased: true, newStreak: 1 };
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

      saveQuizScore: (correct, total) => {
        set({ lastQuizScore: { correct, total, date: getToday() } });
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
