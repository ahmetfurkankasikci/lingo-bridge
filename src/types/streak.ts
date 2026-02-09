// Streak type definitions

export interface StreakState {
  quizStreak: number;
  wordStreak: number;
  lastQuizDate: string | null; // "YYYY-MM-DD" format
  lastWordDate: string | null; // "YYYY-MM-DD" format
}
