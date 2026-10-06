import { useRouter } from 'expo-router';
import { BookOpen, Clock, Languages, Layers, PencilLine, Play, Trophy } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { colors, shadows } from '@/constants/theme';
import { getDueWords } from '@/services/srs-service';
import { useStreakStore } from '@/store/streak-store';
import { useVocabStore } from '@/store/vocab-store';

// The three quiz modes, picked randomly per question in the quiz screen
const QUIZ_MODES: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <Languages size={20} color={colors.primary[500]} />,
    title: 'Türkçe → İngilizce',
    description: 'Türkçe anlamı gör, İngilizce kelimeyi yaz',
  },
  {
    icon: <BookOpen size={20} color={colors.primary[500]} />,
    title: 'İngilizce → Türkçe',
    description: 'Cümledeki vurgulu kelimenin anlamını yaz',
  },
  {
    icon: <PencilLine size={20} color={colors.primary[500]} />,
    title: 'Boşluk doldurma',
    description: 'Cümledeki eksik kelimeyi tamamla',
  },
];

export default function PracticeScreen() {
  const words = useVocabStore((state) => state.words);
  const lastQuizScore = useStreakStore((state) => state.lastQuizScore);
  const router = useRouter();

  const dueCount = getDueWords(words).length;
  const lastScorePercent = lastQuizScore && lastQuizScore.total > 0
    ? Math.round((lastQuizScore.correct / lastQuizScore.total) * 100)
    : null;

  // No words available
  if (words.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Pratik" subtitle="Kelime bilgini test et" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-primary-50 p-6 rounded-full mb-6">
            <Layers size={48} color={colors.primary[500]} />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Henüz kelime yok</Text>
          <Text className="text-gray-500 text-center">
            Pratik yapmaya başlamak için önce Kelimeler sekmesinden birkaç kelime ekle.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Pratik" subtitle="Kelime bilgini test et" />

        <View className="px-4">
          {/* Summary: due words + last quiz score */}
          <View className="flex-row mb-4">
            <Card className="flex-1 mr-2 items-center">
              <View className="bg-primary-100 rounded-full p-2 mb-2">
                <Clock size={18} color={colors.primary[500]} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{dueCount}</Text>
              <Text className="text-xs text-gray-500 mt-1">Tekrar bekleyen</Text>
            </Card>

            <Card className="flex-1 ml-2 items-center">
              <View className="bg-accent-100 rounded-full p-2 mb-2">
                <Trophy size={18} color={colors.accent[600]} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {lastScorePercent !== null ? `%${lastScorePercent}` : '-'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                {lastQuizScore
                  ? `Son quiz: ${lastQuizScore.correct}/${lastQuizScore.total}`
                  : 'Henüz quiz yok'}
              </Text>
            </Card>
          </View>

          {/* Quiz modes */}
          <Text className="text-sm font-semibold text-gray-500 mb-2 mt-2">Quiz modları</Text>
          <Card className="mb-6">
            {QUIZ_MODES.map((mode, index) => (
              <View
                key={mode.title}
                className={`flex-row items-center py-3 ${index > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <View className="bg-primary-50 rounded-xl p-2 mr-3">{mode.icon}</View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{mode.title}</Text>
                  <Text className="text-sm text-gray-500">{mode.description}</Text>
                </View>
              </View>
            ))}
            <Text className="text-xs text-gray-400 mt-2">
              {words.length} soru · Tekrarı gelen kelimeler önce sorulur · Kelimenin kök hâli de kabul edilir
            </Text>
          </Card>

          {/* Start Quiz Button */}
          <TouchableOpacity
            onPress={() => router.push('/quiz')}
            className="bg-primary-500 rounded-2xl py-4 px-8 flex-row items-center justify-center mb-3"
            style={{ boxShadow: shadows.primary }}
          >
            <Play size={22} color={colors.white} />
            <Text className="text-white font-bold text-lg ml-2">Quiz&apos;e Başla</Text>
          </TouchableOpacity>

          {/* Flashcards Button */}
          <TouchableOpacity
            onPress={() => router.push('/flash-cards')}
            className="bg-white border-2 border-primary-500 rounded-2xl py-4 px-8 flex-row items-center justify-center"
          >
            <Layers size={22} color={colors.primary[500]} />
            <Text className="text-primary-600 font-bold text-lg ml-2">Kart Destesi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
