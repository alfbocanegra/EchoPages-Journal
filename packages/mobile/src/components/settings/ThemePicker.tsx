import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeButton } from '../common/ThemeButton';
import { useTheme } from '../../styles/ThemeContext';

export type ThemeOption = 'light' | 'dark' | 'system';

interface ThemePickerProps {
  visible: boolean;
  selected: ThemeOption;
  onSelect: (theme: ThemeOption) => void;
  onClose: () => void;
}

const OPTIONS: { key: ThemeOption; label: string; icon: any }[] = [
  {
    key: 'light',
    label: 'Light',
    icon: <Ionicons name="sunny-outline" size={24} color="#FBC02D" />,
  },
  { key: 'dark', label: 'Dark', icon: <Ionicons name="moon-outline" size={24} color="#625B71" /> },
  {
    key: 'system',
    label: 'System Default',
    icon: <Ionicons name="phone-portrait-outline" size={24} color="#0288D1" />,
  },
];

export const ThemePicker: React.FC<ThemePickerProps> = ({
  visible,
  selected,
  onSelect,
  onClose,
}) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles(theme).overlay}>
        <View style={styles(theme).modal}>
          <Text style={styles(theme).header}>Choose Theme</Text>
          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles(theme).option, selected === opt.key && styles(theme).selected]}
              onPress={() => onSelect(opt.key)}
              accessibilityLabel={`Select ${opt.label} theme`}
              accessibilityRole="button"
              testID={`theme-option-${opt.key}`}
            >
              {opt.icon}
              <Text style={styles(theme).label}>{opt.label}</Text>
              {selected === opt.key && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.accent}
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          ))}
          <ThemeButton
            title="Close"
            onPress={onClose}
            variant="outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.large,
      padding: theme.spacing[5],
      width: 320,
      maxWidth: '90%',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: theme.elevation.modal,
      shadowOffset: { width: 0, height: 4 },
      elevation: theme.elevation.modal,
    },
    header: {
      fontSize: theme.typography.fontSize.heading,
      fontWeight: 'bold',
      marginBottom: theme.spacing[3],
      textAlign: 'center',
      color: theme.colors.onSurface,
      fontFamily: theme.typography.fontFamily,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing[3],
      borderRadius: theme.shape.borderRadius.medium,
      marginBottom: theme.spacing[2],
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    selected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent + '22', // faded accent
    },
    label: {
      fontSize: theme.typography.fontSize.body,
      marginLeft: theme.spacing[2],
      color: theme.colors.onSurface,
      fontFamily: theme.typography.fontFamily,
    },
  });
