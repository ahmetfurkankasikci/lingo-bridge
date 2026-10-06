import { WordCard } from '@/types';
import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';

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
                    className="font-bold text-accent-600 bg-accent-100 px-1.5 py-0.5 rounded-md"
                    style={{ textDecorationLine: 'underline', textDecorationColor: colors.accent[500] }}
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
                <Text key={index} className="text-primary-500 font-semibold bg-primary-50 px-2 py-0.5 rounded border border-dashed border-primary-300">
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
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">Türkçe anlamı</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-6">
                        {card.content.meaningTr}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            İngilizce kelimeyi yaz ↓
                        </Text>
                    </View>
                </View>
            );
        case 'en-to-tr':
            return (
                <View className="items-center py-4">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mb-3">
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">İngilizce cümle</Text>
                    </View>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed mb-6">
                        {renderHighlightedSentence(card.content.exampleSentence)}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            Vurgulu kelimenin Türkçe anlamını yaz ↓
                        </Text>
                    </View>
                </View>
            );
        case 'gap-fill':
            return (
                <View className="items-center py-4">
                    <View className="bg-gray-100 rounded-full px-3 py-1 mb-3">
                        <Text className="text-xs text-gray-500 uppercase tracking-wide">Boşluk doldurma</Text>
                    </View>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed mb-6">
                        {renderGapSentence(card.content.exampleSentence)}
                    </Text>
                    <View className="border-t border-gray-100 w-full pt-4">
                        <Text className="text-sm text-gray-400 text-center">
                            Eksik kelimeyi yaz ↓
                        </Text>
                    </View>
                </View>
            );
        default:
            return null;
    }
}
