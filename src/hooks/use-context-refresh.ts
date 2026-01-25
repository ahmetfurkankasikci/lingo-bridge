// Phase 3: Hook for manually refreshing a word's example sentence
// Uses TanStack Query useMutation for API calls

import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

import { geminiService } from '@/services/gemini-service';
import { useVocabStore } from '@/store/vocab-store';
import type { WordCard } from '@/types';

/**
 * Hook for manually refreshing a word's example sentence.
 * Returns a mutation that can be triggered by user interaction.
 */
export function useRefreshContext() {
  const updateWord = useVocabStore((s) => s.updateWord);

  return useMutation({
    mutationFn: async (card: WordCard) => {
      const newSentence = await geminiService.regenerateWordContext(
        card.word,
        card.content.meaningTr
      );
      return { card, newSentence };
    },
    onSuccess: async ({ card, newSentence }) => {
      // Update the card with new sentence and timestamp
      updateWord(card.id, {
        content: {
          ...card.content,
          exampleSentence: newSentence,
        },
        lastContextUpdate: Date.now(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}
