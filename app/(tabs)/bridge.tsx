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

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { colors, shadows } from '@/constants/theme';
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
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-6"
            keyboardShouldPersistTaps="handled"
          >
            <ScreenHeader title="B1 Köprüsü" subtitle="Basit cümleleri doğal İngilizceye dönüştür" />

            <View className="px-4">
              {/* Input Section */}
              <Card className="mb-4">
                <Text className="text-sm font-medium text-gray-500 mb-2">
                  A2 cümlen (basit)
                </Text>
                <TextInput
                  value={phrase}
                  onChangeText={setPhrase}
                  placeholder="e.g., I want coffee"
                  placeholderTextColor={colors.textSubtle}
                  multiline
                  numberOfLines={2}
                  className="text-lg text-gray-900 min-h-[60px]"
                  editable={!transformMutation.isPending}
                />
              </Card>

              {/* Transform Button */}
              <TouchableOpacity
                onPress={handleTransform}
                disabled={transformMutation.isPending || !phrase.trim()}
                className={`rounded-2xl py-4 flex-row items-center justify-center mb-6 ${
                  transformMutation.isPending || !phrase.trim()
                    ? 'bg-primary-300'
                    : 'bg-primary-500'
                }`}
                style={{ boxShadow: transformMutation.isPending || !phrase.trim() ? 'none' : shadows.primary }}
              >
                {transformMutation.isPending ? (
                  <>
                    <ActivityIndicator color={colors.white} className="mr-2" />
                    <Text className="text-white font-semibold text-base">Dönüştürülüyor...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color={colors.white} />
                    <Text className="text-white font-semibold text-base ml-2">
                      B1&apos;e dönüştür
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
                      : 'Cümle dönüştürülemedi'}
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
                      <Text className="text-xs text-gray-500 mb-1">A2 · Basit</Text>
                      <Text className="text-base text-gray-800">{originalPhrase}</Text>
                    </View>

                    {/* Arrow */}
                    <View className="mx-2">
                      <ArrowRight size={24} color={colors.primary[500]} />
                    </View>

                    {/* B1 Card */}
                    <View
                      className="flex-1 bg-primary-500 rounded-xl p-4"
                      style={{ boxShadow: shadows.primary }}
                    >
                      <Text className="text-xs text-primary-200 mb-1">B1 · Doğal</Text>
                      <Text className="text-base text-white font-medium">
                        {result.b1Phrase}
                      </Text>
                    </View>
                  </View>

                  {/* Explanation */}
                  <View className="bg-accent-50 rounded-xl p-4 mt-4 border border-accent-200">
                    <Text className="text-sm font-medium text-accent-800 mb-1">
                      💡 Neden daha doğal:
                    </Text>
                    <Text className="text-accent-700">{result.explanation}</Text>
                  </View>

                  {/* Try Another Button */}
                  <TouchableOpacity
                    onPress={handleClear}
                    className="mt-4 py-3 items-center"
                  >
                    <Text className="text-primary-500 font-medium">Başka bir cümle dene</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Example Suggestions */}
              {!result && !transformMutation.isPending && (
                <View className="mt-4">
                  <Text className="text-sm text-gray-500 mb-3">Örneklerden birini dene:</Text>
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
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2"
                    >
                      <Text className="text-gray-700">{example}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}
