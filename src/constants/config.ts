import Constants from 'expo-constants';

interface AppConfig {
  geminiApiKey: string | null;
}

// Missing values must not throw here: this module is imported at startup,
// so a throw would crash the whole app instead of just the AI features.
const getConfig = (): AppConfig => {
  const extra = Constants.expoConfig?.extra;
  const geminiApiKey = (extra?.geminiApiKey as string | undefined) || null;

  if (!geminiApiKey && __DEV__) {
    console.warn(
      'Missing Gemini API key. Please ensure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file.'
    );
  }

  return { geminiApiKey };
};

export const Config = getConfig();
