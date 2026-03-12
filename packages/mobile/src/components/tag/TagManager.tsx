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
import { Tag, getTags, saveTag, deleteTag } from '../../utils/EncryptedTagStorage';
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

interface TagManagerProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (tag: Tag) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ visible, onClose, onSelect }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const theme = useTheme();

  useEffect(() => {
    if (visible) loadTags();
  }, [visible]);

  const loadTags = async () => {
    const data = await getTags();
    setTags(data);
  };

  const openCreate = () => {
    setEditingTag(null);
    setName('');
    setColor(COLORS[0]);
    setModalVisible(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const tag: Tag = editingTag
      ? { ...editingTag, name: name.trim(), color }
      : {
          id: uuidv4(),
          name: name.trim(),
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
    await saveTag(tag);
    setModalVisible(false);
    loadTags();
  };

  const handleDelete = (tag: Tag) => {
    Alert.alert('Delete Tag', `Delete tag "${tag.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTag(tag.id);
          loadTags();
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
        <Text style={styles(theme).header}>Tags</Text>
        <FlatList
          data={tags}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles(theme).tagItem, { backgroundColor: item.color + '22' }]}
              onPress={() => (onSelect ? (onSelect(item), onClose()) : openEdit(item))}
              accessibilityLabel={`Tag: ${item.name}`}
              accessible
            >
              <View style={[styles(theme).colorDot, { backgroundColor: item.color }]} />
              <Text style={styles(theme).tagName}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                accessibilityLabel={`Edit tag ${item.name}`}
                style={styles(theme).editBtn}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                accessibilityLabel={`Delete tag ${item.name}`}
                style={styles(theme).deleteBtn}
              >
                <Text>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles(theme).empty}>No tags yet.</Text>}
        />
        <ThemeButton
          title="Create Tag"
          onPress={openCreate}
          variant="primary"
          accessibilityLabel="Create new tag"
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
            <Text style={styles(theme).modalHeader}>{editingTag ? 'Edit Tag' : 'Create Tag'}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tag name"
              style={styles(theme).input}
              accessibilityLabel="Tag name"
              autoFocus
            />
            {renderColorPicker()}
            <ThemeButton
              title={editingTag ? 'Save' : 'Create'}
              onPress={handleSave}
              variant="primary"
              accessibilityLabel={editingTag ? 'Save tag' : 'Create tag'}
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
    tagItem: {
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
    tagName: {
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
