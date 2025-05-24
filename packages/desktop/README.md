# @echopages/desktop

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
