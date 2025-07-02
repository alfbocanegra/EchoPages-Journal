import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Chip, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJournal } from '../context/JournalContext';
import { theme, spacing, shadows } from '../theme/theme';
import { getMoodEmoji, isEmptyOrWhitespace, getColorFromString } from '../utils/helpers';

const MOODS = [
  { id: 'very-happy', label: 'Very Happy', emoji: '😄' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'love', label: 'Love', emoji: '❤️' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'very-sad', label: 'Very Sad', emoji: '😭' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
];

export default function EditEntryScreen({ navigation, route }) {
  const { entryId } = route.params;
  const { getEntry, updateEntry } = useJournal();

  const entry = getEntry(entryId);

  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [selectedMood, setSelectedMood] = useState(entry?.mood || 'neutral');
  const [tags, setTags] = useState(entry?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const contentInputRef = useRef(null);
  const tagInputRef = useRef(null);

  useEffect(() => {
    // Update word count
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

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

  const handleSave = async () => {
    if (isEmptyOrWhitespace(title) && isEmptyOrWhitespace(content)) {
      Alert.alert('Empty Entry', 'Please add a title or content to save your entry.');
      return;
    }

    try {
      setSaving(true);

      const updates = {
        title: title.trim() || 'Untitled Entry',
        content: content.trim(),
        mood: selectedMood,
        tags: tags,
      };

      await updateEntry(entryId, updates);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
      tagInputRef.current?.blur();
    }
  };

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Edit Entry</Text>

      <TouchableOpacity
        style={[styles.headerButton, styles.saveButton]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMoodSelector = () => (
    <Card style={styles.moodCard}>
      <Card.Content>
        <View style={styles.moodHeader}>
          <Ionicons name="happy" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
        </View>

        <TouchableOpacity
          style={styles.selectedMoodContainer}
          onPress={() => setShowMoodModal(true)}
        >
          <Text style={styles.selectedMoodEmoji}>{getMoodEmoji(selectedMood)}</Text>
          <Text style={styles.selectedMoodText}>
            {MOODS.find(mood => mood.id === selectedMood)?.label}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderMoodModal = () => (
    <Portal>
      <Modal
        visible={showMoodModal}
        onDismiss={() => setShowMoodModal(false)}
        contentContainerStyle={styles.moodModal}
      >
        <Text style={styles.modalTitle}>Select your mood</Text>
        <ScrollView style={styles.moodList}>
          {MOODS.map(mood => (
            <TouchableOpacity
              key={mood.id}
              style={[styles.moodOption, selectedMood === mood.id && styles.selectedMoodOption]}
              onPress={() => {
                setSelectedMood(mood.id);
                setShowMoodModal(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodOptionText}>{mood.label}</Text>
              {selectedMood === mood.id && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderTagsSection = () => (
    <Card style={styles.tagsCard}>
      <Card.Content>
        <View style={styles.tagsHeader}>
          <Ionicons name="pricetag" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Tags</Text>
        </View>

        {/* Current tags */}
        {tags.length > 0 && (
          <View style={styles.currentTags}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                style={[styles.tag, { backgroundColor: getColorFromString(tag) + '20' }]}
                textStyle={[styles.tagText, { color: getColorFromString(tag) }]}
                onClose={() => handleRemoveTag(tag)}
                closeIcon="close"
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {/* Add new tag */}
        <View style={styles.addTagContainer}>
          <TextInput
            ref={tagInputRef}
            style={styles.tagInput}
            placeholder="Add a tag..."
            value={newTag}
            onChangeText={setNewTag}
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
            maxLength={20}
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={handleAddTag}
            disabled={!newTag.trim()}
          >
            <Ionicons
              name="add"
              size={20}
              color={newTag.trim() ? theme.colors.primary : theme.colors.outline}
            />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsText}>
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </Text>
      <Text style={styles.statsText}>•</Text>
      <Text style={styles.statsText}>{content.length} characters</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry title..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
              onSubmitEditing={() => contentInputRef.current?.focus()}
            />
          </View>

          {/* Mood Selector */}
          {renderMoodSelector()}

          {/* Content Input */}
          <Card style={styles.contentCard}>
            <Card.Content>
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                placeholder="What's on your mind?"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>

          {/* Tags Section */}
          {renderTagsSection()}

          {/* Stats */}
          {renderStats()}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {renderMoodModal()}
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  titleContainer: {
    marginBottom: spacing.lg,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-SemiBold',
    padding: 0,
  },
  moodCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginLeft: spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  selectedMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  selectedMoodEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  selectedMoodText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Regular',
  },
  moodModal: {
    backgroundColor: theme.colors.surface,
    margin: spacing.xl,
    borderRadius: 12,
    padding: spacing.lg,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  moodList: {
    maxHeight: 300,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  selectedMoodOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  moodOptionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  moodOptionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Regular',
  },
  contentCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  contentInput: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
    minHeight: 200,
    fontFamily: 'Inter-Regular',
    padding: 0,
  },
  tagsCard: {
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingVertical: spacing.sm,
    fontFamily: 'Inter-Regular',
  },
  addTagButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  statsText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginHorizontal: spacing.xs,
    fontFamily: 'Inter-Regular',
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
  bottomPadding: {
    height: 100,
  },
});
