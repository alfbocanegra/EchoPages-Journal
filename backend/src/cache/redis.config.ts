import { RedisOptions } from 'ioredis';

export interface CacheConfig {
  ttl: {
    user: number;
    journalEntry: number;
    folder: number;
    tag: number;
    session: number;
  };
  keyPatterns: {
    user: string;
    journalEntry: string;
    folder: string;
    tag: string;
    session: string;
    userEntries: string;
    userFolders: string;
    userTags: string;
  };
}

// Cache TTL configurations (in seconds)
export const cacheConfig: CacheConfig = {
  ttl: {
    user: 3600, // 1 hour
    journalEntry: 1800, // 30 minutes
    folder: 3600, // 1 hour
    tag: 3600, // 1 hour
    session: 86400, // 24 hours
  },
  keyPatterns: {
    user: 'user:{id}',
    journalEntry: 'entry:{id}',
    folder: 'folder:{id}',
    tag: 'tag:{id}',
    session: 'session:{id}',
    userEntries: 'user:{id}:entries',
    userFolders: 'user:{id}:folders',
    userTags: 'user:{id}:tags',
  },
};

// Redis connection configuration
export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};
