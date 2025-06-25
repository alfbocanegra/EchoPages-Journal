import AsyncStorage from '@react-native-async-storage/async-storage';

const OUTBOX_KEY = 'syncOutbox';

export interface OutboxChange {
  id: string; // unique id for the change
  entityType: string;
  entity: any;
  timestamp: string;
}

export async function addToOutbox(change: OutboxChange): Promise<void> {
  const outbox = await getOutbox();
  outbox.push(change);
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
}

export async function getOutbox(): Promise<OutboxChange[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxChange[];
  } catch {
    return [];
  }
}

export async function removeFromOutbox(changeId: string): Promise<void> {
  const outbox = await getOutbox();
  const filtered = outbox.filter(c => c.id !== changeId);
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(filtered));
}

export async function clearOutbox(): Promise<void> {
  await AsyncStorage.removeItem(OUTBOX_KEY);
}
