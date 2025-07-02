import React from 'react';
import ThemeButton from './ThemeButton';
import { useTheme } from '../../styles/ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, highContrast, setHighContrast, accessibilityMode, setAccessibilityMode } =
    useTheme();

  return (
    <div
      style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <ThemeButton
        title="Light"
        variant={mode === 'light' ? 'primary' : 'outline'}
        onClick={() => setMode('light')}
        aria-label="Switch to light theme"
      />
      <ThemeButton
        title="Dark"
        variant={mode === 'dark' ? 'primary' : 'outline'}
        onClick={() => setMode('dark')}
        aria-label="Switch to dark theme"
      />
      <ThemeButton
        title="System"
        variant={mode === 'system' ? 'primary' : 'outline'}
        onClick={() => setMode('system')}
        aria-label="Switch to system theme"
      />
      <label
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 16, fontSize: 14 }}
      >
        <input
          type="checkbox"
          checked={highContrast}
          onChange={e => setHighContrast(e.target.checked)}
          aria-label="Enable high contrast mode"
          style={{ marginRight: 4 }}
        />
        High Contrast
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={accessibilityMode}
          onChange={e => setAccessibilityMode(e.target.checked)}
          aria-label="Enable accessibility mode (large text)"
          style={{ marginRight: 4 }}
        />
        Accessibility Mode
      </label>
    </div>
  );
};

export default ThemeSwitcher;
