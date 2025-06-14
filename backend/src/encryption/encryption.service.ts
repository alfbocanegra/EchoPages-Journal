import crypto from 'crypto';
import { encryptionConfig, ENV_KEYS, ENCRYPTION_ERRORS } from './encryption.config';
import { EncryptedData } from '../types/encryption';

export type { EncryptedData };

export class EncryptionService {
  private readonly masterKey: Buffer;
  private readonly derivationSalt: Buffer;

  constructor() {
    const masterKeyStr = process.env[ENV_KEYS.MASTER_KEY];
    const saltStr = process.env[ENV_KEYS.KEY_DERIVATION_SALT];

    if (!masterKeyStr) {
      throw new Error(ENCRYPTION_ERRORS.MISSING_MASTER_KEY);
    }
    if (!saltStr) {
      throw new Error(ENCRYPTION_ERRORS.MISSING_SALT);
    }

    this.masterKey = Buffer.from(masterKeyStr, encryptionConfig.encoding);
    this.derivationSalt = Buffer.from(saltStr, encryptionConfig.encoding);
  }

  /**
   * Derives an encryption key for a specific user
   */
  private deriveUserKey(userId: string): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      Buffer.concat([this.derivationSalt, Buffer.from(userId)]),
      encryptionConfig.iterations,
      encryptionConfig.keySize,
      encryptionConfig.digest
    );
  }

  /**
   * Encrypts data for a specific user
   */
  async encrypt(userId: string, data: string): Promise<EncryptedData> {
    try {
      const key = this.deriveUserKey(userId);
      const nonce = crypto.randomBytes(encryptionConfig.ivSize);
      const cipher = crypto.createCipheriv(encryptionConfig.algorithm, key, nonce) as crypto.CipherGCM;
      const encryptedData = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();
      return {
        encryptedData: encryptedData.toString('base64'),
        key: key.toString('base64'),
        nonce: nonce.toString('base64'),
        tag: tag.toString('base64'),
      };
    } catch (error) {
      throw new Error(ENCRYPTION_ERRORS.INVALID_DATA);
    }
  }

  /**
   * Decrypts data for a specific user
   */
  async decrypt(userId: string, encrypted: EncryptedData): Promise<string> {
    try {
      const key = this.deriveUserKey(userId);
      const decipher = crypto.createDecipheriv(
        encryptionConfig.algorithm,
        key,
        Buffer.from(encrypted.nonce, 'base64')
      ) as crypto.DecipherGCM;
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted.encryptedData, 'base64')),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(ENCRYPTION_ERRORS.DECRYPTION_FAILED);
    }
  }

  /**
   * Generates a new random key suitable for use as a master key
   */
  static generateMasterKey(): string {
    return crypto.randomBytes(encryptionConfig.keySize).toString(encryptionConfig.encoding);
  }

  /**
   * Generates a new random salt suitable for key derivation
   */
  static generateKeyDerivationSalt(): string {
    return crypto.randomBytes(encryptionConfig.saltSize).toString(encryptionConfig.encoding);
  }

  /**
   * Validates that the encryption configuration is secure
   */
  static validateConfiguration(): boolean {
    const minKeySize = 32; // 256 bits minimum
    const minIvSize = 12; // 96 bits minimum for GCM
    const minIterations = 100000;

    return (
      encryptionConfig.keySize >= minKeySize &&
      encryptionConfig.ivSize >= minIvSize &&
      encryptionConfig.iterations >= minIterations &&
      encryptionConfig.algorithm === 'aes-256-gcm'
    );
  }
}
