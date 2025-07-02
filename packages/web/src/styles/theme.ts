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
  },
  typography: {
    fontFamily: `'Inter', 'Segoe UI', 'SF Pro Rounded', 'Google Sans Flex Rounded', 'system-ui', sans-serif`,
    fontSize: {
      body: 16,
      heading: 24,
      subheading: 20,
      caption: 14,
      button: 16,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
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

export const highContrastColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
  background: '#FFFF00',
  surface: '#FFFFFF',
  error: '#FF0000',
  success: '#00FF00',
  warning: '#FFA500',
  info: '#0000FF',
  onPrimary: '#FFFF00',
  onSecondary: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  outline: '#000000',
  disabled: '#CCCCCC',
};

export const accessibilityTypography = {
  fontFamily: `'Inter', 'Segoe UI', 'SF Pro Rounded', 'Google Sans Flex Rounded', 'system-ui', sans-serif`,
  fontSize: {
    body: 20,
    heading: 28,
    subheading: 24,
    caption: 18,
    button: 20,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
};

export function getTypography(accessibilityMode: boolean) {
  return accessibilityMode ? accessibilityTypography : theme.typography;
}
