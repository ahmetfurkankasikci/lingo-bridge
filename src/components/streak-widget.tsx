// Streak Widget Component
// Shows daily quiz and word addition streaks

import { BookPlus, Brain, Flame } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { useStreakStore } from '@/store/streak-store';

export function StreakWidget() {
    const quizStreak = useStreakStore((state) => state.quizStreak);
    const wordStreak = useStreakStore((state) => state.wordStreak);

    // Don't show if no streaks
    if (quizStreak === 0 && wordStreak === 0) {
        return null;
    }

    return (
        <View
            className="mx-4 mb-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100"
            style={{ boxShadow: '0 2px 8px rgba(251, 146, 60, 0.15)' }}
        >
            <View className="flex-row items-center mb-3">
                <Flame size={18} color="#F97316" />
                <Text className="text-sm font-semibold text-orange-600 ml-1">Daily Streaks</Text>
            </View>

            <View className="flex-row justify-around">
                {/* Quiz Streak */}
                <View className="items-center">
                    <View className="bg-orange-100 rounded-full p-3 mb-2">
                        <Brain size={24} color="#EA580C" />
                    </View>
                    <View className="flex-row items-baseline">
                        <Text className="text-2xl font-bold text-orange-600">{quizStreak}</Text>
                        <Text className="text-orange-400 ml-1">🔥</Text>
                    </View>
                    <Text className="text-xs text-orange-500 mt-1">Quiz Streak</Text>
                </View>

                {/* Divider */}
                <View className="w-px bg-orange-200 mx-4" />

                {/* Word Streak */}
                <View className="items-center">
                    <View className="bg-amber-100 rounded-full p-3 mb-2">
                        <BookPlus size={24} color="#D97706" />
                    </View>
                    <View className="flex-row items-baseline">
                        <Text className="text-2xl font-bold text-amber-600">{wordStreak}</Text>
                        <Text className="text-amber-400 ml-1">🔥</Text>
                    </View>
                    <Text className="text-xs text-amber-500 mt-1">Word Streak</Text>
                </View>
            </View>
        </View>
    );
}
