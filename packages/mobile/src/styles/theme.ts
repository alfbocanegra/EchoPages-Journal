import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#6750A4',
    secondary: '#625B71',
    background: '#F4EFF4',
    surface: '#FFFFFF',
    error: '#B3261E',
    success: '#388E3C',
    warning: '#FBC02D',
    info: '#0288D1',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
    outline: '#C1C1C1',
    disabled: '#E0E0E0',
    accent: '#0288D1', // Material 3 accent blue
    // Add dynamic color support here in the future
  },
  typography: {
    fontFamily: Platform.select({
      ios: 'SF Pro Rounded',
      android: 'Google Sans Flex Rounded',
      windows: 'Segoe UI Variable',
      default: 'system-ui',
    }),
    fontSize: {
      body: 16,
      heading: 24,
      subheading: 20,
      caption: 14,
      button: 16,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  shape: {
    borderRadius: {
      small: 8,
      medium: 12,
      large: 24,
      full: 999,
    },
  },
  elevation: {
    card: 2,
    modal: 8,
    fab: 6,
    banner: 1,
  },
  spacing: [0, 4, 8, 16, 24, 32, 40],
};
