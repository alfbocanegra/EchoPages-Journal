import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateMoodToJson1710000000001 implements MigrationInterface {
  name = 'MigrateMoodToJson1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    if (isPostgres) {
      await queryRunner.query(`ALTER TABLE "entries" ALTER COLUMN "mood" TYPE jsonb USING mood::jsonb`);
    } else {
      // SQLite: SQLite does not support altering column types directly, so we need to recreate the table if needed.
      // For now, just document that mood should be JSON stored as TEXT.
      // If you need to migrate data, you may need to do a manual migration for SQLite.
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    if (isPostgres) {
      await queryRunner.query(`ALTER TABLE "entries" ALTER COLUMN "mood" TYPE varchar(20) USING mood::text`);
    } else {
      // SQLite: No-op for down migration.
    }
  }
} 