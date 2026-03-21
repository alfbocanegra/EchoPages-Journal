import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { theme as baseTheme, highContrastColors, getTypography } from './theme';

const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#181820',
    surface: '#23232b',
    onBackground: '#F4EFF4',
    onSurface: '#F4EFF4',
    primary: '#8f7cff',
    secondary: '#3a375a',
    outline: '#44445a',
    disabled: '#33334a',
  },
};

const ThemeContext = createContext({
  mode: 'system',
  setMode: (_mode: 'light' | 'dark' | 'system') => {
    /* intentionally empty */
  },
  theme: baseTheme,
  highContrast: false,
  setHighContrast: (_v: boolean) => {
    /* intentionally empty */
  },
  accessibilityMode: false,
  setAccessibilityMode: (_v: boolean) => {
    /* intentionally empty */
  },
});

function setCSSVariables(themeObj: typeof baseTheme, typography: any) {
  const root = document.documentElement;
  Object.entries(themeObj.colors).forEach(([k, v]) => {
    root.style.setProperty(`--color-${k}`, v);
  });
  Object.entries(themeObj.shape.borderRadius).forEach(([k, v]) => {
    root.style.setProperty(`--radius-${k}`, v + 'px');
  });
  Object.entries(typography.fontSize).forEach(([k, v]) => {
    root.style.setProperty(`--font-size-${k}`, v + 'px');
  });
  root.style.setProperty('--font-family', typography.fontFamily);
  Object.entries(themeObj.spacing).forEach(([, v], i) => {
    root.style.setProperty(`--spacing-${i}`, v + 'px');
  });
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
  const [highContrast, setHighContrast] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const theme = useMemo(() => {
    let t = baseTheme;
    if (mode === 'light') t = baseTheme;
    else if (mode === 'dark') t = darkTheme;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      t = darkTheme;
    if (highContrast) {
      t = { ...t, colors: { ...t.colors, ...highContrastColors } };
    }
    return t;
  }, [mode, highContrast]);

  useEffect(() => {
    setCSSVariables(theme, getTypography(accessibilityMode));
  }, [theme, accessibilityMode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        theme,
        highContrast,
        setHighContrast,
        accessibilityMode,
        setAccessibilityMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
