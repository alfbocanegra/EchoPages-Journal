import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, FlatList } from 'react-native';
import { getEntries, JournalEntry } from '../utils/EncryptedEntryStorage';
import { ThemeListItem } from '../components/common/ThemeListItem';
import { Ionicons } from '@expo/vector-icons';
import { EntrySearchBar, EntrySearchFilters } from '../components/common/EntrySearchBar';
import { EntryCalendar } from '../components/common/EntryCalendar';
import { useTheme } from '../styles/ThemeContext';

const EntryListScreen = ({ navigation }: any) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EntrySearchFilters>({
    text: '',
    tagIds: [],
    folderId: undefined,
    date: undefined,
  });
  const theme = useTheme();

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      const data = await getEntries();
      setEntries(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setLoading(false);
    };
    const unsubscribe = navigation.addListener('focus', loadEntries);
    return unsubscribe;
  }, [navigation]);

  // Filtering logic
  const filteredEntries = entries.filter(entry => {
    if (
      filters.text &&
      !entry.title?.toLowerCase().includes(filters.text.toLowerCase()) &&
      !entry.content?.toLowerCase().includes(filters.text.toLowerCase())
    )
      return false;
    if (filters.folderId && entry.folderId !== filters.folderId) return false;
    if (
      filters.tagIds &&
      filters.tagIds.length > 0 &&
      (!entry.tags || !filters.tagIds.every(tid => entry.tags?.includes(tid)))
    )
      return false;
    if (filters.date && entry.createdAt.slice(0, 10) !== filters.date) return false;
    return true;
  });

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <ThemeListItem
      title={item.title || 'Untitled Entry'}
      subtitle={new Date(item.updatedAt).toLocaleString()}
      onPress={() => navigation.navigate('Editor', { entryId: item.id })}
      accessibilityLabel={`Open entry titled ${item.title || 'Untitled Entry'}`}
    />
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <EntrySearchBar value={filters} onChange={setFilters} />
      <EntryCalendar
        entries={entries}
        selectedDate={filters.date}
        onSelect={date => setFilters(f => ({ ...f, date: f.date === date ? undefined : date }))}
      />
      <Text
        style={{
          fontSize: theme.typography.fontSize.heading,
          fontWeight: 'bold',
          marginBottom: 16,
          color: theme.colors.onSurface,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        Your Journal Entries
      </Text>
      <Button
        title="Create New Entry"
        onPress={() => navigation.navigate('Editor', { entryId: null })}
      />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : filteredEntries.length === 0 ? (
        <Text
          style={{
            marginTop: 32,
            color: theme.colors.outline,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          No entries found. Adjust your search or filters.
        </Text>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={{ marginTop: 16 }}
        />
      )}
    </View>
  );
};

export default EntryListScreen;
