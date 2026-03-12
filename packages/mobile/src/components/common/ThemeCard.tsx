import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ThemeCardProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'tonal';
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  children,
  variant = 'filled',
  style,
  accessible,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const cardStyle = [
    styles(theme).card,
    variant === 'outlined' && styles(theme).outlined,
    variant === 'tonal' && styles(theme).tonal,
    style,
  ];
  return (
    <View style={cardStyle} accessible={accessible} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.large,
      padding: theme.spacing[4],
      marginVertical: theme.spacing[2],
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: theme.elevation.card,
      shadowOffset: { width: 0, height: 2 },
      elevation: theme.elevation.card,
    },
    outlined: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    tonal: {
      backgroundColor: theme.colors.secondary,
    },
  });
