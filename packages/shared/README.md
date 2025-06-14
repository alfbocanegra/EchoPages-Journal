# @echopages/shared

Shared types, entities, and utilities for the EchoPages Journal application.

## Installation

```bash
yarn add @echopages/shared
```

## Usage

### Authentication Types

#### OAuth

```typescript
import { OAuthProvider } from '@echopages/shared';

// Available OAuth providers
const provider: OAuthProvider = OAuthProvider.GOOGLE; // 'google' | 'apple' | 'microsoft'
```

#### Biometric Authentication

```typescript
import { 
  BiometricType, 
  BiometricCredential,
  BiometricEnrollRequest,
  BiometricAuthRequest 
} from '@echopages/shared';

// Available biometric types
const biometricType: BiometricType = BiometricType.FINGERPRINT;
// 'fingerprint' | 'face' | 'iris' | 'touch_id' | 'face_id' | 'windows_hello'

// Enroll a new device
const enrollRequest: BiometricEnrollRequest = {
  userId: 'user-123',
  deviceId: 'device-456',
  biometricType: BiometricType.FACE_ID,
  publicKey: 'base64-encoded-public-key',
  keyHandle: 'device-key-handle'
};

// Authenticate with biometrics
const authRequest: BiometricAuthRequest = {
  userId: 'user-123',
  deviceId: 'device-456',
  biometricType: BiometricType.FACE_ID,
  challenge: 'server-challenge',
  signature: 'signed-challenge'
};
```

### User Entity

```typescript
import { User, UserRole } from '@echopages/shared';

// User roles
const role: UserRole = UserRole.USER; // 'user' | 'admin'

// User entity with TypeORM decorators
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // ... other properties
}
```

### Biometric Credential Entity

```typescript
import { BiometricCredential, BiometricMetadata } from '@echopages/shared';

// Biometric metadata structure
const metadata: BiometricMetadata = {
  enrolledAt: new Date().toISOString(),
  lastVerified: null
};

// Biometric credential entity with TypeORM decorators
@Entity('biometric_credentials')
export class BiometricCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  // ... other properties
}
```

## Development

### Building

```bash
yarn build
```

### Type Checking

```bash
yarn type-check
```

### Testing

```bash
yarn test
```

## Directory Structure

```
shared/
├── src/
│   ├── constants/    # Shared constants
│   ├── hooks/        # React hooks
│   ├── services/     # Shared services
│   └── utils/        # Utility functions
├── types/
│   ├── index.ts      # Type exports
│   ├── user.ts       # User types and entity
│   └── biometric.ts  # Biometric types and entity
└── package.json
```

## Contributing

1. Make your changes in a feature branch
2. Update tests if necessary
3. Run `yarn type-check` and `yarn test`
4. Submit a pull request

## License

MIT

# EchoPages Shared Package

This package contains shared code, types, and utilities used across the EchoPages application ecosystem, including the web backend, desktop app, and mobile app.

## Database Setup

The shared package provides a unified database interface that supports both PostgreSQL (for the backend) and SQLite (for desktop/mobile apps) through TypeORM.

### Installation

```bash
# Install dependencies
yarn add typeorm reflect-metadata
yarn add pg sqlite3 # Database drivers
yarn add -D @types/node
```

### Database Initialization

#### PostgreSQL (Backend)

```typescript
import { DatabaseService, PostgresConfig } from '@echopages/shared';

const dbConfig: PostgresConfig = {
  type: 'postgres',
  options: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'echopages',
    ssl: process.env.DB_SSL === 'true',
  },
};

// Initialize database
const dbService = DatabaseService.getInstance(dbConfig);
await dbService.initialize();

// Run migrations
await dbService.runMigrations();
```

#### SQLite (Desktop/Mobile)

```typescript
import { DatabaseService, SQLiteConfig } from '@echopages/shared';
import path from 'path';

const dbConfig: SQLiteConfig = {
  type: 'sqlite',
  options: {
    database: path.join(process.env.APP_DATA_PATH || '.', 'echopages.db'),
    synchronize: process.env.NODE_ENV === 'development', // Enable only in development
  },
};

// Initialize database
const dbService = DatabaseService.getInstance(dbConfig);
await dbService.initialize();

// Run migrations
await dbService.runMigrations();
```

### Environment Variables

#### PostgreSQL Configuration

- `DB_HOST`: Database host (default: 'localhost')
- `DB_PORT`: Database port (default: '5432')
- `DB_USER`: Database username (default: 'postgres')
- `DB_PASSWORD`: Database password (default: 'postgres')
- `DB_NAME`: Database name (default: 'echopages')
- `DB_SSL`: Enable SSL connection (default: false)

#### SQLite Configuration

- `APP_DATA_PATH`: Path to store the SQLite database file
- `NODE_ENV`: Application environment ('development' or 'production')

### Available Entities

- `User`: User account information
- `UserSettings`: User preferences and settings
- `Entry`: Journal entries
- `EntryVersion`: Version history for entries
- `Folder`: Hierarchical organization structure
- `Tag`: Entry categorization
- `Media`: File attachments and media

### Database Operations

```typescript
// Get database instance
const dbService = DatabaseService.getInstance();
const dataSource = await dbService.getDataSource();

// Run migrations
await dbService.runMigrations();

// Revert last migration
await dbService.revertLastMigration();

// Disconnect
await dbService.disconnect();
```

### Migrations

The package includes two sets of migrations:

1. `CreateInitialSchema`: PostgreSQL schema for the backend
2. `CreateSQLiteSchema`: SQLite schema for desktop/mobile apps

Migrations are automatically run when calling `dbService.runMigrations()`.
