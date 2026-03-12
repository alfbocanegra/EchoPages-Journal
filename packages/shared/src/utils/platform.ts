/**
 * Cross-platform utility for detecting the current platform
 * Safe to use in Node.js, web, and React Native environments
 */

export interface PlatformInterface {
  OS: 'ios' | 'android' | 'web' | 'node';
  select: <T>(config: { ios?: T; android?: T; web?: T; node?: T; default?: T }) => T;
}

// Global type augmentation for environments that might not have DOM types
declare global {
  interface Window {
    gapi?: unknown;
  }

  interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  }

  interface Navigator {
    platform: string;
    product?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Document {}

  /* eslint-disable no-var */
  var window: Window | undefined;
  var document: Document | undefined;
  var localStorage: Storage | undefined;
  var navigator: Navigator | undefined;
  /* eslint-enable no-var */
}

// Detect the current platform environment
function detectPlatform(): 'ios' | 'android' | 'web' | 'node' {
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node';
  }

  // Check if we're in React Native environment
  try {
    const global = globalThis as Record<string, unknown>;
    const nav = global.navigator as Navigator | undefined;
    if (typeof globalThis !== 'undefined' && nav && nav.product === 'ReactNative') {
      // We're in React Native, now try to determine iOS vs Android
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RNPlatform = require('react-native').Platform;
        return RNPlatform.OS === 'ios' ? 'ios' : 'android';
      } catch {
        return 'web'; // Fallback if React Native not available
      }
    }
  } catch {
    // Continue to web detection
  }

  // Check if we're in a web browser
  const global = globalThis as Record<string, unknown>;
  if (typeof global.window !== 'undefined' && typeof global.document !== 'undefined') {
    return 'web';
  }

  // Default fallback
  return 'node';
}

const currentOS = detectPlatform();

export const Platform: PlatformInterface = {
  OS: currentOS,
  select: <T>(config: { ios?: T; android?: T; web?: T; node?: T; default?: T }): T => {
    const value = config[currentOS] ?? config.default;
    if (value === undefined) {
      throw new Error(`No value provided for platform ${currentOS} and no default specified`);
    }
    return value;
  },
};

/**
 * Check if the current platform matches the specified platform
 */
export function isPlatform(
  platform: 'ios' | 'android' | 'web' | 'node' | 'mobile' | 'desktop' | 'macos' | 'windows'
): boolean {
  switch (platform) {
    case 'ios':
    case 'android':
    case 'web':
    case 'node':
      return Platform.OS === platform;
    case 'mobile':
      return Platform.OS === 'ios' || Platform.OS === 'android';
    case 'desktop':
      return Platform.OS === 'web' || Platform.OS === 'node';
    case 'macos':
      // In web context, try to detect macOS
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        return navigator.platform.indexOf('Mac') > -1;
      }
      return Platform.OS === 'ios'; // Assume iOS in React Native could be running on macOS
    case 'windows':
      // In web context, try to detect Windows
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        return navigator.platform.indexOf('Win') > -1;
      }
      return Platform.OS === 'node'; // Assume node could be Windows
    default:
      return false;
  }
}

export default Platform;
