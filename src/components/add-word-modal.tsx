// Phase 2: Modal component for adding new vocabulary words
// Features: Input validation, TanStack Query mutation, haptic feedback, AI integration
// Note: Modal positioned at TOP to avoid Android keyboard issues

import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { geminiService } from '@/services/gemini-service';
import { useVocabStore } from '@/store/vocab-store';
import type { WordCard, WordCardContent } from '@/types';

interface AddWordModalProps {
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is dismissed
}

export function AddWordModal({ visible, onClose }: AddWordModalProps) {
  // Local state for form input only (loading/error handled by TanStack Query)
  const [word, setWord] = useState('');

  // Zustand store action to add word
  const addWord = useVocabStore((state) => state.addWord);

  // TanStack Query mutation for generating word card
  const generateWordMutation = useMutation({
    mutationFn: (wordToGenerate: string): Promise<WordCardContent> => {
      return geminiService.generateWordCard(wordToGenerate);
    },
    onSuccess: async (content, wordToGenerate) => {
      const newCard: WordCard = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        word: wordToGenerate,
        content,
        createdAt: Date.now(),
        lastContextUpdate: Date.now(),
        masteryLevel: 0,
      };

      addWord(newCard);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWord('');
      onClose();
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleAddWord = async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    generateWordMutation.mutate(trimmedWord);
  };

  const handleClose = async () => {
    if (generateWordMutation.isPending) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWord('');
    generateWordMutation.reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 bg-black/50 justify-center px-4">
          {/* Modal Content - positioned in CENTER */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              className="bg-white rounded-3xl p-6"
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-gray-900">Add New Word</Text>
                <TouchableOpacity onPress={handleClose} className="p-2">
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Input Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">English Word</Text>
                <TextInput
                  value={word}
                  onChangeText={setWord}
                  placeholder="e.g., coffee, ticket, appointment"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  editable={!generateWordMutation.isPending}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                  onSubmitEditing={handleAddWord}
                  returnKeyType="done"
                />
              </View>

              {/* Error Message */}
              {generateWordMutation.isError && (
                <View className="mb-4 p-3 bg-red-50 rounded-lg">
                  <Text className="text-sm text-red-600">
                    {generateWordMutation.error instanceof Error
                      ? generateWordMutation.error.message
                      : 'Failed to generate word card'}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAddWord}
                disabled={generateWordMutation.isPending || !word.trim()}
                className={`rounded-xl py-4 items-center ${
                  generateWordMutation.isPending || !word.trim() ? 'bg-blue-300' : 'bg-blue-500'
                }`}
                style={{
                  boxShadow:
                    generateWordMutation.isPending || !word.trim()
                      ? 'none'
                      : '0 2px 4px rgba(59, 130, 246, 0.3)',
                }}
              >
                {generateWordMutation.isPending ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#fff" className="mr-2" />
                    <Text className="text-white font-semibold text-base">Generating...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">Add Word</Text>
                )}
              </TouchableOpacity>

              {/* Helper Text */}
              <Text className="text-xs text-gray-500 text-center mt-4">
                AI will generate Turkish meaning and a daily-life example sentence
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
