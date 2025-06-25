import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessible
      accessibilityLabel={accessibilityLabel || title || 'Modal'}
    >
      <View style={styles(theme).overlay}>
        <View style={[styles(theme).modal, style]}>
          {title && <Text style={styles(theme).title}>{title}</Text>}
          <TouchableOpacity
            style={styles(theme).closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Text style={styles(theme).closeText}>×</Text>
          </TouchableOpacity>
          <View style={styles(theme).content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.large,
      padding: theme.spacing[5],
      minWidth: 280,
      maxWidth: 400,
      width: '90%',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: theme.elevation.modal,
      shadowOffset: { width: 0, height: 4 },
      elevation: theme.elevation.modal,
      position: 'relative',
    },
    title: {
      fontSize: theme.typography.fontSize.heading,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing[3],
      fontFamily: theme.typography.fontFamily,
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing[2],
      right: theme.spacing[2],
      zIndex: 10,
      padding: theme.spacing[2],
    },
    closeText: {
      fontSize: 28,
      color: theme.colors.onSurface,
      fontWeight: 'bold',
      lineHeight: 28,
    },
    content: {
      marginTop: theme.spacing[2],
    },
  });
