import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_VERSION_KEY = 'lastSyncVersion';

export async function getLastSyncVersion(): Promise<number> {
  const value = await AsyncStorage.getItem(SYNC_VERSION_KEY);
  return value ? parseInt(value, 10) : 0;
}

export async function setLastSyncVersion(version: number): Promise<void> {
  await AsyncStorage.setItem(SYNC_VERSION_KEY, version.toString());
}
