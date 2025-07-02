/* global device, element, by, waitFor */

describe('EchoPages Journal E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch and Navigation', () => {
    it('should launch app and show home screen', async () => {
      await expect(element(by.text('EchoPages Journal'))).toBeVisible();
      await expect(element(by.text('My Journal'))).toBeVisible();
    });

    it('should navigate between tabs', async () => {
      // Navigate to Calendar tab
      await element(by.text('Calendar')).tap();
      await expect(element(by.text('Calendar View'))).toBeVisible();

      // Navigate to Settings tab
      await element(by.text('Settings')).tap();
      await expect(element(by.text('Settings'))).toBeVisible();

      // Navigate back to Home tab
      await element(by.text('Home')).tap();
      await expect(element(by.text('My Journal'))).toBeVisible();
    });
  });

  describe('Journal Entry CRUD Operations', () => {
    it('should create a new journal entry', async () => {
      // Tap add button
      await element(by.id('add-entry-button')).tap();

      // Fill in entry details
      await element(by.id('entry-title-input')).typeText('Test Entry');
      await element(by.id('entry-content-input')).typeText('This is a test journal entry');

      // Select mood
      await element(by.id('mood-selector')).tap();
      await element(by.text('😊')).tap();

      // Add tags
      await element(by.id('tags-input')).typeText('test, e2e');

      // Save entry
      await element(by.id('save-entry-button')).tap();

      // Verify entry was created
      await expect(element(by.text('Test Entry'))).toBeVisible();
      await expect(element(by.text('This is a test journal entry'))).toBeVisible();
    });

    it('should edit an existing journal entry', async () => {
      // Create an entry first
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Entry to Edit');
      await element(by.id('entry-content-input')).typeText('Original content');
      await element(by.id('save-entry-button')).tap();

      // Tap on the entry to edit
      await element(by.text('Entry to Edit')).tap();

      // Edit the content
      await element(by.id('entry-title-input')).clearText();
      await element(by.id('entry-title-input')).typeText('Updated Entry');
      await element(by.id('entry-content-input')).clearText();
      await element(by.id('entry-content-input')).typeText('Updated content');

      // Save changes
      await element(by.id('save-entry-button')).tap();

      // Verify changes
      await expect(element(by.text('Updated Entry'))).toBeVisible();
      await expect(element(by.text('Updated content'))).toBeVisible();
    });

    it('should delete a journal entry', async () => {
      // Create an entry first
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Entry to Delete');
      await element(by.id('entry-content-input')).typeText('This will be deleted');
      await element(by.id('save-entry-button')).tap();

      // Long press to show delete option
      await element(by.text('Entry to Delete')).longPress();

      // Tap delete button
      await element(by.text('Delete')).tap();

      // Confirm deletion
      await element(by.text('Confirm')).tap();

      // Verify entry was deleted
      await expect(element(by.text('Entry to Delete'))).not.toBeVisible();
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      // Create test entries
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Happy Day');
      await element(by.id('entry-content-input')).typeText('Today was amazing!');
      await element(by.id('mood-selector')).tap();
      await element(by.text('😊')).tap();
      await element(by.id('tags-input')).typeText('happy, good');
      await element(by.id('save-entry-button')).tap();

      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Sad Day');
      await element(by.id('entry-content-input')).typeText('Today was difficult');
      await element(by.id('mood-selector')).tap();
      await element(by.text('😢')).tap();
      await element(by.id('tags-input')).typeText('sad, difficult');
      await element(by.id('save-entry-button')).tap();
    });

    it('should search entries by text', async () => {
      // Tap search icon
      await element(by.id('search-button')).tap();

      // Search for "amazing"
      await element(by.id('search-input')).typeText('amazing');

      // Should show only the happy entry
      await expect(element(by.text('Happy Day'))).toBeVisible();
      await expect(element(by.text('Sad Day'))).not.toBeVisible();
    });

    it('should filter entries by mood', async () => {
      // Tap filter icon
      await element(by.id('filter-button')).tap();

      // Select happy mood
      await element(by.text('😊')).tap();
      await element(by.text('Apply')).tap();

      // Should show only happy entries
      await expect(element(by.text('Happy Day'))).toBeVisible();
      await expect(element(by.text('Sad Day'))).not.toBeVisible();
    });

    it('should filter entries by tags', async () => {
      // Tap filter icon
      await element(by.id('filter-button')).tap();

      // Select "good" tag
      await element(by.text('good')).tap();
      await element(by.text('Apply')).tap();

      // Should show only entries with "good" tag
      await expect(element(by.text('Happy Day'))).toBeVisible();
      await expect(element(by.text('Sad Day'))).not.toBeVisible();
    });
  });

  describe('Calendar View', () => {
    it('should show entries in calendar view', async () => {
      // Create an entry for today
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Calendar Entry');
      await element(by.id('entry-content-input')).typeText('Entry for calendar view');
      await element(by.id('save-entry-button')).tap();

      // Navigate to calendar
      await element(by.text('Calendar')).tap();

      // Should see the entry in today's date
      await expect(element(by.text('Calendar Entry'))).toBeVisible();
    });

    it('should navigate to different months', async () => {
      await element(by.text('Calendar')).tap();

      // Navigate to next month
      await element(by.id('next-month-button')).tap();

      // Navigate to previous month
      await element(by.id('prev-month-button')).tap();

      // Should still be on current month
      await expect(element(by.text('Calendar View'))).toBeVisible();
    });
  });

  describe('Settings and Configuration', () => {
    it('should access settings screen', async () => {
      await element(by.text('Settings')).tap();

      await expect(element(by.text('Account Settings'))).toBeVisible();
      await expect(element(by.text('Sync Settings'))).toBeVisible();
      await expect(element(by.text('Privacy Settings'))).toBeVisible();
    });

    it('should toggle dark mode', async () => {
      await element(by.text('Settings')).tap();

      // Toggle dark mode
      await element(by.id('dark-mode-toggle')).tap();

      // Should show dark mode is enabled
      await expect(element(by.text('Dark Mode: On'))).toBeVisible();
    });

    it('should configure sync settings', async () => {
      await element(by.text('Settings')).tap();
      await element(by.text('Sync Settings')).tap();

      // Enable auto-sync
      await element(by.id('auto-sync-toggle')).tap();

      // Should show auto-sync is enabled
      await expect(element(by.text('Auto Sync: On'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error by creating entry with special text
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Network Error Test');
      await element(by.id('entry-content-input')).typeText('This will cause a network error');
      await element(by.id('save-entry-button')).tap();

      // Should show error message
      await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();
    });

    it('should handle storage errors gracefully', async () => {
      // Simulate storage error
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Storage Error Test');
      await element(by.id('entry-content-input')).typeText('This will cause a storage error');
      await element(by.id('save-entry-button')).tap();

      // Should show error message
      await expect(element(by.text('Storage error. Please try again.'))).toBeVisible();
    });
  });
});
