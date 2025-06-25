import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Folder, getFolders, saveFolder, deleteFolder } from '../../utils/EncryptedFolderStorage';
import { v4 as uuidv4 } from 'uuid';
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

interface FolderManagerProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (folder: Folder) => void;
}

export const FolderManager: React.FC<FolderManagerProps> = ({ visible, onClose, onSelect }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const theme = useTheme();

  useEffect(() => {
    if (visible) loadFolders();
  }, [visible]);

  const loadFolders = async () => {
    const data = await getFolders();
    setFolders(data);
  };

  const openCreate = () => {
    setEditingFolder(null);
    setName('');
    setColor(COLORS[0]);
    setModalVisible(true);
  };

  const openEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setName(folder.name);
    setColor(folder.color);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const folder: Folder = editingFolder
      ? { ...editingFolder, name: name.trim(), color }
      : {
          id: uuidv4(),
          name: name.trim(),
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
    await saveFolder(folder);
    setModalVisible(false);
    loadFolders();
  };

  const handleDelete = (folder: Folder) => {
    Alert.alert('Delete Folder', `Delete folder "${folder.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFolder(folder.id);
          loadFolders();
        },
      },
    ]);
  };

  const renderColorPicker = () => (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {COLORS.map(c => (
        <TouchableOpacity
          key={c}
          style={[
            styles(theme).colorSwatch,
            {
              backgroundColor: c,
              borderWidth: color === c ? 3 : 1,
              borderColor: color === c ? '#222' : '#ccc',
            },
          ]}
          onPress={() => setColor(c)}
          accessibilityLabel={`Select color ${c}`}
          accessible
        />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles(theme).container}>
        <Text style={styles(theme).header}>Folders</Text>
        <FlatList
          data={folders}
          keyExtractor={f => f.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles(theme).folderItem, { backgroundColor: item.color + '22' }]}
              onPress={() => (onSelect ? (onSelect(item), onClose()) : openEdit(item))}
              accessibilityLabel={`Folder: ${item.name}`}
              accessible
            >
              <View style={[styles(theme).colorDot, { backgroundColor: item.color }]} />
              <Text style={styles(theme).folderName}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                accessibilityLabel={`Edit folder ${item.name}`}
                style={styles(theme).editBtn}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                accessibilityLabel={`Delete folder ${item.name}`}
                style={styles(theme).deleteBtn}
              >
                <Text>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles(theme).empty}>No folders yet.</Text>}
        />
        <ThemeButton
          title="Create Folder"
          onPress={openCreate}
          variant="primary"
          accessibilityLabel="Create new folder"
          style={{ marginTop: 16 }}
        />
        <ThemeButton title="Close" onPress={onClose} variant="outline" style={{ marginTop: 8 }} />
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles(theme).modalBg}>
          <View style={styles(theme).modalContent}>
            <Text style={styles(theme).modalHeader}>
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Folder name"
              style={styles(theme).input}
              accessibilityLabel="Folder name"
              autoFocus
            />
            {renderColorPicker()}
            <ThemeButton
              title={editingFolder ? 'Save' : 'Create'}
              onPress={handleSave}
              variant="primary"
              accessibilityLabel={editingFolder ? 'Save folder' : 'Create folder'}
            />
            <ThemeButton
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="outline"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#fff' },
    header: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.heading,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 'bold',
      marginBottom: theme.spacing[2],
    },
    folderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    colorDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      marginRight: 12,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    folderName: {
      color: theme.colors.accent,
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
    },
    editBtn: { marginLeft: 8 },
    deleteBtn: { marginLeft: 8 },
    modalBg: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 24,
      width: 320,
      maxWidth: '90%',
    },
    modalHeader: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.subheading,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 'bold',
      marginBottom: theme.spacing[2],
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      fontSize: 16,
    },
    colorSwatch: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 4 },
    empty: {
      color: theme.colors.outline,
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
      marginTop: theme.spacing[6],
      textAlign: 'center',
    },
  });
