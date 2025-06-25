import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Tag, getTags } from '../../utils/EncryptedTagStorage';
import { TagManager } from '../tag/TagManager';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeContext';

interface TagInputProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ value, onChange }) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [managerVisible, setManagerVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (input.trim()) {
      setSuggestions(
        allTags.filter(
          t => t.name.toLowerCase().includes(input.trim().toLowerCase()) && !value.includes(t.id)
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [input, allTags, value]);

  const loadTags = async () => {
    const tags = await getTags();
    setAllTags(tags);
  };

  const handleAdd = (tag: Tag) => {
    onChange([...value, tag.id]);
    setInput('');
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter(id => id !== tagId));
  };

  const handleCreateAndAdd = () => {
    // Open TagManager to create a new tag
    setManagerVisible(true);
  };

  const selectedTags = allTags.filter(t => value.includes(t.id));

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).label}>Tags</Text>
      <View style={styles(theme).chipRow}>
        {selectedTags.map(tag => (
          <View
            key={tag.id}
            style={[
              styles(theme).chip,
              { backgroundColor: tag.color + '22', borderColor: tag.color },
            ]}
          >
            <Text style={[styles(theme).chipText, { color: tag.color }]}>{tag.name}</Text>
            <TouchableOpacity
              onPress={() => handleRemove(tag.id)}
              accessibilityLabel={`Remove tag ${tag.name}`}
              style={styles(theme).chipRemove}
            >
              <Ionicons name="close" size={16} color={tag.color} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={handleCreateAndAdd}
          style={styles(theme).addBtn}
          accessibilityLabel="Manage tags"
        >
          <Ionicons name="add-circle-outline" size={22} color="#0288D1" />
        </TouchableOpacity>
      </View>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Add tag..."
        style={styles(theme).input}
        accessibilityLabel="Add tag"
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles(theme).suggestion}
              onPress={() => handleAdd(item)}
              accessibilityLabel={`Add tag ${item.name}`}
            >
              <View style={[styles(theme).suggestionDot, { backgroundColor: item.color }]} />
              <Text style={{ color: item.color }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles(theme).suggestionList}
        />
      )}
      <TagManager
        visible={managerVisible}
        onClose={() => {
          setManagerVisible(false);
          loadTags();
        }}
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
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 4,
    },
    chipText: {
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
    },
    chipRemove: { marginLeft: 2 },
    addBtn: { padding: 2 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.shape.borderRadius.medium,
      padding: theme.spacing[2],
      fontSize: theme.typography.fontSize.body,
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurface,
      fontFamily: theme.typography.fontFamily,
    },
    suggestionList: {
      maxHeight: 120,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.shape.borderRadius.medium,
      marginTop: theme.spacing[1],
    },
    suggestion: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing[2],
    },
    suggestionDot: {
      width: 14,
      height: 14,
      borderRadius: theme.shape.borderRadius.full,
      marginRight: theme.spacing[2],
    },
  });
