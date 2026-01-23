// Phase 1: Home Screen Placeholder
// TODO Phase 2: Implement FlashList with WordCard components and Add Word FAB

import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold">Lingo Bridge</Text>
      <Text className="text-gray-500 mt-2">Your Daily Vocab</Text>
    </SafeAreaView>
  );
}
