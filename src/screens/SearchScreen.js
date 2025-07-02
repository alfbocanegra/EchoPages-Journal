import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Searchbar, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useJournal } from '../context/JournalContext';
import { theme, spacing, shadows } from '../theme/theme';
import { formatDate, getPreviewText, getMoodEmoji, debounce } from '../utils/helpers';

export default function SearchScreen({ navigation }) {
  const { entries, searchQuery, setSearchQuery } = useJournal();

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Debounced search function
  const debouncedSearch = debounce(query => {
    if (query.trim()) {
      setIsSearching(true);
      const results = entries.filter(
        entry =>
          entry.title.toLowerCase().includes(query.toLowerCase()) ||
          entry.content.toLowerCase().includes(query.toLowerCase()) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleEntryPress = entry => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { entryId: entry.id });
  };

  const renderSearchResult = ({ item: entry }) => (
    <TouchableOpacity onPress={() => handleEntryPress(entry)} activeOpacity={0.7}>
      <Card style={styles.entryCard}>
        <Card.Content>
          <View style={styles.entryHeader}>
            <View style={styles.entryTitleContainer}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
            </View>
            <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
          </View>

          <Text style={styles.entryPreview} numberOfLines={2}>
            {getPreviewText(entry.content)}
          </Text>

          {entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {entry.tags.slice(0, 3).map((tag, index) => (
                <Chip key={index} style={styles.tag} textStyle={styles.tagText} compact>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={searchQuery ? 'search' : 'search-outline'}
        size={64}
        color={theme.colors.outline}
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No results found' : 'Search your journal'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No entries found for "${searchQuery}"`
          : 'Find entries by title, content, or tags'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search entries, tags, or content..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
          autoFocus
        />
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  searchbar: {
    backgroundColor: theme.colors.surfaceVariant,
    ...shadows.small,
  },
  searchInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  resultsContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  entryCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  entryTitleContainer: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
  },
  entryDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  moodEmoji: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  entryPreview: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.sm,
    fontFamily: 'Inter-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: theme.colors.primaryContainer,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: spacing.lg,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontFamily: 'Inter-Regular',
  },
});
