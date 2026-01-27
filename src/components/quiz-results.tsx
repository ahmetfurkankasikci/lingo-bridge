import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuizResultsProps {
    score: number;
    totalCount: number;
    onExit: () => void;
}

export function QuizResults({ score, totalCount, onExit }: QuizResultsProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-1 bg-gray-50 items-center justify-center p-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <Text className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete! 🎉</Text>
            <View
                className="bg-white rounded-2xl p-8 mb-8 w-full items-center"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
                <Text className="text-gray-500 text-lg mb-2">Your Score</Text>
                <Text className="text-5xl font-bold text-indigo-600 mb-2">
                    {score}/{totalCount}
                </Text>
                <Text className="text-gray-400">
                    {Math.round((score / totalCount) * 100)}% Accuracy
                </Text>
            </View>
            <TouchableOpacity
                onPress={onExit}
                className="bg-indigo-500 rounded-2xl py-4 px-8"
                style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
            >
                <Text className="text-white font-bold text-lg">Back to Menu</Text>
            </TouchableOpacity>
        </View>
    );
}
