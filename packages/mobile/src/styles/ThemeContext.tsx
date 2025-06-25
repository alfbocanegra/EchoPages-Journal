import React, { createContext, useContext } from 'react';
import { theme as baseTheme } from './theme';

export const ThemeContext = createContext(baseTheme);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme() {
  return useContext(ThemeContext);
}
