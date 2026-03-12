import React, { useState } from 'react';
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
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const moods = ['😊', '😌', '😢', '😡', '😴', '🤩', '😐', '🥳', '😭', '❤️'];

export default function QuickEntryScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState('');
  const [images, setImages] = useState([]);
  const { addEntry } = useJournal();
  const colorScheme = useColorScheme();

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
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      testID="quick-entry-screen"
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
      <Button title="Save Entry" onPress={handleSave} testID="save-entry-button" />
      <View style={{ height: 16 }} />
      <Button title="Cancel" onPress={handleCancel} testID="cancel-button" />
    </ScrollView>
  );
}

QuickEntryScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func,
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
