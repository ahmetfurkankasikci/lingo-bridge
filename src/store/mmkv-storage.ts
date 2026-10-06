// Shared MMKV instance and Zustand persist adapter used by all stores

import { createMMKV } from 'react-native-mmkv';

// Initialize MMKV for high-performance local storage
const storage = createMMKV();

// Adapter to make MMKV compatible with Zustand's persist middleware
export const zustandStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value); // Save JSON string to MMKV
  },
  getItem: (name: string) => {
    const value = storage.getString(name); // Retrieve JSON string from MMKV
    return value ?? null; // Return null if not found (Zustand expects this)
  },
  removeItem: (name: string) => {
    storage.remove(name); // Delete from MMKV
    return Promise.resolve(); // Zustand expects a Promise
  },
};
