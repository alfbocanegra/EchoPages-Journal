export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSyncAt?: string;
  tags?: string[];
  folderId?: string;
  weather?: {
    temperature: number;
    condition: string;
    location: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  health?: {
    steps?: number;
    mood?: string;
    activity?: string;
  };
}
export declare function saveEntries(entries: JournalEntry[]): Promise<void>;
export declare function getEntries(): Promise<JournalEntry[]>;
export declare function saveEntry(entry: JournalEntry): Promise<void>;
export declare function getEntry(id: string): Promise<JournalEntry | undefined>;
export declare function deleteEntry(id: string): Promise<void>;
export declare function getPendingEntries(): Promise<JournalEntry[]>;
export declare function getWeatherLocationTaggingEnabled(): Promise<boolean>;
export declare function setWeatherLocationTaggingEnabled(enabled: boolean): Promise<void>;
//# sourceMappingURL=EncryptedEntryStorage.d.ts.map
