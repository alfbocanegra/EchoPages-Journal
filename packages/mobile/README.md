# @echopages/mobile

## Mobile App Status (June 2024)

**Current Status:**
- All major features and PRD requirements are complete except for launch/beta testing.
- The app is feature-complete for journaling, sync, security, multimedia, integrations, AI features, and accessibility.
- Only launch/beta testing remains before public release.

**Completed:**
- OAuth and biometric authentication UI
- Rich text editor with multimedia, templates, accessibility
- Entry list, search, calendar view
- Local encryption (AES-256, SQLCipher, secure key management)
- Theme system and customization UI
- Accessibility and high-contrast mode (UI, diagnostics)
- Real-time diagnostics and state surfacing in UI
- Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers, progress bar, user preference toggle in settings)
- Multimedia support (image, video, audio attachment in editor; further polish/advanced features pending)
- Organization and search (folders, tags, search/filter bar, calendar view navigation)
- Habit tracking and notifications (streaks, reminders, achievements)
- Integrations (calendar, health, weather/location, social sharing)
- Performance and accessibility optimization (final pass)
- AI features (journaling prompts, reflection suggestions)

**In Progress / Pending:**
- Launch and beta testing

**What's Left To Do**
- Prepare for launch: app store, beta, support, monitoring

## Task Checklist

- [x] OAuth and biometric authentication UI
- [x] Rich text editor with multimedia, templates, accessibility
- [x] Entry list, search, calendar view
- [x] Local encryption (AES-256, SQLCipher, secure key management)
- [x] Theme system and customization UI
- [x] Accessibility and high-contrast mode (UI, diagnostics)
- [x] Real-time diagnostics and state surfacing in UI
- [x] Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers, progress bar, user preference toggle in settings)
- [x] Multimedia support (image, video, audio attachment in editor; further polish/advanced features pending)
- [x] Organization and search (folders, tags, search/filter bar, calendar view navigation)
- [x] Habit tracking and notifications (streaks, reminders, achievements)
- [x] Integrations (calendar, health, weather/location, social sharing)
- [x] Performance and accessibility optimization (final pass)
- [x] AI features (journaling prompts, reflection suggestions)
- [ ] Launch and beta testing

## Organization and Search Features

- Organize entries into folders (create, rename, color, delete)
- Add, autocomplete, and manage tags for entries
- Search bar with filter chips for tags, folders, and date
- Calendar view for browsing entries by date
- All features are accessible and mobile-friendly

Mobile application for EchoPages Journal built with React Native.

## Features

- Cross-platform (iOS and Android) support
- Native performance
- Offline-first architecture
- Rich text editing
- Real-time synchronization
- Local storage
- Push notifications
- Deep linking support

## Development

```bash
# Install dependencies
yarn install

# Install iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run tests
yarn test

# Run linting
yarn lint
```

## Environment Setup

1. Install React Native dependencies:

   - Node.js
   - Watchman
   - Xcode (iOS)
   - Android Studio (Android)
   - JDK

2. Create a `.env` file:

```env
API_URL=http://localhost:3000
STORAGE_KEY=echopages_mobile
```

## Directory Structure

```
src/
  ├── assets/        # Static assets
  ├── components/    # React Native components
  ├── hooks/        # Custom hooks
  ├── navigation/   # Navigation configuration
  ├── screens/      # Screen components
  ├── services/     # API and service integrations
  ├── store/        # State management
  ├── styles/       # Global styles and themes
  └── utils/        # Utility functions
```

## Platform-Specific Code

Use the `.ios.ts` and `.android.ts` extensions for platform-specific implementations:

```
Component.tsx         # Shared code
Component.ios.tsx     # iOS-specific
Component.android.tsx # Android-specific
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## Multimedia Editor Integration

- The new multimedia editor (`RichTextEditorMobile`) is available in `src/components/editor/RichTextEditorMobile.tsx`.
- A demo/editor screen is available at `src/screens/EditorScreen.tsx`.
- To use the editor, add `EditorScreen` to your app navigation or set it as your initial screen.

## Running Tests

- This package uses [jest-expo](https://docs.expo.dev/guides/testing-with-jest/) for testing React Native components.
- To run tests, use the Expo CLI:

```
npx expo install jest-expo
npx expo test
```

- Or, if you have a script in your `package.json`:

```
yarn jest-expo
```

- Do **not** use plain `jest` or `yarn jest` directly, as this may cause Babel/Expo config errors.

## Editor Features

- Rich text editing (basic formatting, lists, headings)
- Image, video, and audio attachment (picker, preview, alt text, reorder, remove)
- Accessibility: alt text, focus indicators, screen reader support
- Material 3 (Android) and Apple HIG (iOS) design principles

## Troubleshooting

- If you see errors about `expo/config` or `babel-preset-expo`, ensure you are running tests with `jest-expo` or `expo test`.
- If you add new dependencies for media or testing, use `expo install` or `yarn add` as appropriate.

## Navigation

This app uses [React Navigation](https://reactnavigation.org/) for scalable, accessible navigation between screens.

### Installation

React Navigation and its dependencies are installed:

```
yarn add @react-navigation/native @react-navigation/stack @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

If you are using Expo, you may also need to install `react-native-gesture-handler` and `react-native-reanimated`.

### Usage

Navigation is set up in `App.tsx` using a stack navigator. See the code for details on how screens are registered and navigated between.

## Sync Progress Bar and Settings

- The sync progress bar is now visible at the top of the app by default.
- Users can show/hide the progress bar from the Settings screen ("Sync Progress Bar" toggle).
- The preference is persisted and applies immediately.
