export interface EncryptionService {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(data: string, key: string): Promise<string>;
  generateKey(): Promise<string>;
  deriveKey(password: string, salt: string): Promise<string>;
}
