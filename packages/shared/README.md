# @echopages/shared

Shared utilities, types, and components for the EchoPages Journal application.

## Overview

This package contains code that is shared between the web, mobile, and desktop applications. This includes:

- Common types and interfaces
- Shared utilities and helpers
- Cross-platform components
- Constants and configuration
- Data models and validation schemas

## Usage

```typescript
import { someUtility } from '@echopages/shared/utilities';
import { SomeComponent } from '@echopages/shared/components';
import type { SomeType } from '@echopages/shared/types';
```

## Development

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# Run tests
yarn test

# Run linting
yarn lint
```

## Directory Structure

```
src/
  ├── components/     # Shared React components
  ├── constants/      # Application constants
  ├── types/         # TypeScript types and interfaces
  ├── utilities/     # Helper functions and utilities
  └── validation/    # Data validation schemas
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

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
