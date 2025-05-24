import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1710000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" varchar(255) UNIQUE NOT NULL,
                "username" varchar(50) UNIQUE NOT NULL,
                "password_hash" varchar(255) NOT NULL,
                "full_name" varchar(100),
                "bio" text,
                "avatar_url" varchar(255),
                "is_active" boolean DEFAULT true,
                "last_login_at" timestamp with time zone,
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now()
            )
        `);

    // User settings table
    await queryRunner.query(`
            CREATE TABLE "user_settings" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL UNIQUE,
                "theme" varchar(20) DEFAULT 'light',
                "language" varchar(10) DEFAULT 'en',
                "timezone" varchar(50) DEFAULT 'UTC',
                "notification_preferences" jsonb DEFAULT '{}',
                "encryption_key_hash" varchar(255),
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_user_settings_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    // Folders table
    await queryRunner.query(`
            CREATE TABLE "folders" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "name" varchar(100) NOT NULL,
                "description" text,
                "parent_id" uuid,
                "is_encrypted" boolean DEFAULT false,
                "sort_order" integer DEFAULT 0,
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_folders_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_folders_parent" FOREIGN KEY ("parent_id") 
                    REFERENCES "folders"("id") ON DELETE SET NULL
            )
        `);

    // Tags table
    await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "name" varchar(50) NOT NULL,
                "color" varchar(7) DEFAULT '#000000',
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_tags_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "uq_tags_user_name" UNIQUE ("user_id", "name")
            )
        `);

    // Entries table
    await queryRunner.query(`
            CREATE TABLE "entries" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "folder_id" uuid,
                "title" varchar(255),
                "content" text NOT NULL,
                "content_type" varchar(20) DEFAULT 'text',
                "is_encrypted" boolean DEFAULT false,
                "encryption_iv" varchar(32),
                "mood" varchar(20),
                "weather" jsonb,
                "location" jsonb,
                "is_favorite" boolean DEFAULT false,
                "is_pinned" boolean DEFAULT false,
                "local_id" varchar(255),
                "sync_status" varchar(20) DEFAULT 'synced',
                "last_sync_at" timestamp with time zone,
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_entries_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_entries_folder" FOREIGN KEY ("folder_id") 
                    REFERENCES "folders"("id") ON DELETE SET NULL
            )
        `);

    // Entry versions table for history and sync
    await queryRunner.query(`
            CREATE TABLE "entry_versions" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "entry_id" uuid NOT NULL,
                "content" text NOT NULL,
                "content_type" varchar(20) DEFAULT 'text',
                "is_encrypted" boolean DEFAULT false,
                "encryption_iv" varchar(32),
                "version_number" integer NOT NULL,
                "created_by_device" varchar(255),
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_entry_versions_entry" FOREIGN KEY ("entry_id") 
                    REFERENCES "entries"("id") ON DELETE CASCADE
            )
        `);

    // Entry tags junction table
    await queryRunner.query(`
            CREATE TABLE "entry_tags" (
                "entry_id" uuid NOT NULL,
                "tag_id" uuid NOT NULL,
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                PRIMARY KEY ("entry_id", "tag_id"),
                CONSTRAINT "fk_entry_tags_entry" FOREIGN KEY ("entry_id") 
                    REFERENCES "entries"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_entry_tags_tag" FOREIGN KEY ("tag_id") 
                    REFERENCES "tags"("id") ON DELETE CASCADE
            )
        `);

    // Media table
    await queryRunner.query(`
            CREATE TABLE "media" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "entry_id" uuid NOT NULL,
                "type" varchar(20) NOT NULL,
                "url" varchar(255) NOT NULL,
                "thumbnail_url" varchar(255),
                "filename" varchar(255) NOT NULL,
                "size" integer NOT NULL,
                "mime_type" varchar(100) NOT NULL,
                "metadata" jsonb DEFAULT '{}',
                "is_encrypted" boolean DEFAULT false,
                "encryption_iv" varchar(32),
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "fk_media_entry" FOREIGN KEY ("entry_id") 
                    REFERENCES "entries"("id") ON DELETE CASCADE
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
