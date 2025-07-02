import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

const JournalContext = createContext();

// Action types
const ACTIONS = {
  LOAD_ENTRIES: 'LOAD_ENTRIES',
  ADD_ENTRY: 'ADD_ENTRY',
  UPDATE_ENTRY: 'UPDATE_ENTRY',
  DELETE_ENTRY: 'DELETE_ENTRY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTER: 'SET_FILTER',
};

// Initial state
const initialState = {
  entries: [],
  loading: false,
  error: null,
  searchQuery: '',
  filter: 'all', // 'all', 'today', 'week', 'month'
};

// Reducer
function journalReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_ENTRIES:
      return {
        ...state,
        entries: action.payload,
        loading: false,
      };
    case ACTIONS.ADD_ENTRY:
      return {
        ...state,
        entries: [action.payload, ...state.entries],
      };
    case ACTIONS.UPDATE_ENTRY:
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        ),
      };
    case ACTIONS.DELETE_ENTRY:
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload),
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };
    default:
      return state;
  }
}

// Storage keys
const STORAGE_KEY = '@journal_entries';

export function JournalProvider({ children }) {
  const [state, dispatch] = useReducer(journalReducer, initialState);

  // Load entries from storage on app start
  useEffect(() => {
    loadEntries();
  }, []);

  // Save entries to storage whenever entries change
  useEffect(() => {
    if (state.entries.length > 0) {
      saveEntries(state.entries);
    }
  }, [state.entries]);

  // Load entries from AsyncStorage
  const loadEntries = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        // Sort entries by creation date (newest first)
        const sortedEntries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        dispatch({ type: ACTIONS.LOAD_ENTRIES, payload: sortedEntries });
      } else {
        dispatch({ type: ACTIONS.LOAD_ENTRIES, payload: [] });
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load entries' });
    }
  };

  // Save entries to AsyncStorage
  const saveEntries = async entries => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entries:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to save entries' });
    }
  };

  // Add new entry
  const addEntry = async entryData => {
    try {
      const newEntry = {
        id: generateId(),
        ...entryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: ACTIONS.ADD_ENTRY, payload: newEntry });
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to add entry' });
      throw error;
    }
  };

  // Update existing entry
  const updateEntry = async (entryId, updates) => {
    try {
      const existingEntry = state.entries.find(entry => entry.id === entryId);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      const updatedEntry = {
        ...existingEntry,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: ACTIONS.UPDATE_ENTRY, payload: updatedEntry });
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to update entry' });
      throw error;
    }
  };

  // Delete entry
  const deleteEntry = async entryId => {
    try {
      dispatch({ type: ACTIONS.DELETE_ENTRY, payload: entryId });
    } catch (error) {
      console.error('Error deleting entry:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to delete entry' });
      throw error;
    }
  };

  // Get single entry by ID
  const getEntry = entryId => {
    return state.entries.find(entry => entry.id === entryId);
  };

  // Get filtered entries based on current filter and search query
  const getFilteredEntries = () => {
    let filteredEntries = [...state.entries];

    // Apply filter
    if (state.filter !== 'all') {
      const now = new Date();
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);

        switch (state.filter) {
          case 'today':
            return isToday(entryDate);
          case 'week':
            return isThisWeek(entryDate);
          case 'month':
            return isThisMonth(entryDate);
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filteredEntries = filteredEntries.filter(
        entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filteredEntries;
  };

  // Get statistics
  const getStats = () => {
    const now = new Date();
    const thisMonth = state.entries.filter(entry => isThisMonth(new Date(entry.createdAt))).length;

    // Count moods
    const moodCounts = state.entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    // Get most used tags
    const tagCounts = state.entries.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalEntries: state.entries.length,
      thisMonth,
      moodCounts,
      tagCounts,
      averageWordsPerEntry:
        state.entries.length > 0
          ? Math.round(
              state.entries.reduce((acc, entry) => acc + entry.content.split(/\s+/).length, 0) /
                state.entries.length
            )
          : 0,
    };
  };

  // Set search query
  const setSearchQuery = query => {
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
  };

  // Set filter
  const setFilter = filter => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Export entries (for backup/sharing)
  const exportEntries = () => {
    return JSON.stringify(state.entries, null, 2);
  };

  // Import entries (for restore)
  const importEntries = async entriesJson => {
    try {
      const entries = JSON.parse(entriesJson);
      if (Array.isArray(entries)) {
        dispatch({ type: ACTIONS.LOAD_ENTRIES, payload: entries });
        await saveEntries(entries);
        return true;
      }
      throw new Error('Invalid entries format');
    } catch (error) {
      console.error('Error importing entries:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to import entries' });
      return false;
    }
  };

  const value = {
    // State
    entries: state.entries,
    loading: state.loading,
    error: state.error,
    searchQuery: state.searchQuery,
    filter: state.filter,

    // Actions
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getFilteredEntries,
    getStats,
    setSearchQuery,
    setFilter,
    clearError,
    exportEntries,
    importEntries,
    loadEntries,
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
