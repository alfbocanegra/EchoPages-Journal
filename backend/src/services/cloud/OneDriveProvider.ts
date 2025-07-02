import { CloudProvider, CloudStatus, CloudFileMeta, CloudQuota } from './CloudProvider';

export class OneDriveProvider extends CloudProvider {
  providerName = 'OneDrive';

  async authenticate(_userId: string): Promise<void> {
    // TODO: Implement OneDrive OAuth2 flow
    throw new Error('Not implemented');
  }

  async getStatus(_userId: string): Promise<CloudStatus> {
    // TODO: Return OneDrive connection status
    return { connected: false, provider: this.providerName };
  }

  async uploadFile(
    _userId: string,
    _file: Buffer,
    _meta: Partial<CloudFileMeta>
  ): Promise<CloudFileMeta> {
    // TODO: Upload file to OneDrive
    throw new Error('Not implemented');
  }

  async downloadFile(_userId: string, _fileId: string): Promise<Buffer> {
    // TODO: Download file from OneDrive
    throw new Error('Not implemented');
  }

  async listFiles(_userId: string): Promise<CloudFileMeta[]> {
    // TODO: List files in OneDrive
    return [];
  }

  async deleteFile(_userId: string, _fileId: string): Promise<void> {
    // TODO: Delete file from OneDrive
    throw new Error('Not implemented');
  }

  async getQuota(_userId: string): Promise<CloudQuota> {
    // TODO: Get OneDrive quota
    return { used: 0, total: 0 };
  }
}
