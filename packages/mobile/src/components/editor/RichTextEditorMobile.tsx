import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { JournalEntry, saveEntry } from '../../utils/EncryptedEntryStorage';
import { Media, getMedia, saveMediaItem, deleteMedia } from '../../utils/EncryptedMediaStorage';
import { v4 as uuidv4 } from 'uuid';
import { Video, Audio, ResizeMode } from 'expo-av';
import { FolderPicker } from './FolderPicker';
import { TagInput } from './TagInput';
import { useTheme } from '../../styles/ThemeContext';

interface RichTextEditorMobileProps {
  entry: JournalEntry;
}

const COLORS = {
  background: '#f3f3f3',
  surface: '#fff',
  primary: '#6750A4', // Material 3 primary
  error: '#d32f2f',
  border: '#ccc',
  focus: '#5c9ded',
};
const RADIUS = 12;
const theme = useTheme();
const TOOLBAR_BUTTONS = [
  {
    cmd: 'bold',
    label: 'Bold',
    icon: (
      <Text
        style={{
          fontWeight: 'bold',
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        B
      </Text>
    ),
  },
  {
    cmd: 'italic',
    label: 'Italic',
    icon: (
      <Text
        style={{
          fontStyle: 'italic',
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        I
      </Text>
    ),
  },
  {
    cmd: 'underline',
    label: 'Underline',
    icon: (
      <Text
        style={{
          textDecorationLine: 'underline',
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        U
      </Text>
    ),
  },
  {
    cmd: 'unordered-list',
    label: 'Bulleted List',
    icon: (
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        •
      </Text>
    ),
  },
  {
    cmd: 'ordered-list',
    label: 'Numbered List',
    icon: (
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        1.
      </Text>
    ),
  },
  {
    cmd: 'heading',
    arg: 'H1',
    label: 'Heading 1',
    icon: (
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        H1
      </Text>
    ),
  },
  {
    cmd: 'heading',
    arg: 'H2',
    label: 'Heading 2',
    icon: (
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: theme.typography.fontSize.body,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        H2
      </Text>
    ),
  },
];

export const RichTextEditorMobile: React.FC<RichTextEditorMobileProps> = ({ entry }) => {
  const [currentEntry, setCurrentEntry] = useState(entry);
  const [content, setContent] = useState(entry.content || '');
  const [title, setTitle] = useState(entry.title || '');
  const [images, setImages] = useState<Media[]>([]);
  const [imageAlts, setImageAlts] = useState<string[]>([]);
  const [videos, setVideos] = useState<Media[]>([]);
  const [audios, setAudios] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Load media for this entry
  useEffect(() => {
    setContent(entry.content || '');
    setTitle(entry.title || '');
    (async () => {
      const allMedia = await getMedia();
      const entryMedia = allMedia.filter(m => m.entryId === entry.id);
      setImages(entryMedia.filter(m => m.fileType.startsWith('image')));
      setVideos(entryMedia.filter(m => m.fileType.startsWith('video')));
      setAudios(entryMedia.filter(m => m.fileType.startsWith('audio')));
      setImageAlts(
        entryMedia.filter(m => m.fileType.startsWith('image')).map(m => m.metadata?.alt || '')
      );
    })();
  }, [entry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEntry({ ...entry, title, content });
      Alert.alert('Saved', 'Your entry has been saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry.');
    }
    setSaving(false);
  };

  // Toolbar actions (stub for MVP)
  const handleToolbarAction = (cmd: string, arg?: string) => {
    // For MVP, just append markdown-like tags
    if (cmd === 'bold') setContent(c => c + '**bold**');
    else if (cmd === 'italic') setContent(c => c + '*italic*');
    else if (cmd === 'underline') setContent(c => c + '__underline__');
    else if (cmd === 'unordered-list') setContent(c => c + '\n- List item');
    else if (cmd === 'ordered-list') setContent(c => c + '\n1. List item');
    else if (cmd === 'heading' && arg) setContent(c => c + `\n#${arg} `);
  };
  // Image picker
  const handleAddImage = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const ext = asset.uri.split('.').pop() || 'jpg';
        const destPath = `${
          FileSystem.cacheDirectory || FileSystem.documentDirectory
        }media_${uuidv4()}.${ext}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destPath });
        const media: Media = {
          id: uuidv4(),
          entryId: entry.id,
          fileName: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
          fileType: asset.type || 'image/jpeg',
          fileSize: asset.fileSize || 0,
          storagePath: destPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        };
        await saveMediaItem(media);
        setImages(imgs => [...imgs, media]);
        setImageAlts(alts => [...alts, '']);
      }
    } catch (e: any) {
      setMediaError('Failed to add image.');
      Alert.alert('Error', 'Failed to add image.');
    }
    setMediaLoading(false);
  };
  // Video/audio picker (stub: use DocumentPicker for MVP)
  const handleAddVideo = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const result: any = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (result.type === 'success' && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const ext = asset.uri.split('.').pop() || 'mp4';
        const destPath = `${
          FileSystem.cacheDirectory || FileSystem.documentDirectory
        }media_${uuidv4()}.${ext}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destPath });
        const media: Media = {
          id: uuidv4(),
          entryId: entry.id,
          fileName: asset.name,
          fileType: asset.mimeType || 'video/mp4',
          fileSize: asset.size || 0,
          storagePath: destPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        };
        await saveMediaItem(media);
        setVideos(vids => [...vids, media]);
      }
    } catch (e: any) {
      setMediaError('Failed to add video.');
      Alert.alert('Error', 'Failed to add video.');
    }
    setMediaLoading(false);
  };
  const handleAddAudio = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const result: any = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.type === 'success' && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const ext = asset.uri.split('.').pop() || 'mp3';
        const destPath = `${
          FileSystem.cacheDirectory || FileSystem.documentDirectory
        }media_${uuidv4()}.${ext}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destPath });
        const media: Media = {
          id: uuidv4(),
          entryId: entry.id,
          fileName: asset.name,
          fileType: asset.mimeType || 'audio/mpeg',
          fileSize: asset.size || 0,
          storagePath: destPath,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        };
        await saveMediaItem(media);
        setAudios(auds => [...auds, media]);
      }
    } catch (e: any) {
      setMediaError('Failed to add audio.');
      Alert.alert('Error', 'Failed to add audio.');
    }
    setMediaLoading(false);
  };
  const handleImageAltChange = async (i: number, alt: string) => {
    setImageAlts(alts => alts.map((a, idx) => (idx === i ? alt : a)));
    const media = images[i];
    const updated = { ...media, metadata: { ...media.metadata, alt } };
    await saveMediaItem(updated);
    setImages(imgs => imgs.map((m, idx) => (idx === i ? updated : m)));
  };
  const handleReorderImage = (i: number, dir: -1 | 1) => {
    setImages(imgs => {
      const newImgs = [...imgs];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      [newImgs[i], newImgs[j]] = [newImgs[j], newImgs[i]];
      setImageAlts(alts => {
        const newAlts = [...alts];
        [newAlts[i], newAlts[j]] = [newAlts[j], newAlts[i]];
        return newAlts;
      });
      return newImgs;
    });
  };
  const handleRemoveImage = async (i: number) => {
    setMediaLoading(true);
    setMediaError(null);
    const media = images[i];
    try {
      await FileSystem.deleteAsync(media.storagePath, { idempotent: true });
      await deleteMedia(media.id);
      setImages(imgs => imgs.filter((_, idx) => idx !== i));
      setImageAlts(alts => alts.filter((_, idx) => idx !== i));
    } catch (e: any) {
      setMediaError('Failed to remove image.');
      Alert.alert('Error', 'Failed to remove image.');
    }
    setMediaLoading(false);
  };
  const handleRemoveVideo = async (i: number) => {
    setMediaLoading(true);
    setMediaError(null);
    const media = videos[i];
    try {
      await FileSystem.deleteAsync(media.storagePath, { idempotent: true });
      await deleteMedia(media.id);
      setVideos(vids => vids.filter((_, idx) => idx !== i));
    } catch (e: any) {
      setMediaError('Failed to remove video.');
      Alert.alert('Error', 'Failed to remove video.');
    }
    setMediaLoading(false);
  };
  const handleRemoveAudio = async (i: number) => {
    setMediaLoading(true);
    setMediaError(null);
    const media = audios[i];
    try {
      await FileSystem.deleteAsync(media.storagePath, { idempotent: true });
      await deleteMedia(media.id);
      setAudios(auds => auds.filter((_, idx) => idx !== i));
    } catch (e: any) {
      setMediaError('Failed to remove audio.');
      Alert.alert('Error', 'Failed to remove audio.');
    }
    setMediaLoading(false);
  };
  return (
    <View style={styles.container}>
      <FolderPicker
        value={currentEntry.folderId}
        onChange={folderId => setCurrentEntry(e => ({ ...e, folderId }))}
      />
      <TagInput
        value={currentEntry.tags || []}
        onChange={tags => setCurrentEntry(e => ({ ...e, tags }))}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        {/* Toolbar */}
        <View
          style={styles.toolbar}
          accessibilityRole="toolbar"
          accessibilityLabel="Editor toolbar"
        >
          {TOOLBAR_BUTTONS.map((btn, idx) => (
            <TouchableOpacity
              key={btn.label}
              accessibilityLabel={btn.label}
              onPress={() => handleToolbarAction(btn.cmd, btn.arg)}
              style={styles.toolbarButton}
              accessible
            >
              {btn.icon}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            accessibilityLabel="Insert Image"
            onPress={handleAddImage}
            style={styles.toolbarButton}
            accessible
          >
            <Text>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Insert Video"
            onPress={handleAddVideo}
            style={styles.toolbarButton}
            accessible
          >
            <Text>🎬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Insert Audio"
            onPress={handleAddAudio}
            style={styles.toolbarButton}
            accessible
          >
            <Text>🎤</Text>
          </TouchableOpacity>
        </View>
        {/* Content Area */}
        <TextInput
          style={styles.textInput}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Write your journal entry..."
          accessibilityLabel="Journal entry editor"
          accessible
        />
        {/* Media Attachments Section */}
        {(images.length > 0 || videos.length > 0 || audios.length > 0) && (
          <View style={{ marginTop: 16 }}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.fontSize.body,
                  fontFamily: theme.typography.fontFamily,
                },
              ]}
            >
              Media Attachments:
            </Text>
            {/* Images */}
            {images.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.fontSize.caption,
                      fontFamily: theme.typography.fontFamily,
                    },
                  ]}
                >
                  Images:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  {images.map((media, i) => (
                    <View
                      key={i}
                      style={styles.mediaItem}
                      accessible
                      accessibilityLabel={`Image attachment ${i + 1}`}
                    >
                      <Image
                        source={{ uri: media.storagePath }}
                        style={styles.imagePreview}
                        accessibilityLabel={imageAlts[i] || `attachment-${i}`}
                      />
                      <TextInput
                        style={styles.altInput}
                        value={imageAlts[i] || ''}
                        onChangeText={alt => handleImageAltChange(i, alt)}
                        placeholder="Alt text (for accessibility)"
                        accessibilityLabel={`Alt text for image ${i + 1}`}
                      />
                      <View style={styles.mediaActions}>
                        <TouchableOpacity
                          onPress={() => handleReorderImage(i, -1)}
                          accessibilityLabel="Move image left"
                          disabled={i === 0}
                          style={[styles.actionButton, i === 0 && styles.disabledButton]}
                        >
                          <Text>←</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleReorderImage(i, 1)}
                          accessibilityLabel="Move image right"
                          disabled={i === images.length - 1}
                          style={[
                            styles.actionButton,
                            i === images.length - 1 && styles.disabledButton,
                          ]}
                        >
                          <Text>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveImage(i)}
                          accessibilityLabel="Remove image"
                          style={styles.actionButton}
                        >
                          <Text
                            style={{
                              color: theme.colors.error,
                              fontSize: theme.typography.fontSize.body,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          >
                            ×
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* Videos */}
            {videos.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.fontSize.caption,
                      fontFamily: theme.typography.fontFamily,
                    },
                  ]}
                >
                  Videos:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  {videos.map((media, i) => (
                    <View
                      key={i}
                      style={styles.mediaItem}
                      accessible
                      accessibilityLabel={`Video attachment ${i + 1}`}
                    >
                      <Video
                        source={{ uri: media.storagePath }}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: RADIUS,
                          backgroundColor: '#000',
                        }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        accessibilityLabel={media.fileName}
                        shouldPlay={false}
                        isLooping={false}
                      />
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.caption,
                          maxWidth: 100,
                          color: theme.colors.onSurface,
                          fontFamily: theme.typography.fontFamily,
                        }}
                        numberOfLines={1}
                      >
                        {media.fileName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveVideo(i)}
                        accessibilityLabel="Remove video"
                        style={styles.actionButton}
                        disabled={mediaLoading}
                      >
                        <Text
                          style={{
                            color: theme.colors.error,
                            fontSize: theme.typography.fontSize.body,
                            fontFamily: theme.typography.fontFamily,
                          }}
                        >
                          ×
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* Audios */}
            {audios.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.colors.onSurface,
                      fontSize: theme.typography.fontSize.caption,
                      fontFamily: theme.typography.fontFamily,
                    },
                  ]}
                >
                  Audios:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  {audios.map((media, i) => (
                    <AudioPlayer
                      key={media.id}
                      media={media}
                      onRemove={() => handleRemoveAudio(i)}
                      disabled={mediaLoading}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
        {mediaLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
            pointerEvents="auto"
          >
            <ActivityIndicator size="large" color="#6750A4" />
            <Text
              style={{
                marginTop: 12,
                color: theme.colors.onSurface,
                fontSize: theme.typography.fontSize.body,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Processing media...
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  toolbarButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: COLORS.surface,
  },
  textInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 12,
    backgroundColor: COLORS.surface,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  mediaItem: {
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
    maxWidth: 140,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  altInput: {
    width: 100,
    fontSize: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 2,
  },
  disabledButton: {
    opacity: 0.4,
  },
});

const AudioPlayer = ({
  media,
  onRemove,
  disabled,
}: {
  media: Media;
  onRemove: () => void;
  disabled: boolean;
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayPause = async () => {
    if (playing) {
      if (sound) {
        await sound.pauseAsync();
        setPlaying(false);
      }
    } else {
      setLoading(true);
      try {
        let s = sound;
        if (!s) {
          const { sound: newSound } = await Audio.Sound.createAsync({ uri: media.storagePath });
          setSound(newSound);
          s = newSound;
        }
        await s!.playAsync();
        setPlaying(true);
        s!.setOnPlaybackStatusUpdate(status => {
          if (!status.isLoaded || status.didJustFinish) setPlaying(false);
        });
      } catch (e) {
        setPlaying(false);
      }
      setLoading(false);
    }
  };

  return (
    <View
      style={{ ...styles.mediaItem, flexDirection: 'column', alignItems: 'center', minWidth: 140 }}
    >
      <Text
        style={{
          fontSize: 32,
          color: theme.colors.onSurface,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        🎤
      </Text>
      <Text
        style={{
          fontSize: theme.typography.fontSize.caption,
          maxWidth: 100,
          color: theme.colors.onSurface,
          fontFamily: theme.typography.fontFamily,
        }}
        numberOfLines={1}
      >
        {media.fileName}
      </Text>
      <TouchableOpacity
        onPress={handlePlayPause}
        accessibilityLabel={playing ? 'Pause audio' : 'Play audio'}
        style={styles.actionButton}
        disabled={disabled || loading}
      >
        <Text
          style={{
            fontSize: 18,
            color: theme.colors.onSurface,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {playing ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRemove}
        accessibilityLabel="Remove audio"
        style={styles.actionButton}
        disabled={disabled}
      >
        <Text
          style={{
            color: theme.colors.error,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          ×
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RichTextEditorMobile;
