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

// Helper to render sentence with highlighted word
function renderHighlightedSentence(sentence: string) {
    const parts = sentence.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <Text key={index} className="font-bold text-yellow-500 bg-yellow-100 px-1 rounded">
                    {part}
                </Text>
            );
        }
        return <Text key={index}>{part}</Text>;
    });
}

// Helper to create gap sentence
function createGapSentence(sentence: string): string {
    return sentence.replace(/\*\*([^*]+)\*\*/g, '_____');
}

export function QuizQuestion({ questionItem }: QuizQuestionProps) {
    const { card, mode } = questionItem;

    switch (mode) {
        case 'tr-to-en':
            return (
                <View className="items-center">
                    <Text className="text-sm text-gray-500 mb-2">Turkish Meaning:</Text>
                    <Text className="text-3xl font-bold text-gray-900 text-center">
                        {card.content.meaningTr}
                    </Text>
                    <Text className="text-sm text-gray-400 mt-4">What is the English word?</Text>
                </View>
            );
        case 'en-to-tr':
            return (
                <View className="items-center">
                    <Text className="text-sm text-gray-500 mb-2">English Sentence:</Text>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed">
                        {renderHighlightedSentence(card.content.exampleSentence)}
                    </Text>
                    <Text className="text-sm text-gray-400 mt-4">Turkish meaning of the highlighted word?</Text>
                </View>
            );
        case 'gap-fill':
            return (
                <View className="items-center">
                    <Text className="text-sm text-gray-500 mb-2">Fill in the blank:</Text>
                    <Text className="text-lg text-gray-900 text-center leading-relaxed">
                        {createGapSentence(card.content.exampleSentence)}
                    </Text>
                    <Text className="text-sm text-gray-400 mt-4">Hint: {card.content.meaningTr}</Text>
                </View>
            );
        default:
            return null;
    }
}
