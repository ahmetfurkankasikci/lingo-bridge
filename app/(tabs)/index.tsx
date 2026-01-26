// Phase 2: Home Screen - Main vocabulary list
// Features: FlashList for performance, FAB to add words, empty state, Zustand integration

import { FlashList } from "@shopify/flash-list";
import * as Haptics from 'expo-haptics';
import { BookOpen, Plus, Repeat } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddWordModal } from '@/components/add-word-modal';
import { WordCard } from '@/components/word-card';
import { useVocabStore } from '@/store/vocab-store';
import type { WordCard as WordCardType } from '@/types';

export default function HomeScreen() {
  // Modal visibility state
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Flip All state: 'front' (Turkish), 'back' (Example), or null (Individual)
  const [forcedFlipMode, setForcedFlipMode] = useState<'front' | 'back' | null>(null);

  // Get words from Zustand store (auto-synced with MMKV)
  const words = useVocabStore((state) => state.words);

  // Handle FAB press with haptic feedback
  const handleOpenModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsModalVisible(true);
  };

  // Handle Flip All toggle
  const handleFlipAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Toggle between back (examples) and front (meanings)
    // If currently null (mixed), force to back first to show examples
    setForcedFlipMode((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Render each word card item (wrapped in callback for FlashList optimization)
  const renderItem = useCallback(
    ({ item }: { item: WordCardType }) => {
      return <WordCard card={item} forcedFlipMode={forcedFlipMode} />;
    },
    [forcedFlipMode]
  );

  // Empty state component when no words exist
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      {/* Icon */}
      <View className="bg-blue-50 p-6 rounded-full mb-6">
        <BookOpen size={48} color="#3B82F6" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        No words yet
      </Text>

      {/* Description */}
      <Text className="text-gray-500 text-center text-base leading-relaxed">
        Start building your vocabulary by adding your first English word. AI will
        generate Turkish meanings and daily-life example sentences.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={handleOpenModal}
        className="mt-8 bg-blue-500 px-8 py-4 rounded-xl"
        style={{ boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}
      >
        <Text className="text-white font-semibold text-base">Add Your First Word</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 bg-white flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Lingo Bridge</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {words.length > 0
              ? `${words.length} word${words.length > 1 ? 's' : ''} in your vocabulary`
              : 'Your daily vocabulary companion'}
          </Text>
        </View>

        {/* Flip All Button */}
        {words.length > 0 && (
          <TouchableOpacity
            onPress={handleFlipAll}
            className={`p-3 rounded-full ${
              forcedFlipMode === 'back' ? 'bg-indigo-100' : 'bg-gray-100'
            }`}
          >
            <Repeat
              size={22}
              color={forcedFlipMode === 'back' ? '#4F46E5' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Word List or Empty State */}
      {words.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          data={words}
          renderItem={renderItem}
          extraData={forcedFlipMode} // Ensure re-render when flip state changes
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button - Only show when words exist */}
      {words.length > 0 && (
        <TouchableOpacity
          onPress={handleOpenModal}
          className="absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center"
          style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Word Modal */}
      <AddWordModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}
