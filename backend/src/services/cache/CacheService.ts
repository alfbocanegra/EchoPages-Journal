import { Entry } from '@echopages/shared/entities';

export interface CacheService {
  getJournalEntry(id: string): Promise<Entry | null>;
  getUserEntries(userId: string): Promise<Entry[] | null>;
  cacheJournalEntry(id: string, entry: Entry): Promise<void>;
  cacheUserEntries(userId: string, entries: Entry[]): Promise<void>;
  invalidateJournalEntry(id: string): Promise<void>;
  invalidateUserEntries(userId: string): Promise<void>;
} 