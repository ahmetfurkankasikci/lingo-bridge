// Phase 2: Home Screen - Main vocabulary list
// Features: FlashList for performance, FAB to add words, empty state, Zustand integration

import { FlashList } from "@shopify/flash-list";
import * as Haptics from 'expo-haptics';
import { BookOpen, Plus, Repeat } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

import { AddWordModal } from '@/components/add-word-modal';
import { ReviewStats } from '@/components/review-stats';
import { StreakWidget } from '@/components/streak-widget';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { WordCard } from '@/components/word-card';
import { colors, shadows } from '@/constants/theme';
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
      <View className="bg-primary-50 p-6 rounded-full mb-6">
        <BookOpen size={48} color={colors.primary[500]} />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        Henüz kelime yok
      </Text>

      {/* Description */}
      <Text className="text-gray-500 text-center text-base leading-relaxed">
        İlk İngilizce kelimeni ekleyerek başla. Yapay zekâ Türkçe anlamını ve günlük
        hayattan bir örnek cümle oluşturacak.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={handleOpenModal}
        className="mt-8 bg-primary-500 px-8 py-4 rounded-xl"
        style={{ boxShadow: shadows.primary }}
      >
        <Text className="text-white font-semibold text-base">İlk Kelimeni Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Lingo Bridge"
        subtitle={
          words.length > 0
            ? `Kelime hazinende ${words.length} kelime var`
            : 'Günlük kelime arkadaşın'
        }
        right={
          // Flip All Button
          words.length > 0 && (
            <TouchableOpacity
              onPress={handleFlipAll}
              className={`p-3 rounded-full ${forcedFlipMode === 'back' ? 'bg-primary-100' : 'bg-white'}`}
              style={{ boxShadow: shadows.card }}
            >
              <Repeat
                size={22}
                color={forcedFlipMode === 'back' ? colors.primary[600] : colors.textMuted}
              />
            </TouchableOpacity>
          )
        }
      />

      {/* Word List or Empty State */}
      {words.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          data={words}
          renderItem={renderItem}
          extraData={forcedFlipMode} // Ensure re-render when flip state changes
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <StreakWidget />
              <ReviewStats />
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button - Only show when words exist */}
      {words.length > 0 && (
        <TouchableOpacity
          onPress={handleOpenModal}
          className="absolute bottom-6 right-6 bg-primary-500 w-16 h-16 rounded-full items-center justify-center"
          style={{ boxShadow: shadows.primary }}
        >
          <Plus size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Add Word Modal */}
      <AddWordModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </Screen>
  );
}
