import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEncryptionKey } from './SecureKeyStorage';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'journalFolders';

export interface Folder {
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

export async function getFolders(): Promise<Folder[]> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const encrypted = await AsyncStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try {
    const decrypted = decrypt(encrypted, key);
    return JSON.parse(decrypted) as Folder[];
  } catch (e) {
    return [];
  }
}

export async function saveFolder(folder: Folder): Promise<void> {
  const folders = await getFolders();
  const idx = folders.findIndex(f => f.id === folder.id);
  const now = new Date().toISOString();
  const folderWithDates = {
    ...folder,
    updatedAt: now,
    createdAt: folder.createdAt || now,
  };
  if (idx >= 0) folders[idx] = folderWithDates;
  else folders.push(folderWithDates);
  await saveFolders(folders);
}

export async function saveFolders(folders: Folder[]): Promise<void> {
  const key = await getEncryptionKey();
  if (!key) throw new Error('Encryption key not available');
  const plain = JSON.stringify(folders);
  const encrypted = encrypt(plain, key);
  await AsyncStorage.setItem(STORAGE_KEY, encrypted);
}

export async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  const filtered = folders.filter(f => f.id !== id);
  await saveFolders(filtered);
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  const folders = await getFolders();
  return folders.find(f => f.id === id);
}
