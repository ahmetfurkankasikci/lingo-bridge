// Custom hook for B1 Bridge transformation
// Extracts mutation logic from component for better separation of concerns

import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

import { geminiService } from '@/services/gemini-service';
import type { B1BridgeResult } from '@/types';

interface UseTransformToB1Options {
  onSuccess?: (result: B1BridgeResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for transforming A2 phrases to B1 equivalents.
 * Handles API calls, loading state, and haptic feedback.
 */
export function useTransformToB1(options?: UseTransformToB1Options) {
  return useMutation({
    mutationFn: (phrase: string) => geminiService.transformToB1(phrase),
    onSuccess: async (data) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      options?.onSuccess?.(data);
    },
    onError: async (error) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      options?.onError?.(error as Error);
    },
  });
}
