import { DataSource, DataSourceOptions } from 'typeorm';
import { User, UserSettings, Entry, EntryVersion, Folder, Tag, Media } from '../entities';

// Base configuration shared between all data sources
const baseConfig: Partial<DataSourceOptions> = {
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserSettings, Entry, EntryVersion, Folder, Tag, Media],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  subscribers: [__dirname + '/subscribers/*.{js,ts}'],
};

// PostgreSQL configuration for backend
export const postgresConfig: DataSourceOptions = {
  ...baseConfig,
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'echopages',
} as const;

// SQLite configuration for desktop/mobile
export const sqliteConfig: DataSourceOptions = {
  ...baseConfig,
  type: 'sqlite',
  database: ':memory:', // Default to in-memory, can be overridden
} as const;

// Export data sources
export const PostgresDataSource = new DataSource(postgresConfig);
export const SQLiteDataSource = new DataSource(sqliteConfig);
