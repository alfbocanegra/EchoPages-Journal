import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1', // Indigo
    primaryContainer: '#E0E7FF',
    secondary: '#EC4899', // Pink
    secondaryContainer: '#FCE7F3',
    tertiary: '#10B981', // Emerald
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    background: '#F8FAFC',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
    onBackground: '#1F2937',
    outline: '#D1D5DB',
    shadow: '#000000',
    inverseSurface: '#374151',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#A5B4FC',
  },
  fonts: {
    ...DefaultTheme.fonts,
    displayLarge: {
      fontFamily: 'Inter-Bold',
      fontSize: 57,
      fontWeight: '700',
      letterSpacing: -0.25,
      lineHeight: 64,
    },
    displayMedium: {
      fontFamily: 'Inter-Bold',
      fontSize: 45,
      fontWeight: '700',
      letterSpacing: 0,
      lineHeight: 52,
    },
    displaySmall: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 36,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 44,
    },
    headlineLarge: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 32,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineMedium: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: 0,
      lineHeight: 36,
    },
    headlineSmall: {
      fontFamily: 'Inter-Medium',
      fontSize: 24,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: 'Inter-Medium',
      fontSize: 22,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 28,
    },
    titleMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    titleSmall: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelLarge: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'Inter-Medium',
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    bodyLarge: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.4,
      lineHeight: 16,
    },
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
