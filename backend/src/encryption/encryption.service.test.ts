/// <reference types="jest" />
import { EncryptionService } from './encryption.service';
import { ENV_KEYS, ENCRYPTION_ERRORS } from './encryption.config';

describe('EncryptionService', () => {
  const mockMasterKey = EncryptionService.generateMasterKey();
  const mockSalt = EncryptionService.generateKeyDerivationSalt();
  const mockUserId = 'test-user-123';
  const mockData = 'This is sensitive data that needs to be encrypted';

  beforeEach(() => {
    process.env[ENV_KEYS.MASTER_KEY] = mockMasterKey;
    process.env[ENV_KEYS.KEY_DERIVATION_SALT] = mockSalt;
  });

  afterEach(() => {
    delete process.env[ENV_KEYS.MASTER_KEY];
    delete process.env[ENV_KEYS.KEY_DERIVATION_SALT];
  });

  describe('initialization', () => {
    it('should create an instance when proper environment variables are set', () => {
      expect(() => new EncryptionService()).not.toThrow();
    });

    it('should throw error when master key is missing', () => {
      delete process.env[ENV_KEYS.MASTER_KEY];
      expect(() => new EncryptionService()).toThrow(ENCRYPTION_ERRORS.MISSING_MASTER_KEY);
    });

    it('should throw error when salt is missing', () => {
      delete process.env[ENV_KEYS.KEY_DERIVATION_SALT];
      expect(() => new EncryptionService()).toThrow(ENCRYPTION_ERRORS.MISSING_SALT);
    });
  });

  describe('encryption and decryption', () => {
    let encryptionService: EncryptionService;

    beforeEach(() => {
      encryptionService = new EncryptionService();
    });

    it('should encrypt and decrypt data successfully', async () => {
      const encrypted = await encryptionService.encrypt(mockUserId, mockData);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');

      const decrypted = await encryptionService.decrypt(mockUserId, encrypted);
      expect(decrypted).toBe(mockData);
    });

    it('should produce different ciphertexts for same data', async () => {
      const encrypted1 = await encryptionService.encrypt(mockUserId, mockData);
      const encrypted2 = await encryptionService.encrypt(mockUserId, mockData);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should produce different ciphertexts for different users', async () => {
      const encrypted1 = await encryptionService.encrypt(mockUserId, mockData);
      const encrypted2 = await encryptionService.encrypt('other-user', mockData);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should fail to decrypt with wrong user id', async () => {
      const encrypted = await encryptionService.encrypt(mockUserId, mockData);
      await expect(encryptionService.decrypt('wrong-user', encrypted)).rejects.toThrow(
        ENCRYPTION_ERRORS.DECRYPTION_FAILED
      );
    });

    it('should fail to decrypt tampered data', async () => {
      const encrypted = await encryptionService.encrypt(mockUserId, mockData);
      const tamperedData = encrypted.replace(/[A-Za-z]/, 'X');
      await expect(encryptionService.decrypt(mockUserId, tamperedData)).rejects.toThrow(
        ENCRYPTION_ERRORS.DECRYPTION_FAILED
      );
    });

    it('should fail to decrypt malformed data', async () => {
      await expect(encryptionService.decrypt(mockUserId, 'not-valid-json')).rejects.toThrow(
        ENCRYPTION_ERRORS.DECRYPTION_FAILED
      );
    });
  });

  describe('key generation', () => {
    it('should generate valid master keys', () => {
      const key = EncryptionService.generateMasterKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate valid derivation salts', () => {
      const salt = EncryptionService.generateKeyDerivationSalt();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should generate different master keys each time', () => {
      const key1 = EncryptionService.generateMasterKey();
      const key2 = EncryptionService.generateMasterKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('configuration validation', () => {
    it('should validate secure configuration', () => {
      expect(EncryptionService.validateConfiguration()).toBe(true);
    });
  });
});
