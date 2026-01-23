// Phase 1: Bridge Screen Placeholder
// TODO Phase 4: Implement A2->B1 phrase transformation with Gemini API

import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BridgeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold">A2 {'->'} B1 Bridge</Text>
      <Text className="text-gray-500 mt-2">Transform your phrases</Text>
    </SafeAreaView>
  );
}
