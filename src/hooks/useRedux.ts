/**
 * useRedux Hooks
 * Typed versions of the Redux hooks for this application
 * Provides TypeScript type safety for Redux usage
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';

/**
 * Typed useDispatch hook
 * Use this instead of the plain useDispatch for type safety
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 * Use this instead of the plain useSelector for type safety
 *
 * @param selector - A function that selects from the root state
 * @returns The selected state with proper typing
 */
export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};
