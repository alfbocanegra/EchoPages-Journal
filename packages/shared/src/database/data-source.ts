import { DataSource, DataSourceOptions } from 'typeorm';
// import { User, UserSettings, Entry, EntryVersion, Folder, Tag, Media } from '../entities';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

// Base configuration shared between all data sources
const baseConfig = {
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*.{js,ts}'],
  migrations: [
    __dirname + '/migrations/1710000000000-CreateInitialSchema.{js,ts}',
    __dirname + '/migrations/1710000000001-MigrateMoodToJson.{js,ts}',
  ],
  subscribers: [__dirname + '/subscribers/*.{js,ts}'],
};

// PostgreSQL configuration for backend
const postgresConfig: PostgresConnectionOptions = {
  ...baseConfig,
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'echopages',
};

// SQLite configuration for desktop/mobile
const sqliteConfig: SqliteConnectionOptions = {
  ...baseConfig,
  type: 'sqlite',
  database: ':memory:', // In-memory database for tests
};

// Export data sources
export const PostgresDataSource = new DataSource(postgresConfig);
export const SQLiteDataSource = new DataSource(sqliteConfig);

// Only export a single DataSource instance for TypeORM CLI compatibility
export const AppDataSource = new DataSource(postgresConfig);
