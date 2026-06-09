/**
 * Redux Store Configuration
 * This file sets up the Redux Toolkit store with the pet slice
 * It combines all reducers and configures the store
 */

import { configureStore } from '@reduxjs/toolkit';
import { petReducer } from './petSlice';

/**
 * Create and configure the Redux store
 * Includes middleware for Redux Toolkit's built-in capabilities
 */
export const store = configureStore({
  reducer: {
    pet: petReducer,
  },
  // Middleware is automatically configured by Redux Toolkit
  // Includes thunk middleware for async actions and DevTools support
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for our Date objects (lastOpened timestamp)
      // In production, consider using a proper serialization approach
      serializableCheck: false,
    }),
});

/**
 * TypeScript types for the Redux state
 * These types provide type safety throughout the application
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
