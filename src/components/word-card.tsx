// Phase 2: Word Card component with flip animation
// Features: Front shows Turkish meaning, back shows example with refresh button

import * as Haptics from 'expo-haptics';
import { RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useRefreshContext } from '@/hooks/use-context-refresh';
import type { WordCard as WordCardType } from '@/types';

interface WordCardProps {
  card: WordCardType; // The vocabulary card data
  onDelete?: (id: string) => void; // Optional delete callback
}

// Helper to render sentence with **bold** markers parsed
function renderSentenceWithBoldMarkers(sentence: string) {
  // Split by ** markers: "I **drink** coffee" → ["I ", "drink", " coffee"]
  const parts = sentence.split(/\*\*([^*]+)\*\*/g);

  return parts.map((part, index) => {
    // Odd indices are the words that were inside ** markers
    if (index % 2 === 1) {
      return (
        <Text key={index} className="font-bold text-yellow-300">
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
}

export function WordCard({ card, onDelete }: WordCardProps) {
  // Shared value for flip animation (0 = front, 1 = back)
  const flipProgress = useSharedValue(0);

  // Track which side is showing
  const isFlipped = useSharedValue(false);

  // Manual refresh mutation
  const refreshMutation = useRefreshContext();

  // Handle card flip with haptic feedback
  const handleFlip = async () => {
    // Haptic feedback on flip
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle flip state
    isFlipped.value = !isFlipped.value;

    // Animate to new state with spring-like easing
    flipProgress.value = withTiming(isFlipped.value ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    refreshMutation.mutate(card);
  };

  // Front side animation: visible when progress is 0-0.5, rotates 0-90deg
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [0, 90, 90]);
    const opacity = interpolate(flipProgress.value, [0, 0.5], [1, 0]);

    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  // Back side animation: visible when progress is 0.5-1, rotates 90-0deg
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [-90, -90, 0]);
    const opacity = interpolate(flipProgress.value, [0.5, 1], [0, 1]);

    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable onPress={handleFlip} className="w-full mb-4">
      {/* Card Container - maintains consistent height */}
      <View className="relative h-48">
        {/* Front Side - Turkish Meaning Only */}
        <Animated.View
          style={[
            frontAnimatedStyle,
            { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
          ]}
          className="absolute inset-0 bg-white rounded-2xl p-5 justify-center items-center"
        >
          {/* Label */}
          <Text className="text-sm text-gray-500 mb-2">Türkçe</Text>

          {/* Turkish Meaning */}
          <Text className="text-3xl font-bold text-gray-900 text-center">
            {card.content.meaningTr}
          </Text>

          {/* Flip Hint */}
          <Text className="absolute bottom-3 text-xs text-gray-400">
            Tap to see example
          </Text>
        </Animated.View>

        {/* Back Side - Example Sentence with refresh button */}
        <Animated.View
          style={[
            backAnimatedStyle,
            { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#3B82F6' },
          ]}
          className="absolute inset-0 rounded-2xl p-5 justify-center"
        >
          {/* Refresh Button - Top Right */}
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshMutation.isPending}
            className="absolute top-3 right-3 p-2 bg-blue-600 rounded-full"
          >
            {refreshMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={18} color="#fff" />
            )}
          </TouchableOpacity>

          {/* Label */}
          <Text className="text-xs text-blue-200 mb-3 text-center">Example Sentence</Text>

          {/* Example Sentence with bolded word (parsed from ** markers) */}
          <Text className="text-lg text-white leading-relaxed text-center">
            {renderSentenceWithBoldMarkers(card.content.exampleSentence)}
          </Text>

          {/* Mastery Level Indicator */}
          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-xs text-blue-200 mr-2">Mastery:</Text>
            <View className="flex-row">
              {/* Render 5 dots for mastery level */}
              {[0, 1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  className={`w-2 h-2 rounded-full mx-0.5 ${
                    level < card.masteryLevel ? 'bg-yellow-400' : 'bg-blue-400/40'
                  }`}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
