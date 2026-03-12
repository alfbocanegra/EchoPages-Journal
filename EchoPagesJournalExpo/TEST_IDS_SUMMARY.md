# Test IDs Summary for E2E Testing

This document provides a comprehensive overview of all test IDs added to the EchoPages Journal app components to support E2E testing with Detox.

## Overview

Test IDs have been systematically added to all interactive components across the app's screens to enable reliable E2E testing. These IDs follow a consistent naming convention and are strategically placed to support the test scenarios defined in the E2E test suite.

## Test ID Naming Convention

- **Screen containers**: `{screen-name}-screen` (e.g., `home-screen`, `settings-screen`)
- **Interactive elements**: `{action}-{element}` (e.g., `add-entry-button`, `search-input`)
- **Dynamic elements**: `{element}-{identifier}` (e.g., `entry-{id}`, `mood-{emoji}`)
- **Lists and collections**: `{collection}-list` (e.g., `journal-entries-list`)

## Test IDs by Screen

### HomeScreen (`HomeScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `app-root` | View | Main app container |
| `search-input` | TextInput | Search bar for filtering entries |
| `tag-filter-{tag}` | TouchableOpacity | Tag filter chips |
| `mood-filter-{mood}` | TouchableOpacity | Mood filter chips |
| `calendar-tab` | TouchableOpacity | Calendar navigation button |
| `settings-tab` | TouchableOpacity | Settings navigation button |
| `journal-entries-list` | FlatList | List of journal entries |
| `entry-{id}` | TouchableOpacity | Individual entry card |
| `add-entry-button` | TouchableOpacity | Floating action button to add entry |

### QuickEntryScreen (`QuickEntryScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `quick-entry-screen` | ScrollView | Main screen container |
| `entry-content-input` | TextInput | Main content input field |
| `tags-input` | TextInput | Tags input field |
| `mood-selector` | View | Container for mood selection |
| `mood-{emoji}` | TouchableOpacity | Individual mood buttons |
| `attach-media-button` | TouchableOpacity | Button to attach media |
| `save-entry-button` | Button | Save entry button |

### EditEntryScreen (`EditEntryScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `edit-entry-screen` | ScrollView | Main screen container |
| `entry-title-input` | TextInput | Entry title input field |
| `entry-content-input` | TextInput | Entry content input field |
| `tags-input` | TextInput | Tags input field |
| `mood-selector` | View | Container for mood selection |
| `mood-{emoji}` | TouchableOpacity | Individual mood buttons |
| `attach-media-button` | TouchableOpacity | Button to attach media |
| `save-entry-button` | Button | Save changes button |
| `cancel-button` | Button | Cancel editing button |
| `entry-not-found` | View | Error state when entry not found |
| `back-button` | Button | Back navigation button |

### SettingsScreen (`SettingsScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `settings-screen` | View | Main screen container |
| `user-info-section` | View | Container for signed-in user info |
| `auth-buttons-section` | View | Container for authentication buttons |
| `google-signin-button` | TouchableOpacity | Google sign-in button |
| `apple-signin-button` | TouchableOpacity | Apple sign-in button (iOS only) |
| `dropbox-signin-button` | TouchableOpacity | Dropbox sign-in button |
| `sign-out-button` | Button | Sign out button |
| `clear-data-button` | Button | Clear all data button |
| `sync-button` | Button | Sync now button |
| `loading-indicator` | ActivityIndicator | Loading spinner |

### CalendarScreen (`CalendarScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `calendar-screen` | View | Main screen container |
| `calendar-component` | Calendar | Calendar component |
| `entries-for-date` | View | Container for entries on selected date |
| `calendar-entries-list` | FlatList | List of entries for selected date |
| `calendar-entry-{id}` | TouchableOpacity | Individual entry in calendar view |

### EntryDetailScreen (`EntryDetailScreen.js`)

| Test ID | Element Type | Description |
|---------|-------------|-------------|
| `entry-detail-screen` | View | Main screen container |
| `media-gallery` | ScrollView | Horizontal scroll of attached media |
| `entry-title` | Text | Entry title display |
| `entry-date` | Text | Entry date and mood display |
| `entry-content` | Text | Entry content display |
| `entry-tags` | View | Container for entry tags |
| `edit-entry-button` | Button | Edit entry button |
| `delete-entry-button` | Button | Delete entry button |
| `back-button` | Button | Back navigation button |
| `entry-not-found` | View | Error state when entry not found |

## Usage in E2E Tests

These test IDs are used in the E2E test suite to:

1. **Navigate between screens**: Using screen container test IDs
2. **Interact with inputs**: Typing text, selecting options
3. **Tap buttons and links**: Triggering actions and navigation
4. **Verify content**: Checking text, images, and data
5. **Test user flows**: Complete user journeys from start to finish

## Example E2E Test Usage

```javascript
// Navigate to home screen
await element(by.id('app-root')).toBeVisible();

// Search for entries
await element(by.id('search-input')).typeText('test entry');

// Add a new entry
await element(by.id('add-entry-button')).tap();
await element(by.id('entry-content-input')).typeText('My test entry');
await element(by.id('save-entry-button')).tap();

// Verify entry appears
await element(by.id('entry-1')).toBeVisible();
```

## Maintenance Guidelines

1. **Add test IDs for new components**: Any new interactive elements should include appropriate test IDs
2. **Update test IDs when refactoring**: Ensure test IDs remain consistent when components are modified
3. **Document new test IDs**: Update this document when adding new test IDs
4. **Follow naming convention**: Maintain consistency in test ID naming across the app

## Benefits

- **Reliable element selection**: Test IDs provide stable selectors that don't break with UI changes
- **Clear test intent**: Test IDs make it obvious what elements are being tested
- **Maintainable tests**: E2E tests are easier to maintain and debug
- **Accessibility support**: Test IDs can also support accessibility testing

## Next Steps

1. **Run E2E test builds**: Build the app for E2E testing
2. **Execute E2E test suite**: Run the comprehensive E2E tests
3. **Add more test scenarios**: Expand E2E coverage based on user feedback
4. **Performance testing**: Add performance benchmarks to E2E tests 