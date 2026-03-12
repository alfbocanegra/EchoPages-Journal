import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useJournal, useAppColorScheme } from '../context/JournalContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

export default function JournalScreen() {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [moodFilter, setMoodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useAppColorScheme();
  const { entries, dateFormat } = useJournal();
  const navigation = useNavigation();

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
    const matchesDate = !dateFilter || entry.date === format(dateFilter, 'yyyy-MM-dd');
    return matchesSearch && matchesTag && matchesMood && matchesDate;
  });

  const styles = getStyles(colorScheme);

  const gradientColors =
    colorScheme === 'dark' ? ['#203A43', '#2c5364', '#0f2027'] : ['#a8edea', '#4fc3f7', '#1976d2'];

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
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View style={styles.container} testID="journal-root">
        {/* Top bar with back button and title */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={colorScheme === 'dark' ? '#fff' : '#4F8EF7'}
            />
          </TouchableOpacity>
          <Text style={styles.header}>Journal</Text>
        </View>
        {/* Search bar and date filter */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 16,
            marginBottom: 4,
          }}
        >
          <TextInput
            style={[styles.searchBar, { flex: 1, marginRight: 8 }]}
            placeholder="Search entries..."
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search journal entries"
            testID="search-input"
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ padding: 6, borderRadius: 8, backgroundColor: '#f0f0f0' }}
            testID="date-filter-button"
          >
            <MaterialIcons name="event" size={22} color="#4F8EF7" />
          </TouchableOpacity>
        </View>
        {dateFilter && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24, marginBottom: 2 }}
          >
            <Text style={{ color: '#4F8EF7', fontSize: 15 }}>
              Date:{' '}
              {format(
                dateFilter,
                dateFormat === 'DD/MM/YYYY'
                  ? 'dd/MM/yyyy'
                  : dateFormat === 'MM/DD/YYYY'
                  ? 'MM/dd/yyyy'
                  : 'yyyy-MM-dd'
              )}
            </Text>
            <TouchableOpacity onPress={() => setDateFilter(null)} style={{ marginLeft: 8 }}>
              <MaterialIcons name="close" size={18} color="#888" />
            </TouchableOpacity>
          </View>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={dateFilter || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDateFilter(selectedDate);
            }}
          />
        )}
        {/* Filter chips stacked tightly */}
        <View style={styles.filterChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipsRow}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.filterChip, tagFilter === tag && styles.filterChipSelected]}
                onPress={() => setTagFilter(tagFilter === tag ? '' : tag)}
                testID={`tag-filter-${tag}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    tagFilter === tag && styles.filterChipTextSelected,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipsRow}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {allMoods.map(mood => (
              <TouchableOpacity
                key={mood}
                style={[styles.filterChip, moodFilter === mood && styles.filterChipSelected]}
                onPress={() => setMoodFilter(moodFilter === mood ? '' : mood)}
                testID={`mood-filter-${mood}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    moodFilter === mood && styles.filterChipTextSelected,
                  ]}
                >
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Journal entries list */}
        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1 }}
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
    </LinearGradient>
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
      justifyContent: 'flex-start',
      marginHorizontal: 16,
      marginBottom: 8,
    },
    header: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#fff' : '#181A20',
      flex: 1,
      textAlign: 'center',
    },
    iconButton: {
      marginRight: 8,
    },
    searchBar: {
      backgroundColor: isDark ? '#23242A' : '#fff',
      color: isDark ? '#fff' : '#181A20',
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 4,
      paddingHorizontal: 16,
      paddingVertical: 10,
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
      marginVertical: 0,
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
      color: isDark ? '#fff' : '#181A20',
      fontSize: 13,
    },
    filterChip: {
      backgroundColor: isDark ? '#333' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      minHeight: 0,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterChipSelected: {
      backgroundColor: '#4F8EF7',
      borderColor: '#4F8EF7',
    },
    filterChipText: {
      fontSize: 15,
      minHeight: 0,
      lineHeight: 18,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    filterChipTextSelected: {
      color: '#fff',
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 32,
      backgroundColor: '#4F8EF7',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#4F8EF7',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    icon: {
      color: isDark ? '#fff' : '#4F8EF7',
    },
    filterChipsContainer: {
      marginTop: 0,
      marginBottom: 0,
      paddingVertical: 0,
    },
    filterChipsRow: {
      marginLeft: 16,
      marginBottom: 0,
      minHeight: 0,
      height: 32,
      paddingVertical: 0,
    },
    gradient: {
      flex: 1,
    },
  });
}

JournalScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }),
};
