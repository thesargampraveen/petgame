/**
 * MMKV Storage Setup
 * This file configures and exports the MMKV instance for persistent storage
 * MMKV is a fast, efficient key-value storage solution for React Native
 */

import { MMKV } from 'react-native-mmkv';

/**
 * Create a new MMKV instance
 * We use a single instance with encryption disabled for simplicity
 * For production apps, consider enabling encryption with a secure key
 */
export const storage = new MMKV({
  id: 'my-pet-game-storage',
  // encryptionKey: 'your-encryption-key-here', // Optional: enable for sensitive data
});

/**
 * Storage keys - constants for all stored values
 * Using constants prevents typos and makes refactoring easier
 */
export const STORAGE_KEYS = {
  PET_STATE: 'petState',
  LAST_OPENED: 'lastOpened',
  FIRST_LAUNCH: 'firstLaunch',
  SETTINGS: 'settings',
} as const;

/**
 * Generic type-safe storage functions
 * These functions provide TypeScript safety for storage operations
 */

/**
 * Save data to storage
 * @param key - Storage key
 * @param value - Value to store (must be JSON-serializable)
 */
export const saveData = <T>(key: string, value: T): void => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
  }
};

/**
 * Retrieve data from storage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The stored value or default value
 */
export const getData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = storage.getString(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading data for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Remove a specific key from storage
 * @param key - Storage key to remove
 */
export const removeData = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
  }
};

/**
 * Clear all stored data
 * Useful for testing or reset functionality
 */
export const clearAllData = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};

/**
 * Check if a key exists in storage
 * @param key - Storage key to check
 * @returns True if key exists, false otherwise
 */
export const hasKey = (key: string): boolean => {
  try {
    return storage.contains(key);
  } catch (error) {
    console.error(`Error checking key "${key}":`, error);
    return false;
  }
};

/**
 * Get all keys from storage
 * @returns Array of all stored keys
 */
export const getAllKeys = (): string[] => {
  try {
    return storage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};
