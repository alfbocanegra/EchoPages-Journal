# @echopages/web

## Web App Status (June 2024)

**Completed:**
- OAuth and biometric authentication UI
- Rich text editor with multimedia, templates, accessibility
- Entry list, search, calendar view
- Local encryption (AES-256, SQLCipher, secure key management)
- Theme system and customization UI
- Accessibility and high-contrast mode (UI, diagnostics)
- Real-time diagnostics and state surfacing in UI
- AI features (journaling prompts, reflection suggestions)

**In Progress / Pending:**
- Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers)
- Multimedia support (handwriting, audio, video)
- Organization and search (tags, folders, advanced search, calendar view)
- Customization and themes (stickers, advanced personalization)
- Habit tracking and notifications (streaks, reminders, achievements)
- Integrations (calendar, health, weather/location, social sharing)
- Performance and accessibility optimization (final pass)
- Launch and beta testing

**Known Issues / Technical Debt:**
- Cloud provider integrations (iCloud, Google Drive, OneDrive) are not yet implemented in the backend (all methods are stubs).
- Some sync/upload logic is stubbed and not fully functional.
- Biometric authentication is a placeholder and not a real implementation.
- AI features (journaling prompts, reflection suggestions) are not implemented.
- Handwriting and advanced multimedia features are only partially implemented or pending polish.

## What's Left To Do
- Implement cloud provider integrations (iCloud, Google Drive, OneDrive)
- Complete habit tracking and notification features
- Finish integrations (calendar, health, weather/location, social sharing)
- Implement AI journaling prompts and reflection suggestions
- Polish customization (stickers, advanced themes)
- Finalize performance and accessibility
- Prepare for launch: app store, beta, support, monitoring

## Task Checklist

- [x] OAuth and biometric authentication UI
- [x] Rich text editor with multimedia, templates, accessibility
- [x] Entry list, search, calendar view
- [x] Local encryption (AES-256, SQLCipher, secure key management)
- [x] Theme system and customization UI
- [x] Accessibility and high-contrast mode (UI, diagnostics)
- [x] Real-time diagnostics and state surfacing in UI
- [ ] Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers)
- [ ] Multimedia support (handwriting, audio, video)
- [ ] Organization and search (tags, folders, advanced search, calendar view)
- [ ] Customization and themes (stickers, advanced personalization)
- [ ] Habit tracking and notifications (streaks, reminders, achievements)
- [ ] Integrations (calendar, health, weather/location, social sharing)
- [ ] Performance and accessibility optimization (final pass)
- [x] AI features (journaling prompts, reflection suggestions)
- [ ] Launch and beta testing

Web application for EchoPages Journal built with React and Vite.

## Features

- Modern React application with TypeScript
- Fast development with Vite
- Responsive design for all screen sizes
- Rich text editing capabilities
- Real-time synchronization
- Offline support with local storage
- Progressive Web App (PWA) capabilities

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run tests
yarn test

# Run linting
yarn lint
```

## Environment Variables

Create a `.env` file in the package root:

```env
VITE_API_URL=http://localhost:3000
VITE_STORAGE_KEY=echopages_web
```

## Directory Structure

```
src/
  ├── assets/        # Static assets (images, fonts, etc.)
  ├── components/    # React components
  ├── hooks/        # Custom React hooks
  ├── pages/        # Page components
  ├── services/     # API and service integrations
  ├── store/        # State management
  ├── styles/       # Global styles and themes
  └── utils/        # Utility functions
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.
