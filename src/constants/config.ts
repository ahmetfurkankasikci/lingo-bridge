import Constants from 'expo-constants';

interface AppConfig {
  geminiApiKey: string;
}

const getConfig = (): AppConfig => {
  const extra = Constants.expoConfig?.extra;

  if (!extra?.geminiApiKey) {
    throw new Error(
      'Missing Gemini API key. Please ensure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file.'
    );
  }

  return {
    geminiApiKey: extra.geminiApiKey as string,
  };
};

export const Config = getConfig();
