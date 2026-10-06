// Base card: white rounded surface with the shared card shadow

import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { shadows } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, className = '', style }: CardProps) {
  // Default to white unless the caller sets its own background
  // (two bg-* classes would conflict, and class order doesn't decide the winner)
  const background = /(^|\s)bg-/.test(className) ? '' : 'bg-white';

  return (
    <View className={`${background} rounded-2xl p-4 ${className}`} style={[{ boxShadow: shadows.card }, style]}>
      {children}
    </View>
  );
}
