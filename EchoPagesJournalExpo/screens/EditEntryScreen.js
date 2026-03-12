import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  Platform,
  Modal,
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import AppleHealthKit from 'react-native-health';
import HealthConnect from 'react-native-health-connect';
import PropTypes from 'prop-types';
let ExpoPencilkit = null;
try {
  if (Platform.OS === 'ios') {
    ExpoPencilkit =
      require('@noripi10/expo-pencilkit').ExpoPencilkit ||
      require('@noripi10/expo-pencilkit').default;
  }
} catch (e) {
  ExpoPencilkit = null;
}

const moods = ['😊', '😌', '😢', '😡', '😴', '🤩', '😐', '🥳', '😭', '❤️'];

export default function EditEntryScreen({ route, navigation }) {
  const { entryId } = route.params || {};
  const { getEntryById, updateEntry, addEntry } = useJournal();
  const entry = entryId ? getEntryById(entryId) : undefined;
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [images, setImages] = useState(
    entry?.media && Array.isArray(entry.media) ? entry.media : []
  );
  const colorScheme = useColorScheme();
  const [startTime] = useState(new Date());
  const [showHandwriting, setShowHandwriting] = useState(false);
  const pencilKitRef = useRef(null);

  const isEdit = !!entry;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      quality: 0.7,
      selectionLimit: 5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = uri => {
    setImages(prev => prev.filter(img => img !== uri));
  };

  const handleSave = () => {
    const endTime = new Date();
    if (isEdit) {
      updateEntry(entry.id, {
        title,
        content,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        mood,
        media: images,
      });
    } else {
      addEntry({
        title,
        content,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        mood,
        media: images,
        date: new Date().toISOString().slice(0, 10),
      });
    }
    // Health data integration
    const startISO = startTime.toISOString();
    const endISO = endTime.toISOString();
    if (Platform.OS === 'ios') {
      // Save Mindful Minutes
      AppleHealthKit.saveMindfulSession({ startDate: startISO, endDate: endISO }, (err, result) => {
        if (err) {
          console.warn('Failed to save Mindful Minutes to HealthKit:', err);
        }
      });
      // Save State of Mind
      AppleHealthKit.saveMentalWellbeing({ value: mood, date: endISO }, (err, result) => {
        if (err) {
          console.warn('Failed to save State of Mind to HealthKit:', err);
        }
      });
    } else if (Platform.OS === 'android') {
      // Save Mindful Minutes and State of Mind to Health Connect (scaffold)
      (async () => {
        try {
          await HealthConnect.writeMindfulSession({ startTime: startISO, endTime: endISO });
          await HealthConnect.writeMentalWellbeing({ value: mood, time: endISO });
        } catch (err) {
          console.warn('Failed to save to Health Connect:', err);
        }
      })();
    }
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (entryId && !entry) {
    return (
      <View style={styles.container} testID="entry-not-found">
        <Text>Entry not found.</Text>
        <Button title="Back" onPress={() => navigation.goBack()} testID="back-button" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        testID="edit-entry-screen"
      >
        <Text style={styles.header}>Journal Entry</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          testID="entry-title-input"
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          testID="entry-content-input"
        />
        <TextInput
          style={styles.input}
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          testID="tags-input"
        />
        <Text style={styles.label}>Mood:</Text>
        <View style={styles.moodRow} testID="mood-selector">
          {moods.map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMood(m)}
              style={[styles.moodBtn, mood === m && styles.moodSelected]}
              testID={`mood-${m}`}
            >
              <Text style={{ fontSize: 24 }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={pickImage}
            style={{ marginRight: 12 }}
            testID="attach-media-button"
          >
            <MaterialIcons
              name="attach-file"
              size={28}
              color={colorScheme === 'dark' ? '#fff' : '#4F8EF7'}
            />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, idx) => (
              <View key={uri} style={{ position: 'relative', marginRight: 8 }}>
                <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                <TouchableOpacity
                  onPress={() => removeImage(uri)}
                  style={{ position: 'absolute', top: -8, right: -8 }}
                >
                  <MaterialIcons name="close" size={20} color="#f44" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <Button
          title={isEdit ? 'Save Changes' : 'Save Entry'}
          onPress={handleSave}
          testID="save-entry-button"
        />
        <View style={{ height: 16 }} />
        <Button title="Cancel" onPress={handleCancel} testID="cancel-button" />
        {Platform.OS === 'ios' && (
          <Button
            title="Add Handwriting"
            onPress={() => setShowHandwriting(true)}
            testID="add-handwriting-button"
          />
        )}
      </ScrollView>
      {/* Handwriting Modal */}
      {Platform.OS === 'ios' && ExpoPencilkit ? (
        <Modal
          visible={showHandwriting}
          animationType="slide"
          onRequestClose={() => setShowHandwriting(false)}
          presentationStyle="fullScreen"
        >
          <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
            <ExpoPencilkit
              ref={pencilKitRef}
              style={{
                flex: 1,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                marginBottom: 16,
              }}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
            >
              <Button title="Undo" onPress={() => pencilKitRef.current?.undo()} />
              <Button title="Redo" onPress={() => pencilKitRef.current?.redo()} />
              <Button title="Clear" onPress={() => pencilKitRef.current?.clearDraw()} />
            </View>
            <Button
              title="Save Drawing"
              onPress={async () => {
                if (pencilKitRef.current) {
                  setShowHandwriting(false);
                }
              }}
            />
            <Button title="Cancel" onPress={() => setShowHandwriting(false)} />
          </View>
        </Modal>
      ) : Platform.OS === 'ios' ? (
        <Modal
          visible={showHandwriting}
          animationType="slide"
          onRequestClose={() => setShowHandwriting(false)}
          presentationStyle="fullScreen"
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontSize: 18, color: '#d33', marginBottom: 16 }}>
              ExpoPencilkit is not available. Please use a custom Expo Dev Client build.
            </Text>
            <Button title="Close" onPress={() => setShowHandwriting(false)} />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

EditEntryScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  moodBtn: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  moodSelected: { backgroundColor: '#4F8EF7' },
  contentInput: {
    minHeight: 160,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
});
