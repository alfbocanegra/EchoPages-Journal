import { describe, it, expect, jest } from '@jest/globals';
import { EncryptionMiddleware } from '../EncryptionMiddleware';
import { EncryptionService } from '../../../services/encryption';
import { Logger } from 'winston';
import { EncryptedData } from '../../../types/encryption';

describe('EncryptionMiddleware', () => {
  // Mock encryption service
  const mockEncryptionService: jest.Mocked<EncryptionService> = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  // Mock logger
  const mockLogger: Logger = {
    error: jest.fn(),
  } as unknown as Logger;

  const middleware = new EncryptionMiddleware(mockEncryptionService, mockLogger);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptEntity', () => {
    it('should encrypt specified fields', async () => {
      const mockEncryptedData: EncryptedData = {
        encryptedData: 'ZW5jcnlwdGVk', // 'encrypted' in base64
        key: 'a2V5', // 'key' in base64
        nonce: 'bm9uY2U=', // 'nonce' in base64
        tag: 'dGFn', // 'tag' in base64
      };

      mockEncryptionService.encrypt.mockResolvedValueOnce(mockEncryptedData);

      const entity = {
        id: '123',
        content: 'test content',
        title: 'test title',
      };

      const result = await middleware.encryptEntity(
        entity,
        'journal_entry',
        EncryptionMiddleware.getFieldConfig('journal_entry')
      );

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('test content');
      expect(result).toEqual({
        id: '123',
        title: 'test title',
        encrypted_content: mockEncryptedData.encryptedData,
        content_key: mockEncryptedData.key,
        content_nonce: mockEncryptedData.nonce,
        content_tag: mockEncryptedData.tag,
        content_encrypted: true,
      });
    });

    it('should handle encryption errors', async () => {
      mockEncryptionService.encrypt.mockRejectedValueOnce(new Error('Encryption failed'));

      const entity = {
        id: '123',
        content: 'test content',
      };

      await expect(
        middleware.encryptEntity(
          entity,
          'journal_entry',
          EncryptionMiddleware.getFieldConfig('journal_entry')
        )
      ).rejects.toThrow('Failed to encrypt entity');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error encrypting entity',
        expect.objectContaining({
          entityType: 'journal_entry',
          error: 'Encryption failed',
        })
      );
    });
  });

  describe('decryptEntity', () => {
    it('should decrypt specified fields', async () => {
      mockEncryptionService.decrypt.mockResolvedValueOnce('decrypted content');

      const entity = {
        id: '123',
        encrypted_content: 'ZW5jcnlwdGVk', // 'encrypted' in base64
        content_key: 'a2V5', // 'key' in base64
        content_nonce: 'bm9uY2U=', // 'nonce' in base64
        content_tag: 'dGFn', // 'tag' in base64
        content_encrypted: true,
        title: 'test title',
      };

      const result = await middleware.decryptEntity(
        entity,
        'journal_entry',
        EncryptionMiddleware.getFieldConfig('journal_entry')
      );

      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(
        entity.encrypted_content,
        entity.content_key,
        entity.content_nonce,
        entity.content_tag
      );

      expect(result).toEqual({
        id: '123',
        content: 'decrypted content',
        title: 'test title',
      });
    });

    it('should skip decryption for unencrypted fields', async () => {
      const entity = {
        id: '123',
        content: 'plain content',
        content_encrypted: false,
        title: 'test title',
      };

      const result = await middleware.decryptEntity(
        entity,
        'journal_entry',
        EncryptionMiddleware.getFieldConfig('journal_entry')
      );

      expect(mockEncryptionService.decrypt).not.toHaveBeenCalled();
      expect(result).toEqual(entity);
    });

    it('should handle decryption errors', async () => {
      mockEncryptionService.decrypt.mockRejectedValueOnce(new Error('Decryption failed'));

      const entity = {
        id: '123',
        encrypted_content: 'ZW5jcnlwdGVk',
        content_key: 'a2V5',
        content_nonce: 'bm9uY2U=',
        content_tag: 'dGFn',
        content_encrypted: true,
      };

      await expect(
        middleware.decryptEntity(
          entity,
          'journal_entry',
          EncryptionMiddleware.getFieldConfig('journal_entry')
        )
      ).rejects.toThrow('Failed to decrypt entity');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error decrypting entity',
        expect.objectContaining({
          entityType: 'journal_entry',
          error: 'Decryption failed',
        })
      );
    });
  });

  describe('getFieldConfig', () => {
    it('should return correct configuration for journal entries', () => {
      const config = EncryptionMiddleware.getFieldConfig('journal_entry');
      expect(config).toHaveLength(1);
      expect(config[0]).toEqual({
        field: 'content',
        encryptedField: 'encrypted_content',
        keyField: 'content_key',
        nonceField: 'content_nonce',
        tagField: 'content_tag',
        isEncryptedField: 'content_encrypted',
      });
    });

    it('should return correct configuration for folders', () => {
      const config = EncryptionMiddleware.getFieldConfig('folder');
      expect(config).toHaveLength(2);
      expect(config[0].field).toBe('name');
      expect(config[1].field).toBe('description');
    });

    it('should throw error for unsupported entity type', () => {
      expect(() => {
        // @ts-expect-error intentionally testing error case
        EncryptionMiddleware.getFieldConfig('invalid');
      }).toThrow('Unsupported entity type: invalid');
    });
  });
});
