import { configureStore } from '@reduxjs/toolkit';
import habitsReducer from './slices/habitsSlice';
// Import other reducers here as needed

export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
