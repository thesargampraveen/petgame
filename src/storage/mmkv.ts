/**
 * AsyncStorage Setup
 * This file configures and exports AsyncStorage for persistent storage
 * AsyncStorage is a simple key-value storage solution for React Native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
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
export const getData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue != null) {
      return JSON.parse(jsonValue) as T;
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
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
  }
};

/**
 * Clear all stored data
 * Useful for testing or reset functionality
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};

/**
 * Check if a key exists in storage
 * @param key - Storage key to check
 * @returns True if key exists, false otherwise
 */
export const hasKey = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key "${key}":`, error);
    return false;
  }
};

/**
 * Get all keys from storage
 * @returns Array of all stored keys
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};
