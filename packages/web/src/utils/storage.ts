import { encryptData, decryptData } from './crypto';
import type { Entry } from '../components/editor/EntryList';

const STORAGE_KEY = 'journalEntries';

export async function getEntries(key: string): Promise<Entry[]> {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = await decryptData(encrypted, key);
    const parsed = JSON.parse(decrypted) as Entry[];
    // Normalize mood field
    return parsed.map(e => ({
      ...e,
      mood:
        e.mood && typeof e.mood === 'object' && 'mood' in e.mood && 'intensity' in e.mood
          ? e.mood
          : undefined,
    }));
  } catch (e) {
    console.error('Failed to decrypt entries:', e);
    return [];
  }
}

export async function saveEntries(entries: Entry[], key: string): Promise<void> {
  try {
    const plain = JSON.stringify(entries);
    const encrypted = await encryptData(plain, key);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error('Failed to encrypt/save entries:', e);
  }
}

export async function addEntry(entry: Entry, key: string): Promise<void> {
  const entries = await getEntries(key);
  entries.push(entry);
  await saveEntries(entries, key);
}

export async function updateEntry(entry: Entry, key: string): Promise<void> {
  const entries = await getEntries(key);
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx !== -1) {
    entries[idx] = entry;
    await saveEntries(entries, key);
  }
}

export async function deleteEntry(id: string, key: string): Promise<void> {
  const entries = await getEntries(key);
  const filtered = entries.filter(e => e.id !== id);
  await saveEntries(filtered, key);
}
