// Root layout - Provides QueryClientProvider and routes to tabs
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

import { useStreakStore } from '@/store/streak-store';

const queryClient = new QueryClient();

export default function RootLayout() {
  const checkAndResetStreaks = useStreakStore((state) => state.checkAndResetStreaks);

  // Check and reset streaks on app open
  useEffect(() => {
    checkAndResetStreaks();
  }, [checkAndResetStreaks]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Default route redirects to (tabs) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
