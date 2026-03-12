import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Card, Chip, FAB, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJournal } from '../context/JournalContext';
import { theme, spacing, shadows } from '../theme/theme';
import {
  formatDate,
  getMoodEmoji,
  getMoodColor,
  calculateReadingTime,
  getColorFromString,
} from '../utils/helpers';

export default function EntryDetailScreen({ navigation, route }) {
  const { entryId } = route.params;
  const { getEntry, deleteEntry } = useJournal();
  const [menuVisible, setMenuVisible] = useState(false);

  const entry = getEntry(entryId);

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Entry not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditEntry', { entryId });
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        message: `${entry.title}\n\n${entry.content}`,
        title: entry.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
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
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity style={styles.headerButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        }
      >
        <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
        <Menu.Item onPress={handleShare} title="Share" leadingIcon="share" />
        <Divider />
        <Menu.Item
          onPress={handleDelete}
          title="Delete"
          leadingIcon="delete"
          titleStyle={{ color: theme.colors.error }}
        />
      </Menu>
    </View>
  );

  const renderMoodAndMeta = () => (
    <Card style={styles.metaCard}>
      <Card.Content>
        <View style={styles.moodContainer}>
          <View style={styles.moodInfo}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
            <View>
              <Text style={styles.moodLabel}>Mood</Text>
              <Text style={styles.moodText}>{entry.mood.replace('-', ' ')}</Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.metaLabel}>Reading time</Text>
            <Text style={styles.metaText}>{calculateReadingTime(entry.content)} min read</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(entry.createdAt)}</Text>
          {entry.updatedAt !== entry.createdAt && (
            <Text style={styles.updatedText}>Updated {formatDate(entry.updatedAt)}</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderContent = () => (
    <Card style={styles.contentCard}>
      <Card.Content>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.content}>{entry.content}</Text>
      </Card.Content>
    </Card>
  );

  const renderTags = () => {
    if (entry.tags.length === 0) return null;

    return (
      <Card style={styles.tagsCard}>
        <Card.Content>
          <Text style={styles.tagsTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag, index) => (
              <Chip
                key={index}
                style={[styles.tag, { backgroundColor: getColorFromString(tag) + '20' }]}
                textStyle={[styles.tagText, { color: getColorFromString(tag) }]}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMoodAndMeta()}
        {renderContent()}
        {renderTags()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="pencil"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleEdit();
        }}
        color="#fff"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  headerButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  metaCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  moodLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Medium',
  },
  moodText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Medium',
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Regular',
  },
  dateContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: spacing.md,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Medium',
  },
  updatedText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  contentCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.lg,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  tagsCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
    fontFamily: 'Inter-SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginTop: spacing.lg,
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  bottomPadding: {
    height: 100,
  },
});
