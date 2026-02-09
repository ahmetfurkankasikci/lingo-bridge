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

    const title = streakType === 'quiz' ? 'Quiz Streak!' : 'Word Streak!';
    const subtitle = streakType === 'quiz'
        ? 'You completed a quiz today!'
        : 'You added a word today!';

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
                        <X size={24} color="#9CA3AF" />
                    </Pressable>

                    {/* Fire icon */}
                    <Animated.View style={fireStyle} className="mb-4">
                        <View className="bg-orange-200 rounded-full p-4">
                            <Flame size={48} color="#EA580C" fill="#FB923C" />
                        </View>
                    </Animated.View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-orange-600 mb-2">
                        {title}
                    </Text>

                    {/* Streak count */}
                    <Animated.View style={numberStyle} className="my-4">
                        <View className="flex-row items-center">
                            <Text className="text-6xl font-extrabold text-orange-500">
                                {streakCount}
                            </Text>
                            <Text className="text-4xl ml-2">🔥</Text>
                        </View>
                    </Animated.View>

                    {/* Subtitle */}
                    <Text className="text-base text-orange-600/80 text-center mb-2">
                        {subtitle}
                    </Text>

                    {/* Encouragement */}
                    <Text className="text-sm text-orange-500/60 text-center">
                        {streakCount === 1
                            ? "Great start! Keep it going!"
                            : streakCount < 7
                                ? `${7 - streakCount} more days to a week streak!`
                                : "Amazing dedication! 🎉"}
                    </Text>

                    {/* Continue button */}
                    <Pressable
                        onPress={onClose}
                        className="mt-6 bg-orange-500 px-8 py-3 rounded-full"
                        style={{ boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)' }}
                    >
                        <Text className="text-white font-semibold text-base">
                            Continue
                        </Text>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}
