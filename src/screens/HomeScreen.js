import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  ActivityIndicator,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useJournal } from '../context/JournalContext';
import { theme, spacing, shadows } from '../theme/theme';
import {
  formatDate,
  getPreviewText,
  getMoodEmoji,
  getMoodColor,
  getGreeting,
  getRandomWritingPrompt,
} from '../utils/helpers';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const {
    entries,
    loading,
    error,
    getFilteredEntries,
    getStats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deleteEntry,
  } = useJournal();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [writingPrompt, setWritingPrompt] = useState('');

  const filteredEntries = getFilteredEntries();
  const stats = getStats();

  useEffect(() => {
    setWritingPrompt(getRandomWritingPrompt());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setWritingPrompt(getRandomWritingPrompt());
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEntryPress = entry => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { entryId: entry.id });
  };

  const handleDeleteEntry = entryId => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEntry(entryId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Your Journal</Text>
          </View>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="stats-chart" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {entries.length > 0
                ? Math.round((stats.thisMonth / new Date().getDate()) * 10) / 10
                : 0}
            </Text>
            <Text style={styles.statLabel}>Daily Avg</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderPromptCard = () => (
    <Card style={styles.promptCard}>
      <Card.Content>
        <View style={styles.promptHeader}>
          <Ionicons name="bulb" size={20} color={theme.colors.primary} />
          <Text style={styles.promptTitle}>Writing Prompt</Text>
        </View>
        <Text style={styles.promptText}>{writingPrompt}</Text>
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => navigation.navigate('Write', { prompt: writingPrompt })}
        >
          <Text style={styles.promptButtonText}>Start Writing</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search your entries..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        iconColor={theme.colors.primary}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity style={styles.filterButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="filter" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          onPress={() => {
            setFilter('all');
            setMenuVisible(false);
          }}
          title="All Entries"
          leadingIcon={filter === 'all' ? 'check' : undefined}
        />
        <Menu.Item
          onPress={() => {
            setFilter('today');
            setMenuVisible(false);
          }}
          title="Today"
          leadingIcon={filter === 'today' ? 'check' : undefined}
        />
        <Menu.Item
          onPress={() => {
            setFilter('week');
            setMenuVisible(false);
          }}
          title="This Week"
          leadingIcon={filter === 'week' ? 'check' : undefined}
        />
        <Menu.Item
          onPress={() => {
            setFilter('month');
            setMenuVisible(false);
          }}
          title="This Month"
          leadingIcon={filter === 'month' ? 'check' : undefined}
        />
      </Menu>
    </View>
  );

  const renderEntryCard = entry => (
    <TouchableOpacity
      key={entry.id}
      onPress={() => handleEntryPress(entry)}
      onLongPress={() => handleDeleteEntry(entry.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.entryCard}>
        <Card.Content>
          <View style={styles.entryHeader}>
            <View style={styles.entryTitleContainer}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
            </View>
            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
            </View>
          </View>

          <Text style={styles.entryPreview} numberOfLines={3}>
            {getPreviewText(entry.content)}
          </Text>

          {entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {entry.tags.slice(0, 3).map((tag, index) => (
                <Chip key={index} style={styles.tag} textStyle={styles.tagText} compact>
                  {tag}
                </Chip>
              ))}
              {entry.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{entry.tags.length - 3} more</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="journal" size={64} color={theme.colors.outline} />
      <Text style={styles.emptyTitle}>No entries yet</Text>
      <Text style={styles.emptySubtitle}>
        Start your journaling journey by writing your first entry
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Write')}>
        <Text style={styles.emptyButtonText}>Write First Entry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your journal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderPromptCard()}
        {renderSearchAndFilter()}

        <View style={styles.entriesContainer}>
          {filteredEntries.length === 0 ? renderEmptyState() : filteredEntries.map(renderEntryCard)}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('Write');
        }}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statsButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: -spacing.lg,
  },
  promptCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginLeft: spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  promptText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontFamily: 'Inter-Regular',
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  promptButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchbar: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    ...shadows.small,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    ...shadows.small,
  },
  entriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
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
  moodContainer: {
    marginLeft: spacing.sm,
  },
  moodEmoji: {
    fontSize: 24,
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
    alignItems: 'center',
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
  moreTagsText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
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
    marginHorizontal: spacing.xl,
    fontFamily: 'Inter-Regular',
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
