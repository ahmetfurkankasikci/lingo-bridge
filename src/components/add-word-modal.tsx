// Phase 2: Modal component for adding new vocabulary words
// Features: Input validation, custom hook mutation, haptic feedback, AI integration

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

import { useAddWord } from '@/hooks/use-add-word';
import { StreakCelebrationModal } from './streak-celebration-modal';

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddWordModal({ visible, onClose }: AddWordModalProps) {
  const [word, setWord] = useState('');
  const [streakModal, setStreakModal] = useState<{ visible: boolean; count: number }>(
    { visible: false, count: 0 }
  );

  // Use custom hook for adding words
  const addWordMutation = useAddWord({
    onSuccess: ({ streakResult }) => {
      setWord('');
      onClose();
      // Show celebration if streak increased
      if (streakResult.increased) {
        setTimeout(() => {
          setStreakModal({ visible: true, count: streakResult.newStreak });
        }, 300); // Small delay for modal transition
      }
    },
  });

  const handleAddWord = async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addWordMutation.mutate(trimmedWord);
  };

  const handleClose = async () => {
    if (addWordMutation.isPending) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWord('');
    addWordMutation.reset();
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 bg-black/50 justify-center px-4">
            {/* Modal Content */}
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
                    editable={!addWordMutation.isPending}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                    onSubmitEditing={handleAddWord}
                    returnKeyType="done"
                  />
                </View>

                {/* Error Message */}
                {addWordMutation.isError && (
                  <View className="mb-4 p-3 bg-red-50 rounded-lg">
                    <Text className="text-sm text-red-600">
                      {addWordMutation.error instanceof Error
                        ? addWordMutation.error.message
                        : 'Failed to generate word card'}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleAddWord}
                  disabled={addWordMutation.isPending || !word.trim()}
                  className={`rounded-xl py-4 items-center ${addWordMutation.isPending || !word.trim() ? 'bg-blue-300' : 'bg-blue-500'
                    }`}
                  style={{
                    boxShadow:
                      addWordMutation.isPending || !word.trim()
                        ? 'none'
                        : '0 2px 4px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {addWordMutation.isPending ? (
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

      {/* Streak Celebration Modal */}
      <StreakCelebrationModal
        visible={streakModal.visible}
        onClose={() => setStreakModal({ visible: false, count: 0 })}
        streakType="word"
        streakCount={streakModal.count}
      />
    </>
  );
}
