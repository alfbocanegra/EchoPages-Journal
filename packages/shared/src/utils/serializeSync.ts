import { Entry } from '../entities/Entry';

export interface SerializedEntry {
  id: string;
  userId: string;
  folderId?: string;
  title?: string;
  content: string;
  contentType: string;
  isEncrypted: boolean;
  mood?: {
    mood: string;
    intensity: number;
    emotions: string[];
    note?: string;
    timestamp?: Date;
  };
  weather?: any;
  location?: any;
  isFavorite: boolean;
  isPinned: boolean;
  localId?: string;
  syncStatus: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  tagIds?: string[];
  mediaIds?: string[];
  version?: number;
}

export function serializeEntry(entry: Entry): SerializedEntry {
  return {
    id: entry.id,
    userId: entry.userId,
    folderId: entry.folderId,
    title: entry.title,
    content: entry.content,
    contentType: entry.contentType,
    isEncrypted: entry.isEncrypted,
    mood: entry.mood ? entry.mood : undefined,
    weather: entry.weather,
    location: entry.location,
    isFavorite: entry.isFavorite,
    isPinned: entry.isPinned,
    localId: entry.localId,
    syncStatus: entry.syncStatus,
    lastSyncAt: entry.lastSyncAt ? entry.lastSyncAt.toISOString() : undefined,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    tagIds: entry.tags ? entry.tags.map(t => t.id) : undefined,
    mediaIds: entry.media ? entry.media.map(m => m.id) : undefined,
    version:
      entry.versions && entry.versions.length > 0
        ? entry.versions[entry.versions.length - 1].versionNumber
        : undefined,
  };
}

export function deserializeEntry(data: SerializedEntry): Entry {
  // This is a partial, for merging into local Entry objects
  return {
    ...data,
    mood: data.mood ? data.mood : undefined,
    lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    tags: [], // To be resolved by tagIds
    media: [], // To be resolved by mediaIds
    versions: [],
    user: undefined as any, // Satisfy required property for Entry
  } as Entry;
}

export function serializeChanges(entries: Entry[], since: Date): SerializedEntry[] {
  return entries.filter(e => e.updatedAt > since).map(serializeEntry);
}
