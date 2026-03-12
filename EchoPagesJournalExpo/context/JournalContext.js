import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12');
  const [theme, setTheme] = useState('device');

  // Load entries and preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('journalEntries');
        if (stored) setEntries(JSON.parse(stored));
        const storedDateFormat = await AsyncStorage.getItem('dateFormat');
        if (storedDateFormat) setDateFormat(storedDateFormat);
        const storedTimeFormat = await AsyncStorage.getItem('timeFormat');
        if (storedTimeFormat) setTimeFormat(storedTimeFormat);
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) setTheme(storedTheme);
      } catch (e) {
        Alert.alert('Error', 'Failed to load journal entries.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save entries to AsyncStorage on change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
    }
  }, [entries, loading]);

  // Save date/time format and theme preferences
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('dateFormat', dateFormat);
      AsyncStorage.setItem('timeFormat', timeFormat);
      AsyncStorage.setItem('theme', theme);
    }
  }, [dateFormat, timeFormat, theme, loading]);

  const addEntry = entry => {
    setEntries(prev => [{ ...entry, id: Date.now().toString() }, ...prev]);
  };

  const updateEntry = (id, updated) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteEntry = id => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  function getEntryById(id) {
    return entries.find(e => e.id === id);
  }

  return (
    <JournalContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntryById,
        loading,
        dateFormat,
        setDateFormat,
        timeFormat,
        setTimeFormat,
        theme,
        setTheme,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

JournalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useJournal() {
  return useContext(JournalContext);
}

export function useAppColorScheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const { theme } = useJournal();
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return deviceColorScheme === 'dark' ? 'dark' : 'light';
}
