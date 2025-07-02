import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useJournal, useAppColorScheme } from '../context/JournalContext';

export default function InsightsScreen() {
  const navigation = useNavigation();
  const { entries } = useJournal();
  const colorScheme = useAppColorScheme();
  // Placeholder stats
  const entriesThisYear = entries.length;
  const streak = 5; // Placeholder
  const mostActiveDay = 'Monday'; // Placeholder
  const placesVisited = 3; // Placeholder

  const gradientColors =
    colorScheme === 'dark' ? ['#203A43', '#2c5364', '#0f2027'] : ['#a8edea', '#4fc3f7', '#1976d2'];
  const containerBg = colorScheme === 'dark' ? '#181A20' : '#F7F8FA';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.header}>EchoPages Journal</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
          >
            <MaterialIcons name="settings" size={28} color="#4F8EF7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Journal Link at Top */}
      <TouchableOpacity
        style={styles.journalLinkCard}
        onPress={() => navigation.navigate('Journal')}
      >
        <Image source={require('../assets/app-icon.png')} style={styles.appIcon} />
        <View style={styles.journalLinkContent}>
          <Text style={styles.journalLinkTitle}>Journal</Text>
          <Text style={styles.journalLinkSubtitle}>{entries.length} entries</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#bbb" />
      </TouchableOpacity>

      {/* Insights Section - vertical list, even margins */}
      <LinearGradient
        colors={gradientColors}
        style={styles.insightsSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.insightsTitle}>Insights</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightListItem}>
            <Text style={styles.insightListValue}>{entriesThisYear}</Text>
            <Text style={styles.insightListLabel}>Entries This Year</Text>
          </View>
          <View style={styles.insightListItem}>
            <Text style={styles.insightListValue}>{streak}</Text>
            <Text style={styles.insightListLabel}>Day Streak</Text>
          </View>
          <View style={styles.insightListItem}>
            <Text style={styles.insightListValue}>{mostActiveDay}</Text>
            <Text style={styles.insightListLabel}>Most Active</Text>
          </View>
          <View style={styles.insightListItem}>
            <Text style={styles.insightListValue}>{placesVisited}</Text>
            <Text style={styles.insightListLabel}>Places Visited</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditEntry')}
        accessibilityLabel="Add Journal Entry"
        testID="add-journal-entry-fab"
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#181A20',
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
  journalLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#aaa',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  journalLinkContent: {
    flex: 1,
  },
  journalLinkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181A20',
  },
  journalLinkSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  insightsSection: {
    flex: 1,
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    shadowColor: '#aaa',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  insightsTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 24,
    letterSpacing: 1,
    textAlign: 'left',
  },
  insightsList: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  insightListItem: {
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  insightListValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  insightListLabel: {
    color: '#f0e6ff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7b61ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
});
