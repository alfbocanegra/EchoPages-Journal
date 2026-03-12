export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  saltSize: number;
  iterations: number;
  digest: string;
  encoding: BufferEncoding;
}

export const encryptionConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm', // AES-256 in Galois/Counter Mode for authenticated encryption
  keySize: 32, // 256 bits
  ivSize: 16, // 128 bits
  saltSize: 32, // 256 bits
  iterations: 100000, // Number of PBKDF2 iterations
  digest: 'sha512',
  encoding: 'base64' as BufferEncoding,
};

// Environment variable names
export const ENV_KEYS = {
  MASTER_KEY: 'ECHOPAGES_MASTER_KEY',
  KEY_DERIVATION_SALT: 'ECHOPAGES_KEY_DERIVATION_SALT',
} as const;

// Error messages
export const ENCRYPTION_ERRORS = {
  MISSING_MASTER_KEY: 'Master encryption key is not configured',
  MISSING_SALT: 'Key derivation salt is not configured',
  INVALID_DATA: 'Invalid data format for encryption/decryption',
  DECRYPTION_FAILED: 'Failed to decrypt data: authentication failed',
} as const;
