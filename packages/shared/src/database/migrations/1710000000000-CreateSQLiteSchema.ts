import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSQLiteSchema1710000000000 implements MigrationInterface {
  name = 'CreateSQLiteSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" TEXT PRIMARY KEY,
                "email" TEXT UNIQUE NOT NULL,
                "username" TEXT UNIQUE NOT NULL,
                "password_hash" TEXT NOT NULL,
                "full_name" TEXT,
                "bio" TEXT,
                "avatar_url" TEXT,
                "is_active" INTEGER DEFAULT 1,
                "last_login_at" INTEGER,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
            )
        `);

    // User settings table
    await queryRunner.query(`
            CREATE TABLE "user_settings" (
                "id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL UNIQUE,
                "theme" TEXT DEFAULT 'light',
                "language" TEXT DEFAULT 'en',
                "timezone" TEXT DEFAULT 'UTC',
                "notification_preferences" TEXT DEFAULT '{}',
                "encryption_key_hash" TEXT,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    // Folders table
    await queryRunner.query(`
            CREATE TABLE "folders" (
                "id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "parent_id" TEXT,
                "is_encrypted" INTEGER DEFAULT 0,
                "sort_order" INTEGER DEFAULT 0,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE SET NULL
            )
        `);

    // Tags table
    await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "color" TEXT DEFAULT '#000000',
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                UNIQUE ("user_id", "name")
            )
        `);

    // Entries table
    await queryRunner.query(`
            CREATE TABLE "entries" (
                "id" TEXT PRIMARY KEY,
                "user_id" TEXT NOT NULL,
                "folder_id" TEXT,
                "title" TEXT,
                "content" TEXT NOT NULL,
                "content_type" TEXT DEFAULT 'text',
                "is_encrypted" INTEGER DEFAULT 0,
                "encryption_iv" TEXT,
                "mood" TEXT,
                "weather" TEXT,
                "location" TEXT,
                "is_favorite" INTEGER DEFAULT 0,
                "is_pinned" INTEGER DEFAULT 0,
                "local_id" TEXT,
                "sync_status" TEXT DEFAULT 'synced',
                "last_sync_at" INTEGER,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL
            )
        `);

    // Entry versions table
    await queryRunner.query(`
            CREATE TABLE "entry_versions" (
                "id" TEXT PRIMARY KEY,
                "entry_id" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "content_type" TEXT DEFAULT 'text',
                "is_encrypted" INTEGER DEFAULT 0,
                "encryption_iv" TEXT,
                "version_number" INTEGER NOT NULL,
                "created_by_device" TEXT,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE
            )
        `);

    // Entry tags junction table
    await queryRunner.query(`
            CREATE TABLE "entry_tags" (
                "entry_id" TEXT NOT NULL,
                "tag_id" TEXT NOT NULL,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                PRIMARY KEY ("entry_id", "tag_id"),
                FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE,
                FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
            )
        `);

    // Media table
    await queryRunner.query(`
            CREATE TABLE "media" (
                "id" TEXT PRIMARY KEY,
                "entry_id" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "url" TEXT NOT NULL,
                "thumbnail_url" TEXT,
                "filename" TEXT NOT NULL,
                "size" INTEGER NOT NULL,
                "mime_type" TEXT NOT NULL,
                "metadata" TEXT DEFAULT '{}',
                "is_encrypted" INTEGER DEFAULT 0,
                "encryption_iv" TEXT,
                "created_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                "updated_at" INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE
            )
        `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_username" ON "users"("username")`);
    await queryRunner.query(`CREATE INDEX "idx_folders_user_id" ON "folders"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_folders_parent_id" ON "folders"("parent_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tags_user_id" ON "tags"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_entries_user_id" ON "entries"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_entries_folder_id" ON "entries"("folder_id")`);
    await queryRunner.query(`CREATE INDEX "idx_entries_created_at" ON "entries"("created_at")`);
    await queryRunner.query(
      `CREATE INDEX "idx_entry_versions_entry_id" ON "entry_versions"("entry_id")`
    );
    await queryRunner.query(`CREATE INDEX "idx_media_entry_id" ON "media"("entry_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "entry_tags"`);
    await queryRunner.query(`DROP TABLE "entry_versions"`);
    await queryRunner.query(`DROP TABLE "entries"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "folders"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
