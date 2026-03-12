import { Pool } from 'pg';
import { Entry } from '@echopages/shared';
import { CacheService } from '../services/cache/CacheService';
import { EncryptionService, EncryptedData } from '../encryption/encryption.service';

export class JournalEntryRepository {
  constructor(
    private readonly pool: Pool,
    private readonly cache: CacheService,
    private readonly encryptionService: EncryptionService
  ) {}

  async getById(id: string): Promise<Entry | null> {
    const cached = await this.cache.getJournalEntry(id);
    if (cached) {
      return cached;
    }

    const result = await this.pool.query('SELECT * FROM entries WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const entry = this.mapDatabaseToEntity(result.rows[0]);
    await this.cache.cacheJournalEntry(id, entry);

    return entry;
  }

  async getByUserId(userId: string): Promise<Entry[]> {
    const cached = await this.cache.getUserEntries(userId);
    if (cached) {
      return cached;
    }

    const result = await this.pool.query(
      'SELECT * FROM entries WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const entries = result.rows.map(this.mapDatabaseToEntity);
    await this.cache.cacheUserEntries(userId, entries);

    return entries;
  }

  private mapDatabaseToEntity(row: Record<string, any>): Entry {
    const entry = new Entry();
    entry.id = row.id;
    entry.userId = row.user_id;
    entry.content = row.content;
    entry.contentType = row.content_type;
    entry.isEncrypted = row.is_encrypted;
    entry.isFavorite = row.is_favorite;
    entry.isPinned = row.is_pinned;
    entry.syncStatus = row.sync_status;
    entry.createdAt = row.created_at;
    entry.updatedAt = row.updated_at;
    return entry;
  }

  async create(entry: Partial<Entry>): Promise<Entry> {
    let encrypted: EncryptedData | null = null;
    if (entry.content && entry.isEncrypted && entry.userId) {
      encrypted = await this.encryptionService.encrypt(entry.userId, entry.content);
      entry.content = encrypted.encryptedData;
    }

    let sql = `INSERT INTO entries (
      id, user_id, content, content_type, is_encrypted, is_favorite, is_pinned, sync_status, created_at, updated_at`;
    let placeholders = '$1, $2, $3, $4, $5, $6, $7, $8, $9, $10';
    const params: any[] = [
      entry.id,
      entry.userId,
      entry.content,
      entry.contentType,
      entry.isEncrypted,
      entry.isFavorite,
      entry.isPinned,
      entry.syncStatus,
      entry.createdAt,
      entry.updatedAt,
    ];
    if (encrypted) {
      sql += ', content_key, content_nonce, content_tag';
      placeholders += ', $11, $12, $13';
      params.push(encrypted.key, encrypted.nonce, encrypted.tag);
    }
    sql += `) VALUES (${placeholders}) RETURNING *`;

    const result = await this.pool.query(sql, params);
    const newEntry = this.mapDatabaseToEntity(result.rows[0]);
    await this.cache.cacheJournalEntry(newEntry.id, newEntry);
    return newEntry;
  }

  async update(id: string, entry: Partial<Entry>): Promise<Entry> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('Entry not found');
    }

    let encrypted: EncryptedData | null = null;
    if (entry.content && entry.isEncrypted) {
      encrypted = await this.encryptionService.encrypt(current.userId, entry.content);
      entry.content = encrypted.encryptedData;
    }

    let sql = `UPDATE entries SET
      content = COALESCE($1, content),
      content_type = COALESCE($2, content_type),
      is_encrypted = COALESCE($3, is_encrypted),
      is_favorite = COALESCE($4, is_favorite),
      is_pinned = COALESCE($5, is_pinned),
      sync_status = COALESCE($6, sync_status),
      updated_at = $7`;
    const params: any[] = [
      entry.content ?? current.content,
      entry.contentType ?? current.contentType,
      entry.isEncrypted ?? current.isEncrypted,
      entry.isFavorite ?? current.isFavorite,
      entry.isPinned ?? current.isPinned,
      entry.syncStatus ?? current.syncStatus,
      new Date(),
      id,
    ];
    if (encrypted) {
      sql += ', content_key = $9, content_nonce = $10, content_tag = $11';
      params.push(encrypted.key, encrypted.nonce, encrypted.tag);
    }
    sql += ' WHERE id = $8 RETURNING *';

    const result = await this.pool.query(sql, params);
    const updatedEntry = this.mapDatabaseToEntity(result.rows[0]);
    await this.cache.cacheJournalEntry(id, updatedEntry);
    return updatedEntry;
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM entries WHERE id = $1', [id]);
    await this.cache.invalidateJournalEntry(id);
  }
}
