/**
 * usePetActions Hook
 * Provides convenient functions for interacting with the pet
 * Wraps Redux dispatch functions with additional logic
 */

import { useCallback } from 'react';
import { useAppDispatch } from './useRedux';
import {
  feedPet,
  playPet,
  sleepPet,
  wakePet,
} from '../redux/petSlice';

/**
 * usePetActions Hook
 * Returns functions for all pet interactions
 */
export const usePetActions = () => {
  const dispatch = useAppDispatch();

  /**
   * Feed the pet
   * Increases hunger and awards XP
   */
  const feed = useCallback(() => {
    dispatch(feedPet());
  }, [dispatch]);

  /**
   * Play with the pet
   * Increases happiness but costs energy, awards XP
   */
  const play = useCallback(() => {
    dispatch(playPet());
  }, [dispatch]);

  /**
   * Put the pet to sleep
   * Energy will regenerate while sleeping
   */
  const sleep = useCallback(() => {
    dispatch(sleepPet());
  }, [dispatch]);

  /**
   * Wake the pet up
   */
  const wake = useCallback(() => {
    dispatch(wakePet());
  }, [dispatch]);

  return {
    feed,
    play,
    sleep,
    wake,
  };
};
