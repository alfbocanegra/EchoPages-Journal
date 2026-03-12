export interface CloudFileMeta {
  id: string;
  name: string;
  size: number;
  modifiedAt: string;
}

export interface CloudQuota {
  used: number;
  total: number;
}

export interface CloudStatus {
  connected: boolean;
  provider: string;
  lastSync?: string;
  quota?: CloudQuota;
  error?: string;
}

export abstract class CloudProvider {
  abstract providerName: string;
  abstract authenticate(userId: string): Promise<void>;
  abstract getStatus(userId: string): Promise<CloudStatus>;
  abstract uploadFile(
    userId: string,
    file: Buffer,
    meta: Partial<CloudFileMeta>
  ): Promise<CloudFileMeta>;
  abstract downloadFile(userId: string, fileId: string): Promise<Buffer>;
  abstract listFiles(userId: string): Promise<CloudFileMeta[]>;
  abstract deleteFile(userId: string, fileId: string): Promise<void>;
  abstract getQuota(userId: string): Promise<CloudQuota>;
}
