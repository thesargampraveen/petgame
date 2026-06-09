/**
 * Game Constants
 * This file contains all the constant values used throughout the application
 * Centralizing constants makes it easy to tune game balance
 */

import { PetMood } from '../types';

/**
 * Stat Decay Constants
 * How much each stat decreases per tick (every second while app is open)
 */
export const DECAY_RATES = {
  HUNGER_PER_SECOND: 0.5,      // Loses 0.5 hunger per second
  ENERGY_PER_SECOND: 0.3,      // Loses 0.3 energy per second
  HAPPINESS_PER_SECOND: 0.4,   // Loses 0.4 happiness per second
};

/**
 * Offline Decay Constants
 * How stats decay while the app is closed
 */
export const OFFLINE_DECAY_CONFIG = {
  MAX_DECAY_HOURS: 8,           // Maximum offline time to calculate decay for (prevents excessive punishment)
  SECONDS_PER_HOUR: 3600,       // Used for calculations
  MAX_OFFLINE_DECAY: 60,        // Maximum amount any stat can decrease offline (0-60, so they won't go below 40)
};

/**
 * Action Benefits
 * How much each action increases the corresponding stat
 */
export const ACTION_BENEFITS = {
  FEED_HUNGER: 25,              // Feeding increases hunger by 25
  PLAY_HAPPINESS: 20,           // Playing increases happiness by 20
  SLEEP_ENERGY_PER_SECOND: 5,   // Energy regenerates while sleeping
};

/**
 * XP and Leveling System
 */
export const XP_CONFIG = {
  XP_PER_ACTION: 10,            // Base XP gained per action
  XP_BONUS_MULTIPLIER: 1.5,     // XP multiplier when stats are high
  BASE_LEVEL_THRESHOLD: 100,    // XP needed for level 2
  THRESHOLD_MULTIPLIER: 1.2,    // Each level requires 1.2x more XP than the previous
};

/**
 * Stat Thresholds for Mood Determination
 * Used to determine the pet's emotional state based on its stats
 */
export const MOOD_THRESHOLDS = {
  CRITICAL: 20,                 // Any stat below 20 = critical state
  SAD: 40,                      // Any stat below 40 = sad state
  HAPPY: 70,                    // All stats above 70 = happy state
  EXCITED: 90,                  // All stats above 90 = excited state
};

/**
 * Animation Constants
 * Timing and values for Reanimated animations
 */
export const ANIMATION_CONFIG = {
  BOUNCE_DURATION: 600,
  BOUNCE_SCALE: 1.15,
  SHAKE_DURATION: 400,
  SHAKE_ROTATION: 5,
  FLOAT_DURATION: 2000,
  PARTICLE_DURATION: 1500,
  TRANSITION_DURATION: 300,
};

/**
 * UI Constants
 */
export const UI_CONFIG = {
  STAT_BAR_HEIGHT: 24,
  BUTTON_HEIGHT: 56,
  BUTTON_BORDER_RADIUS: 28,
  CARD_BORDER_RADIUS: 20,
  PET_SIZE: 180,
  PARTICLE_SIZE: 24,
};

/**
 * Color Palette
 * Cute, vibrant colors for the pet game
 */
export const COLORS = {
  // Stat bar colors
  HUNGER_HIGH: '#4CAF50',        // Green
  HUNGER_MEDIUM: '#FFC107',      // Amber
  HUNGER_LOW: '#F44336',         // Red

  ENERGY_HIGH: '#2196F3',        // Blue
  ENERGY_MEDIUM: '#FFC107',      // Amber
  ENERGY_LOW: '#F44336',         // Red

  HAPPINESS_HIGH: '#FF9800',     // Orange
  HAPPINESS_MEDIUM: '#FFC107',   // Amber
  HAPPINESS_LOW: '#9E9E9E',      // Gray

  // UI colors
  PRIMARY: '#6C63FF',            // Purple
  SECONDARY: '#FF6584',          // Pink
  BACKGROUND: '#F5F5F7',         // Light gray
  CARD: '#FFFFFF',               // White
  TEXT_PRIMARY: '#2D2D2D',       // Dark gray
  TEXT_SECONDARY: '#757575',     // Medium gray

  // Mood-based background colors
  HAPPY_BG: '#FFF3E0',
  SAD_BG: '#ECEFF1',
  CRITICAL_BG: '#FFEBEE',
  SLEEPING_BG: '#E8EAF6',
};

/**
 * Helper function to get the appropriate color for a stat value
 * @param value - Current stat value (0-100)
 * @param statType - Which stat to get color for
 * @returns The color string for the current stat level
 */
export const getStatColor = (value: number, statType: 'hunger' | 'energy' | 'happiness'): string => {
  if (value >= 70) {
    return statType === 'hunger' ? COLORS.HUNGER_HIGH :
           statType === 'energy' ? COLORS.ENERGY_HIGH :
           COLORS.HAPPINESS_HIGH;
  } else if (value >= 40) {
    return COLORS.HUNGER_MEDIUM;
  } else {
    return statType === 'happiness' ? COLORS.HAPPINESS_LOW : COLORS.HUNGER_LOW;
  }
};

/**
 * Calculate XP needed for a specific level
 * Uses exponential growth formula
 * @param level - Target level
 * @returns Total XP needed to reach that level
 */
export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(
    XP_CONFIG.BASE_LEVEL_THRESHOLD *
    Math.pow(XP_CONFIG.THRESHOLD_MULTIPLIER, level - 2)
  );
};

/**
 * Get title for a level
 * @param level - Current level
 * @returns The title string for that level
 */
export const getLevelTitle = (level: number): string => {
  const titles: Record<number, string> = {
    1: 'Novice',
    5: 'Apprentice',
    10: 'Friend',
    15: 'Best Friend',
    20: 'Pet Master',
    25: 'Legend',
  };

  // Find the highest title threshold the player has passed
  let title = 'Novice';
  for (const [lvl, ttl] of Object.entries(titles)) {
    if (level >= parseInt(lvl)) {
      title = ttl;
    }
  }
  return title;
};
