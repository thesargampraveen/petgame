/**
 * usePetDecay Hook
 * Manages the automatic stat decay that occurs while the app is open
 * Features:
 * - Configurable decay interval (default: 1 second)
 * - Automatic cleanup on unmount
 * - Pauses while pet is sleeping
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { applyDecay, selectIsSleeping } from '../redux/petSlice';

/**
 * Props for the usePetDecay hook
 */
interface UsePetDecayProps {
  /** Interval in milliseconds (default: 1000ms = 1 second) */
  intervalMs?: number;
}

/**
 * usePetDecay Hook
 * Sets up a timer that automatically applies stat decay at regular intervals
 */
export const usePetDecay = ({ intervalMs = 1000 }: UsePetDecayProps = {}) => {
  const dispatch = useAppDispatch();
  const isSleeping = useAppSelector(selectIsSleeping);

  // Ref to track the timer ID
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Apply decay dispatch function
   * Wrapped in useCallback for stability
   */
  const applyDecayDispatch = useCallback(() => {
    dispatch(applyDecay());
  }, [dispatch]);

  /**
   * Set up the decay timer
   */
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up new timer
    timerRef.current = setInterval(() => {
      applyDecayDispatch();
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [intervalMs, applyDecayDispatch]);

  /**
   * Reset the decay timer
   * Useful when changing the interval
   */
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(applyDecayDispatch, intervalMs);
  }, [intervalMs, applyDecayDispatch]);

  return {
    isSleeping,
    resetTimer,
  };
};
