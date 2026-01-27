import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useVocabStore } from '@/store/vocab-store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // Point of no return
const ANIMATION_THRESHOLD = SCREEN_WIDTH * 0.15; // Visual confirmation hook

export default function FlashcardsScreen() {
    // ... imports and setup
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const words = useVocabStore((state) => state.words);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation values
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const hasTriggeredHaptic = useSharedValue(false);

    // Derived states
    const currentCard = words[currentIndex % words.length];
    const nextCard = words[(currentIndex + 1) % words.length];
    const nextNextCard = words.length > 2 ? words[(currentIndex + 2) % words.length] : null;

    // Go back logic
    const handleClose = () => {
        router.back();
    };

    // Move to next card
    const handleNext = () => {
        setCurrentIndex((prev) => prev + 1);
        translateX.value = 0;
        rotate.value = 0;
        scale.value = 1;
        hasTriggeredHaptic.value = false;
    };

    // Haptic trigger helper
    const triggerImpact = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Gesture Handler
    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotate.value = (event.translationX / SCREEN_WIDTH) * 25;
            scale.value = Math.max(0.95, 1 - Math.abs(event.translationX) / (SCREEN_WIDTH * 3));

            // Haptic feedback logic
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
                hasTriggeredHaptic.value = true;
                runOnJS(triggerImpact)();
            } else if (Math.abs(event.translationX) < SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
                hasTriggeredHaptic.value = false;
                // Optional: trigger distinct haptic when returning to "cancel" zone
                // runOnJS(triggerImpact)();
            }
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                // Swipe detected - move off screen
                const direction = event.translationX > 0 ? 1 : -1;
                translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleNext)();
                });
            } else {
                // Return to center
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
                scale.value = withSpring(1);
                hasTriggeredHaptic.value = false; // Reset haptic state if canceled
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

    // 2nd Card (Index + 1)
    const nextCardStyle = useAnimatedStyle(() => {
        const threshold = ANIMATION_THRESHOLD;
        const inputRange = [-threshold, 0, threshold];

        const scaleAnim = interpolate(translateX.value, inputRange, [1, 0.95, 1], Extrapolation.CLAMP);
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

    // 3rd Card (Index + 2)
    const nextNextCardStyle = useAnimatedStyle(() => {
        const threshold = ANIMATION_THRESHOLD;
        const inputRange = [-threshold, 0, threshold];

        const scaleAnim = interpolate(translateX.value, inputRange, [0.95, 0.90, 0.95], Extrapolation.CLAMP);
        const translateYAnim = interpolate(translateX.value, inputRange, [12, 24, 12], Extrapolation.CLAMP);

        return {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            zIndex: -2,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: 0.8,
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
        <View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <Stack.Screen options={{ gestureEnabled: false }} />

            <ProgressHeader
                current={(currentIndex % words.length) + 1}
                total={words.length}
                onExit={handleClose}
            />

            {/* Deck Container */}
            <View className="flex-1 items-center justify-center px-4">
                <View className="w-full relative h-64 justify-center">

                    {/* Deep Background Card (Index + 2) */}
                    {nextNextCard && (
                        <StackedCard
                            card={nextNextCard}
                            style={nextNextCardStyle}
                            overlayOpacity={0.1}
                        />
                    )}

                    {/* Next Card (Index + 1) */}
                    {words.length > 1 && (
                        <StackedCard
                            card={nextCard}
                            style={nextCardStyle}
                            overlayOpacity={0.05}
                        />
                    )}

                    {/* Top Card (Foreground) */}
                    <GestureDetector gesture={gesture}>
                        {/* Wrapper logic for top card is slightly different (gesture detector), so keeping explicit View for now or wrapping StackedCard? 
                            Let's use StackedCard inside Animated.View relative to gesture? 
                            Actually, StackedCard returns an Animated.View.
                            So we can wrap StackedCard with GestureDetector.
                        */}

                        <Animated.View style={[topCardStyle, { zIndex: 10 }]} className="w-full relative">
                            {/* No overlay for top card */}
                            <WordCard card={currentCard} />
                        </Animated.View>
                    </GestureDetector>

                </View>

                <Text className="mt-12 text-gray-400 text-sm">Swipe left or right to move to next card</Text>
            </View>
        </View>
    );
}
