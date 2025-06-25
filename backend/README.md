# EchoPages Backend

## Backend Status (June 2024)

**Completed:**
- OAuth 2.0 authentication (Google, Apple, Microsoft)
- Biometric authentication (enrollment, verification)
- JWT session management
- Core database schema and migrations
- Export/backup endpoints
- Local storage encryption (AES-256, SQLCipher, secure key management)

**In Progress:**
- Real-time sync (WebSocket infra, conflict resolution)
- Organization/search endpoints

**Next:**
- Multimedia/media endpoints
- Integrations (calendar, health, weather)
- Performance, monitoring, diagnostics

The backend server for the EchoPages Journal application.

## Features

- **Authentication**
  - OAuth 2.0 integration (Google, Apple, Microsoft)
  - Biometric authentication support
  - JWT-based session management
  - Password reset and account recovery

- **Database**
  - PostgreSQL with TypeORM
  - Automatic migrations
  - Data encryption
  - Audit logging

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
yarn migration:run
```

4. Start the development server:
```bash
yarn dev
```

## Authentication Services

### OAuth Service

The `OAuthService` handles authentication with various OAuth providers:

```typescript
import { OAuthService } from './services/auth/OAuthService';

// Initialize the service
const oauthService = new OAuthService();

// Authenticate with a provider
const user = await oauthService.authenticate('google', profile);
```

Supported providers:
- Google (`google`)
- Apple (`apple`)
- Microsoft (`microsoft`)

### Biometric Authentication Service

The `BiometricAuthService` manages biometric device enrollment and verification:

```typescript
import { BiometricAuthService } from './services/auth/BiometricAuthService';

// Initialize the service
const biometricService = new BiometricAuthService(userRepository);

// Enroll a new device
const credential = await biometricService.enrollDevice({
  userId: 'user-123',
  deviceId: 'device-456',
  biometricType: BiometricType.FACE_ID,
  publicKey: 'base64-encoded-public-key',
  keyHandle: 'device-key-handle'
});

// Verify biometric authentication
const isValid = await biometricService.verifyBiometric({
  userId: 'user-123',
  deviceId: 'device-456',
  biometricType: BiometricType.FACE_ID,
  challenge: 'server-challenge',
  signature: 'signed-challenge'
});
```

## API Routes

### Authentication

```typescript
// OAuth routes
POST /auth/oauth/:provider/login
GET  /auth/oauth/:provider/callback

// Biometric routes
POST /auth/biometric/enroll
POST /auth/biometric/verify
GET  /auth/biometric/devices
DELETE /auth/biometric/devices/:id

// Traditional auth routes
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh-token
POST /auth/forgot-password
POST /auth/reset-password
```

## Development

### Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Run type checking
yarn type-check

# Generate migrations
yarn migration:generate

# Run migrations
yarn migration:run

# Revert migrations
yarn migration:revert
```

### Database Migrations

1. Make changes to entities
2. Generate migration:
```bash
yarn migration:generate src/migrations/DescriptiveName
```
3. Review generated migration
4. Run migration:
```bash
yarn migration:run
```

### Adding New OAuth Providers

1. Add provider configuration:
```typescript
// src/config/oauth.ts
export const oauthConfig = {
  newProvider: {
    clientId: process.env.NEW_PROVIDER_CLIENT_ID,
    clientSecret: process.env.NEW_PROVIDER_CLIENT_SECRET,
    callbackURL: '/auth/oauth/new-provider/callback'
  }
};
```

2. Create provider strategy:
```typescript
// src/services/auth/strategies/NewProviderStrategy.ts
import { Strategy } from 'passport-oauth2';

export class NewProviderStrategy extends Strategy {
  // Implementation
}
```

3. Update OAuthService:
```typescript
// src/services/auth/OAuthService.ts
this.registerStrategy('newProvider', new NewProviderStrategy());
```

### Adding New Biometric Methods

1. Add new type to BiometricType enum
2. Update BiometricAuthService with new method support
3. Add necessary validation and security checks
4. Update API documentation

## Encryption System

The backend uses field-level encryption for sensitive data using **AES-256-GCM**. For each encrypted field, the following metadata is stored (all as base64 strings):
- `encryptedData`: The ciphertext
- `key`: The encryption key (derived per user/field)
- `nonce`: The initialization vector (IV)
- `tag`: The authentication tag

A migration system is included to encrypt existing data and update the schema with the required metadata fields.

**After making changes to encryption or running migrations, always run your test suite:**
```bash
yarn test
```
This ensures all encryption, decryption, and migration logic is working as expected.

## Security Considerations

- All sensitive data is encrypted at rest
- API endpoints are rate-limited
- JWT tokens are short-lived
- Biometric data never leaves the user's device
- OAuth state parameters prevent CSRF attacks
- Input validation on all endpoints
- Regular security audits

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## License

MIT

## Synchronization Monitoring & Metrics

The backend WebSocket sync server now includes:

- **Structured logging** for all major sync events (connections, disconnections, sync requests, updates, errors, conflicts, resolutions).
- **In-memory metrics** for:
  - Total connections/disconnections
  - Sync requests
  - Sync updates
  - Sync errors
  - Sync conflicts
  - (Planned) Average sync request/response time

Metrics are logged to the server log every 5 minutes for diagnostics. For future extensibility, a `getMetrics()` method is available on the sync server class and can be exposed via an HTTP endpoint for dashboards or external monitoring (e.g., Prometheus scraping).

**How to extend:**
- To add more metrics, update the `syncMetrics` object in `WebSocketSyncServer.ts` and increment counters at relevant points.
- To expose metrics externally, add an HTTP endpoint in your backend (e.g., `/metrics`).

**Example log output:**
```
[SyncMetrics] {"totalConnections":12,"totalDisconnections":10,"syncRequests":34,"syncUpdates":21,"syncErrors":2,"syncConflicts":3,"lastMetricsLog":1710000000000}
```

See the code in `backend/src/services/sync/WebSocketSyncServer.ts` for details.

### Diagnostics Endpoint

You can access current sync metrics via the HTTP endpoint:

```
GET /sync/metrics
```

Returns a JSON object with metrics such as:

```
{
  "totalConnections": 12,
  "totalDisconnections": 10,
  "syncRequests": 34,
  "syncUpdates": 21,
  "syncErrors": 2,
  "syncConflicts": 3,
  "lastMetricsLog": 1710000000000
}
```

This endpoint is useful for monitoring, diagnostics, and integration with external dashboards or monitoring tools.

### Persistent Metrics Logging

In addition to in-memory and console metrics, the backend writes sync metrics snapshots to a rolling log file:

- **File:** `logs/sync-metrics.log`
- **Format:** One JSON object per line, every 5 minutes, with a timestamp
- **Retention:** Up to 10MB per file, 10 files (oldest files are deleted automatically)

This enables long-term analysis, export, and integration with external monitoring tools.

#### Downloading Metrics History

Admins can download the last 100 metrics snapshots via:

```
GET /sync/metrics/history
```

Returns an array of JSON objects (most recent last). This can be used for offline analysis, dashboarding, or troubleshooting.

The web admin dashboard also provides a "Download Metrics History" button for easy export.

### Protocol Buffer-Based Sync

Journal entry synchronization now uses protocol buffers for efficient, cross-platform serialization:

- **Format:** Each entry is serialized using protocol buffers, then base64-encoded for transmission.
- **Sync messages:**
  - `sync:changes` and `sync:update` payloads include `format: "protobuf-base64"` and an array of base64-encoded entries.
  - Example:
    ```json
    {
      "type": "sync:changes",
      "payload": {
        "changes": ["...base64...", "...base64..."],
        "format": "protobuf-base64"
      },
      "version": 1
    }
    ```
- **Versioning:** The `format` field allows for future upgrades and backward compatibility.
- **Legacy support:** If `format` is not present, the system falls back to JSON for legacy clients.

This reduces bandwidth usage and improves sync performance across all platforms.
