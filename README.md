# EchoPages Journal

A cross-platform digital journaling application with rich text editing, multimedia support, and secure synchronization.

## Project Status (June 2024)

**Current Status:**
- All major features and PRD requirements are complete except for launch/beta testing.
- The app is feature-complete for journaling, sync, security, multimedia, integrations, AI features, and accessibility.
- Only launch/beta testing remains before public release.

**Completed:**
- Project repository and CI/CD pipeline
- Core database schema (PostgreSQL/SQLite)
- User authentication (OAuth, biometrics, passwordless flows)
- Entry creation and editing UI (rich text, multimedia, templates, accessibility, preferences)
- Export and backup functionality
- Local storage and encryption (AES-256, SQLCipher, secure key management)
- Theme system and customization UI (web/mobile)
- Accessibility and high-contrast mode (UI, diagnostics)
- Real-time diagnostics and state surfacing in UI
- Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers, progress bar, user preference toggle in mobile settings)
- Multimedia support (image, video, audio attachment in editor; further polish/advanced features pending)
- Organization and search (folders, tags, search/filter bar, calendar view navigation in mobile)
- Habit tracking and notifications (streaks, reminders, achievements)
- Integrations (calendar, health, weather/location, social sharing)
- Performance and accessibility optimization (final pass)
- AI features (journaling prompts, reflection suggestions)

**In Progress / Pending:**
- Launch and beta testing

**What's Left To Do**
- Prepare for launch: app store, beta, support, monitoring

See the [tasks/tasks.json](tasks/tasks.json) for the full roadmap and status.

## Task Checklist

- [x] Project repository and CI/CD pipeline
- [x] Core database schema (PostgreSQL/SQLite)
- [x] User authentication (OAuth, biometrics, passwordless flows)
- [x] Entry creation and editing UI (rich text, multimedia, templates, accessibility, preferences)
- [x] Export and backup functionality
- [x] Local storage and encryption (AES-256, SQLCipher, secure key management)
- [x] Theme system and customization UI (web/mobile)
- [x] Accessibility and high-contrast mode (UI, diagnostics)
- [x] Real-time diagnostics and state surfacing in UI
- [x] Cross-platform synchronization (WebSocket, conflict resolution, offline sync, cloud providers, progress bar, user preference toggle in mobile settings)
- [x] Multimedia support (image, video, audio attachment in editor; further polish/advanced features pending)
- [x] Organization and search (folders, tags, search/filter bar, calendar view navigation in mobile)
- [x] Habit tracking and notifications (streaks, reminders, achievements)
- [x] Integrations (calendar, health, weather/location, social sharing)
- [x] Performance and accessibility optimization (final pass)
- [x] AI features (journaling prompts, reflection suggestions)
- [ ] Launch and beta testing

## Features

- Rich text editing with multimedia support
- Cross-platform synchronization
- Field-level encryption for sensitive data
- Offline-first architecture
- Folder organization
- Tags and categorization
- Weather and location tracking
- Multi-device support
- **Multi-Provider Authentication**
  - OAuth support (Google, Apple, Microsoft)
  - Biometric authentication (Fingerprint, Face ID, Windows Hello)
  - Traditional email/password login

### Data Synchronization

EchoPages Journal includes a robust synchronization system that enables:

- Seamless syncing across multiple devices
- Offline-first operation with conflict resolution
- Secure and efficient data transfer
- Automatic conflict detection and resolution
- Support for both PostgreSQL and SQLite databases

The sync system tracks all changes to journal entries, folders, tags, and media attachments, ensuring data consistency across devices while handling conflicts gracefully. For technical details, see the [backend README](backend/README.md#sync-metadata-system).

### Sync Protocol (WebSocket API)

The backend exposes a WebSocket API at `/ws/sync` for real-time, resumable, and conflict-aware synchronization. All messages are JSON objects with a `type`, `payload`, and `version` field.

**Supported message types:**

- `sync:request`: Request changes since a given version (with optional `batchSize`)
  - Payload: `{ deviceId: string, sinceVersion: number, batchSize?: number }`
  - Response: `{ type: 'sync:changes', payload: { changes }, version: 1 }`

- `sync:update`: Submit new or updated changes
  - Payload: `{ deviceId: string, changes: SyncChange[] }`
  - Response: Broadcasts `{ type: 'sync:changes', payload: { changes }, version: 1 }` to other clients

- `sync:conflicts`: Request unresolved conflicts for the user (and optionally device)
  - Payload: `{ deviceId?: string }`
  - Response: `{ type: 'sync:conflicts', payload: { conflicts }, version: 1 }`

- `sync:resolveConflict`: Submit a resolution for a specific conflict
  - Payload: `{ conflictId: string, strategy: string, resolvedBy: string, metadata?: object }`
  - Response: `{ type: 'sync:resolveConflict', payload: { success: boolean, conflictId, error? }, version: 1 }`

- `error`: Structured error response for invalid or failed requests
  - `{ type: 'error', payload: { code: string, message: string }, version: 1 }`

**Protocol versioning:**
- All messages include a `version` field (currently `1`) for future extensibility.

**Reconnection/Resume:**
- On reconnect, clients should send a `sync:request` with their `deviceId` and last known `sinceVersion` to receive only missed changes.

**Batching:**
- Clients can specify `batchSize` in `sync:request` to fetch changes in manageable chunks for efficient catch-up after being offline.

**Conflict Handling:**
- Clients can fetch unresolved conflicts with `sync:conflicts` and resolve them with `sync:resolveConflict`.

See the backend code for more details on message payloads and server behavior.

## Project Structure

- `packages/`: Contains all client applications
  - `web/`: Web application
  - `mobile/`: Mobile apps (iOS/Android)
  - `desktop/`: Desktop apps (macOS/Windows)
  - `shared/`: Shared code and utilities
- `backend/`: Server-side application
- `docs/`: Project documentation

## Security Features

EchoPages Journal implements several security measures to protect user data:

- Field-level encryption for sensitive content
- Secure authentication and session management
- End-to-end encryption for sync operations
- Encrypted local storage
- Secure key management

For technical details, see the [backend README](backend/README.md).

## Database Schema

The EchoPages Journal uses a relational database with PostgreSQL for the server and SQLite for local storage. Below is the database schema visualization:

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email
        varchar username
        text password_hash
        varchar full_name
        enum status
        jsonb preferences
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    folders {
        uuid id PK
        uuid user_id FK
        uuid parent_folder_id FK
        varchar name
        text description
        boolean is_encrypted
        enum sync_status
        int sync_version
        timestamptz created_at
        timestamptz updated_at
    }

    journal_entries {
        uuid id PK
        uuid user_id FK
        uuid folder_id FK
        text title
        text content
        boolean content_encrypted
        enum status
        smallint mood_score
        jsonb weather
        jsonb location
        date entry_date
        enum sync_status
        int sync_version
        timestamptz created_at
        timestamptz updated_at
    }

    tags {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar color
        enum sync_status
        int sync_version
        timestamptz created_at
        timestamptz updated_at
    }

    entry_tags {
        uuid entry_id PK,FK
        uuid tag_id PK,FK
        timestamptz created_at
    }

    media_attachments {
        uuid id PK
        uuid entry_id FK
        varchar file_name
        varchar file_type
        bigint file_size
        text storage_path
        boolean is_encrypted
        text thumbnail_path
        jsonb metadata
        enum sync_status
        int sync_version
        timestamptz created_at
        timestamptz updated_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK
        text token
        jsonb device_info
        timestamptz expires_at
        timestamptz created_at
        timestamptz last_active_at
    }

    sync_metadata {
        uuid id PK
        uuid user_id FK
        varchar device_id
        timestamptz last_sync_at
        enum sync_status
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    users ||--o{ folders : "owns"
    users ||--o{ journal_entries : "owns"
    users ||--o{ tags : "owns"
    users ||--o{ user_sessions : "has"
    users ||--o{ sync_metadata : "has"
    folders ||--o{ journal_entries : "contains"
    folders ||--o{ folders : "parent_of"
    journal_entries ||--o{ media_attachments : "has"
    journal_entries ||--o{ entry_tags : "has"
    tags ||--o{ entry_tags : "used_in"
</erDiagram>
```

### Encryption Support

The schema includes several fields that support encryption:

- `journal_entries.content` with `content_encrypted` flag
- `folders.name` with `is_encrypted` flag
- `media_attachments.storage_path` with `is_encrypted` flag

These fields are individually encrypted using **AES-256-GCM** with per-user encryption keys. Each encrypted field stores:
- `encryptedData`: The ciphertext (base64 string)
- `key`: The encryption key (base64 string, derived per user/field)
- `nonce`: The initialization vector (IV, base64 string)
- `tag`: The authentication tag (base64 string)

A migration system is provided to encrypt existing data in the database, updating all relevant fields and storing the required encryption metadata.

**After making changes to encryption or running migrations, always run your test suite:**
```bash
yarn test
```
This ensures all encryption, decryption, and migration logic is working as expected.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/EchoPages-Journal.git
cd EchoPages-Journal
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- Database credentials
- OAuth provider credentials
- JWT secret
- Other configuration options

4. Run database migrations:
```bash
cd backend
yarn migration:run
```

5. Start the development servers:
```bash
# In the root directory
yarn dev
```

## Authentication Methods

### OAuth Providers

The application supports the following OAuth providers:
- Google
- Apple
- Microsoft

Configure your OAuth credentials in the `.env` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

### Biometric Authentication

The application supports various biometric authentication methods:
- Fingerprint
- Face ID
- Touch ID
- Windows Hello
- Iris scanning (where available)

To enable biometric authentication:
1. User must have a registered account
2. Enroll biometric device through the settings page
3. Use biometric login for subsequent sign-ins

## Security Considerations

- All biometric data is processed locally on the user's device
- Only cryptographic keys and verification data are stored on the server
- Each device enrollment creates a unique credential
- Users can manage and revoke device access
- Failed authentication attempts are rate-limited
- Session tokens are rotated regularly

## Development

### Available Scripts

```bash
# Install dependencies
yarn install

# Start development servers
yarn dev

# Run tests
yarn test

# Build for production
yarn build

# Run type checking
yarn type-check
```

### Adding New OAuth Providers

1. Add provider configuration in `backend/src/config/oauth.ts`
2. Create provider strategy in `backend/src/services/auth/strategies`
3. Update the OAuth service and routes
4. Add provider UI components in the frontend

### Adding New Biometric Methods

1. Add new biometric type in `packages/shared/types/biometric.ts`
2. Update the BiometricAuthService with new method support
3. Add platform-specific implementation in the frontend
4. Update the device enrollment UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Admin Panel Status

- **User Import/Export:** Implemented in the admin panel. Admins can now export all users as CSV or JSON and import users from CSV/JSON files. The UI provides accessibility features and feedback for successful or failed imports. This completes the core feature set for the admin panel.

- **Feature-Complete:** All core admin features are now production-ready. Only advanced/enterprise features remain as optional enhancements.

## Recent Updates

### Two-Factor Authentication (2FA)
- TOTP (authenticator app) 2FA is now supported for all users.
- Users can enable 2FA in Settings, scan a QR code, and verify with a 6-digit code from any authenticator app (Google Authenticator, Authy, etc).
- 2FA is required at login if enabled, with accessible error handling and help links.

### Accessibility & UI/UX Improvements
- Global focus-visible outlines for all interactive elements.
- All modals and cards use `aria-labelledby` and `aria-describedby` for screen reader navigation.
- All form fields have visible or `.sr-only` labels.
- High contrast and accessibility modes are user-toggleable.
- All error and status messages are accessible via `role="alert"` or `role="status"`.
- 2FA flows include clear instructions, help links, and error recovery guidance.

### Task & PRD Sync
- All authentication, accessibility, and UI/UX audit tasks are **complete**.
- Cross-platform sync, monitoring, diagnostics, and protocol buffer-based sync are **complete**.
- The next major task is **Multimedia Support** (images, video, audio, handwriting).

## What's Left To Do
- **Implement Multimedia Support:** Add support for images, videos, audio, and handwritten notes in journal entries.
- **Build Organization and Search Features:** Tagging, folders, advanced search, and calendar navigation.
- **Implement Customization and Themes:** Theme engine, custom colors, fonts, and stickers.
- **Develop Habit Tracking and Notifications:** Streaks, goals, reminders, and achievements.
- **Integrate External Services and APIs:** Google Calendar, Apple Health, Google Fit, weather/location.
- **Build Export and Backup Functionality:** PDF, RTF, Markdown, encrypted archive exports, scheduled/manual backups.
- **Implement AI Features and Prompts:** AI-generated journaling prompts and reflection suggestions.
- **Prepare for Launch and Beta Testing:** App store submissions, beta channels, support, and monitoring.

---

For details, see `tasks/tasks.json` and the PRD in `/docs`.

## Supported Media Types for Journal Entries

- **Images:** jpeg, png, gif, svg, etc.
- **Video:** mp4, mov, webm, etc.
- **Audio:** mp3, wav, m4a, etc.
- **Handwriting:** PNG, SVG, or vector data (stored as image or in metadata).

**Media metadata conventions:**
- For images: `{ width, height, exif? }`
- For video: `{ duration, width, height, codec }`
- For audio: `{ duration, codec }`
- For handwriting: `{ format: 'svg'|'png'|'json', data: string|object }`

See `Media.ts` and `Media.proto` for details.

## Mobile Sync Progress Bar and Settings

- The mobile app now includes a sync progress bar at the top of the main UI.
- Users can show/hide the progress bar from the Settings screen ("Sync Progress Bar" toggle).
- The preference is persisted and applies immediately.

## Organization and Search Features (Mobile)

- Organize entries into folders (create, rename, color, delete)
- Add, autocomplete, and manage tags for entries
- Search bar with filter chips for tags, folders, and date
- Calendar view for browsing entries by date
- All features are accessible and mobile-friendly

## Dynamic Theming & Font Size (Mobile)

EchoPages Journal mobile app supports dynamic theming, accent color, and font size, all user-configurable and accessible throughout the UI.

### How to Use the Theme System
- Use the `useTheme` hook from `packages/mobile/src/styles/ThemeContext` in any component to access the current theme.
- All theme values (colors, accent, typography, spacing, etc.) are available via the returned `theme` object.
- Always use theme values for colors, font sizes, and border radii instead of static values.

#### Example Usage
```tsx
import { useTheme } from '../styles/ThemeContext';
...
const theme = useTheme();
<Text style={{ color: theme.colors.onSurface, fontSize: theme.typography.fontSize.body, fontFamily: theme.typography.fontFamily }}>
  Themed text
</Text>
```

### Best Practices
- Use `theme.colors` for all colors, including accent and error states.
- Use `theme.typography.fontSize` and `fontFamily` for all text.
- Use `theme.shape.borderRadius` and `theme.spacing` for layout and shape.
- Allow font scaling for accessibility: `<Text allowFontScaling ... />`.
- Ensure color contrast meets WCAG 2.2 AA standards.

### Accessibility
- All text and UI elements should respect user font size and color preferences.
- Use semantic roles and accessibility labels where appropriate.

See [`docs/theming.md`](docs/theming.md) for more details and advanced usage.

## Database Credentials (Local Development)

The default Postgres credentials for local development are:

- **User:** postgres
- **Password:** postgres
- **Database:** echopages
- **Host:** localhost
- **Port:** 5432

If you need to change these, update the following environment variables:

- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_HOST`
- `DB_PORT`

You can set these in your shell or in a `.env` file at the project root.

---
