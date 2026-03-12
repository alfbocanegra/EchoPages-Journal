import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Image, ScrollView, Platform } from 'react-native';
import { useJournal } from '../context/JournalContext';
import AppleHealthKit from 'react-native-health';
import HealthConnect from 'react-native-health-connect';
import PropTypes from 'prop-types';

export default function EntryDetailScreen({ route, navigation }) {
  const { entryId } = route.params || {};
  const { getEntryById, deleteEntry } = useJournal();
  const entry = getEntryById(entryId);
  const [mindfulMinutes, setMindfulMinutes] = React.useState(null);
  const [stateOfMind, setStateOfMind] = React.useState(null);

  React.useEffect(() => {
    if (!entry?.date) return;
    const date = entry.date;
    if (Platform.OS === 'ios') {
      // Fetch Mindful Minutes
      AppleHealthKit.getMindfulSession({ startDate: date, endDate: date }, (err, results) => {
        if (!err && results && results.length > 0) {
          const total = results.reduce((sum, s) => sum + (s.value || 0), 0);
          setMindfulMinutes(total);
        }
      });
      // Fetch State of Mind
      AppleHealthKit.getMentalWellbeingSamples(
        { startDate: date, endDate: date },
        (err, results) => {
          if (!err && results && results.length > 0) {
            setStateOfMind(results[0].value);
          }
        }
      );
    } else if (Platform.OS === 'android') {
      // Fetch Mindful Minutes and State of Mind from Health Connect (scaffold)
      (async () => {
        try {
          const mm = await HealthConnect.readMindfulSession({ startTime: date, endTime: date });
          setMindfulMinutes(mm?.totalMinutes || null);
          const sm = await HealthConnect.readMentalWellbeing({ startTime: date, endTime: date });
          setStateOfMind(sm?.value || null);
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [entry?.date]);

  if (!entry) {
    return (
      <View style={styles.container} testID="entry-not-found">
        <Text>Entry not found.</Text>
        <Button title="Back" onPress={() => navigation.goBack()} testID="back-button" />
      </View>
    );
  }
  function handleDelete() {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(entry.id);
          navigation.popToTop();
        },
      },
    ]);
  }
  return (
    <View style={styles.container} testID="entry-detail-screen">
      {entry.media && entry.media.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          testID="media-gallery"
        >
          {entry.media.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={{ width: 120, height: 120, borderRadius: 10, marginRight: 8 }}
            />
          ))}
        </ScrollView>
      )}
      <Text style={styles.title} testID="entry-title">
        {entry.title}
      </Text>
      <Text style={styles.date} testID="entry-date">
        {entry.date} {entry.mood}
      </Text>
      <View style={{ marginTop: 12 }}>
        {mindfulMinutes !== null && (
          <Text style={{ fontSize: 16, color: '#4F8EF7' }}>Mindful Minutes: {mindfulMinutes}</Text>
        )}
        {stateOfMind && (
          <Text style={{ fontSize: 16, color: '#4F8EF7' }}>State of Mind: {stateOfMind}</Text>
        )}
      </View>
      <Text style={styles.content} testID="entry-content">
        {entry.content}
      </Text>
      <View style={styles.tagsRow} testID="entry-tags">
        {entry.tags.map(tag => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('EditEntry', { entryId: entry.id })}
          testID="edit-entry-button"
        />
        <View style={{ width: 16 }} />
        <Button title="Delete" color="#d33" onPress={handleDelete} testID="delete-entry-button" />
      </View>
      <View style={{ height: 16 }} />
      <Button title="Back" onPress={() => navigation.goBack()} testID="back-button" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  date: { fontSize: 16, color: '#888', marginBottom: 12 },
  content: { fontSize: 18, marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tagChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 2,
  },
  tagText: { fontSize: 13, color: '#181A20' },
});

EntryDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    popToTop: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};
