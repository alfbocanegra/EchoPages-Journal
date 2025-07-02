import { GoogleDriveProvider } from './GoogleDriveProvider';
import { OneDriveProvider } from './OneDriveProvider';
import { ICloudProvider } from './ICloudProvider';
import { CloudProvider } from './CloudProvider';

const PROVIDERS = {
  google: new GoogleDriveProvider(),
  onedrive: new OneDriveProvider(),
  icloud: new ICloudProvider(),
};

type ProviderKey = keyof typeof PROVIDERS;

class CloudProviderManager {
  private userProviders: Map<string, ProviderKey> = new Map();

  selectProvider(userId: string, provider: ProviderKey) {
    this.userProviders.set(userId, provider);
  }

  getProvider(userId: string): CloudProvider | null {
    const key = this.userProviders.get(userId);
    if (key && PROVIDERS[key]) return PROVIDERS[key];
    return null;
  }

  getProviderName(userId: string): string | null {
    const key = this.userProviders.get(userId);
    return key || null;
  }
}

const cloudProviderManager = new CloudProviderManager();
export default cloudProviderManager;
