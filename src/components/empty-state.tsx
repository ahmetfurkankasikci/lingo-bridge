import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction: () => void;
}

export function EmptyState({
    title = "No words yet",
    description = "Add words to your vocabulary to start.",
    actionLabel = "Go Back",
    onAction
}: EmptyStateProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-1 items-center justify-center bg-gray-50 p-6"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <Text className="text-xl font-bold text-gray-800 text-center mb-4">{title}</Text>
            <Text className="text-gray-500 text-center mb-8">
                {description}
            </Text>
            <TouchableOpacity onPress={onAction} className="bg-indigo-500 py-3 px-6 rounded-xl">
                <Text className="text-white font-bold">{actionLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}
