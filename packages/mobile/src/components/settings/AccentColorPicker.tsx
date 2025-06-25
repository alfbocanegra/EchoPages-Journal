import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemeButton } from '../common/ThemeButton';
import { useTheme } from '../../styles/ThemeContext';

const COLORS = [
  '#0288D1',
  '#388E3C',
  '#FBC02D',
  '#B3261E',
  '#625B71',
  '#FF9800',
  '#7C4DFF',
  '#009688',
  '#E91E63',
  '#607D8B',
];

interface AccentColorPickerProps {
  visible: boolean;
  selected: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export const AccentColorPicker: React.FC<AccentColorPickerProps> = ({
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
          <Text style={styles(theme).header}>Choose Accent Color</Text>
          <View style={styles(theme).swatchRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles(theme).swatch,
                  {
                    backgroundColor: c,
                    borderWidth: selected === c ? 3 : 1,
                    borderColor: selected === c ? '#222' : '#ccc',
                  },
                ]}
                onPress={() => onSelect(c)}
                accessibilityLabel={`Select color ${c}`}
                accessibilityRole="button"
                testID={`accent-color-${c}`}
              />
            ))}
          </View>
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
    modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 320, maxWidth: '90%' },
    header: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.heading,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 'bold',
      marginBottom: theme.spacing[2],
      textAlign: 'center',
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginVertical: 8,
    },
    swatch: { width: 36, height: 36, borderRadius: 18, margin: 6 },
  });
