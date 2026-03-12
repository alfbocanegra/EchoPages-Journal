import Redis from 'ioredis';
import { redisConfig, cacheConfig } from './redis.config';

interface CachedUser {
  id: string;
  email: string;
  username: string;
  [key: string]: unknown;
}

interface CachedJournalEntry {
  id: string;
  title: string;
  content: string;
  [key: string]: unknown;
}

interface CachedFolder {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

interface CachedTag {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface CachedSession {
  id: string;
  userId: string;
  expiresAt: Date;
  [key: string]: unknown;
}

export class RedisCacheService {
  private readonly redis: Redis;
  private readonly config: typeof cacheConfig;
  private readonly userTTL = 3600; // 1 hour
  private readonly entryTTL = 1800; // 30 minutes

  constructor() {
    this.redis = new Redis(redisConfig);
    this.config = cacheConfig;
  }

  // Helper method to format cache keys
  private formatKey(pattern: string, params: Record<string, string>): string {
    let key = pattern;
    Object.entries(params).forEach(([param, value]) => {
      key = key.replace(`{${param}}`, value);
    });
    return key;
  }

  // User caching methods
  async cacheUser(userId: string, userData: CachedUser): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.user, { id: userId });
    await this.redis.setex(key, this.userTTL, JSON.stringify(userData));
  }

  async getCachedUser(userId: string): Promise<CachedUser | null> {
    const key = this.formatKey(this.config.keyPatterns.user, { id: userId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Journal entry caching methods
  async cacheJournalEntry(entryId: string, entryData: CachedJournalEntry): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.journalEntry, { id: entryId });
    await this.redis.setex(key, this.entryTTL, JSON.stringify(entryData));
  }

  async getCachedJournalEntry(entryId: string): Promise<CachedJournalEntry | null> {
    const key = this.formatKey(this.config.keyPatterns.journalEntry, { id: entryId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // User's entries list caching
  async cacheUserEntries(userId: string, entries: CachedJournalEntry[]): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.userEntries, { id: userId });
    await this.redis.setex(key, this.config.ttl.journalEntry, JSON.stringify(entries));
  }

  async getCachedUserEntries(userId: string): Promise<CachedJournalEntry[] | null> {
    const key = this.formatKey(this.config.keyPatterns.userEntries, { id: userId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Folder caching methods
  async cacheFolder(folderId: string, folderData: CachedFolder): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.folder, { id: folderId });
    await this.redis.setex(key, this.config.ttl.folder, JSON.stringify(folderData));
  }

  async getCachedFolder(folderId: string): Promise<CachedFolder | null> {
    const key = this.formatKey(this.config.keyPatterns.folder, { id: folderId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // User's folders list caching
  async cacheUserFolders(userId: string, folders: CachedFolder[]): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.userFolders, { id: userId });
    await this.redis.setex(key, this.config.ttl.folder, JSON.stringify(folders));
  }

  async getCachedUserFolders(userId: string): Promise<CachedFolder[] | null> {
    const key = this.formatKey(this.config.keyPatterns.userFolders, { id: userId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Tag caching methods
  async cacheTag(tagId: string, tagData: CachedTag): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.tag, { id: tagId });
    await this.redis.setex(key, this.config.ttl.tag, JSON.stringify(tagData));
  }

  async getCachedTag(tagId: string): Promise<CachedTag | null> {
    const key = this.formatKey(this.config.keyPatterns.tag, { id: tagId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // User's tags list caching
  async cacheUserTags(userId: string, tags: CachedTag[]): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.userTags, { id: userId });
    await this.redis.setex(key, this.config.ttl.tag, JSON.stringify(tags));
  }

  async getCachedUserTags(userId: string): Promise<CachedTag[] | null> {
    const key = this.formatKey(this.config.keyPatterns.userTags, { id: userId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Session caching methods
  async cacheSession(sessionId: string, sessionData: CachedSession): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.session, { id: sessionId });
    await this.redis.setex(key, this.config.ttl.session, JSON.stringify(sessionData));
  }

  async getCachedSession(sessionId: string): Promise<CachedSession | null> {
    const key = this.formatKey(this.config.keyPatterns.session, { id: sessionId });
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Cache invalidation methods
  async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      this.formatKey(this.config.keyPatterns.user, { id: userId }),
      this.formatKey(this.config.keyPatterns.userEntries, { id: userId }),
      this.formatKey(this.config.keyPatterns.userFolders, { id: userId }),
      this.formatKey(this.config.keyPatterns.userTags, { id: userId }),
    ];
    await this.redis.del(...keys);
  }

  async invalidateJournalEntryCache(entryId: string, userId: string): Promise<void> {
    const keys = [
      this.formatKey(this.config.keyPatterns.journalEntry, { id: entryId }),
      this.formatKey(this.config.keyPatterns.userEntries, { id: userId }),
    ];
    await this.redis.del(...keys);
  }

  async invalidateFolderCache(folderId: string, userId: string): Promise<void> {
    const keys = [
      this.formatKey(this.config.keyPatterns.folder, { id: folderId }),
      this.formatKey(this.config.keyPatterns.userFolders, { id: userId }),
    ];
    await this.redis.del(...keys);
  }

  async invalidateTagCache(tagId: string, userId: string): Promise<void> {
    const keys = [
      this.formatKey(this.config.keyPatterns.tag, { id: tagId }),
      this.formatKey(this.config.keyPatterns.userTags, { id: userId }),
    ];
    await this.redis.del(...keys);
  }

  async invalidateSessionCache(sessionId: string): Promise<void> {
    const key = this.formatKey(this.config.keyPatterns.session, { id: sessionId });
    await this.redis.del(key);
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cleanup method
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
