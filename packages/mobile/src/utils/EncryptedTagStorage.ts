import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEncryptionKey } from './SecureKeyStorage';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'journalTags';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(cipher: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function getTags(): Promise<Tag[]> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const encrypted = await AsyncStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = decrypt(encrypted, key);
    return JSON.parse(decrypted) as Tag[];
  } catch (e) {
    return [];
  }
}

export async function saveTag(tag: Tag): Promise<void> {
  const tags = await getTags();
  const idx = tags.findIndex(t => t.id === tag.id);
  const now = new Date().toISOString();
  const tagWithDates = {
    ...tag,
    updatedAt: now,
    createdAt: tag.createdAt || now,
  };
  if (idx >= 0) tags[idx] = tagWithDates;
  else tags.push(tagWithDates);
  await saveTags(tags);
}

export async function saveTags(tags: Tag[]): Promise<void> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const plain = JSON.stringify(tags);
  const encrypted = encrypt(plain, key);
  await AsyncStorage.setItem(STORAGE_KEY, encrypted);
}

export async function deleteTag(id: string): Promise<void> {
  const tags = await getTags();
  const filtered = tags.filter(t => t.id !== id);
  await saveTags(filtered);
}
