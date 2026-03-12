import crypto from 'crypto';
import { promisify } from 'util';
import { EncryptedData } from '../types/encryption';

const randomBytes = promisify(crypto.randomBytes);

export interface EncryptionService {
  encrypt(data: string): Promise<EncryptedData>;
  decrypt(encryptedData: string, key: string, nonce: string, tag: string): Promise<string>;
}

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  nonceLength: number;
  tagLength: number;
  masterKey: Buffer;
}

export function createEncryptionService(config: { key: string }): EncryptionService {
  return new DefaultEncryptionService({
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    nonceLength: 12,
    tagLength: 16,
    masterKey: Buffer.from(config.key, 'hex'),
  });
}

class DefaultEncryptionService implements EncryptionService {
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig) {
    this.config = config;
  }

  async encrypt(data: string): Promise<EncryptedData> {
    try {
      const key = await randomBytes(this.config.keyLength);
      const nonce = await randomBytes(this.config.nonceLength);
      const cipher = crypto.createCipheriv(this.config.algorithm, key, nonce) as crypto.CipherGCM;
      const encryptedData = Buffer.concat([
        cipher.update(Buffer.from(data, 'utf-8')),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      return {
        encryptedData: encryptedData.toString('base64'),
        key: key.toString('base64'),
        nonce: nonce.toString('base64'),
        tag: tag.toString('base64'),
      };
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedData: string, key: string, nonce: string, tag: string): Promise<string> {
    try {
      const decipher = crypto.createDecipheriv(
        this.config.algorithm,
        Buffer.from(key, 'base64'),
        Buffer.from(nonce, 'base64')
      ) as crypto.DecipherGCM;
      decipher.setAuthTag(Buffer.from(tag, 'base64'));
      const decryptedData = Buffer.concat([
        decipher.update(Buffer.from(encryptedData, 'base64')),
        decipher.final(),
      ]);
      return decryptedData.toString('utf-8');
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}
