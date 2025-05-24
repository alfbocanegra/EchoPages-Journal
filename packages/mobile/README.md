# @echopages/mobile

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
