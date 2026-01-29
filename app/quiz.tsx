import { EmptyState } from '@/components/empty-state';
import { ProgressHeader } from '@/components/progress-header';
import { PracticeMode, QuestionItem, QuizQuestion } from '@/components/quiz-question';
import { QuizResults } from '@/components/quiz-results';
import { useVocabStore } from '@/store/vocab-store';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, RefreshCw, SkipForward, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
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
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuizState {
  isStarted: boolean;
  queue: QuestionItem[];
  currentIndex: number;
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  isFinished: boolean;
}

// Helper to extract the target word from a sentence with ** markers
function extractTargetWord(sentence: string): string {
  const match = sentence.match(/\*\*([^*]+)\*\*/);
  return match ? match[1] : '';
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
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const shakeX = useSharedValue(0);

  const [quiz, setQuiz] = useState<QuizState>({
    isStarted: false,
    queue: [],
    currentIndex: 0,
    userAnswer: '',
    isAnswered: false,
    isCorrect: false,
    correctCount: 0,
    wrongCount: 0,
    skippedCount: 0,
    isFinished: false,
  });

  // Generate a shuffled queue and start immediately on mount
  useEffect(() => {
    if (words.length === 0) return;

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
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      isFinished: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-focus input when question changes
  useEffect(() => {
    if (quiz.isStarted && !quiz.isAnswered && !quiz.isFinished) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [quiz.currentIndex, quiz.isStarted, quiz.isAnswered, quiz.isFinished]);

  // Shake animation style
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Trigger shake animation
  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // Calculate progress percentage
  const progress = quiz.queue.length > 0
    ? ((quiz.currentIndex) / quiz.queue.length) * 100
    : 0;

  // Exit quiz
  const exitQuiz = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  // Restart quiz
  const restartQuiz = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      isFinished: false,
    });
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
      const allTargets = targets.flatMap(t => t.split(/[,;]/).map(s => s.trim().toLowerCase()));
      return allTargets.includes(normalizedUser);
    };

    switch (currentQuestion.mode) {
      case 'tr-to-en': {
        correct = checkMatch(userAnswer, targetWord, baseWord);
        break;
      }
      case 'en-to-tr': {
        correct = checkMatch(userAnswer, currentQuestion.card.content.meaningTr);
        break;
      }
      case 'gap-fill': {
        correct = checkMatch(userAnswer, targetWord, baseWord);
        break;
      }
    }

    // Update mastery level
    const newMastery = correct
      ? Math.min(currentQuestion.card.masteryLevel + 1, 5)
      : Math.max(currentQuestion.card.masteryLevel - 1, 0);

    updateWord(currentQuestion.card.id, { masteryLevel: newMastery });

    // Haptic and animation feedback
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
    }

    setQuiz((prev) => ({
      ...prev,
      isAnswered: true,
      isCorrect: correct,
      correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
      wrongCount: !correct ? prev.wrongCount + 1 : prev.wrongCount,
    }));
  };

  // Skip question
  const skipQuestion = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setQuiz((prev) => ({
      ...prev,
      skippedCount: prev.skippedCount + 1,
    }));

    nextQuestion();
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
      <EmptyState
        description="Add some vocabulary words to start."
        onAction={exitQuiz}
      />
    );
  }

  // Quiz Finished View
  if (quiz.isFinished) {
    return (
      <QuizResults
        correctCount={quiz.correctCount}
        wrongCount={quiz.wrongCount}
        skippedCount={quiz.skippedCount}
        totalCount={quiz.queue.length}
        onExit={exitQuiz}
        onRetry={restartQuiz}
      />
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, padding: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <ProgressHeader
              current={quiz.currentIndex + 1}
              total={quiz.queue.length}
              onExit={exitQuiz}
            />

            {/* Progress Bar */}
            <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
              <View
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>

            {/* Running Score */}
            <View className="flex-row justify-center items-center mb-4">
              <View className="flex-row items-center mr-4">
                <Check size={16} color="#22C55E" />
                <Text className="text-green-600 font-medium ml-1">{quiz.correctCount}</Text>
              </View>
              <View className="flex-row items-center mr-4">
                <X size={16} color="#EF4444" />
                <Text className="text-red-500 font-medium ml-1">{quiz.wrongCount}</Text>
              </View>
              {quiz.skippedCount > 0 && (
                <View className="flex-row items-center">
                  <SkipForward size={16} color="#9CA3AF" />
                  <Text className="text-gray-400 font-medium ml-1">{quiz.skippedCount}</Text>
                </View>
              )}
            </View>

            {/* Mode Badge */}
            <View className="bg-indigo-100 rounded-full px-4 py-2 self-center mb-4">
              <Text className="text-indigo-600 font-medium">{getModeLabel(quiz.queue[quiz.currentIndex].mode)}</Text>
            </View>

            {/* Question Card with Animation */}
            <Animated.View
              key={quiz.currentIndex}
              entering={SlideInRight.duration(300)}
              exiting={SlideOutLeft.duration(200)}
              className="bg-white rounded-2xl p-6 mb-4"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <QuizQuestion questionItem={quiz.queue[quiz.currentIndex]} />
            </Animated.View>

            {/* Input with Shake Animation */}
            <Animated.View style={shakeStyle} className="mb-4">
              <TextInput
                ref={inputRef}
                value={quiz.userAnswer}
                onChangeText={(text) => setQuiz((prev) => ({ ...prev, userAnswer: text }))}
                placeholder="Type your answer..."
                placeholderTextColor="#9CA3AF"
                editable={!quiz.isAnswered}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                className={`border-2 rounded-xl px-5 py-4 text-lg text-gray-900 ${quiz.isAnswered
                  ? quiz.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
                  }`}
                onSubmitEditing={checkAnswer}
              />
            </Animated.View>

            {/* Result Feedback with Animation */}
            {quiz.isAnswered && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(100)}
                className={`rounded-xl p-4 mb-4 flex-row items-center ${quiz.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
              >
                {quiz.isCorrect ? <Check size={24} color="#22C55E" /> : <X size={24} color="#EF4444" />}
                <View className="ml-3 flex-1">
                  <Text className={`font-bold ${quiz.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {quiz.isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                  </Text>
                  {!quiz.isCorrect && (
                    <View className="mt-1">
                      <Text className="text-sm text-red-600">Correct answer:</Text>
                      {renderCorrectAnswer()}
                    </View>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Spacer to push buttons down */}
            <View className="flex-1" />

            {/* Action Buttons */}
            <View>
              {/* Main Action Button */}
              <TouchableOpacity
                onPress={quiz.isAnswered ? nextQuestion : checkAnswer}
                disabled={!quiz.userAnswer.trim() && !quiz.isAnswered}
                className={`rounded-xl py-4 flex-row items-center justify-center ${!quiz.userAnswer.trim() && !quiz.isAnswered ? 'bg-indigo-300' : 'bg-indigo-500'
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

              {/* Skip Button - Text style below main button */}
              {!quiz.isAnswered && (
                <TouchableOpacity
                  onPress={skipQuestion}
                  className="py-3 items-center"
                >
                  <Text className="text-gray-500 font-medium">Skip this question</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

