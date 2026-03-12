import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ProgressBannerProps {
  message: string;
  accent?: boolean;
  style?: any;
}

export const ProgressBanner: React.FC<ProgressBannerProps> = ({
  message,
  accent = false,
  style,
}) => {
  const theme = useTheme();
  return (
    <View style={[styles(theme).container, accent && styles(theme).accent, style]}>
      <Text style={styles(theme).text}>{message}</Text>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.medium,
      padding: theme.spacing[2],
      marginVertical: theme.spacing[1],
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    accent: {
      backgroundColor: theme.colors.accent + '22',
      borderColor: theme.colors.accent,
      borderWidth: 1,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
    },
  });
