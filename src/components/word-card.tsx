// Phase 2: Word Card component with flip animation
// Features: Front/back flip, Reanimated animation, haptic feedback, boxShadow styling

import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { WordCard as WordCardType } from '@/types';

interface WordCardProps {
  card: WordCardType; // The vocabulary card data
  onDelete?: (id: string) => void; // Optional delete callback
}

export function WordCard({ card, onDelete }: WordCardProps) {
  // Shared value for flip animation (0 = front, 1 = back)
  const flipProgress = useSharedValue(0);

  // Track which side is showing
  const isFlipped = useSharedValue(false);

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
        {/* Front Side - English Word */}
        <Animated.View
          style={[
            frontAnimatedStyle,
            { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
          ]}
          className="absolute inset-0 bg-white rounded-2xl p-5 justify-center items-center"
        >
          {/* Word Label */}
          <Text className="text-sm text-gray-500 mb-2">English</Text>

          {/* The Word */}
          <Text className="text-3xl font-bold text-gray-900 text-center">
            {card.word}
          </Text>

          {/* Flip Hint */}
          <Text className="absolute bottom-3 text-xs text-gray-400">
            Tap to flip
          </Text>
        </Animated.View>

        {/* Back Side - Turkish Meaning & Example */}
        <Animated.View
          style={[
            backAnimatedStyle,
            { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#3B82F6' },
          ]}
          className="absolute inset-0 rounded-2xl p-5"
        >
          {/* Turkish Meaning Section */}
          <View className="mb-3">
            <Text className="text-xs text-blue-200 mb-1">Türkçe</Text>
            <Text className="text-2xl font-bold text-white">
              {card.content.meaningTr}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-blue-400/30 my-2" />

          {/* Example Sentence Section */}
          <View className="flex-1">
            <Text className="text-xs text-blue-200 mb-1">Example</Text>
            <Text className="text-base text-white leading-relaxed">
              {card.content.exampleSentence}
            </Text>
          </View>

          {/* Mastery Level Indicator */}
          <View className="flex-row items-center mt-2">
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
