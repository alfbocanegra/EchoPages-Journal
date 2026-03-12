import { Pool } from 'pg';
import { Database } from 'sqlite3';
import { program } from 'commander';
import { DataEncryptionMigration } from '../migrations/encryptExistingData';
import { createLogger } from '../utils/logger';
import { createEncryptionService } from '../services/encryption';
import { config } from '../config';

program
  .option('-p, --postgres-only', 'Only migrate PostgreSQL data')
  .option('-s, --sqlite-only', 'Only migrate SQLite data')
  .option('-b, --batch-size <size>', 'Number of records to process in each batch', '100')
  .option('--dry-run', 'Show what would be migrated without making changes')
  .parse(process.argv);

const options = program.opts();

async function main() {
  const logger = createLogger('encryption-migration');
  let pgPool: Pool | null = null;
  let sqliteDb: Database | null = null;

  try {
    // Initialize PostgreSQL connection if needed
    if (!options.sqliteOnly) {
      pgPool = new Pool(config.postgres);
      logger.info('Connected to PostgreSQL');
    }

    // Initialize SQLite connection if needed
    if (!options.postgresOnly) {
      sqliteDb = new Database(config.sqlite.path);
      logger.info('Connected to SQLite database');
    }

    // Create encryption service with a dummy key for migration
    const encryptionService = createEncryptionService({
      key: process.env.ENCRYPTION_KEY || 'dummy-key-for-migration',
    });

    // Create migration instance
    const migration = new DataEncryptionMigration(
      pgPool,
      sqliteDb,
      encryptionService,
      logger,
      parseInt(options.batchSize)
    );

    if (options.dryRun) {
      // Get counts without making changes
      logger.info('Dry run - would show migration counts');
      return;
    }

    // Run the migration
    await migration.migrateAll();
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Clean up connections
    if (pgPool) await pgPool.end();
    if (sqliteDb) sqliteDb.close();
  }
}

main();
