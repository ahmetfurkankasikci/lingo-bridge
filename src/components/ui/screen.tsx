// Base screen container: safe area + shared background for every screen

import type { ReactNode } from 'react';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  // Tab screens only need the top edge (the tab bar handles the bottom)
  edges?: Edge[];
  className?: string;
}

export function Screen({ children, edges = ['top'], className = '' }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-gray-50 ${className}`}>
      {children}
    </SafeAreaView>
  );
}
