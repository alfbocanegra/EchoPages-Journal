import { Pool, PoolClient } from 'pg';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService } from '../services/encryption';
import { Logger } from 'winston';
import { QueryRunner } from 'typeorm';

interface MigrationProgress {
  total: number;
  processed: number;
  errors: number;
}

interface JournalEntry {
  id: string;
  user_id: string;
  folder_id?: string;
  title?: string;
  content: string;
  content_encrypted: number;
  encrypted_content?: Buffer;
  content_key?: Buffer;
  content_nonce?: Buffer;
  content_tag?: Buffer;
  status: string;
  mood_score?: number;
  weather?: string;
  location?: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
  sync_version: number;
  password_hash: string;
}

interface Folder {
  id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  is_encrypted: number;
  encrypted_name?: Buffer;
  encrypted_description?: Buffer;
  folder_key?: Buffer;
  folder_nonce?: Buffer;
  folder_tag?: Buffer;
  created_at: string;
  updated_at: string;
  password_hash: string;
}

interface MediaAttachment {
  id: string;
  user_id: string;
  journal_entry_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number;
  is_encrypted: number;
  encrypted_file?: Buffer;
  file_key?: Buffer;
  file_nonce?: Buffer;
  file_tag?: Buffer;
  created_at: string;
  updated_at: string;
  password_hash: string;
}

export class DataEncryptionMigration {
  private progress: {
    journalEntries: MigrationProgress;
    folders: MigrationProgress;
    media: MigrationProgress;
  };

  constructor(
    private pgPool: Pool | null,
    private sqliteDb: Database | null,
    private encryptionService: EncryptionService,
    private logger: Logger,
    private batchSize: number = 100
  ) {
    this.progress = {
      journalEntries: { total: 0, processed: 0, errors: 0 },
      folders: { total: 0, processed: 0, errors: 0 },
      media: { total: 0, processed: 0, errors: 0 },
    };
  }

  async migrateAll(): Promise<void> {
    try {
      // Start with PostgreSQL migration
      if (this.pgPool) {
        await this.migratePgData();
      }

      // Then migrate SQLite if available
      if (this.sqliteDb) {
        await this.migrateSqliteData();
      }
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  private async migratePgData(): Promise<void> {
    if (!this.pgPool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    const client = await this.pgPool.connect();
    try {
      await client.query('BEGIN');

      // Get counts for progress tracking
      const counts = await this.getPgCounts(client);
      this.progress.journalEntries.total = counts.journalEntries;
      this.progress.folders.total = counts.folders;
      this.progress.media.total = counts.media;

      // Migrate journal entries
      await this.migrateJournalEntriesPg(client);

      // Migrate folders
      await this.migrateFoldersPg(client);

      // Migrate media attachments
      await this.mediaAttachmentsPg(client);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async migrateSqliteData(): Promise<void> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.sqliteDb!.serialize(() => {
        this.sqliteDb!.run('BEGIN TRANSACTION');

        // Similar structure to PG migration but using SQLite syntax
        this.migrateJournalEntriesSqlite()
          .then(() => this.migrateFoldersSqlite())
          .then(() => this.mediaAttachmentsSqlite())
          .then(() => {
            this.sqliteDb!.run('COMMIT', err => {
              if (err) reject(err);
              else resolve();
            });
          })
          .catch(error => {
            this.sqliteDb!.run('ROLLBACK', err => {
              if (err) {
                this.logger.error('Failed to rollback transaction:', err);
              }
              reject(error);
            });
          });
      });
    });
  }

  private async migrateJournalEntriesPg(client: PoolClient): Promise<void> {
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const { rows } = await client.query(
        `
        SELECT j.*, u.password_hash
        FROM journal_entries j
        JOIN users u ON j.user_id = u.id
        WHERE NOT j.content_encrypted 
            AND j.content IS NOT NULL
        LIMIT $1 OFFSET $2
        `,
        [this.batchSize, offset]
      );

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const entry of rows) {
        try {
          const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
            entry.content
          );

          await client.query(
            `
            UPDATE journal_entries
            SET content_encrypted = true,
                encrypted_content = $1,
                content_key = $2,
                content_nonce = $3,
                content_tag = $4
            WHERE id = $5
            `,
            [encryptedData, key, nonce, tag, entry.id]
          );

          await client.query(
            `
            INSERT INTO encryption_metadata 
            (id, user_id, entity_type, entity_id)
            VALUES ($1, $2, $3, $4)
            `,
            [uuidv4(), entry.user_id, 'journal_entry', entry.id]
          );

          this.progress.journalEntries.processed++;
        } catch (error) {
          this.progress.journalEntries.errors++;
          this.logger.error(`Failed to encrypt journal entry ${entry.id}:`, error);
        }
      }

      offset += rows.length;
      this.logProgress('Journal Entries');
    }
  }

  private async migrateFoldersPg(client: PoolClient): Promise<void> {
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const { rows } = await client.query(
        `
        SELECT f.*, u.password_hash
        FROM folders f
        JOIN users u ON f.user_id = u.id
        WHERE NOT f.is_encrypted 
            AND (f.name IS NOT NULL OR f.description IS NOT NULL)
        LIMIT $1 OFFSET $2
        `,
        [this.batchSize, offset]
      );

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const folder of rows) {
        try {
          if (folder.name) {
            const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
              folder.name
            );

            await client.query(
              `
              UPDATE folders
              SET is_encrypted = true,
                  encrypted_name = $1,
                  folder_key = $2,
                  folder_nonce = $3,
                  folder_tag = $4
              WHERE id = $5
              `,
              [encryptedData, key, nonce, tag, folder.id]
            );
          }

          if (folder.description) {
            const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
              folder.description
            );

            await client.query(
              `
              UPDATE folders
              SET is_encrypted = true,
                  encrypted_description = $1,
                  folder_key = $2,
                  folder_nonce = $3,
                  folder_tag = $4
              WHERE id = $5
              `,
              [encryptedData, key, nonce, tag, folder.id]
            );
          }

          await client.query(
            `
            INSERT INTO encryption_metadata 
            (id, user_id, entity_type, entity_id)
            VALUES ($1, $2, $3, $4)
            `,
            [uuidv4(), folder.user_id, 'folder', folder.id]
          );

          this.progress.folders.processed++;
        } catch (error) {
          this.progress.folders.errors++;
          this.logger.error(`Failed to encrypt folder ${folder.id}:`, error);
        }
      }

      offset += rows.length;
      this.logProgress('Folders');
    }
  }

  private async mediaAttachmentsPg(client: PoolClient): Promise<void> {
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const { rows } = await client.query(
        `
        SELECT m.*, u.password_hash
        FROM media_attachments m
        JOIN journal_entries j ON m.journal_entry_id = j.id
        JOIN users u ON j.user_id = u.id
        WHERE NOT m.is_encrypted 
        LIMIT $1 OFFSET $2
        `,
        [this.batchSize, offset]
      );

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const media of rows) {
        try {
          // Media content encryption would be handled by a separate service
          // Here we just update the metadata
          await client.query(
            `
            UPDATE media_attachments
            SET is_encrypted = true
            WHERE id = $1
            `,
            [media.id]
          );

          await client.query(
            `
            INSERT INTO encryption_metadata 
            (id, user_id, entity_type, entity_id)
            VALUES ($1, $2, $3, $4)
            `,
            [uuidv4(), media.user_id, 'media', media.id]
          );

          this.progress.media.processed++;
        } catch (error) {
          this.progress.media.errors++;
          this.logger.error(`Failed to encrypt media ${media.id}:`, error);
        }
      }

      offset += rows.length;
      this.logProgress('Media');
    }
  }

  private async migrateJournalEntriesSqlite(): Promise<void> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized');
    }
    const db = this.sqliteDb;

    // Initialize progress count
    await new Promise<void>((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM journal_entries WHERE content_encrypted = 0 AND content IS NOT NULL`,
        (err, row: { count: number }) => {
          if (err) reject(err);
          else {
            this.progress.journalEntries.total = row.count;
            resolve();
          }
        }
      );
    });

    return new Promise((resolve, reject) => {
      const entries: JournalEntry[] = [];
      let hasError = false;

      // First, collect all entries that need encryption
      db.each<JournalEntry>(
        `
        SELECT j.*, u.password_hash
        FROM journal_entries j
        JOIN users u ON j.user_id = u.id
        WHERE j.content_encrypted = 0 
            AND j.content IS NOT NULL
        `,
        (err, entry: JournalEntry) => {
          if (err) {
            this.progress.journalEntries.errors++;
            this.logger.error(`Failed to read journal entry:`, err);
            hasError = true;
            return;
          }
          entries.push(entry);
        },
        async err => {
          if (err || hasError) {
            reject(err || new Error('Failed to read journal entries'));
            return;
          }

          try {
            // Process all entries in series to avoid SQLite concurrency issues
            for (const entry of entries) {
              try {
                const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
                  entry.content
                );

                await new Promise<void>((resolveUpdate, rejectUpdate) => {
                  db.run(
                    `
                    UPDATE journal_entries
                    SET content_encrypted = 1,
                        encrypted_content = ?,
                        content_key = ?,
                        content_nonce = ?,
                        content_tag = ?
                    WHERE id = ?
                    `,
                    [encryptedData, key, nonce, tag, entry.id],
                    err => {
                      if (err) rejectUpdate(err);
                      else resolveUpdate();
                    }
                  );
                });

                await new Promise<void>((resolveInsert, rejectInsert) => {
                  db.run(
                    `
                    INSERT INTO encryption_metadata 
                    (id, user_id, entity_type, entity_id)
                    VALUES (?, ?, ?, ?)
                    `,
                    [uuidv4(), entry.user_id, 'journal_entry', entry.id],
                    err => {
                      if (err) rejectInsert(err);
                      else resolveInsert();
                    }
                  );
                });

                this.progress.journalEntries.processed++;
                this.logProgress('Journal Entries');
              } catch (error) {
                this.progress.journalEntries.errors++;
                this.logger.error(`Failed to encrypt journal entry ${entry.id}:`, error);
                reject(error);
                return;
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  private async migrateFoldersSqlite(): Promise<void> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized');
    }
    const db = this.sqliteDb;

    // Initialize progress count
    await new Promise<void>((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM folders WHERE is_encrypted = 0 AND (name IS NOT NULL OR description IS NOT NULL)`,
        (err, row: { count: number }) => {
          if (err) reject(err);
          else {
            this.progress.folders.total = row.count;
            resolve();
          }
        }
      );
    });

    return new Promise((resolve, reject) => {
      const folders: Folder[] = [];
      let hasError = false;

      // First, collect all folders that need encryption
      db.each<Folder>(
        `
        SELECT f.*, u.password_hash
        FROM folders f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_encrypted = 0 
            AND (f.name IS NOT NULL OR f.description IS NOT NULL)
        `,
        (err, folder) => {
          if (err) {
            this.progress.folders.errors++;
            this.logger.error(`Failed to read folder:`, err);
            hasError = true;
            return;
          }
          folders.push(folder);
        },
        async err => {
          if (err || hasError) {
            reject(err || new Error('Failed to read folders'));
            return;
          }

          try {
            // Process all folders in series to avoid SQLite concurrency issues
            for (const folder of folders) {
              try {
                if (folder.name) {
                  const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
                    folder.name
                  );

                  await new Promise<void>((resolveUpdate, rejectUpdate) => {
                    db.run(
                      `
                      UPDATE folders
                      SET is_encrypted = 1,
                          encrypted_name = ?,
                          folder_key = ?,
                          folder_nonce = ?,
                          folder_tag = ?
                      WHERE id = ?
                      `,
                      [encryptedData, key, nonce, tag, folder.id],
                      err => {
                        if (err) rejectUpdate(err);
                        else resolveUpdate();
                      }
                    );
                  });
                }

                if (folder.description) {
                  const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
                    folder.description
                  );

                  await new Promise<void>((resolveUpdate, rejectUpdate) => {
                    db.run(
                      `
                      UPDATE folders
                      SET is_encrypted = 1,
                          encrypted_description = ?,
                          folder_key = ?,
                          folder_nonce = ?,
                          folder_tag = ?
                      WHERE id = ?
                      `,
                      [encryptedData, key, nonce, tag, folder.id],
                      err => {
                        if (err) rejectUpdate(err);
                        else resolveUpdate();
                      }
                    );
                  });
                }

                await new Promise<void>((resolveInsert, rejectInsert) => {
                  db.run(
                    `
                    INSERT INTO encryption_metadata 
                    (id, user_id, entity_type, entity_id)
                    VALUES (?, ?, ?, ?)
                    `,
                    [uuidv4(), folder.user_id, 'folder', folder.id],
                    err => {
                      if (err) rejectInsert(err);
                      else resolveInsert();
                    }
                  );
                });

                this.progress.folders.processed++;
                this.logProgress('Folders');
              } catch (error) {
                this.progress.folders.errors++;
                this.logger.error(`Failed to encrypt folder ${folder.id}:`, error);
                reject(error);
                return;
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  private async mediaAttachmentsSqlite(): Promise<void> {
    if (!this.sqliteDb) {
      throw new Error('SQLite database not initialized');
    }
    const db = this.sqliteDb;

    // Initialize progress count
    await new Promise<void>((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM media_attachments WHERE is_encrypted = 0`,
        (err, row: { count: number }) => {
          if (err) reject(err);
          else {
            this.progress.media.total = row.count;
            resolve();
          }
        }
      );
    });

    return new Promise((resolve, reject) => {
      let hasError = false;

      db.each<MediaAttachment>(
        `
        SELECT m.*, u.password_hash
        FROM media_attachments m
        JOIN journal_entries j ON m.journal_entry_id = j.id
        JOIN users u ON j.user_id = u.id
        WHERE m.is_encrypted = 0
        `,
        async (err, media) => {
          if (err) {
            this.progress.media.errors++;
            this.logger.error(`Failed to read media attachment:`, err);
            hasError = true;
            return;
          }

          try {
            // Media content encryption would be handled by a separate service
            // Here we just update the metadata
            await new Promise<void>((resolveUpdate, rejectUpdate) => {
              db.run(
                `
                UPDATE media_attachments
                SET is_encrypted = 1
                WHERE id = ?
                `,
                [media.id],
                err => {
                  if (err) rejectUpdate(err);
                  else resolveUpdate();
                }
              );
            });

            await new Promise<void>((resolveInsert, rejectInsert) => {
              db.run(
                `
                INSERT INTO encryption_metadata 
                (id, user_id, entity_type, entity_id)
                VALUES (?, ?, ?, ?)
                `,
                [uuidv4(), media.user_id, 'media', media.id],
                err => {
                  if (err) rejectInsert(err);
                  else resolveInsert();
                }
              );
            });

            this.progress.media.processed++;
            this.logProgress('Media');
          } catch (error) {
            this.progress.media.errors++;
            this.logger.error(`Failed to encrypt media ${media.id}:`, error);
            reject(error);
            return;
          }
        },
        err => {
          if (err || hasError) {
            reject(err || new Error('Failed to process media attachments'));
          } else {
            resolve();
          }
        }
      );
    });
  }

  private async getPgCounts(client: PoolClient): Promise<{
    journalEntries: number;
    folders: number;
    media: number;
  }> {
    const {
      rows: [counts],
    } = await client.query(`
            SELECT
                (SELECT COUNT(*) FROM journal_entries 
                 WHERE NOT content_encrypted AND content IS NOT NULL) as journal_entries,
                (SELECT COUNT(*) FROM folders 
                 WHERE NOT is_encrypted AND (name IS NOT NULL OR description IS NOT NULL)) as folders,
                (SELECT COUNT(*) FROM media_attachments WHERE NOT is_encrypted) as media
        `);
    return counts;
  }

  private logProgress(entity: string): void {
    let key: keyof typeof this.progress | undefined;

    // Map display names to progress keys
    switch (
      entity
        .toLowerCase()
        .replace(/\s+\([^)]*\)/g, '')
        .trim()
    ) {
      case 'journal entries':
        key = 'journalEntries';
        break;
      case 'folders':
        key = 'folders';
        break;
      case 'media':
        key = 'media';
        break;
      default:
        this.logger.error(`Invalid progress entity: ${entity}`);
        return;
    }

    if (!key) {
      this.logger.error(`Failed to map entity to progress key: ${entity}`);
      return;
    }

    const progress = this.progress[key];
    const percentage = ((progress.processed / progress.total) * 100).toFixed(2);
    this.logger.info(
      `${entity} Progress: ${progress.processed}/${progress.total} (${percentage}%) - Errors: ${progress.errors}`
    );
  }
}

async function processJournalEntries(
  queryRunner: QueryRunner,
  encryptionService: EncryptionService,
  batchSize = 100
): Promise<void> {
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const entries = await queryRunner.query(`SELECT * FROM journal_entries LIMIT $1 OFFSET $2`, [
      batchSize,
      offset,
    ]);

    if (entries.length === 0) {
      hasMore = false;
      break;
    }

    // Process entries...
    offset += batchSize;
  }
}

async function processFolders(
  queryRunner: QueryRunner,
  encryptionService: EncryptionService,
  batchSize = 100
): Promise<void> {
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const folders = await queryRunner.query(`SELECT * FROM folders LIMIT $1 OFFSET $2`, [
      batchSize,
      offset,
    ]);

    if (folders.length === 0) {
      hasMore = false;
      break;
    }

    // Process folders...
    offset += batchSize;
  }
}

async function processTags(
  queryRunner: QueryRunner,
  encryptionService: EncryptionService,
  batchSize = 100
): Promise<void> {
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const tags = await queryRunner.query(`SELECT * FROM tags LIMIT $1 OFFSET $2`, [
      batchSize,
      offset,
    ]);

    if (tags.length === 0) {
      hasMore = false;
      break;
    }

    // Process tags...
    offset += batchSize;
  }
}

async function updateJournalEntryProgress(total: number): Promise<void> {
  // Update progress...
}

async function updateFolderProgress(total: number): Promise<void> {
  // Update progress...
}

async function updateTagProgress(total: number): Promise<void> {
  // Update progress...
}
