export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  saltSize: number;
  iterations: number;
  digest: string;
  encoding: BufferEncoding;
}

export interface EncryptedData {
  encryptedData: string; // base64
  key: string; // base64
  nonce: string; // base64
  tag: string; // base64
}

export interface EncryptionService {
  encrypt(data: string): Promise<EncryptedData>;
  decrypt(encryptedData: string, key: string, nonce: string, tag: string): Promise<string>;
} 