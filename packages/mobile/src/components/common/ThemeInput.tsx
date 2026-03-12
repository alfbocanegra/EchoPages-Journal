import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ThemeInputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'filled' | 'outlined' | 'error' | 'disabled';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const ThemeInput: React.FC<ThemeInputProps> = ({
  label,
  error,
  variant = 'filled',
  style,
  inputStyle,
  editable = true,
  accessibilityLabel,
  ...props
}) => {
  const theme = useTheme();
  const isError = variant === 'error' || !!error;
  const isDisabled = variant === 'disabled' || !editable;
  return (
    <View style={[styles(theme).container, style]}>
      {label && <Text style={styles(theme).label}>{label}</Text>}
      <TextInput
        style={[
          styles(theme).input,
          variant === 'outlined' && styles(theme).outlined,
          isError && styles(theme).error,
          isDisabled && styles(theme).disabled,
          inputStyle,
        ]}
        placeholderTextColor={theme.colors.outline}
        editable={!isDisabled}
        accessibilityLabel={accessibilityLabel || label}
        {...props}
      />
      {isError && error && <Text style={styles(theme).errorText}>{error}</Text>}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing[2],
      width: '100%',
    },
    label: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontWeight: '500',
      marginBottom: theme.spacing[1],
      fontFamily: theme.typography.fontFamily,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurface,
      borderRadius: theme.shape.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
    },
    outlined: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    error: {
      borderColor: theme.colors.error,
    },
    disabled: {
      backgroundColor: theme.colors.disabled,
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.caption,
      marginTop: theme.spacing[1],
      fontFamily: theme.typography.fontFamily,
    },
  });
