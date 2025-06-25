import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Folder, getFolders } from '../../utils/EncryptedFolderStorage';
import { FolderManager } from '../folder/FolderManager';
import { useTheme } from '../../styles/ThemeContext';

interface FolderPickerProps {
  value?: string;
  onChange: (folderId: string | undefined) => void;
}

export const FolderPicker: React.FC<FolderPickerProps> = ({ value, onChange }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<Folder | undefined>();
  const [managerVisible, setManagerVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    setSelected(folders.find(f => f.id === value));
  }, [folders, value]);

  const loadFolders = async () => {
    const data = await getFolders();
    setFolders(data);
  };

  const handleSelect = (folder: Folder) => {
    setManagerVisible(false);
    onChange(folder.id);
    setSelected(folder);
    loadFolders();
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).label}>Folder</Text>
      <TouchableOpacity
        style={styles(theme).picker}
        onPress={() => setManagerVisible(true)}
        accessibilityLabel="Select folder"
        accessible
      >
        {selected ? (
          <>
            <View style={[styles(theme).colorDot, { backgroundColor: selected.color }]} />
            <Text style={styles(theme).folderName}>{selected.name}</Text>
          </>
        ) : (
          <Text style={styles(theme).placeholder}>No folder</Text>
        )}
      </TouchableOpacity>
      <FolderManager
        visible={managerVisible}
        onClose={() => setManagerVisible(false)}
        onSelect={handleSelect}
      />
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: { marginBottom: 16 },
    label: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
      marginBottom: theme.spacing[1],
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#fafafa',
    },
    colorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    folderName: {
      color: theme.colors.accent,
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
    },
    placeholder: {
      color: theme.colors.outline,
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
      fontStyle: 'italic',
    },
  });
