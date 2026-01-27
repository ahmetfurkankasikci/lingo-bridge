import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { WordCard } from '@/components/word-card';

interface StackedCardProps {
    card: React.ComponentProps<typeof WordCard>['card'];
    style: any;
    overlayOpacity?: number;
}

export function StackedCard({ card, style, overlayOpacity = 0 }: StackedCardProps) {
    return (
        <Animated.View style={style} className="w-full">
            {/* Dark Overlay for depth */}
            {overlayOpacity > 0 && (
                <View
                    style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
                    className="absolute inset-0 z-10 rounded-2xl"
                />
            )}
            <View className="relative flex-1 flex items-center justify-center p-6 mb-4">
                <WordCard card={card} />
            </View>
        </Animated.View>
    );
}
