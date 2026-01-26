import { useRouter } from 'expo-router';
import { Play } from 'lucide-react-native';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVocabStore } from '@/store/vocab-store';

export default function PracticeScreen() {
  const words = useVocabStore((state) => state.words);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const startQuiz = () => {
    router.push('/quiz');
  };

  // No words available
  if (words.length === 0) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center p-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-xl font-bold text-gray-900 mb-2">No Words Yet</Text>
        <Text className="text-gray-500 text-center">Add some vocabulary words first to start practicing!</Text>
      </View>
    );
  }

  // Dashboard / Menu
  return (
    <View
      className="flex-1 bg-gray-50 items-center justify-center p-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Text className="text-3xl font-bold text-gray-900 mb-2">Practice 📝</Text>
      <Text className="text-gray-500 text-center mb-8">Test your vocabulary knowledge</Text>

      <View className="bg-white rounded-2xl p-6 mb-8 w-full" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quiz Info:</Text>
        <View className="space-y-2">
          <Text className="text-gray-600">• {words.length} questions in total</Text>
          <Text className="text-gray-600">• Modes: Translation & Gap Fill</Text>
          <Text className="text-gray-600">• Base words accepted!</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={startQuiz}
        className="bg-indigo-500 rounded-2xl py-4 px-8 flex-row items-center"
        style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
      >
        <Play size={24} color="#fff" />
        <Text className="text-white font-bold text-lg ml-2">Start Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}
