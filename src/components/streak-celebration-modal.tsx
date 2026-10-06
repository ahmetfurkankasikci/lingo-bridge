// Streak Celebration Modal Component
// Shows animated celebration when streak increases

import { Flame, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn
} from 'react-native-reanimated';
import { colors, shadows } from '@/constants/theme';

interface StreakCelebrationModalProps {
    visible: boolean;
    onClose: () => void;
    streakType: 'quiz' | 'word';
    streakCount: number;
}

export function StreakCelebrationModal({
    visible,
    onClose,
    streakType,
    streakCount,
}: StreakCelebrationModalProps) {
    // Animation values
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const fireScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            // Pulse animation for the number
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 300 }),
                    withTiming(1, { duration: 300 })
                ),
                3,
                true
            );

            // Wiggle animation for fire
            rotate.value = withRepeat(
                withSequence(
                    withTiming(-10, { duration: 100 }),
                    withTiming(10, { duration: 100 }),
                    withTiming(0, { duration: 100 })
                ),
                3,
                false
            );

            // Fire scale animation
            fireScale.value = withRepeat(
                withSequence(
                    withSpring(1.2),
                    withSpring(1)
                ),
                -1,
                true
            );
        }
    }, [visible, scale, rotate, fireScale]);

    const numberStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const fireStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotate.value}deg` },
            { scale: fireScale.value },
        ],
    }));

    const title = streakType === 'quiz' ? 'Quiz Serisi!' : 'Kelime Serisi!';
    const subtitle = streakType === 'quiz'
        ? 'Bugün bir quiz tamamladın!'
        : 'Bugün bir kelime ekledin!';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 items-center justify-center"
                onPress={onClose}
            >
                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={FadeOut}
                    className="bg-white rounded-3xl p-8 mx-8 items-center"
                    style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                >
                    {/* Close button */}
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 p-2"
                    >
                        <X size={24} color={colors.textSubtle} />
                    </Pressable>

                    {/* Fire icon */}
                    <Animated.View style={fireStyle} className="mb-4">
                        <View className="bg-accent-200 rounded-full p-4">
                            <Flame size={48} color={colors.accent[600]} fill={colors.accent[400]} />
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-accent-600 mb-2">
                        {title}
                    </Text>

                    {/* Streak count */}
                    <Animated.View style={numberStyle} className="my-4">
                        <View className="flex-row items-center">
                            <Text className="text-6xl font-extrabold text-accent-500">
                                {streakCount}
                            </Text>
                            <Text className="text-4xl ml-2">🔥</Text>
                        </View>
                    </Animated.View>

                    {/* Subtitle */}
                    <Text className="text-base text-accent-600/80 text-center mb-2">
                        {subtitle}
                    </Text>

                    {/* Encouragement */}
                    <Text className="text-sm text-accent-500/60 text-center">
                        {streakCount === 1
                            ? "Harika bir başlangıç! Devam et!"
                            : streakCount < 7
                                ? `Bir haftalık seriye ${7 - streakCount} gün kaldı!`
                                : "İnanılmaz bir kararlılık! 🎉"}
                    </Text>

                    {/* Continue button */}
                    <Pressable
                        onPress={onClose}
                        className="mt-6 bg-accent-500 px-8 py-3 rounded-full"
                        style={{ boxShadow: shadows.accent }}
                    >
                        <Text className="text-white font-semibold text-base">
                            Devam
                        </Text>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}
