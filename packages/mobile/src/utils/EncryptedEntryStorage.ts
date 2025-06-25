import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEncryptionKey } from './SecureKeyStorage';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'journalEntries';
const WEATHER_LOCATION_PREF_KEY = 'weatherLocationTaggingEnabled';

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
  // ...other fields
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

function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(cipher: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const plain = JSON.stringify(entries);
  const encrypted = encrypt(plain, key);
  await AsyncStorage.setItem(STORAGE_KEY, encrypted);
}

export async function getEntries(): Promise<JournalEntry[]> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const encrypted = await AsyncStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = decrypt(encrypted, key);
    return JSON.parse(decrypted) as JournalEntry[];
  } catch (e) {
    return [];
  }
}

export async function saveEntry(entry: JournalEntry): Promise<void> {
  const entries = await getEntries();
  const idx = entries.findIndex(e => e.id === entry.id);
  const now = new Date().toISOString();
  const entryWithSync = {
    ...entry,
    syncStatus: entry.syncStatus || 'pending',
    updatedAt: now,
  };
  if (idx >= 0) entries[idx] = entryWithSync;
  else entries.push(entryWithSync);
  await saveEntries(entries);
}

export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  const entries = await getEntries();
  return entries.find(e => e.id === id);
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.id !== id);
  await saveEntries(filtered);
}

export async function getPendingEntries(): Promise<JournalEntry[]> {
  const entries = await getEntries();
  return entries.filter(e => e.syncStatus === 'pending');
}

export async function getWeatherLocationTaggingEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(WEATHER_LOCATION_PREF_KEY);
  if (value === null) return true; // default to enabled
  return value === 'true';
}

export async function setWeatherLocationTaggingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(WEATHER_LOCATION_PREF_KEY, enabled ? 'true' : 'false');
}
