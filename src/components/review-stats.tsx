// Review Stats Widget Component
// Shows SRS review statistics on home screen

import { Calendar, Clock, Zap } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/constants/theme';
import { getDueWords, getTimeUntilReview } from '@/services/srs-service';
import { useVocabStore } from '@/store/vocab-store';

export function ReviewStats() {
    const words = useVocabStore((state) => state.words);

    // Calculate stats
    const dueWords = getDueWords(words);
    const dueCount = dueWords.length;

    // Get next review time for non-due words
    const nonDueWords = words.filter(w => !dueWords.includes(w));
    const nextReview = nonDueWords.length > 0
        ? nonDueWords.reduce((earliest, word) =>
            word.srs.nextReviewDate < earliest.srs.nextReviewDate ? word : earliest
        )
        : null;

    // Calculate average mastery
    const avgMastery = words.length > 0
        ? Math.round((words.reduce((sum, w) => sum + w.masteryLevel, 0) / words.length) * 20)
        : 0;

    if (words.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4">
            <Text className="text-sm font-semibold text-gray-500 mb-3">Tekrar Durumu</Text>

            <View className="flex-row justify-between">
                {/* Due Today */}
                <View className="items-center flex-1">
                    <View className="bg-primary-100 rounded-full p-2 mb-2">
                        <Clock size={18} color={colors.primary[500]} />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-xl font-bold text-gray-900">{dueCount}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Tekrar bekleyen</Text>
                </View>

                {/* Next Review */}
                <View className="items-center flex-1">
                    <View className="bg-primary-100 rounded-full p-2 mb-2">
                        <Calendar size={18} color={colors.primary[500]} />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                            {nextReview ? getTimeUntilReview(nextReview.srs) : '-'}
                        </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Sonraki tekrar</Text>
                </View>

                {/* Progress */}
                <View className="items-center flex-1">
                    <View className="bg-green-100 rounded-full p-2 mb-2">
                        <Zap size={18} color={colors.success} />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-xl font-bold text-gray-900">%{avgMastery}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Ustalık</Text>
                </View>
            </View>
        </Card>
    );
}
