import { Check, RefreshCw, SkipForward, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuizResultsProps {
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    totalCount: number;
    onExit: () => void;
    onRetry: () => void;
}

// Get motivational message based on score
function getMotivationalMessage(percentage: number): { emoji: string; message: string } {
    if (percentage >= 90) return { emoji: '🏆', message: 'Outstanding! You\'re a master!' };
    if (percentage >= 75) return { emoji: '🌟', message: 'Great job! Keep it up!' };
    if (percentage >= 50) return { emoji: '💪', message: 'Good effort! Practice makes perfect.' };
    if (percentage >= 25) return { emoji: '📚', message: 'Keep studying! You\'ll get there.' };
    return { emoji: '🎯', message: 'Don\'t give up! Try again.' };
}

export function QuizResults({
    correctCount,
    wrongCount,
    skippedCount,
    totalCount,
    onExit,
    onRetry
}: QuizResultsProps) {
    const insets = useSafeAreaInsets();
    const confettiRef = useRef<ConfettiCannon>(null);

    const percentage = Math.round((correctCount / totalCount) * 100);
    const { emoji, message } = getMotivationalMessage(percentage);
    const isHighScore = percentage >= 90;

    // Animation values
    const scale = useSharedValue(0);
    const confettiRotation = useSharedValue(0);

    useEffect(() => {
        // Score card bounce animation
        scale.value = withSpring(1, { damping: 8, stiffness: 100 });

        // Confetti rotation for high scores
        if (isHighScore) {
            confettiRotation.value = withRepeat(
                withSequence(
                    withTiming(-5, { duration: 200 }),
                    withTiming(5, { duration: 200 })
                ),
                -1,
                true
            );
            // Trigger confetti explosion
            setTimeout(() => {
                confettiRef.current?.start();
            }, 300);
        }
    }, [scale, confettiRotation, isHighScore]);

    const scoreCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const confettiStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${confettiRotation.value}deg` }],
    }));

    return (
        <View
            className="flex-1 bg-gradient-to-b from-indigo-50 to-white items-center justify-center p-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Confetti Cannon for high scores */}
            {isHighScore && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={150}
                    origin={{ x: -10, y: 0 }}
                    autoStart={false}
                    fadeOut={true}
                    fallSpeed={2500}
                    explosionSpeed={350}
                    colors={['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6']}
                />
            )}

            {/* Celebration Header */}
            <Animated.View
                entering={FadeInUp.delay(100).duration(400)}
                style={isHighScore ? confettiStyle : undefined}
            >
                <Text className="text-6xl mb-2">{emoji}</Text>
            </Animated.View>

            <Animated.Text
                entering={FadeIn.delay(200).duration(300)}
                className="text-3xl font-bold text-gray-900 mb-2 text-center"
            >
                Quiz Complete!
            </Animated.Text>

            <Animated.Text
                entering={FadeIn.delay(300).duration(300)}
                className="text-gray-500 text-center mb-6"
            >
                {message}
            </Animated.Text>

            {/* Score Card */}
            <Animated.View
                style={[scoreCardStyle, { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }]}
                className="bg-white rounded-3xl p-8 mb-6 w-full items-center"
            >
                {/* Main Score */}
                <Text className="text-gray-400 text-base mb-1">Your Score</Text>
                <Text className="text-6xl font-bold text-indigo-600 mb-1">
                    {percentage}%
                </Text>
                <Text className="text-gray-500 mb-6">
                    {correctCount} of {totalCount} correct
                </Text>

                {/* Breakdown */}
                <View className="w-full border-t border-gray-100 pt-4">
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <View className="flex-row items-center mb-1">
                                <Check size={18} color="#22C55E" />
                                <Text className="text-2xl font-bold text-green-600 ml-1">{correctCount}</Text>
                            </View>
                            <Text className="text-xs text-gray-400">Correct</Text>
                        </View>

                        <View className="items-center">
                            <View className="flex-row items-center mb-1">
                                <X size={18} color="#EF4444" />
                                <Text className="text-2xl font-bold text-red-500 ml-1">{wrongCount}</Text>
                            </View>
                            <Text className="text-xs text-gray-400">Wrong</Text>
                        </View>

                        {skippedCount > 0 && (
                            <View className="items-center">
                                <View className="flex-row items-center mb-1">
                                    <SkipForward size={18} color="#9CA3AF" />
                                    <Text className="text-2xl font-bold text-gray-400 ml-1">{skippedCount}</Text>
                                </View>
                                <Text className="text-xs text-gray-400">Skipped</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
                entering={FadeIn.delay(500).duration(300)}
                className="flex-row w-full"
            >
                {/* Back to Menu */}
                <TouchableOpacity
                    onPress={onExit}
                    className="flex-1 bg-gray-200 rounded-2xl py-4 mr-2"
                >
                    <Text className="text-gray-700 font-semibold text-base text-center">Back</Text>
                </TouchableOpacity>

                {/* Try Again */}
                <TouchableOpacity
                    onPress={onRetry}
                    className="flex-1 bg-indigo-500 rounded-2xl py-4 ml-2 flex-row items-center justify-center"
                    style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
                >
                    <RefreshCw size={18} color="#fff" />
                    <Text className="text-white font-semibold text-base ml-2">Try Again</Text>
                </TouchableOpacity>
            </Animated.View>


        </View>
    );
}
