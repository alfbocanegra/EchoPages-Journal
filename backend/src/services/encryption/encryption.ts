export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
  digest: string;
  tagLength: number;
}

export interface EncryptionService {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(data: string, key: string): Promise<string>;
  generateKey(): Promise<string>;
  deriveKey(password: string, salt: string): Promise<string>;
}
