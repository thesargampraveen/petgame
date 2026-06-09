/**
 * Offline Decay Utility
 * This file handles calculating stat decay that occurs while the app is closed
 * It ensures fair gameplay by preventing excessive punishment for long absences
 */

import { PetStats } from '../types';
import { DECAY_RATES, OFFLINE_DECAY_CONFIG } from './constants';

/**
 * Calculate how much time has passed since the last app session
 * @param lastOpened - Timestamp of when the app was last opened
 * @returns The elapsed time in seconds (capped at MAX_DECAY_HOURS)
 */
export const calculateElapsedTime = (lastOpened: number): number => {
  const currentTime = Date.now();
  const elapsedMs = currentTime - lastOpened;
  const elapsedSeconds = elapsedMs / 1000;

  // Cap the elapsed time to prevent excessive punishment
  const maxElapsedSeconds = OFFLINE_DECAY_CONFIG.MAX_DECAY_HOURS * OFFLINE_DECAY_CONFIG.SECONDS_PER_HOUR;

  return Math.min(elapsedSeconds, maxElapsedSeconds);
};

/**
 * Calculate the decayed stats after being away from the app
 * This function:
 * 1. Calculates time elapsed
 * 2. Applies decay rates to each stat
 * 3. Ensures stats don't drop below a minimum threshold (40%)
 *
 * @param currentStats - Current pet stats before decay
 * @param lastOpened - Timestamp when app was last opened
 * @returns New stats after applying offline decay
 */
export const calculateOfflineDecay = (currentStats: PetStats, lastOpened: number): PetStats => {
  // Calculate elapsed time in seconds
  const elapsedSeconds = calculateElapsedTime(lastOpened);

  // If the elapsed time is very short (< 10 seconds), don't apply any decay
  // This prevents decay during quick app switching
  if (elapsedSeconds < 10) {
    return currentStats;
  }

  // Calculate decay for each stat
  const hungerDecay = elapsedSeconds * DECAY_RATES.HUNGER_PER_SECOND;
  const energyDecay = elapsedSeconds * DECAY_RATES.ENERGY_PER_SECOND;
  const happinessDecay = elapsedSeconds * DECAY_RATES.HAPPINESS_PER_SECOND;

  // Apply decay with minimum floor of 40 (max decay of 60)
  // This ensures the pet is never in a completely hopeless state
  const newStats: PetStats = {
    hunger: Math.max(40, currentStats.hunger - Math.min(hungerDecay, OFFLINE_DECAY_CONFIG.MAX_OFFLINE_DECAY)),
    energy: Math.max(40, currentStats.energy - Math.min(energyDecay, OFFLINE_DECAY_CONFIG.MAX_OFFLINE_DECAY)),
    happiness: Math.max(40, currentStats.happiness - Math.min(happinessDecay, OFFLINE_DECAY_CONFIG.MAX_OFFLINE_DECAY)),
  };

  return newStats;
};

/**
 * Calculate in-app decay (stats decrease while playing)
 * This is called every second while the app is open
 *
 * @param currentStats - Current pet stats
 * @returns New stats after applying one second of decay
 */
export const calculateInAppDecay = (currentStats: PetStats): PetStats => {
  return {
    hunger: Math.max(0, currentStats.hunger - DECAY_RATES.HUNGER_PER_SECOND),
    energy: Math.max(0, currentStats.energy - DECAY_RATES.ENERGY_PER_SECOND),
    happiness: Math.max(0, currentStats.happiness - DECAY_RATES.HAPPINESS_PER_SECOND),
  };
};

/**
 * Calculate energy regeneration while sleeping
 * Energy recovers faster while the pet is sleeping
 *
 * @param currentEnergy - Current energy value
 * @returns New energy value after one second of sleep
 */
export const calculateSleepRegeneration = (currentEnergy: number): number => {
  const regenerationRate = DECAY_RATES.ENERGY_PER_SECOND * 5; // 5x faster recovery
  return Math.min(100, currentEnergy + regenerationRate);
};

/**
 * Get a human-readable string describing how long the player was away
 * Useful for showing a "Welcome back!" message
 *
 * @param lastOpened - Timestamp when app was last opened
 * @returns A friendly string describing the time away
 */
export const getTimeAwayMessage = (lastOpened: number): string => {
  const elapsedSeconds = calculateElapsedTime(lastOpened);

  if (elapsedSeconds < 60) {
    return 'Welcome back!';
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `Welcome back! You were away for ${elapsedMinutes} minute${elapsedMinutes > 1 ? 's' : ''}.`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  if (elapsedHours < 24) {
    return `Welcome back! You were away for ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}.`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Welcome back! You were away for ${elapsedDays} day${elapsedDays > 1 ? 's' : ''}.`;
};
