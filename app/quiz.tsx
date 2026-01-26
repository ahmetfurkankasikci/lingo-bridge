import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, RefreshCw, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVocabStore } from '@/store/vocab-store';
import type { WordCard } from '@/types';

type PracticeMode = 'tr-to-en' | 'en-to-tr' | 'gap-fill';

// Single question item
interface QuestionItem {
  card: WordCard;
  mode: PracticeMode;
}

interface QuizState {
  isStarted: boolean;
  queue: QuestionItem[];
  currentIndex: number;
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  score: number;
  isFinished: boolean;
}

// Helper to extract the target word from a sentence with ** markers
function extractTargetWord(sentence: string): string {
  const match = sentence.match(/\*\*([^*]+)\*\*/);
  return match ? match[1] : '';
}

// Helper to render sentence with highlighted word
function renderHighlightedSentence(sentence: string) {
  const parts = sentence.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <Text key={index} className="font-bold text-yellow-500 bg-yellow-100 px-1 rounded">
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
}

// Helper to create gap sentence (replace word with blank)
function createGapSentence(sentence: string): string {
  return sentence.replace(/\*\*([^*]+)\*\*/g, '_____');
}

// Get random mode
function getRandomMode(): PracticeMode {
  const modes: PracticeMode[] = ['tr-to-en', 'en-to-tr', 'gap-fill'];
  return modes[Math.floor(Math.random() * modes.length)];
}

export default function QuizScreen() {
  const words = useVocabStore((state) => state.words);
  const updateWord = useVocabStore((state) => state.updateWord);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [quiz, setQuiz] = useState<QuizState>({
    isStarted: false,
    queue: [],
    currentIndex: 0,
    userAnswer: '',
    isAnswered: false,
    isCorrect: false,
    score: 0,
    isFinished: false,
  });

  // Generate a shuffled queue and start immediately on mount
  useEffect(() => {
    // If no words, valid check handled in render or we can redirect back
    if (words.length === 0) return;

    // Use a local copy to generate queue once, ignoring valid future updates to 'words'
    // This prevents the quiz from resetting when 'updateWord' changes the store
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const queue = shuffledWords.map((card) => ({
      card,
      mode: getRandomMode(),
    }));

    setQuiz({
      isStarted: true,
      queue,
      currentIndex: 0,
      userAnswer: '',
      isAnswered: false,
      isCorrect: false,
      score: 0,
      isFinished: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONLY once on mount

  // Exit quiz
  const exitQuiz = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  // Check the answer
  const checkAnswer = async () => {
    const currentQuestion = quiz.queue[quiz.currentIndex];
    if (!currentQuestion || quiz.isAnswered) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let correct = false;
    const userAnswer = quiz.userAnswer.trim().toLowerCase();
    const targetWord = extractTargetWord(currentQuestion.card.content.exampleSentence).toLowerCase();
    const baseWord = currentQuestion.card.word.toLowerCase();

    const checkMatch = (user: string, ...targets: string[]) => {
      const normalizedUser = user.trim().toLowerCase();
      // Flatten all targets (some might be comma separated strings)
      const allTargets = targets.flatMap(t => t.split(/[,;]/).map(s => s.trim().toLowerCase()));
      return allTargets.includes(normalizedUser);
    };

    switch (currentQuestion.mode) {
      case 'tr-to-en': {
        // User should type the English word (accepts conjugated OR base form)
        correct = checkMatch(userAnswer, targetWord, baseWord);
        break;
      }
      case 'en-to-tr': {
        // User should type Turkish meaning
        correct = checkMatch(userAnswer, currentQuestion.card.content.meaningTr);
        break;
      }
      case 'gap-fill': {
        // User should type the missing word (accepts conjugated OR base form)
        correct = checkMatch(userAnswer, targetWord, baseWord);
        break;
      }
    }

    // Update mastery level
    const newMastery = correct
      ? Math.min(currentQuestion.card.masteryLevel + 1, 5)
      : Math.max(currentQuestion.card.masteryLevel - 1, 0);

    updateWord(currentQuestion.card.id, { masteryLevel: newMastery });

    // Haptic feedback
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setQuiz((prev) => ({
      ...prev,
      isAnswered: true,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
    }));
  };

  // Move to next question or finish
  const nextQuestion = () => {
    if (quiz.currentIndex >= quiz.queue.length - 1) {
      setQuiz((prev) => ({ ...prev, isFinished: true }));
    } else {
      setQuiz((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        userAnswer: '',
        isAnswered: false,
        isCorrect: false,
      }));
    }
  };

  const getModeLabel = (mode: PracticeMode): string => {
    switch (mode) {
      case 'tr-to-en': return 'Turkish → English';
      case 'en-to-tr': return 'English → Turkish';
      case 'gap-fill': return 'Fill in the Blank';
    }
  };

  const renderQuestion = () => {
    const currentQuestion = quiz.queue[quiz.currentIndex];
    if (!currentQuestion) return null;

    switch (currentQuestion.mode) {
      case 'tr-to-en':
        return (
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-2">Turkish Meaning:</Text>
            <Text className="text-3xl font-bold text-gray-900 text-center">
              {currentQuestion.card.content.meaningTr}
            </Text>
            <Text className="text-sm text-gray-400 mt-4">What is the English word?</Text>
          </View>
        );
      case 'en-to-tr':
        return (
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-2">English Sentence:</Text>
            <Text className="text-lg text-gray-900 text-center leading-relaxed">
              {renderHighlightedSentence(currentQuestion.card.content.exampleSentence)}
            </Text>
            <Text className="text-sm text-gray-400 mt-4">Turkish meaning of the highlighted word?</Text>
          </View>
        );
      case 'gap-fill':
        return (
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-2">Fill in the blank:</Text>
            <Text className="text-lg text-gray-900 text-center leading-relaxed">
              {createGapSentence(currentQuestion.card.content.exampleSentence)}
            </Text>
            <Text className="text-sm text-gray-400 mt-4">Hint: {currentQuestion.card.content.meaningTr}</Text>
          </View>
        );
    }
  };

  const renderCorrectAnswer = () => {
    const currentQuestion = quiz.queue[quiz.currentIndex];
    if (!currentQuestion || !quiz.isAnswered) return null;

    if (currentQuestion.mode === 'en-to-tr') {
      return (
        <Text className="text-lg font-bold text-gray-900">
          {currentQuestion.card.content.meaningTr}
        </Text>
      );
    } else {
      const target = extractTargetWord(currentQuestion.card.content.exampleSentence);
      const base = currentQuestion.card.word;
      return (
        <Text className="text-lg font-bold text-gray-900">
          {target} {target.toLowerCase() !== base.toLowerCase() ? `(or ${base})` : ''}
        </Text>
      );
    }
  };

  // No words available state
  if (words.length === 0) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center p-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-xl font-bold text-gray-900 mb-2">No Words Yet</Text>
        <Text className="text-gray-500 text-center">Add some vocabulary words to start.</Text>
        <TouchableOpacity
          onPress={exitQuiz}
          className="bg-gray-200 rounded-2xl py-3 px-6 mt-4"
        >
          <Text className="text-gray-700 font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Quiz Finished View
  if (quiz.isFinished) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center p-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete! 🎉</Text>
        <View className="bg-white rounded-2xl p-8 mb-8 w-full items-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Text className="text-gray-500 text-lg mb-2">Your Score</Text>
          <Text className="text-5xl font-bold text-indigo-600 mb-2">
            {quiz.score}/{quiz.queue.length}
          </Text>
          <Text className="text-gray-400">
            {Math.round((quiz.score / quiz.queue.length) * 100)}% Accuracy
          </Text>
        </View>
        <TouchableOpacity
          onPress={exitQuiz}
          className="bg-indigo-500 rounded-2xl py-4 px-8"
          style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
        >
          <Text className="text-white font-bold text-lg">Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state (while generating queue)
  if (!quiz.isStarted) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <RefreshCw className="animate-spin" size={32} color="#6366F1" />
      </View>
    );
  }

  // Active Quiz View
  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={exitQuiz} className="p-2 bg-gray-200 rounded-full">
                <X size={20} color="#374151" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-600">
                {quiz.currentIndex + 1} / {quiz.queue.length}
              </Text>
              <View className="w-9" />
            </View>

            {/* Mode Badge */}
            <View className="bg-indigo-100 rounded-full px-4 py-2 self-center mb-4">
              <Text className="text-indigo-600 font-medium">{getModeLabel(quiz.queue[quiz.currentIndex].mode)}</Text>
            </View>

            {/* Question Card */}
            <View className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {renderQuestion()}
            </View>

            {/* Input */}
            <View className="mb-4">
              <TextInput
                value={quiz.userAnswer}
                onChangeText={(text) => setQuiz((prev) => ({ ...prev, userAnswer: text }))}
                placeholder="Type your answer..."
                placeholderTextColor="#9CA3AF"
                editable={!quiz.isAnswered}
                autoCapitalize="none"
                className={`border-2 rounded-xl px-4 py-3 text-base text-gray-900 ${
                  quiz.isAnswered
                    ? quiz.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                onSubmitEditing={checkAnswer}
              />
            </View>

            {/* Result */}
            {quiz.isAnswered && (
              <View className={`rounded-xl p-4 mb-4 flex-row items-center ${quiz.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                {quiz.isCorrect ? <Check size={24} color="#22C55E" /> : <X size={24} color="#EF4444" />}
                <View className="ml-3 flex-1">
                  <Text className={`font-bold ${quiz.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {quiz.isCorrect ? 'Correct!' : 'Incorrect'}
                  </Text>
                  {!quiz.isCorrect && (
                    <View className="mt-1">
                      <Text className="text-sm text-red-600">Correct answer:</Text>
                      {renderCorrectAnswer()}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              onPress={quiz.isAnswered ? nextQuestion : checkAnswer}
              disabled={!quiz.userAnswer.trim() && !quiz.isAnswered}
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                !quiz.userAnswer.trim() && !quiz.isAnswered ? 'bg-indigo-300' : 'bg-indigo-500'
              }`}
              style={{ boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)' }}
            >
              {quiz.isAnswered ? (
                <>
                  <RefreshCw size={20} color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">Next</Text>
                </>
              ) : (
                <Text className="text-white font-semibold text-base">Check Answer</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
