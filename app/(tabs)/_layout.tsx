// Phase 1: Tab Navigation Setup
// This layout defines the bottom tab navigation for the app

import { Tabs } from 'expo-router';
import { BookOpen, Chrome as ChromeIcon, MessageSquare } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  // TODO: Implement theme support (dark/light mode)
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a7ea4',
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {/* Home Tab: Vocabulary list with AI-generated word cards */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <BookOpen size={28} color={color} />,
        }}
      />
      {/* Bridge Tab: A2 -> B1 phrase transformation feature */}
      <Tabs.Screen
        name="bridge"
        options={{
          title: 'Bridge',
          tabBarIcon: ({ color }) => <MessageSquare size={28} color={color} />,
        }}
      />
      {/* Practice Tab: Interactive quizzes and roleplay scenarios */}
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <ChromeIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
