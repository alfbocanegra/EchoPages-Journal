/* global device, element, by, expect, waitFor */
// E2E Test Setup File
import { device, element, by, expect } from 'detox';

// Global test utilities
export const TestUtils = {
  // Wait for element to be visible
  waitForElement: async (testId, timeout = 5000) => {
    await waitFor(element(by.id(testId)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Wait for element to not be visible
  waitForElementToDisappear: async (testId, timeout = 5000) => {
    await waitFor(element(by.id(testId)))
      .not.toBeVisible()
      .withTimeout(timeout);
  },

  // Tap element safely
  tapElement: async testId => {
    await element(by.id(testId)).tap();
  },

  // Type text safely
  typeText: async (testId, text) => {
    await element(by.id(testId)).typeText(text);
  },

  // Clear and type text
  clearAndTypeText: async (testId, text) => {
    await element(by.id(testId)).clearText();
    await element(by.id(testId)).typeText(text);
  },

  // Scroll to element
  scrollToElement: async (testId, direction = 'down') => {
    await element(by.id(testId)).scrollTo(direction);
  },

  // Take screenshot
  takeScreenshot: async name => {
    await device.takeScreenshot(name);
  },

  // Reload app
  reloadApp: async () => {
    await device.reloadReactNative();
  },

  // Launch app
  launchApp: async () => {
    await device.launchApp();
  },

  // Go back
  goBack: async () => {
    await device.pressBack();
  },
};

// Mock data for tests
export const MockData = {
  entries: [
    {
      title: 'Test Entry 1',
      content: 'This is the first test entry',
      mood: '😊',
      tags: ['test', 'first'],
    },
    {
      title: 'Test Entry 2',
      content: 'This is the second test entry',
      mood: '😌',
      tags: ['test', 'second'],
    },
    {
      title: 'Test Entry 3',
      content: 'This is the third test entry',
      mood: '🎨',
      tags: ['test', 'third'],
    },
  ],

  users: [
    {
      email: 'test@example.com',
      name: 'Test User',
      provider: 'google',
    },
  ],
};

// Test constants
export const TestConstants = {
  timeouts: {
    short: 2000,
    medium: 5000,
    long: 10000,
  },

  testIds: {
    // Navigation
    homeTab: 'home-tab',
    calendarTab: 'calendar-tab',
    settingsTab: 'settings-tab',

    // Entry management
    addEntryButton: 'add-entry-button',
    entryTitleInput: 'entry-title-input',
    entryContentInput: 'entry-content-input',
    saveEntryButton: 'save-entry-button',
    deleteEntryButton: 'delete-entry-button',

    // Search and filter
    searchButton: 'search-button',
    searchInput: 'search-input',
    filterButton: 'filter-button',

    // Settings
    darkModeToggle: 'dark-mode-toggle',
    autoSyncToggle: 'auto-sync-toggle',

    // Calendar
    nextMonthButton: 'next-month-button',
    prevMonthButton: 'prev-month-button',
  },

  text: {
    // Error messages
    networkError: 'Network error. Please check your connection.',
    storageError: 'Storage error. Please try again.',
    authError: 'Authentication failed. Please try again.',

    // Success messages
    entrySaved: 'Entry saved successfully',
    entryDeleted: 'Entry deleted successfully',

    // Navigation
    home: 'Home',
    calendar: 'Calendar',
    settings: 'Settings',

    // Actions
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
};

// Global beforeAll setup
beforeAll(async () => {
  // Launch app
  await device.launchApp();

  // Wait for app to be ready
  await TestUtils.waitForElement('app-root', TestConstants.timeouts.long);
});

// Global beforeEach setup
beforeEach(async () => {
  // Reload app for clean state
  await device.reloadReactNative();

  // Wait for app to be ready
  await TestUtils.waitForElement('app-root', TestConstants.timeouts.medium);
});

// Global afterEach cleanup
afterEach(async () => {
  // Take screenshot for debugging
  await TestUtils.takeScreenshot('test-completion');
});

// Export for use in test files
export { device, element, by, expect, waitFor };
