// Phase 4: B1 Bridge Screen
// Transform A2 phrases to natural B1 equivalents with explanation

import * as Haptics from 'expo-haptics';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransformToB1 } from '@/hooks/use-transform-to-b1';
import type { B1BridgeResult } from '@/types';

export default function BridgeScreen() {
  const [phrase, setPhrase] = useState('');
  const [originalPhrase, setOriginalPhrase] = useState('');
  const [result, setResult] = useState<B1BridgeResult | null>(null);

  // Use custom hook for transformation
  const transformMutation = useTransformToB1({
    onSuccess: (data) => setResult(data),
  });

  const handleTransform = async () => {
    const trimmed = phrase.trim();
    if (!trimmed) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOriginalPhrase(trimmed);
    transformMutation.mutate(trimmed);
  };

  const handleClear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhrase('');
    setResult(null);
    transformMutation.reset();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="p-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900">B1 Bridge 🌉</Text>
              <Text className="text-gray-600 mt-1">
                Transform simple phrases into natural English
              </Text>
            </View>

            {/* Input Section */}
            <View className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Text className="text-sm font-medium text-gray-500 mb-2">
                Your A2 phrase (simple)
              </Text>
              <TextInput
                value={phrase}
                onChangeText={setPhrase}
                placeholder="e.g., I want coffee"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={2}
                className="text-lg text-gray-900 min-h-[60px]"
                editable={!transformMutation.isPending}
              />
            </View>

            {/* Transform Button */}
            <TouchableOpacity
              onPress={handleTransform}
              disabled={transformMutation.isPending || !phrase.trim()}
              className={`rounded-2xl py-4 flex-row items-center justify-center mb-6 ${
                transformMutation.isPending || !phrase.trim()
                  ? 'bg-indigo-300'
                  : 'bg-indigo-500'
              }`}
              style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
            >
              {transformMutation.isPending ? (
                <>
                  <ActivityIndicator color="#fff" className="mr-2" />
                  <Text className="text-white font-semibold text-base">Transforming...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Transform to B1
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Error Display */}
            {transformMutation.isError && (
              <View className="bg-red-50 rounded-xl p-4 mb-4">
                <Text className="text-red-600">
                  {transformMutation.error instanceof Error
                    ? transformMutation.error.message
                    : 'Failed to transform phrase'}
                </Text>
              </View>
            )}

            {/* Result Display */}
            {result && (
              <View className="space-y-4">
                {/* Side by Side Comparison */}
                <View className="flex-row items-center">
                  {/* A2 Card */}
                  <View className="flex-1 bg-gray-200 rounded-xl p-4">
                    <Text className="text-xs text-gray-500 mb-1">A2 - Simple</Text>
                    <Text className="text-base text-gray-800">{originalPhrase}</Text>
                  </View>

                  {/* Arrow */}
                  <View className="mx-2">
                    <ArrowRight size={24} color="#6366F1" />
                  </View>

                  {/* B1 Card */}
                  <View
                    className="flex-1 bg-indigo-500 rounded-xl p-4"
                    style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
                  >
                    <Text className="text-xs text-indigo-200 mb-1">B1 - Natural</Text>
                    <Text className="text-base text-white font-medium">
                      {result.b1Phrase}
                    </Text>
                  </View>
                </View>

                {/* Explanation */}
                <View className="bg-amber-50 rounded-xl p-4 mt-4 border border-amber-200">
                  <Text className="text-sm font-medium text-amber-800 mb-1">
                    💡 Why this sounds better:
                  </Text>
                  <Text className="text-amber-700">{result.explanation}</Text>
                </View>

                {/* Try Another Button */}
                <TouchableOpacity
                  onPress={handleClear}
                  className="mt-4 py-3 items-center"
                >
                  <Text className="text-indigo-500 font-medium">Try another phrase</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Example Suggestions */}
            {!result && !transformMutation.isPending && (
              <View className="mt-4">
                <Text className="text-sm text-gray-500 mb-3">Try these examples:</Text>
                {[
                  'I want coffee',
                  'Where is bathroom?',
                  'I don\'t understand',
                  'This is good',
                  'I need help',
                ].map((example) => (
                  <TouchableOpacity
                    key={example}
                    onPress={() => setPhrase(example)}
                    className="bg-gray-100 rounded-lg px-4 py-3 mb-2"
                  >
                    <Text className="text-gray-700">{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
