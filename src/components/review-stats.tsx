// Review Stats Widget Component
// Shows SRS review statistics on home screen

import { Calendar, Clock, Zap } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

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
        <View className="mx-4 mb-4 bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text className="text-sm font-semibold text-gray-500 mb-3">Review Stats</Text>

            <View className="flex-row justify-between">
                {/* Due Today */}
                <View className="items-center flex-1">
                    <View className="bg-indigo-100 rounded-full p-2 mb-2">
                        <Clock size={18} color="#6366F1" />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-xl font-bold text-gray-900">{dueCount}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Due Now</Text>
                </View>

                {/* Next Review */}
                <View className="items-center flex-1">
                    <View className="bg-blue-100 rounded-full p-2 mb-2">
                        <Calendar size={18} color="#3B82F6" />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                            {nextReview ? getTimeUntilReview(nextReview.srs) : '-'}
                        </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Next Review</Text>
                </View>

                {/* Progress */}
                <View className="items-center flex-1">
                    <View className="bg-green-100 rounded-full p-2 mb-2">
                        <Zap size={18} color="#22C55E" />
                    </View>
                    <View className="h-7 justify-center">
                        <Text className="text-xl font-bold text-gray-900">{avgMastery}%</Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Mastery</Text>
                </View>
            </View>
        </View>
    );
}
