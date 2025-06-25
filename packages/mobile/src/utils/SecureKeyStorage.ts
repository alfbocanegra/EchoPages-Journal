// @ts-ignore: No type declarations for react-native-keychain
import * as Keychain from 'react-native-keychain';
import { randomBytes } from 'crypto';

const SERVICE = 'EchoPagesEncryptionKey';
const KEY_LENGTH = 32; // 256 bits

export async function generateEncryptionKey(): Promise<string> {
  // Generate a random 256-bit key (base64)
  return randomBytes(KEY_LENGTH).toString('base64');
}

export async function storeEncryptionKey(key: string): Promise<void> {
  await Keychain.setGenericPassword('encryption', key, { service: SERVICE });
}

export async function getEncryptionKey(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: SERVICE });
  return creds ? creds.password : null;
}

export async function deleteEncryptionKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

// Usage example (call after successful login):
// let key = await getEncryptionKey();
// if (!key) {
//   key = await generateEncryptionKey();
//   await storeEncryptionKey(key);
// }
// Use `key` for all local encryption/decryption
