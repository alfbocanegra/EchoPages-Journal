import { DataSourceOptions } from 'typeorm';

export interface DatabaseConfig {
  type: 'postgres' | 'sqlite';
  options: Partial<DataSourceOptions>;
}

export interface PostgresConfig extends DatabaseConfig {
  type: 'postgres';
  options: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
  };
}

export interface SQLiteConfig extends DatabaseConfig {
  type: 'sqlite';
  options: {
    database: string;
    synchronize?: boolean;
  };
}

export type DatabaseType = 'postgres' | 'sqlite';
export type DatabaseOptions = PostgresConfig | SQLiteConfig;
