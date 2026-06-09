/**
 * Main type definitions for the Pet Game
 * This file defines all TypeScript interfaces used throughout the application
 */

/**
 * PetStats interface - represents the three core stats of the pet
 * Each stat ranges from 0-100
 */
export interface PetStats {
  hunger: number;      // 0 = starving, 100 = full
  energy: number;      // 0 = exhausted, 100 = fully rested
  happiness: number;   // 0 = miserable, 100 = elated
}

/**
 * PetState interface - represents the complete state of the pet
 * Includes stats, progression data, and metadata
 */
export interface PetState {
  stats: PetStats;
  xp: number;
  level: number;
  lastOpened: number;  // Timestamp when app was last opened
  isSleeping: boolean;
  mood: PetMood;
}

/**
 * PetMood enum - represents the emotional state of the pet
 * Used to determine which animations and expressions to show
 */
export enum PetMood {
  HAPPY = 'happy',
  SAD = 'sad',
  SLEEPING = 'sleeping',
  IDLE = 'idle',
  EXCITED = 'excited',
  CRITICAL = 'critical'  // When any stat is critically low
}

/**
 * PetAction enum - represents all possible actions the user can take
 */
export enum PetAction {
  FEED = 'feed',
  PLAY = 'play',
  SLEEP = 'sleep',
  WAKE = 'wake'
}

/**
 * LevelReward interface - defines rewards for reaching certain levels
 * Can be expanded to include unlocks, new animations, etc.
 */
export interface LevelReward {
  level: number;
  xpRequired: number;
  title: string;
}

/**
 * AnimationConfig interface - configuration for Reanimated animations
 */
export interface AnimationConfig {
  duration: number;
  easing: (value: number) => number;
}

/**
 * ParticleConfig interface - configuration for particle effects
 */
export interface ParticleConfig {
  type: 'heart' | 'star' | 'zzz' | 'sparkle';
  count: number;
  duration: number;
}
