import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, List, Switch, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useJournal } from '../context/JournalContext';
import { theme, spacing, shadows } from '../theme/theme';

export default function SettingsScreen({ navigation }) {
  const { getStats, entries } = useJournal();
  const stats = getStats();

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const handleBackupData = () => {
    Alert.alert('Backup Data', 'This feature will be available in a future update.', [
      { text: 'OK' },
    ]);
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Journal Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Most Used Moods</Text>
        {Object.entries(stats.moodCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([mood, count]) => (
            <View key={mood} style={styles.moodStat}>
              <Text style={styles.moodLabel}>{mood}</Text>
              <Text style={styles.moodCount}>{count} entries</Text>
            </View>
          ))}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      {renderStatsCard()}

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>App Settings</Text>

          <List.Item
            title="Export Journal Data"
            description="Export all your entries to a file"
            left={props => <List.Icon {...props} icon="download" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleExportData}
          />

          <List.Item
            title="Backup to Cloud"
            description="Backup your journal to cloud storage"
            left={props => <List.Icon {...props} icon="cloud-upload" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleBackupData}
          />

          <List.Item
            title="Privacy & Security"
            description="Manage your privacy settings"
            left={props => <List.Icon {...props} icon="shield-check" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Card style={styles.aboutCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>About EchoPages</Text>
          <Text style={styles.aboutText}>
            EchoPages is your personal journaling companion, designed to help you capture thoughts,
            memories, and reflections in a beautiful and intuitive way.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  settingsCard: {
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  aboutCard: {
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
    fontFamily: 'Inter-SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
    fontFamily: 'Inter-SemiBold',
  },
  moodStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  moodLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  moodCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  aboutText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontFamily: 'Inter-Regular',
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
});
