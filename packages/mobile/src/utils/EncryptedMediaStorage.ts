import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEncryptionKey } from './SecureKeyStorage';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'journalMedia';

export interface Media {
  id: string;
  entryId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  isEncrypted?: boolean;
  thumbnailPath?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSyncAt?: string;
}

function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(cipher: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function saveMediaList(media: Media[]): Promise<void> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const plain = JSON.stringify(media);
  const encrypted = encrypt(plain, key);
  await AsyncStorage.setItem(STORAGE_KEY, encrypted);
}

export async function getMedia(): Promise<Media[]> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const encrypted = await AsyncStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = decrypt(encrypted, key);
    return JSON.parse(decrypted) as Media[];
  } catch (e) {
    return [];
  }
}

export async function saveMediaItem(mediaItem: Media): Promise<void> {
  const media = await getMedia();
  const idx = media.findIndex(m => m.id === mediaItem.id);
  const now = new Date().toISOString();
  const mediaWithSync = {
    ...mediaItem,
    syncStatus: mediaItem.syncStatus || 'pending',
    updatedAt: now,
  };
  if (idx >= 0) media[idx] = mediaWithSync;
  else media.push(mediaWithSync);
  await saveMediaList(media);
}

export async function getMediaItem(id: string): Promise<Media | undefined> {
  const media = await getMedia();
  return media.find(m => m.id === id);
}

export async function deleteMedia(id: string): Promise<void> {
  const media = await getMedia();
  const filtered = media.filter(m => m.id !== id);
  await saveMediaList(filtered);
}

export async function getPendingMedia(): Promise<Media[]> {
  const media = await getMedia();
  return media.filter(m => m.syncStatus === 'pending');
}
