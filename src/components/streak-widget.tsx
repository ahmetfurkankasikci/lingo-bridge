// Streak Widget Component
// Shows daily quiz and word addition streaks

import { BookPlus, Brain, Flame } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/constants/theme';
import { useStreakStore } from '@/store/streak-store';

export function StreakWidget() {
    const quizStreak = useStreakStore((state) => state.quizStreak);
    const wordStreak = useStreakStore((state) => state.wordStreak);

    // Don't show if no streaks
    if (quizStreak === 0 && wordStreak === 0) {
        return null;
    }

    return (
        <Card className="mb-4 bg-accent-50 border border-accent-100">
            <View className="flex-row items-center mb-3">
                <Flame size={18} color={colors.accent[500]} />
                <Text className="text-sm font-semibold text-accent-600 ml-1">Günlük Seriler</Text>
            </View>

            <View className="flex-row justify-around">
                {/* Quiz Streak */}
                <View className="items-center flex-1">
                    <View className="bg-accent-100 rounded-full p-3 mb-2">
                        <Brain size={24} color={colors.accent[600]} />
                    </View>
                    <View className="flex-row items-baseline">
                        <Text className="text-2xl font-bold text-accent-600">{quizStreak}</Text>
                        <Text className="ml-1">🔥</Text>
                    </View>
                    <Text className="text-xs text-accent-700 mt-1" numberOfLines={1}>Quiz serisi</Text>
                </View>

                {/* Divider */}
                <View className="w-px bg-accent-200" />

                {/* Word Streak */}
                <View className="items-center flex-1">
                    <View className="bg-accent-100 rounded-full p-3 mb-2">
                        <BookPlus size={24} color={colors.accent[600]} />
                    </View>
                    <View className="flex-row items-baseline">
                        <Text className="text-2xl font-bold text-accent-600">{wordStreak}</Text>
                        <Text className="ml-1">🔥</Text>
                    </View>
                    <Text className="text-xs text-accent-700 mt-1" numberOfLines={1}>Kelime serisi</Text>
                </View>
            </View>
        </Card>
    );
}
