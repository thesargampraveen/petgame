/**
 * Pet Slice
 * This is the main Redux slice that manages all pet state
 * It includes reducers for all pet actions and persistence logic
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PetState, PetStats, PetMood, PetAction } from '../types';
import { saveData, getData, STORAGE_KEYS } from '../storage/mmkv';
import {
  calculateOfflineDecay,
  calculateInAppDecay,
  calculateSleepRegeneration,
  getTimeAwayMessage,
} from '../utils/offlineDecay';
import {
  ACTION_BENEFITS,
  XP_CONFIG,
  MOOD_THRESHOLDS,
  DECAY_RATES,
  getXPForLevel,
} from '../utils/constants';

/**
 * Initial state for a new pet
 * All stats start at 100 (perfect condition)
 */
const createInitialPetState = (): PetState => ({
  stats: {
    hunger: 100,
    energy: 100,
    happiness: 100,
  },
  xp: 0,
  level: 1,
  lastOpened: Date.now(),
  isSleeping: false,
  mood: PetMood.HAPPY,
});

/**
 * Calculate the pet's mood based on current stats
 * The mood determines which animations and expressions are shown
 */
const calculateMood = (stats: PetStats, isSleeping: boolean): PetMood => {
  // If sleeping, override everything
  if (isSleeping) {
    return PetMood.SLEEPING;
  }

  const { hunger, energy, happiness } = stats;
  const lowestStat = Math.min(hunger, energy, happiness);

  // Critical state - any stat is very low
  if (lowestStat < MOOD_THRESHOLDS.CRITICAL) {
    return PetMood.CRITICAL;
  }

  // Sad state - any stat is low
  if (lowestStat < MOOD_THRESHOLDS.SAD) {
    return PetMood.SAD;
  }

  // Excited state - all stats are very high
  if (lowestStat >= MOOD_THRESHOLDS.EXCITED) {
    return PetMood.EXCITED;
  }

  // Happy state - all stats are good
  if (lowestStat >= MOOD_THRESHOLDS.HAPPY) {
    return PetMood.HAPPY;
  }

  // Default idle state
  return PetMood.IDLE;
};

/**
 * Calculate XP gained from an action
 * Awards bonus XP when stats are well-maintained
 */
const calculateXP = (stats: PetStats): number => {
  const averageStat = (stats.hunger + stats.energy + stats.happiness) / 3;

  // Bonus XP multiplier for keeping stats high
  const bonusMultiplier = averageStat >= 70 ? XP_CONFIG.XP_BONUS_MULTIPLIER : 1;

  return Math.floor(XP_CONFIG.XP_PER_ACTION * bonusMultiplier);
};

/**
 * Check and process level ups based on current XP
 * Returns the new level (same if no level up occurred)
 */
const processLevelUp = (currentXP: number, currentLevel: number): number => {
  const xpForNextLevel = getXPForLevel(currentLevel + 1);

  if (currentXP >= xpForNextLevel) {
    // Level up! Calculate new level
    let newLevel = currentLevel + 1;

    // Check for multiple level ups (if lots of XP gained)
    while (newLevel > 1 && currentXP >= getXPForLevel(newLevel + 1)) {
      newLevel++;
    }

    return newLevel;
  }

  return currentLevel;
};

/**
 * Async thunk to initialize pet state from storage
 * This should be called when the app first loads
 * Handles offline decay calculation
 */
export const initializePet = createAsyncThunk(
  'pet/initialize',
  async () => {
    try {
      const savedState = await getData<PetState | null>(STORAGE_KEYS.PET_STATE, null);

      if (savedState) {
        // Apply offline decay to loaded stats
        const decayedStats = calculateOfflineDecay(savedState.stats, savedState.lastOpened);

        return {
          stats: decayedStats,
          xp: savedState.xp,
          level: savedState.level,
          lastOpened: Date.now(),
          isSleeping: false, // Always wake up when returning to app
          mood: calculateMood(decayedStats, false),
        };
      }

      // First time playing - return initial state
      return createInitialPetState();
    } catch (error) {
      console.error('Error initializing pet state:', error);
      return createInitialPetState();
    }
  }
);

/**
 * Async thunk to save pet state to storage
 */
const persistState = async (state: PetState): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.PET_STATE, state);
  } catch (error) {
    console.error('Error saving pet state:', error);
  }
};

/**
 * Pet Slice
 * Manages all pet state and actions
 */
const petSlice = createSlice({
  name: 'pet',
  initialState: createInitialPetState(),
  reducers: {
    /**
     * Feed the pet
     * Increases hunger stat and awards XP
     */
    feedPet: (state) => {
      // Can't feed while sleeping
      if (state.isSleeping) return;

      // Apply benefit
      state.stats.hunger = Math.min(100, state.stats.hunger + ACTION_BENEFITS.FEED_HUNGER);

      // Award XP
      state.xp += calculateXP(state.stats);

      // Check for level up
      state.level = processLevelUp(state.xp, state.level);

      // Update mood
      state.mood = calculateMood(state.stats, state.isSleeping);

      // Trigger async save (fire and forget)
      persistState(state as PetState);
    },

    /**
     * Play with the pet
     * Increases happiness but costs energy, awards XP
     */
    playPet: (state) => {
      // Can't play while sleeping
      if (state.isSleeping) return;

      // Apply benefits and costs
      state.stats.happiness = Math.min(100, state.stats.happiness + ACTION_BENEFITS.PLAY_HAPPINESS);
      state.stats.energy = Math.max(0, state.stats.energy - 10); // Playing costs energy
      state.stats.hunger = Math.max(0, state.stats.hunger - 5);  // Playing makes hungry

      // Award XP
      state.xp += calculateXP(state.stats);

      // Check for level up
      state.level = processLevelUp(state.xp, state.level);

      // Update mood
      state.mood = calculateMood(state.stats, state.isSleeping);

      // Trigger async save
      persistState(state as PetState);
    },

    /**
     * Put the pet to sleep
     * Energy will regenerate while sleeping
     */
    sleepPet: (state) => {
      if (state.isSleeping) return; // Already sleeping

      state.isSleeping = true;
      state.mood = PetMood.SLEEPING;

      // Trigger async save
      persistState(state as PetState);
    },

    /**
     * Wake the pet up
     */
    wakePet: (state) => {
      if (!state.isSleeping) return; // Already awake

      state.isSleeping = false;
      state.mood = calculateMood(state.stats, false);

      // Trigger async save
      persistState(state as PetState);
    },

    /**
     * Apply stat decay (called every second while app is open)
     * This represents natural stat decrease over time
     */
    applyDecay: (state) => {
      if (state.isSleeping) {
        // While sleeping, energy regenerates instead of decaying
        state.stats.energy = calculateSleepRegeneration(state.stats.energy);
        // Other stats still decay slowly even while sleeping
        state.stats.hunger = Math.max(0, state.stats.hunger - DECAY_RATES.HUNGER_PER_SECOND * 0.5);
        state.stats.happiness = Math.max(0, state.stats.happiness - DECAY_RATES.HAPPINESS_PER_SECOND * 0.5);
      } else {
        // Normal decay when awake
        state.stats = calculateInAppDecay(state.stats);
      }

      // Update mood
      state.mood = calculateMood(state.stats, state.isSleeping);

      // Trigger async save (you might want to throttle this)
      persistState(state as PetState);
    },

    /**
     * Reset the pet to initial state
     * Useful for testing or starting over
     */
    resetPet: (state) => {
      const initialState = createInitialPetState();
      Object.assign(state, initialState);
      persistState(state as PetState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePet.fulfilled, (state, action) => {
        // Update state with loaded data
        Object.assign(state, action.payload);
        // Save the loaded state
        persistState(state as PetState);
      });
  },
});

// Export actions
export const {
  feedPet,
  playPet,
  sleepPet,
  wakePet,
  applyDecay,
  resetPet,
} = petSlice.actions;

// Export reducer
export const petReducer = petSlice.reducer;

// Export selectors for accessing state
export const selectPetState = (state: { pet: PetState }) => state.pet;
export const selectPetStats = (state: { pet: PetState }) => state.pet.stats;
export const selectPetMood = (state: { pet: PetState }) => state.pet.mood;
export const selectPetLevel = (state: { pet: PetState }) => state.pet.level;
export const selectPetXP = (state: { pet: PetState }) => state.pet.xp;
export const selectIsSleeping = (state: { pet: PetState }) => state.pet.isSleeping;

// Helper selector to get XP needed for next level
export const selectXPToNextLevel = (state: { pet: PetState }) => {
  const currentLevel = state.pet.level;
  const currentXP = state.pet.xp;
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  return Math.max(0, xpForNextLevel - currentXP);
};

// Helper selector to check if pet needs attention (any stat below 30)
export const selectPetNeedsAttention = (state: { pet: PetState }) => {
  const { hunger, energy, happiness } = state.pet.stats;
  return hunger < 30 || energy < 30 || happiness < 30;
};
