import { WordCard } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';

export type PracticeMode = 'tr-to-en' | 'en-to-tr' | 'gap-fill';

export interface QuestionItem {
    card: WordCard;
    mode: PracticeMode;
}

interface QuizQuestionProps {
    questionItem: QuestionItem;
}

// Helper to render sentence with highlighted word - enhanced styling
function renderHighlightedSentence(sentence: string) {
    const parts = sentence.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <Text
                    key={index}
                    className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md"
                    style={{ textDecorationLine: 'underline', textDecorationColor: '#F59E0B' }}
                >
                    {part}
                </Text>
            );
        }
        return <Text key={index}>{part}</Text>;
    });
}




// Helper to create gap sentence with styled gap
function renderGapSentence(sentence: string) {
    const parts = sentence.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            // This is the word that should be replaced with gap
            return (
                <Text key={index} className="text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-dashed border-indigo-300">
                    _____
                </Text>
            );
        }
        return <Text key={index}>{part}</Text>;
    });
}

export function QuizQuestion({ questionItem }: QuizQuestionProps) {
    const { card, mode } = questionItem;

    switch (mode) {
        case 'tr-to-en':
            return (
                <View className="items-center py-4">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mb-3">
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">Turkish Meaning</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-6">
                        {card.content.meaningTr}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            Type the English word ↓
                        </Text>
                    </View>
                </View>
            );
        case 'en-to-tr':
            return (
                <View className="items-center py-4">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mb-3">
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">English Sentence</Text>
                    </View>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed mb-6">
                        {renderHighlightedSentence(card.content.exampleSentence)}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            Type the Turkish meaning of the highlighted word ↓
                        </Text>
                    </View>
                </View>
            );
        case 'gap-fill':
            return (
                <View className="items-center py-4">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mb-3">
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">Fill in the Blank</Text>
                    </View>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed mb-6">
                        {renderGapSentence(card.content.exampleSentence)}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            Type the missing word ↓
                        </Text>
                    </View>
                </View>
            );
        default:
            return null;
    }
}
