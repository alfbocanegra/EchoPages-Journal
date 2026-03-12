/* global device, element, by, waitFor */

describe('EchoPages Journal E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch and Navigation', () => {
    it('should launch app successfully', async () => {
      await expect(element(by.id('app-container'))).toBeVisible();
    });

    it('should show home screen on launch', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should navigate to calendar screen', async () => {
      await element(by.id('calendar-tab')).tap();
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });

    it('should navigate to settings screen', async () => {
      await element(by.id('settings-tab')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('Journal Entry Creation', () => {
    it('should create a new journal entry', async () => {
      // Navigate to create entry
      await element(by.id('add-entry-button')).tap();
      await expect(element(by.id('edit-entry-screen'))).toBeVisible();

      // Fill in entry details
      await element(by.id('entry-title-input')).typeText('My First Entry');
      await element(by.id('entry-content-input')).typeText(
        'This is my first journal entry. I am feeling great today!'
      );

      // Select mood
      await element(by.id('mood-selector')).tap();
      await element(by.id('mood-happy')).tap();

      // Add tags
      await element(by.id('tags-input')).typeText('personal, reflection');
      await element(by.id('add-tag-button')).tap();

      // Save entry
      await element(by.id('save-entry-button')).tap();

      // Verify entry was created
      await expect(element(by.text('My First Entry'))).toBeVisible();
      await expect(element(by.text('This is my first journal entry'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      await element(by.id('add-entry-button')).tap();

      // Try to save without title
      await element(by.id('save-entry-button')).tap();

      // Should show validation error
      await expect(element(by.text('Title is required'))).toBeVisible();
    });

    it('should handle entry with media attachment', async () => {
      await element(by.id('add-entry-button')).tap();

      // Add title and content
      await element(by.id('entry-title-input')).typeText('Entry with Photo');
      await element(by.id('entry-content-input')).typeText('This entry has a photo attached');

      // Add photo
      await element(by.id('add-media-button')).tap();
      await element(by.id('camera-option')).tap();

      // Mock camera capture
      await element(by.id('capture-photo')).tap();
      await element(by.id('use-photo')).tap();

      // Verify photo was attached
      await expect(element(by.id('media-preview'))).toBeVisible();

      // Save entry
      await element(by.id('save-entry-button')).tap();

      // Verify entry with media
      await expect(element(by.text('Entry with Photo'))).toBeVisible();
      await expect(element(by.id('entry-media'))).toBeVisible();
    });
  });

  describe('Journal Entry Editing', () => {
    beforeEach(async () => {
      // Create a test entry first
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Test Entry for Editing');
      await element(by.id('entry-content-input')).typeText('Original content');
      await element(by.id('save-entry-button')).tap();
    });

    it('should edit an existing entry', async () => {
      // Tap on the entry to open it
      await element(by.text('Test Entry for Editing')).tap();
      await expect(element(by.id('entry-detail-screen'))).toBeVisible();

      // Edit the entry
      await element(by.id('edit-entry-button')).tap();
      await element(by.id('entry-title-input')).clearText();
      await element(by.id('entry-title-input')).typeText('Updated Test Entry');
      await element(by.id('entry-content-input')).clearText();
      await element(by.id('entry-content-input')).typeText('Updated content with more details');

      // Save changes
      await element(by.id('save-entry-button')).tap();

      // Verify changes
      await expect(element(by.text('Updated Test Entry'))).toBeVisible();
      await expect(element(by.text('Updated content with more details'))).toBeVisible();
    });

    it('should delete an entry', async () => {
      // Open the entry
      await element(by.text('Test Entry for Editing')).tap();

      // Delete the entry
      await element(by.id('delete-entry-button')).tap();
      await element(by.id('confirm-delete-button')).tap();

      // Verify entry was deleted
      await expect(element(by.text('Test Entry for Editing'))).not.toBeVisible();
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      // Create multiple test entries with different tags and moods
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Happy Entry');
      await element(by.id('entry-content-input')).typeText('I am feeling happy today');
      await element(by.id('mood-selector')).tap();
      await element(by.id('mood-happy')).tap();
      await element(by.id('tags-input')).typeText('happy, positive');
      await element(by.id('add-tag-button')).tap();
      await element(by.id('save-entry-button')).tap();

      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Sad Entry');
      await element(by.id('entry-content-input')).typeText('I am feeling sad today');
      await element(by.id('mood-selector')).tap();
      await element(by.id('mood-sad')).tap();
      await element(by.id('tags-input')).typeText('sad, reflection');
      await element(by.id('add-tag-button')).tap();
      await element(by.id('save-entry-button')).tap();
    });

    it('should search entries by text', async () => {
      await element(by.id('search-input')).typeText('happy');

      // Should show only happy entry
      await expect(element(by.text('Happy Entry'))).toBeVisible();
      await expect(element(by.text('Sad Entry'))).not.toBeVisible();
    });

    it('should filter entries by mood', async () => {
      await element(by.id('filter-button')).tap();
      await element(by.id('mood-filter')).tap();
      await element(by.id('mood-happy-filter')).tap();

      // Should show only happy entries
      await expect(element(by.text('Happy Entry'))).toBeVisible();
      await expect(element(by.text('Sad Entry'))).not.toBeVisible();
    });

    it('should filter entries by tags', async () => {
      await element(by.id('filter-button')).tap();
      await element(by.id('tags-filter')).tap();
      await element(by.id('tag-positive-filter')).tap();

      // Should show only entries with 'positive' tag
      await expect(element(by.text('Happy Entry'))).toBeVisible();
      await expect(element(by.text('Sad Entry'))).not.toBeVisible();
    });
  });

  describe('Calendar View', () => {
    it('should display calendar with entries', async () => {
      await element(by.id('calendar-tab')).tap();
      await expect(element(by.id('calendar-view'))).toBeVisible();

      // Should show today's date
      const today = new Date().toISOString().split('T')[0];
      await expect(element(by.id(`calendar-day-${today}`))).toBeVisible();
    });

    it('should navigate to entry from calendar', async () => {
      // Create an entry first
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Calendar Entry');
      await element(by.id('entry-content-input')).typeText('Entry for calendar test');
      await element(by.id('save-entry-button')).tap();

      // Navigate to calendar
      await element(by.id('calendar-tab')).tap();

      // Tap on today's date
      const today = new Date().toISOString().split('T')[0];
      await element(by.id(`calendar-day-${today}`)).tap();

      // Should show the entry
      await expect(element(by.text('Calendar Entry'))).toBeVisible();
    });
  });

  describe('Settings and Preferences', () => {
    it('should access settings screen', async () => {
      await element(by.id('settings-tab')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should change theme preference', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('theme-selector')).tap();
      await element(by.id('dark-theme')).tap();

      // Verify theme changed
      await expect(element(by.id('dark-theme-indicator'))).toBeVisible();
    });

    it('should export journal data', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('export-data-button')).tap();

      // Should show export options
      await expect(element(by.id('export-options'))).toBeVisible();
      await element(by.id('export-json')).tap();

      // Should show success message
      await expect(element(by.text('Export completed'))).toBeVisible();
    });
  });

  describe('Authentication Flow', () => {
    it('should show login screen when not authenticated', async () => {
      // Clear authentication state (this would be done in setup)
      await element(by.id('logout-button')).tap();

      // Should show login screen
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should handle Google OAuth login', async () => {
      await element(by.id('google-login-button')).tap();

      // Mock OAuth flow
      await expect(element(by.id('oauth-webview'))).toBeVisible();

      // Simulate successful login
      await element(by.id('oauth-success')).tap();

      // Should return to main app
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should handle login errors gracefully', async () => {
      await element(by.id('google-login-button')).tap();

      // Simulate login error
      await element(by.id('oauth-error')).tap();

      // Should show error message
      await expect(element(by.text('Login failed. Please try again.'))).toBeVisible();
    });
  });

  describe('Data Synchronization', () => {
    it('should sync data when online', async () => {
      // Create a new entry
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Sync Test Entry');
      await element(by.id('entry-content-input')).typeText('This entry should sync');
      await element(by.id('save-entry-button')).tap();

      // Trigger sync
      await element(by.id('sync-button')).tap();

      // Should show sync progress
      await expect(element(by.id('sync-progress'))).toBeVisible();

      // Should show sync success
      await expect(element(by.text('Sync completed'))).toBeVisible();
    });

    it('should handle offline mode', async () => {
      // Simulate offline mode
      await element(by.id('offline-indicator')).tap();

      // Create entry while offline
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Offline Entry');
      await element(by.id('entry-content-input')).typeText('Created while offline');
      await element(by.id('save-entry-button')).tap();

      // Should show offline indicator
      await expect(element(by.id('offline-badge'))).toBeVisible();

      // Go back online
      await element(by.id('online-indicator')).tap();

      // Should sync automatically
      await expect(element(by.text('Sync completed'))).toBeVisible();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should handle large number of entries', async () => {
      // Create multiple entries quickly
      for (let i = 1; i <= 10; i++) {
        await element(by.id('add-entry-button')).tap();
        await element(by.id('entry-title-input')).typeText(`Entry ${i}`);
        await element(by.id('entry-content-input')).typeText(`Content for entry ${i}`);
        await element(by.id('save-entry-button')).tap();
      }

      // Should scroll smoothly
      await element(by.id('entries-list')).scrollTo('bottom');

      // Should show all entries
      await expect(element(by.text('Entry 10'))).toBeVisible();
    });

    it('should handle rapid navigation', async () => {
      // Navigate between screens rapidly
      await element(by.id('calendar-tab')).tap();
      await element(by.id('settings-tab')).tap();
      await element(by.id('home-tab')).tap();

      // Should not crash and show correct screen
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await element(by.id('network-error-simulator')).tap();

      // Try to sync
      await element(by.id('sync-button')).tap();

      // Should show error message
      await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();

      // Should allow retry
      await element(by.id('retry-button')).tap();
    });

    it('should handle storage errors', async () => {
      // Simulate storage error
      await element(by.id('storage-error-simulator')).tap();

      // Try to save entry
      await element(by.id('add-entry-button')).tap();
      await element(by.id('entry-title-input')).typeText('Storage Test');
      await element(by.id('save-entry-button')).tap();

      // Should show error message
      await expect(element(by.text('Storage error. Please try again.'))).toBeVisible();
    });
  });
});
