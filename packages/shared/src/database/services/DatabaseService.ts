import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseConfig, DatabaseOptions } from '../config/DatabaseConfig';
import { User, UserSettings, Entry, EntryVersion, Folder, Tag, Media } from '../../entities';

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource | null = null;
  private config: DatabaseConfig;

  private constructor(config: DatabaseOptions) {
    this.config = config;
  }

  public static getInstance(config?: DatabaseOptions): DatabaseService {
    if (!DatabaseService.instance && config) {
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  private getBaseConfig(): Partial<DataSourceOptions> {
    return {
      entities: [User, UserSettings, Entry, EntryVersion, Folder, Tag, Media],
      migrations: [__dirname + '/../migrations/*.{js,ts}'],
      subscribers: [__dirname + '/../subscribers/*.{js,ts}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    };
  }

  private async createDataSource(): Promise<DataSource> {
    const baseConfig = this.getBaseConfig();
    const dataSourceConfig: DataSourceOptions = {
      ...baseConfig,
      type: this.config.type,
      ...this.config.options,
    } as DataSourceOptions;

    return new DataSource(dataSourceConfig);
  }

  public async initialize(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = await this.createDataSource();
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  public async getDataSource(): Promise<DataSource> {
    if (!this.dataSource?.isInitialized) {
      return this.initialize();
    }
    return this.dataSource;
  }

  public async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }
  }

  public async runMigrations(): Promise<void> {
    const dataSource = await this.getDataSource();
    await dataSource.runMigrations();
  }

  public async revertLastMigration(): Promise<void> {
    const dataSource = await this.getDataSource();
    await dataSource.undoLastMigration();
  }
}
