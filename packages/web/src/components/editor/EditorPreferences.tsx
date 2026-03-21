import React, { useState, useEffect } from 'react';

const FONT_SIZES = [
  { label: 'Small', value: '0.9rem' },
  { label: 'Medium', value: '1rem' },
  { label: 'Large', value: '1.2rem' },
];

export interface EditorPrefs {
  darkMode: boolean;
  fontSize: string;
}

export const EditorPreferences: React.FC<{
  prefs: EditorPrefs;
  onChange: (prefs: EditorPrefs) => void;
}> = ({ prefs, onChange }) => {
  const [darkMode, setDarkMode] = useState(prefs.darkMode);
  const [fontSize, setFontSize] = useState(prefs.fontSize);

  useEffect(() => {
    setDarkMode(prefs.darkMode);
    setFontSize(prefs.fontSize);
  }, [prefs]);

  useEffect(() => {
    onChange({ darkMode, fontSize });
    localStorage.setItem('editorPrefs', JSON.stringify({ darkMode, fontSize }));
  }, [darkMode, fontSize, onChange]);

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
      <label>
        <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />{' '}
        Dark Mode
      </label>
      <label>
        Font Size:{' '}
        <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={{ padding: 4 }}>
          {FONT_SIZES.map(fs => (
            <option key={fs.value} value={fs.value}>
              {fs.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export function getInitialEditorPrefs(): EditorPrefs {
  try {
    const stored = localStorage.getItem('editorPrefs');
    if (stored) return JSON.parse(stored);
  } catch {
    /* intentionally empty */
  }
  return { darkMode: false, fontSize: '1rem' };
}
