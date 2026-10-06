// Phase 1: Tab Navigation Setup
// This layout defines the bottom tab navigation for the app

import { Tabs } from 'expo-router';
import { BookOpen, GraduationCap, MessageSquare } from 'lucide-react-native';

import { colors } from '@/constants/theme';

export default function TabLayout() {
  // TODO: Implement theme support (dark/light mode)
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.textSubtle,
      }}
    >
      {/* Home Tab: Vocabulary list with AI-generated word cards */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kelimeler',
          tabBarIcon: ({ color }) => <BookOpen size={26} color={color} />,
        }}
      />
      {/* Bridge Tab: A2 -> B1 phrase transformation feature */}
      <Tabs.Screen
        name="bridge"
        options={{
          title: 'Köprü',
          tabBarIcon: ({ color }) => <MessageSquare size={26} color={color} />,
        }}
      />
      {/* Practice Tab: Interactive quizzes and flashcards */}
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Pratik',
          tabBarIcon: ({ color }) => <GraduationCap size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
