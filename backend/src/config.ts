import { EncryptionConfig } from './services/encryption/encryption';

interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface SQLiteConfig {
  path: string;
}

interface Config {
  postgres: PostgresConfig;
  sqlite: SQLiteConfig;
  encryption: EncryptionConfig;
}

export const config: Config = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'echopages',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
  sqlite: {
    path: process.env.SQLITE_PATH || './data/echopages.db',
  },
  encryption: {
    keyLength: 32, // 256 bits
    saltLength: 16,
    algorithm: 'aes-256-gcm',
    iterations: 100000,
    ivLength: 12,
    digest: 'sha256',
    tagLength: 16,
  },
};
