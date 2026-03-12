# @echopages/desktop

## Desktop App Status (June 2024)

**Completed:**
- OAuth and biometric authentication UI
- Rich text editor with multimedia, templates, accessibility
- Entry list, search, calendar view
- Local encryption (AES-256, SQLCipher, secure key management)

**In Progress:**
- Sync status, tag/folder UI

**Next:**
- Customization, themes, notifications, integrations

Desktop application for EchoPages Journal built with Electron and React.

## Features

- Cross-platform desktop support (Windows, macOS, Linux)
- Native system integration
- Offline-first architecture
- Rich text editing
- Real-time synchronization
- Local file system access
- System tray integration
- Auto-updates

## Development

```bash
# Install dependencies
yarn install

# Start development
yarn dev

# Build for production
yarn build

# Package application
yarn package

# Run tests
yarn test

# Run linting
yarn lint
```

## Environment Setup

Create a `.env` file in the package root:

```env
ELECTRON_API_URL=http://localhost:3000
ELECTRON_STORAGE_PATH=user-data
```

## Directory Structure

```
src/
  ├── main/         # Electron main process
  │   ├── ipc/      # IPC handlers
  │   ├── menu/     # Application menu
  │   └── store/    # Electron store
  ├── renderer/     # React renderer process
  │   ├── assets/   # Static assets
  │   ├── components/ # React components
  │   ├── hooks/    # Custom hooks
  │   ├── pages/    # Page components
  │   ├── services/ # API and services
  │   └── store/    # State management
  └── preload/      # Preload scripts
```

## Building and Packaging

The application can be built for different platforms:

```bash
# Build for current platform
yarn package

# Build for specific platform
yarn package:mac
yarn package:win
yarn package:linux
```

## System Requirements

- Windows 10+ (64-bit)
- macOS 10.13+
- Linux (Ubuntu 18.04+, Fedora 24+, Debian 9+)

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## Multimedia Editor Integration

- The new multimedia editor (`RichTextEditorDesktop`) is available in `src/components/editor/RichTextEditorDesktop.tsx`.
- A minimal demo app is available in `src/App.tsx` that renders the editor for development and testing.
- To use the editor, set `App.tsx` as your main entry point or integrate the component into your main window/page.

## Running Tests

- Tests are located in `tests/RichTextEditorDesktop.test.tsx`.
- To run the test, use:

```
yarn jest ../packages/desktop/tests/RichTextEditorDesktop.test.tsx --passWithNoTests
```

- If you encounter issues with test discovery, check your Jest configuration and testMatch patterns.

## Editor Features

- Rich text editing (basic formatting, lists, headings)
- Image, video, and audio attachment (picker, preview, alt text, reorder, remove)
- Accessibility: alt text, focus indicators, keyboard navigation, screen reader support
- Fluent Design System principles

## Troubleshooting

- If you see errors about missing dependencies or Jest config, ensure you have installed all required packages and are running tests from the correct directory.

## Navigation

- The **mobile app** uses [React Navigation](https://reactnavigation.org/) for scalable, accessible navigation between screens.
- The **desktop app** currently uses a simple navigation model, but can be upgraded to a more scalable approach if needed.
