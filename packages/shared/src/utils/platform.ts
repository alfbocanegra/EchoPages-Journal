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
    gapi?: any;
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

  var window: Window | undefined;
  var document: Document | undefined;
  var localStorage: Storage | undefined;
  var navigator: Navigator | undefined;
}

// Detect the current platform environment
function detectPlatform(): 'ios' | 'android' | 'web' | 'node' {
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node';
  }

  // Check if we're in React Native environment
  try {
    if (
      typeof globalThis !== 'undefined' &&
      (globalThis as any).navigator &&
      (globalThis as any).navigator.product === 'ReactNative'
    ) {
      // We're in React Native, now try to determine iOS vs Android
      try {
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
  if (
    typeof (globalThis as any).window !== 'undefined' &&
    typeof (globalThis as any).document !== 'undefined'
  ) {
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
