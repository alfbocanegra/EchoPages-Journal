import { EncryptionService } from '../../services/encryption';
import { Logger } from 'winston';
import { EntityType, EncryptableEntity } from '../../types/encryption';

interface EncryptedField {
  field: string;
  encryptedField: string;
  keyField: string;
  nonceField: string;
  tagField: string;
  isEncryptedField: string;
}

export class EncryptionMiddleware {
  private encryptionService: EncryptionService;
  private logger: Logger;

  constructor(encryptionService: EncryptionService, logger: Logger) {
    this.encryptionService = encryptionService;
    this.logger = logger;
  }

  /**
   * Encrypts an entity's sensitive fields before saving to database
   * @param entity The entity to encrypt
   * @param entityType Type of entity (journal_entry, folder, etc.)
   * @param fields Array of field configurations to encrypt
   * @returns Entity with encrypted fields
   */
  async encryptEntity(
    entity: EncryptableEntity,
    entityType: EntityType,
    fields: EncryptedField[]
  ): Promise<EncryptableEntity> {
    try {
      const encryptedEntity = { ...entity };

      for (const fieldConfig of fields) {
        const value = entity[fieldConfig.field];
        if (value === null || value === undefined) continue;

        const { encryptedData, key, nonce, tag } = await this.encryptionService.encrypt(
          value.toString()
        );

        encryptedEntity[fieldConfig.encryptedField] = encryptedData;
        encryptedEntity[fieldConfig.keyField] = key;
        encryptedEntity[fieldConfig.nonceField] = nonce;
        encryptedEntity[fieldConfig.tagField] = tag;
        encryptedEntity[fieldConfig.isEncryptedField] = true;
        delete encryptedEntity[fieldConfig.field];
      }

      return encryptedEntity;
    } catch (error) {
      this.logger.error('Error encrypting entity', {
        entityType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to encrypt entity');
    }
  }

  /**
   * Decrypts an entity's encrypted fields when reading from database
   * @param entity The entity to decrypt
   * @param entityType Type of entity (journal_entry, folder, etc.)
   * @param fields Array of field configurations to decrypt
   * @returns Entity with decrypted fields
   */
  async decryptEntity(
    entity: EncryptableEntity,
    entityType: EntityType,
    fields: EncryptedField[]
  ): Promise<EncryptableEntity> {
    try {
      const decryptedEntity = { ...entity };

      for (const fieldConfig of fields) {
        // Skip if not encrypted
        if (!entity[fieldConfig.isEncryptedField]) continue;

        const encryptedData = entity[fieldConfig.encryptedField];
        const key = entity[fieldConfig.keyField];
        const nonce = entity[fieldConfig.nonceField];
        const tag = entity[fieldConfig.tagField];

        // Skip if any required encryption data is missing
        if (!encryptedData || !key || !nonce || !tag) continue;

        const decryptedValue = await this.encryptionService.decrypt(
          encryptedData.toString(),
          key.toString(),
          nonce.toString(),
          tag.toString()
        );

        decryptedEntity[fieldConfig.field] = decryptedValue;

        // Remove encryption-related fields from the returned entity
        delete decryptedEntity[fieldConfig.encryptedField];
        delete decryptedEntity[fieldConfig.keyField];
        delete decryptedEntity[fieldConfig.nonceField];
        delete decryptedEntity[fieldConfig.tagField];
        delete decryptedEntity[fieldConfig.isEncryptedField];
      }

      return decryptedEntity;
    } catch (error) {
      this.logger.error('Error decrypting entity', {
        entityType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to decrypt entity');
    }
  }

  /**
   * Creates field configuration for a specific entity type
   * @param entityType Type of entity
   * @returns Array of field configurations
   */
  static getFieldConfig(entityType: EntityType): EncryptedField[] {
    switch (entityType) {
      case 'journal_entry':
        return [
          {
            field: 'content',
            encryptedField: 'encrypted_content',
            keyField: 'content_key',
            nonceField: 'content_nonce',
            tagField: 'content_tag',
            isEncryptedField: 'content_encrypted',
          },
        ];
      case 'folder':
        return [
          {
            field: 'name',
            encryptedField: 'encrypted_name',
            keyField: 'folder_key',
            nonceField: 'folder_nonce',
            tagField: 'folder_tag',
            isEncryptedField: 'is_encrypted',
          },
          {
            field: 'description',
            encryptedField: 'encrypted_description',
            keyField: 'folder_key',
            nonceField: 'folder_nonce',
            tagField: 'folder_tag',
            isEncryptedField: 'is_encrypted',
          },
        ];
      case 'media_attachment':
        return [
          {
            field: 'content',
            encryptedField: 'encrypted_content',
            keyField: 'media_key',
            nonceField: 'media_nonce',
            tagField: 'media_tag',
            isEncryptedField: 'is_encrypted',
          },
        ];
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }
}
