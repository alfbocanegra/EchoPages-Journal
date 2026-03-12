/**
 * HabitTrackingService
 * Cross-platform service for managing habit tracking data:
 * - Streaks (current, best)
 * - Goals (target, progress, completed)
 * - Reminders (time, frequency, enabled)
 * - Achievements (id, unlockedAt)
 *
 * Storage is pluggable (default: AsyncStorage for React Native, can be replaced for web/desktop).
 *
 * Types:
 *   - HabitStreak
 *   - HabitGoal
 *   - HabitReminder
 *   - HabitAchievement
 *
 * API:
 *   - getStreak(), setStreak()
 *   - getGoals(), addGoal(), updateGoal(), removeGoal()
 *   - getReminders(), addReminder(), updateReminder(), removeReminder()
 *   - getAchievements(), addAchievement(), hasAchievement()
 */

// Platform-agnostic storage interface
interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// Default storage implementation (can be overridden)
let storage: StorageInterface = {
  getItem: async (key: string) => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem(key, value);
    }
  },
};

// Function to set custom storage implementation
export function setStorage(customStorage: StorageInterface): void {
  storage = customStorage;
}

export interface HabitStreak {
  current: number;
  best: number;
  lastEntryDate: string; // ISO date
}

export interface HabitGoal {
  id: string;
  type: 'days' | 'entries';
  target: number;
  progress: number;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  completed: boolean;
}

export interface HabitReminder {
  id: string;
  time: string; // 'HH:mm' 24h format
  frequency: 'daily' | 'weekly';
  enabled: boolean;
  daysOfWeek?: number[]; // 0=Sun, 6=Sat (for weekly)
  notificationId?: string; // Optional: local notification ID for scheduled reminders
}

export interface HabitAchievement {
  id: string;
  unlockedAt: string; // ISO date
}

const STREAK_KEY = 'habit_streak';
const GOALS_KEY = 'habit_goals';
const REMINDERS_KEY = 'habit_reminders';
const ACHIEVEMENTS_KEY = 'habit_achievements';

// --- Streaks ---
export async function getStreak(): Promise<HabitStreak | null> {
  const raw = await storage.getItem(STREAK_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setStreak(streak: HabitStreak): Promise<void> {
  await storage.setItem(STREAK_KEY, JSON.stringify(streak));
}

// --- Goals ---
export async function getGoals(): Promise<HabitGoal[]> {
  const raw = await storage.getItem(GOALS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addGoal(goal: HabitGoal): Promise<void> {
  const goals = await getGoals();
  goals.push(goal);
  await storage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export async function updateGoal(goal: HabitGoal): Promise<void> {
  const goals = await getGoals();
  const idx = goals.findIndex(g => g.id === goal.id);
  if (idx !== -1) {
    goals[idx] = goal;
    await storage.setItem(GOALS_KEY, JSON.stringify(goals));
  }
}

export async function removeGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  await storage.setItem(GOALS_KEY, JSON.stringify(filtered));
}

// --- Reminders ---
export async function getReminders(): Promise<HabitReminder[]> {
  const raw = await storage.getItem(REMINDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addReminder(reminder: HabitReminder): Promise<void> {
  const reminders = await getReminders();
  reminders.push(reminder);
  await storage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export async function updateReminder(reminder: HabitReminder): Promise<void> {
  const reminders = await getReminders();
  const idx = reminders.findIndex(r => r.id === reminder.id);
  if (idx !== -1) {
    reminders[idx] = reminder;
    await storage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }
}

export async function removeReminder(reminderId: string): Promise<void> {
  const reminders = await getReminders();
  const filtered = reminders.filter(r => r.id !== reminderId);
  await storage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
}

// --- Achievements ---
export async function getAchievements(): Promise<HabitAchievement[]> {
  const raw = await storage.getItem(ACHIEVEMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addAchievement(achievement: HabitAchievement): Promise<void> {
  const achievements = await getAchievements();
  achievements.push(achievement);
  await storage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export async function hasAchievement(id: string): Promise<boolean> {
  const achievements = await getAchievements();
  return achievements.some(a => a.id === id);
}
