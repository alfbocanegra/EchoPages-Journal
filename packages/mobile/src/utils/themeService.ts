import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeOption = 'light' | 'dark' | 'system';
export type FontSizeOption = 'small' | 'medium' | 'large';

const THEME_KEY = 'userTheme';
const ACCENT_COLOR_KEY = 'accentColor';
const FONT_SIZE_KEY = 'fontSize';

export async function getUserTheme(): Promise<ThemeOption> {
  const t = await AsyncStorage.getItem(THEME_KEY);
  if (t === 'light' || t === 'dark' || t === 'system') return t;
  return 'system';
}

export async function setUserTheme(theme: ThemeOption): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

export async function getAccentColor(): Promise<string> {
  const c = await AsyncStorage.getItem(ACCENT_COLOR_KEY);
  return c || '#0288D1'; // Default accent color
}

export async function setAccentColor(color: string): Promise<void> {
  await AsyncStorage.setItem(ACCENT_COLOR_KEY, color);
}

export async function getFontSize(): Promise<FontSizeOption> {
  const f = await AsyncStorage.getItem(FONT_SIZE_KEY);
  if (f === 'small' || f === 'medium' || f === 'large') return f;
  return 'medium';
}

export async function setFontSize(size: FontSizeOption): Promise<void> {
  await AsyncStorage.setItem(FONT_SIZE_KEY, size);
}
