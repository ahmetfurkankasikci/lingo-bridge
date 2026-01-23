import * as SecureStore from 'expo-secure-store';

const API_KEY_KEY = 'gemini_api_key';

class SecureStoreService {
  private static instance: SecureStoreService;

  private constructor() {}

  public static getInstance(): SecureStoreService {
    if (!SecureStoreService.instance) {
      SecureStoreService.instance = new SecureStoreService();
    }
    return SecureStoreService.instance;
  }

  /**
   * Saves the API key to SecureStore.
   * @param key - The Gemini API key to save.
   */
  async saveApiKey(key: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(API_KEY_KEY, key);
    } catch (error) {
      console.error('Error saving API key to SecureStore:', error);
      throw error;
    }
  }

  /**
   * Retrieves the API key from SecureStore.
   * @returns The stored API key, or null if not found.
   */
  async getApiKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(API_KEY_KEY);
    } catch (error) {
      console.error('Error getting API key from SecureStore:', error);
      throw error;
    }
  }

  /**
   * Deletes the API key from SecureStore.
   */
  async deleteApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(API_KEY_KEY);
    } catch (error) {
      console.error('Error deleting API key from SecureStore:', error);
      throw error;
    }
  }
}

export const secureStoreService = SecureStoreService.getInstance();
