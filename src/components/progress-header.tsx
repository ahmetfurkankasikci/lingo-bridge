import { X } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProgressHeaderProps {
    current: number;
    total: number;
    onExit: () => void;
}

export function ProgressHeader({ current, total, onExit }: ProgressHeaderProps) {
    return (
        <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
                onPress={onExit}
                className="bg-gray-200 p-2 rounded-full"
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
                <X size={20} color="#374151" />
            </TouchableOpacity>

            <Text className="text-gray-500 font-semibold text-lg">
                {current} / {total}
            </Text>

            <View style={{ width: 40 }} />
        </View>
    );
}
