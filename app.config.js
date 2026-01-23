import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: ['expo-secure-store'],
  extra: {
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  },
});
