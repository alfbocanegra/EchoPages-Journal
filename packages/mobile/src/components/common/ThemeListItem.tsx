import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ThemeListItemProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  rightActions?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const ThemeListItem: React.FC<ThemeListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  rightActions,
  onPress,
  onLongPress,
  selected = false,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles(theme).container,
        selected && styles(theme).selected,
        disabled && styles(theme).disabled,
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessible
    >
      {leading && <View style={styles(theme).leading}>{leading}</View>}
      <View style={styles(theme).textContainer}>
        <Text style={[styles(theme).title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles(theme).subtitle, subtitleStyle]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing && <View style={styles(theme).trailing}>{trailing}</View>}
      {rightActions && <View style={styles(theme).rightActions}>{rightActions}</View>}
    </TouchableOpacity>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.medium,
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      marginVertical: theme.spacing[1],
      minHeight: 56,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    selected: {
      backgroundColor: theme.colors.accent + '22',
      borderColor: theme.colors.accent,
      borderWidth: 1,
    },
    disabled: {
      opacity: 0.5,
    },
    leading: {
      marginRight: theme.spacing[3],
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.body,
      fontWeight: '500',
      fontFamily: theme.typography.fontFamily,
    },
    subtitle: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
      marginTop: 2,
    },
    trailing: {
      marginLeft: theme.spacing[3],
    },
    rightActions: {
      marginLeft: theme.spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
