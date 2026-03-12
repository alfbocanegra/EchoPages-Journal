export type EntityType = 'journal_entry' | 'folder' | 'media_attachment';

export interface EncryptedData {
  encryptedData: string; // base64
  key: string; // base64
  nonce: string; // base64
  tag: string; // base64
}

export interface EncryptionMetadata {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface EncryptableEntity {
  [key: string]: unknown;
}
