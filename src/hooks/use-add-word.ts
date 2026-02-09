import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

import { geminiService } from '@/services/gemini-service';
import { getInitialSRSState } from '@/services/srs-service';
import { useStreakStore } from '@/store/streak-store';
import { useVocabStore } from '@/store/vocab-store';
import type { WordCard, WordCardContent } from '@/types';

interface UseAddWordOptions {
  onSuccess?: (card: WordCard) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for adding new vocabulary words.
 * Handles API calls, store updates, and haptic feedback.
 */
export function useAddWord(options?: UseAddWordOptions) {
  const addWord = useVocabStore((state) => state.addWord);
  const recordWordAddition = useStreakStore((state) => state.recordWordAddition);

  return useMutation({
    mutationFn: async (word: string): Promise<WordCard> => {
      const content: WordCardContent = await geminiService.generateWordCard(word);

      const newCard: WordCard = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        word,
        content,
        createdAt: Date.now(),
        lastContextUpdate: Date.now(),
        masteryLevel: 0,
        srs: getInitialSRSState(),
      };

      return newCard;
    },
    onSuccess: async (card) => {
      addWord(card);
      recordWordAddition(); // Track word addition for streak
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      options?.onSuccess?.(card);
    },
    onError: async (error) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      options?.onError?.(error as Error);
    },
  });
}
