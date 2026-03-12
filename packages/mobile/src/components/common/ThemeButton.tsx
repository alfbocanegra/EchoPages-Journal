import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ThemeButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

const fontWeightMap: Record<string, TextStyle['fontWeight']> = {
  '400': '400',
  '500': '500',
  '700': '700',
};

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const getButtonColors = (variant: string, disabled: boolean) => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.disabled,
        textColor: theme.colors.onSurface,
        borderColor: theme.colors.outline,
      };
    }
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          textColor: theme.colors.onSecondary,
          borderColor: theme.colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          textColor: theme.colors.onPrimary,
          borderColor: theme.colors.error,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
          borderColor: theme.colors.primary,
        };
    }
  };
  const { backgroundColor, textColor, borderColor } = getButtonColors(variant, disabled);
  return (
    <TouchableOpacity
      onPress={onPress || (() => {})}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[
        styles(theme).button,
        {
          backgroundColor,
          borderColor,
          shadowOpacity: theme.elevation.card ? 0.15 : 0,
          shadowRadius: theme.elevation.card,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles(theme).text,
          {
            color: textColor,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize.button,
            fontWeight: fontWeightMap[theme.typography.fontWeight.medium],
          },
          textStyle,
        ]}
        allowFontScaling
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    button: {
      minHeight: 48,
      minWidth: 120,
      borderRadius: theme.shape.borderRadius.medium,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      marginVertical: theme.spacing[1],
      borderWidth: 1,
      shadowColor: '#000',
      elevation: theme.elevation.card,
    },
    text: {
      textAlign: 'center',
      letterSpacing: 0.5,
    },
  });
