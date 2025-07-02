import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useJournal } from '../context/JournalContext';
import PropTypes from 'prop-types';

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const colorScheme = useColorScheme();
  const { entries } = useJournal();

  // Collect unique tags and moods
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags))).filter(Boolean);
  const allMoods = Array.from(new Set(entries.map(e => e.mood))).filter(Boolean);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.content.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
      (entry.mood && entry.mood.includes(search));
    const matchesTag = !tagFilter || entry.tags.includes(tagFilter);
    const matchesMood = !moodFilter || entry.mood === moodFilter;
    return matchesSearch && matchesTag && matchesMood;
  });

  const styles = getStyles(colorScheme);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}
      testID={`entry-${item.id}`}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{item.date}</Text>
        <Text style={styles.entryMood}>{item.mood}</Text>
      </View>
      <Text style={styles.entryTitle}>{item.title}</Text>
      <View style={styles.entryTagsRow}>
        {item.tags.map(tag => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {item.media && (
          <MaterialIcons
            name="image"
            size={18}
            color={styles.icon.color}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} testID="app-root">
      {/* Top bar with title and icons */}
      <View style={styles.topBar}>
        <Text style={styles.header}>EchoPages Journal</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Calendar')}
            style={styles.iconButton}
            testID="calendar-tab"
          >
            <MaterialIcons
              name="calendar-today"
              size={28}
              color={colorScheme === 'dark' ? '#fff' : '#4F8EF7'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
            testID="settings-tab"
          >
            <MaterialIcons
              name="settings"
              size={28}
              color={colorScheme === 'dark' ? '#fff' : '#4F8EF7'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search entries..."
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search journal entries"
        testID="search-input"
      />
      {/* Tag filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginLeft: 16, marginBottom: 4 }}
      >
        {allTags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.filterChip, tagFilter === tag && styles.filterChipSelected]}
            onPress={() => setTagFilter(tagFilter === tag ? '' : tag)}
            testID={`tag-filter-${tag}`}
          >
            <Text
              style={[styles.filterChipText, tagFilter === tag && styles.filterChipTextSelected]}
            >
              #{tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Mood filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginLeft: 16, marginBottom: 8 }}
      >
        {allMoods.map(mood => (
          <TouchableOpacity
            key={mood}
            style={[styles.filterChip, moodFilter === mood && styles.filterChipSelected]}
            onPress={() => setMoodFilter(moodFilter === mood ? '' : mood)}
            testID={`mood-filter-${mood}`}
          >
            <Text
              style={[styles.filterChipText, moodFilter === mood && styles.filterChipTextSelected]}
            >
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Journal entries list */}
      <FlatList
        data={filteredEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        accessibilityLabel="Journal entry list"
        testID="journal-entries-list"
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QuickEntry')}
        accessibilityLabel="Quick Entry"
        accessibilityRole="button"
        testID="add-entry-button"
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function getStyles(colorScheme) {
  const isDark = colorScheme === 'dark';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#181A20' : '#F7F8FA',
      paddingTop: 56,
      paddingHorizontal: 0,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginBottom: 8,
    },
    header: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#fff' : '#181A20',
      flex: 1,
      textAlign: 'left',
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      marginLeft: 12,
    },
    searchBar: {
      backgroundColor: isDark ? '#23242A' : '#fff',
      color: isDark ? '#fff' : '#181A20',
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
    },
    listContent: {
      paddingBottom: 96,
      paddingHorizontal: 8,
    },
    entryCard: {
      backgroundColor: isDark ? '#23242A' : '#fff',
      borderRadius: 16,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 8,
      shadowColor: isDark ? '#000' : '#aaa',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    entryDate: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#888',
    },
    entryMood: {
      fontSize: 18,
    },
    entryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#181A20',
      marginBottom: 6,
    },
    entryTagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    tagChip: {
      backgroundColor: isDark ? '#333' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: 6,
      marginTop: 2,
    },
    tagText: {
      fontSize: 13,
      color: isDark ? '#fff' : '#181A20',
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 32,
      backgroundColor: '#4F8EF7',
      borderRadius: 32,
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#4F8EF7',
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    icon: {
      color: isDark ? '#fff' : '#181A20',
    },
    filterChip: {
      backgroundColor: isDark ? '#333' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: 6,
      marginTop: 2,
    },
    filterChipSelected: {
      backgroundColor: '#4F8EF7',
    },
    filterChipText: {
      fontSize: 13,
      color: isDark ? '#fff' : '#181A20',
    },
    filterChipTextSelected: {
      fontWeight: 'bold',
    },
  });
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
