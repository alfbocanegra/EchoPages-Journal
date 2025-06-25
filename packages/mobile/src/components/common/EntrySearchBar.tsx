import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Tag, getTags } from '../../utils/EncryptedTagStorage';
import { Folder, getFolders } from '../../utils/EncryptedFolderStorage';
import { TagManager } from '../tag/TagManager';
import { FolderManager } from '../folder/FolderManager';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export interface EntrySearchFilters {
  text: string;
  tagIds: string[];
  folderId?: string;
  date?: string; // ISO date string
}

interface EntrySearchBarProps {
  value: EntrySearchFilters;
  onChange: (filters: EntrySearchFilters) => void;
}

export const EntrySearchBar: React.FC<EntrySearchBarProps> = ({ value, onChange }) => {
  const [tagManagerVisible, setTagManagerVisible] = useState(false);
  const [folderManagerVisible, setFolderManagerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  const loadTags = async () => setAllTags(await getTags());
  const loadFolders = async () => setAllFolders(await getFolders());

  const handleTagChipPress = async () => {
    await loadTags();
    setTagManagerVisible(true);
  };
  const handleFolderChipPress = async () => {
    await loadFolders();
    setFolderManagerVisible(true);
  };
  const handleDateChipPress = () => setDatePickerVisible(true);

  const selectedTags = allTags.filter(t => value.tagIds.includes(t.id));
  const selectedFolder = allFolders.find(f => f.id === value.folderId);

  return (
    <View style={styles.container}>
      <TextInput
        value={value.text}
        onChangeText={text => onChange({ ...value, text })}
        placeholder="Search entries..."
        style={styles.input}
        accessibilityLabel="Search entries"
      />
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={styles.chip}
          onPress={handleTagChipPress}
          accessibilityLabel="Filter by tags"
          accessibilityRole="button"
          testID="tag-filter-chip"
        >
          <Ionicons name="pricetags-outline" size={16} color="#0288D1" />
          <Text style={styles.chipText}>
            {selectedTags.length > 0 ? selectedTags.map(t => t.name).join(', ') : 'Tags'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chip}
          onPress={handleFolderChipPress}
          accessibilityLabel="Filter by folder"
          accessibilityRole="button"
          testID="folder-filter-chip"
        >
          <Ionicons name="folder-outline" size={16} color="#388E3C" />
          <Text style={styles.chipText}>{selectedFolder ? selectedFolder.name : 'Folder'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chip}
          onPress={handleDateChipPress}
          accessibilityLabel="Filter by date"
          accessibilityRole="button"
          testID="date-filter-chip"
        >
          <Ionicons name="calendar-outline" size={16} color="#FBC02D" />
          <Text style={styles.chipText}>
            {value.date ? new Date(value.date).toLocaleDateString() : 'Date'}
          </Text>
        </TouchableOpacity>
      </View>
      <TagManager
        visible={tagManagerVisible}
        onClose={() => setTagManagerVisible(false)}
        onSelect={tag => {
          setTagManagerVisible(false);
          if (!value.tagIds.includes(tag.id))
            onChange({ ...value, tagIds: [...value.tagIds, tag.id] });
        }}
      />
      <FolderManager
        visible={folderManagerVisible}
        onClose={() => setFolderManagerVisible(false)}
        onSelect={folder => {
          setFolderManagerVisible(false);
          onChange({ ...value, folderId: folder.id });
        }}
      />
      {datePickerVisible && (
        <DateTimePicker
          value={value.date ? new Date(value.date) : new Date()}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setDatePickerVisible(false);
            if (date) onChange({ ...value, date: date.toISOString().slice(0, 10) });
          }}
        />
      )}
      {/* Show selected tag/folder/date chips with remove buttons */}
      <View style={styles.selectedRow}>
        {selectedTags.map(tag => (
          <View
            key={tag.id}
            style={[
              styles.selectedChip,
              { backgroundColor: tag.color + '22', borderColor: tag.color },
            ]}
          >
            <Text style={[styles.selectedChipText, { color: tag.color }]}>{tag.name}</Text>
            <TouchableOpacity
              onPress={() =>
                onChange({ ...value, tagIds: value.tagIds.filter(id => id !== tag.id) })
              }
              accessibilityLabel={`Remove tag filter ${tag.name}`}
              accessibilityRole="button"
              style={[styles.selectedChipRemove, styles.focusOutline]}
              testID={`remove-tag-filter-${tag.id}`}
            >
              <Ionicons name="close" size={14} color={tag.color} />
            </TouchableOpacity>
          </View>
        ))}
        {selectedFolder && (
          <View
            style={[
              styles.selectedChip,
              { backgroundColor: selectedFolder.color + '22', borderColor: selectedFolder.color },
            ]}
          >
            <Text style={[styles.selectedChipText, { color: selectedFolder.color }]}>
              {selectedFolder.name}
            </Text>
            <TouchableOpacity
              onPress={() => onChange({ ...value, folderId: undefined })}
              accessibilityLabel={`Remove folder filter ${selectedFolder.name}`}
              accessibilityRole="button"
              style={[styles.selectedChipRemove, styles.focusOutline]}
              testID="remove-folder-filter"
            >
              <Ionicons name="close" size={14} color={selectedFolder.color} />
            </TouchableOpacity>
          </View>
        )}
        {value.date && (
          <View
            style={[styles.selectedChip, { backgroundColor: '#FBC02D22', borderColor: '#FBC02D' }]}
          >
            <Text style={[styles.selectedChipText, { color: '#FBC02D' }]}>
              {new Date(value.date).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              onPress={() => onChange({ ...value, date: undefined })}
              accessibilityLabel={`Remove date filter`}
              accessibilityRole="button"
              style={[styles.selectedChipRemove, styles.focusOutline]}
              testID="remove-date-filter"
            >
              <Ionicons name="close" size={14} color="#FBC02D" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    minHeight: 36,
    minWidth: 44,
    justifyContent: 'center',
  },
  chipText: { fontSize: 15, marginLeft: 4 },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 2 },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    minHeight: 36,
    minWidth: 44,
    justifyContent: 'center',
  },
  selectedChipText: { fontSize: 15, marginRight: 4 },
  selectedChipRemove: { marginLeft: 2 },
  focusOutline: { borderColor: '#0288D1', borderWidth: 2 },
});
