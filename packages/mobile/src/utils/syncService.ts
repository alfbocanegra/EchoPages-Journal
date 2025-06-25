import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntries, saveEntry } from './EncryptedEntryStorage';
import { getMedia, saveMediaItem } from './EncryptedMediaStorage';
import { uploadCloudFile, downloadCloudFile } from './api';

const SHOW_PROGRESS_KEY = 'showSyncProgressBar';

let progressListeners: ((progress: SyncProgress) => void)[] = [];

export interface SyncProgress {
  total: number;
  completed: number;
  current?: string;
  status: 'idle' | 'syncing' | 'done' | 'error';
  error?: string;
}

let currentProgress: SyncProgress = { total: 0, completed: 0, status: 'idle' };

export function subscribeSyncProgress(listener: (progress: SyncProgress) => void) {
  progressListeners.push(listener);
  listener(currentProgress);
  return () => {
    progressListeners = progressListeners.filter(l => l !== listener);
  };
}

function notifyProgress(progress: SyncProgress) {
  currentProgress = progress;
  progressListeners.forEach(l => l(progress));
}

export async function getShowProgressBar(): Promise<boolean> {
  const value = await AsyncStorage.getItem(SHOW_PROGRESS_KEY);
  return value === null ? true : value === 'true';
}

export async function setShowProgressBar(show: boolean): Promise<void> {
  await AsyncStorage.setItem(SHOW_PROGRESS_KEY, show ? 'true' : 'false');
}

export async function syncAll() {
  try {
    notifyProgress({ total: 1, completed: 0, status: 'syncing', current: 'Preparing...' });
    // 1. Sync entries
    const entries = await getEntries();
    const pendingEntries = entries.filter(e => e.syncStatus !== 'synced');
    let completed = 0;
    for (const entry of pendingEntries) {
      notifyProgress({
        total: pendingEntries.length,
        completed,
        status: 'syncing',
        current: `Syncing entry: ${entry.title || entry.id}`,
      });
      // TODO: Upload entry to backend
      // await uploadEntry(entry);
      entry.syncStatus = 'synced';
      await saveEntry(entry);
      completed++;
      notifyProgress({
        total: pendingEntries.length,
        completed,
        status: 'syncing',
        current: `Synced entry: ${entry.title || entry.id}`,
      });
    }
    // 2. Sync media
    const media = await getMedia();
    const pendingMedia = media.filter(m => m.syncStatus !== 'synced');
    let mediaCompleted = 0;
    for (const m of pendingMedia) {
      notifyProgress({
        total: pendingMedia.length,
        completed: mediaCompleted,
        status: 'syncing',
        current: `Uploading media: ${m.fileName}`,
      });
      // TODO: Upload media file to backend
      // await uploadCloudFile(m, { entryId: m.entryId });
      m.syncStatus = 'synced';
      await saveMediaItem(m);
      mediaCompleted++;
      notifyProgress({
        total: pendingMedia.length,
        completed: mediaCompleted,
        status: 'syncing',
        current: `Uploaded media: ${m.fileName}`,
      });
    }
    notifyProgress({ total: 1, completed: 1, status: 'done' });
  } catch (e: any) {
    notifyProgress({ total: 1, completed: 0, status: 'error', error: e.message });
  }
}
