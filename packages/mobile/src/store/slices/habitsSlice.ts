import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getStreak,
  setStreak,
  getGoals,
  addGoal,
  updateGoal,
  removeGoal,
  getReminders,
  addReminder,
  updateReminder,
  removeReminder,
  getAchievements,
  addAchievement,
  hasAchievement,
  HabitStreak,
  HabitGoal,
  HabitReminder,
  HabitAchievement,
} from '../../../../shared/src/database/services/HabitTrackingService';

/**
 * habitsSlice
 * Redux Toolkit slice for habit tracking (streaks, goals, reminders, achievements)
 *
 * Async thunks:
 *   - loadHabits
 *   - saveStreak
 *   - addGoalAsync, updateGoalAsync, removeGoalAsync
 *   - addReminderAsync, updateReminderAsync, removeReminderAsync
 *   - addAchievementAsync
 *
 * Selectors:
 *   - selectStreak, selectGoals, selectReminders, selectAchievements
 */

export interface HabitsState {
  streak: HabitStreak | null;
  goals: HabitGoal[];
  reminders: HabitReminder[];
  achievements: HabitAchievement[];
  loading: boolean;
  error: string | null;
}

const initialState: HabitsState = {
  streak: null,
  goals: [],
  reminders: [],
  achievements: [],
  loading: false,
  error: null,
};

export const loadHabits = createAsyncThunk('habits/loadHabits', async () => {
  const [streak, goals, reminders, achievements] = await Promise.all([
    getStreak(),
    getGoals(),
    getReminders(),
    getAchievements(),
  ]);
  return { streak, goals, reminders, achievements };
});

export const saveStreak = createAsyncThunk('habits/saveStreak', async (streak: HabitStreak) => {
  await setStreak(streak);
  return streak;
});

export const addGoalAsync = createAsyncThunk('habits/addGoal', async (goal: HabitGoal) => {
  await addGoal(goal);
  return goal;
});

export const updateGoalAsync = createAsyncThunk('habits/updateGoal', async (goal: HabitGoal) => {
  await updateGoal(goal);
  return goal;
});

export const removeGoalAsync = createAsyncThunk('habits/removeGoal', async (goalId: string) => {
  await removeGoal(goalId);
  return goalId;
});

export const addReminderAsync = createAsyncThunk(
  'habits/addReminder',
  async (reminder: HabitReminder) => {
    await addReminder(reminder);
    return reminder;
  }
);

export const updateReminderAsync = createAsyncThunk(
  'habits/updateReminder',
  async (reminder: HabitReminder) => {
    await updateReminder(reminder);
    return reminder;
  }
);

export const removeReminderAsync = createAsyncThunk(
  'habits/removeReminder',
  async (reminderId: string) => {
    await removeReminder(reminderId);
    return reminderId;
  }
);

export const addAchievementAsync = createAsyncThunk(
  'habits/addAchievement',
  async (achievement: HabitAchievement) => {
    await addAchievement(achievement);
    return achievement;
  }
);

export const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadHabits.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHabits.fulfilled, (state, action) => {
        state.streak = action.payload.streak;
        state.goals = action.payload.goals;
        state.reminders = action.payload.reminders;
        state.achievements = action.payload.achievements;
        state.loading = false;
      })
      .addCase(loadHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load habits';
      })
      .addCase(saveStreak.fulfilled, (state, action) => {
        state.streak = action.payload;
      })
      .addCase(addGoalAsync.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(updateGoalAsync.fulfilled, (state, action) => {
        const idx = state.goals.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) state.goals[idx] = action.payload;
      })
      .addCase(removeGoalAsync.fulfilled, (state, action) => {
        state.goals = state.goals.filter(g => g.id !== action.payload);
      })
      .addCase(addReminderAsync.fulfilled, (state, action) => {
        state.reminders.push(action.payload);
      })
      .addCase(updateReminderAsync.fulfilled, (state, action) => {
        const idx = state.reminders.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.reminders[idx] = action.payload;
      })
      .addCase(removeReminderAsync.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(r => r.id !== action.payload);
      })
      .addCase(addAchievementAsync.fulfilled, (state, action) => {
        state.achievements.push(action.payload);
      });
  },
});

// Selectors
export const selectStreak = (state: { habits: HabitsState }) => state.habits.streak;
export const selectGoals = (state: { habits: HabitsState }) => state.habits.goals;
export const selectReminders = (state: { habits: HabitsState }) => state.habits.reminders;
export const selectAchievements = (state: { habits: HabitsState }) => state.habits.achievements;
export const selectHabitsLoading = (state: { habits: HabitsState }) => state.habits.loading;
export const selectHabitsError = (state: { habits: HabitsState }) => state.habits.error;

export default habitsSlice.reducer;
