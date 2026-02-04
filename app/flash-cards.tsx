import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ProgressHeader } from '@/components/progress-header';
import { StackedCard } from '@/components/stacked-card';
import { WordCard } from '@/components/word-card';
import { getDueWords, mapResultToQuality, sortByReviewPriority } from '@/services/srs-service';
import { useVocabStore } from '@/store/vocab-store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ANIMATION_THRESHOLD = SCREEN_WIDTH * 0.15;

export default function FlashcardsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const words = useVocabStore((state) => state.words);
    const recordReview = useVocabStore((state) => state.recordReview);

    // Sort words: due words first, then others
    const sortedWords = useMemo(() => {
        const dueWords = getDueWords(words);
        const sortedDue = sortByReviewPriority(dueWords);
        const nonDue = words.filter(w => !dueWords.includes(w));
        return [...sortedDue, ...nonDue];
    }, [words]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation values
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const hasTriggeredHaptic = useSharedValue(false);

    // Derived states (use sorted words)
    const currentCard = sortedWords[currentIndex % sortedWords.length];
    const nextCard = sortedWords[(currentIndex + 1) % sortedWords.length];
    const nextNextCard = sortedWords.length > 2 ? sortedWords[(currentIndex + 2) % sortedWords.length] : null;

    // Calculate progress
    const progress = sortedWords.length > 0 ? ((currentIndex % sortedWords.length) / sortedWords.length) * 100 : 0;

    const handleClose = () => router.back();

    const handleSwipe = (isLearned: boolean) => {
        // Record SRS review: right swipe (learned) = quality 4, left swipe (skip) = quality 2
        if (currentCard) {
            const quality = mapResultToQuality(isLearned);
            recordReview(currentCard.id, quality);
        }
        setCurrentIndex((prev) => prev + 1);
        translateX.value = 0;
        rotate.value = 0;
        scale.value = 1;
        hasTriggeredHaptic.value = false;
    };

    const triggerImpact = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotate.value = (event.translationX / SCREEN_WIDTH) * 20;
            scale.value = Math.max(0.95, 1 - Math.abs(event.translationX) / (SCREEN_WIDTH * 3));

            if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
                hasTriggeredHaptic.value = true;
                runOnJS(triggerImpact)();
            } else if (Math.abs(event.translationX) < SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
                hasTriggeredHaptic.value = false;
            }
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 1 : -1;
                const isLearned = direction > 0; // Right swipe = learned
                translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleSwipe)(isLearned);
                });
            } else {
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
                scale.value = withSpring(1);
                hasTriggeredHaptic.value = false;
            }
        });

    // Animated Styles
    const topCardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
            { scale: scale.value }
        ]
    }));

    // Swipe indicator styles (LEARNED - right swipe)
    const learnedIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP);
        return { opacity };
    });

    // Swipe indicator styles (SKIP - left swipe)
    const skipIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP);
        return { opacity };
    });

    // 2nd card: always visible behind top card, peeks from bottom
    const nextCardStyle = useAnimatedStyle(() => {
        const inputRange = [-ANIMATION_THRESHOLD, 0, ANIMATION_THRESHOLD];
        // At rest: slightly smaller, offset down. When swiping: full size, no offset
        const scaleAnim = interpolate(translateX.value, inputRange, [1, 0.97, 1], Extrapolation.CLAMP);
        // Use top offset via translateY - card peeks 12px from bottom at rest
        const translateYAnim = interpolate(translateX.value, inputRange, [0, 12, 0], Extrapolation.CLAMP);

        return {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            zIndex: -1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        };
    });

    // 3rd card: deeper in the stack
    const nextNextCardStyle = useAnimatedStyle(() => {
        const inputRange = [-ANIMATION_THRESHOLD, 0, ANIMATION_THRESHOLD];
        // At rest: even smaller, further offset. When swiping: rises to 2nd position
        const scaleAnim = interpolate(translateX.value, inputRange, [0.97, 0.94, 0.97], Extrapolation.CLAMP);
        const translateYAnim = interpolate(translateX.value, inputRange, [12, 24, 12], Extrapolation.CLAMP);

        return {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            zIndex: -2,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: 0.9,
        };
    });


    if (words.length === 0) {
        return (
            <>
                <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
                <EmptyState
                    description="Add words to your vocabulary to start using flashcards."
                    onAction={handleClose}
                />
            </>
        );
    }

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <Stack.Screen options={{ gestureEnabled: false }} />

            <ProgressHeader
                current={(currentIndex % words.length) + 1}
                total={words.length}
                onExit={handleClose}
            />

            {/* Progress Bar */}
            <View className="mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <View
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </View>

            {/* Swipe Hint Labels */}
            <View className="flex-row justify-between px-8 mt-6">
                <Animated.View style={skipIndicatorStyle} className="flex-row items-center">
                    <View className="bg-orange-100 rounded-full p-2 mr-2">
                        <X size={16} color="#F97316" />
                    </View>
                    <Text className="text-orange-500 font-semibold">Skip</Text>
                </Animated.View>

                <Animated.View style={learnedIndicatorStyle} className="flex-row items-center">
                    <Text className="text-green-500 font-semibold">Learned</Text>
                    <View className="bg-green-100 rounded-full p-2 ml-2">
                        <Check size={16} color="#22C55E" />
                    </View>
                </Animated.View>
            </View>

            {/* Deck Container */}
            <View className="flex-1 items-center justify-center px-4">
                <View className="w-full relative h-72 justify-center">

                    {nextNextCard && (
                        <StackedCard
                            card={nextNextCard}
                            style={nextNextCardStyle}
                            overlayOpacity={0.1}
                        />
                    )}

                    {words.length > 1 && (
                        <StackedCard
                            card={nextCard}
                            style={nextCardStyle}
                            overlayOpacity={0.05}
                        />
                    )}

                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[topCardStyle, { zIndex: 10 }]} className="w-full relative">
                            <WordCard card={currentCard} />
                        </Animated.View>
                    </GestureDetector>

                </View>

                {/* Instruction */}
                <View className="mt-8 items-center">
                    <Text className="text-gray-400 text-sm mb-1">Tap card to flip</Text>
                    <Text className="text-gray-300 text-xs">Swipe to continue</Text>
                </View>
            </View>
        </View>
    );
}
