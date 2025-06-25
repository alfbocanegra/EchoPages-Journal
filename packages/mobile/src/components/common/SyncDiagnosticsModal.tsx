import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { ThemeButton } from './ThemeButton';
import { ThemeModal } from './ThemeModal';
import { useTheme } from '../../styles/ThemeContext';
import {
  GoogleCalendarService,
  GoogleCalendarEvent,
} from '@echopages/shared/services/GoogleCalendarService';
import {
  WeatherLocationService,
  WeatherData,
} from '@echopages/shared/services/WeatherLocationService';
import { AppleHealthService, HealthData } from '@echopages/shared/services/AppleHealthService';

interface RecentResolvedConflict {
  id: string;
  entityType: string;
  resolvedAt: string;
  strategy: string;
}

interface SyncDiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
  syncStatus: string;
  isOnline: boolean;
  isOffline?: boolean;
  lastSyncTime: string | null;
  lastPayloadSize: number | null;
  lastSyncDuration: number | null;
  bandwidthSaved?: string;
  compressionStatus?: string;
  queuedCount: number;
  lastOfflineSync?: string | null;
  conflictCount: number;
  autoResolvedCount?: number;
  manualResolvedCount?: number;
  recentResolvedConflicts?: RecentResolvedConflict[];
  lastError: string | null;
  onManualSync: () => void;
  onClearOutbox: () => void;
  onSyncQueued?: () => void;
  // Organization & Search props
  tagCount?: number;
  folderCount?: number;
  recentSearches?: string[];
  onCreateTag?: () => void;
  onCreateFolder?: () => void;
  onRunSearch?: () => void;
  // Cloud storage props
  cloudProvider?: string;
  cloudStatus?: string;
  lastCloudSync?: string | null;
  cloudQuota?: string;
  cloudError?: string | null;
  onConnectCloud?: () => void;
  onDisconnectCloud?: () => void;
  onManualCloudSync?: () => void;
  currentFilter?: string;
  onOpenCalendar?: () => void;
  imageCount?: number;
  videoCount?: number;
  audioCount?: number;
  noteCount?: number;
  recentMedia?: string[];
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onRecordAudio?: () => void;
  onAddNote?: () => void;
  lastExport?: string | null;
  lastBackup?: string | null;
  backupStatus?: string;
  onExportPDF?: () => void;
  onExportRTF?: () => void;
  onExportArchive?: () => void;
  onBackupNow?: () => void;
  onVerifyBackup?: () => void;
  theme: string;
  fontSize?: number;
  stickerCount?: number;
  onSwitchTheme?: () => void;
  onFontSizeUp?: () => void;
  onFontSizeDown?: () => void;
  onAddSticker?: () => void;
  onSyncTheme?: () => void;
  streak?: number;
  goals?: string[];
  achievements?: string[];
  onLogEntry?: () => void;
  onSetGoal?: () => void;
  onSendNotification?: () => void;
  onViewAchievements?: () => void;
  googleCalendarStatus?: string;
  googleCalendarLastSync?: string | null;
  appleHealthStatus?: string;
  appleHealthLastSync?: string | null;
  weatherStatus?: string;
  weatherLastTag?: string | null;
  onConnectGoogleCalendar?: () => void;
  onConnectAppleHealth?: () => void;
  onTagWeather?: () => void;
  onShareEntry?: () => void;
  accessibilityMode?: boolean;
  highContrastMode?: boolean;
  lastPerfTest?: string | null;
  onToggleAccessibility?: () => void;
  onToggleHighContrast?: () => void;
  onRunPerfTest?: () => void;
  onTestScreenReader?: () => void;
  aiEnabled?: boolean;
  aiOptIn?: boolean;
  lastPrompt?: string | null;
  onToggleAI?: () => void;
  onGeneratePrompt?: () => void;
  onToggleOptIn?: () => void;
  aiModel?: string;
  aiStatus?: string;
  onAISearch?: (query: string) => void;
  onAISummarize?: () => void;
  lastAISearchQuery?: string;
  lastAISearchResult?: string[];
  lastAISummary?: string;
  onboardingComplete?: boolean;
  onRunPreflightCheck?: () => void;
  preflightResults?: {
    sync: string;
    storage: string;
    ai: string;
    export: string;
  };
  appVersion?: string;
  appBuild?: string;
}

const SyncDiagnosticsModal: React.FC<SyncDiagnosticsModalProps> = ({
  visible,
  onClose,
  syncStatus,
  isOnline,
  isOffline = false,
  lastSyncTime,
  lastPayloadSize,
  lastSyncDuration,
  bandwidthSaved = 'N/A',
  compressionStatus = 'N/A',
  queuedCount,
  lastOfflineSync,
  conflictCount,
  autoResolvedCount = 0,
  manualResolvedCount = 0,
  recentResolvedConflicts = [],
  lastError,
  onManualSync,
  onClearOutbox,
  onSyncQueued,
  tagCount = 0,
  folderCount = 0,
  recentSearches = [],
  onCreateTag,
  onCreateFolder,
  onRunSearch,
  cloudProvider,
  cloudStatus,
  lastCloudSync,
  cloudQuota,
  cloudError,
  onConnectCloud,
  onDisconnectCloud,
  onManualCloudSync,
  currentFilter,
  onOpenCalendar,
  imageCount = 0,
  videoCount = 0,
  audioCount = 0,
  noteCount = 0,
  recentMedia = [],
  onAddImage,
  onAddVideo,
  onRecordAudio,
  onAddNote,
  lastExport,
  lastBackup,
  backupStatus = 'N/A',
  onExportPDF,
  onExportRTF,
  onExportArchive,
  onBackupNow,
  onVerifyBackup,
  theme: userTheme = 'Light',
  fontSize = 16,
  stickerCount = 0,
  onSwitchTheme,
  onFontSizeUp,
  onFontSizeDown,
  onAddSticker,
  onSyncTheme,
  streak = 0,
  goals = [],
  achievements = [],
  onLogEntry,
  onSetGoal,
  onSendNotification,
  onViewAchievements,
  googleCalendarStatus = 'Disconnected',
  googleCalendarLastSync = null,
  appleHealthStatus = 'Disconnected',
  appleHealthLastSync = null,
  weatherStatus = 'Unavailable',
  weatherLastTag = null,
  onConnectGoogleCalendar,
  onConnectAppleHealth,
  onTagWeather,
  onShareEntry,
  accessibilityMode = false,
  highContrastMode = false,
  lastPerfTest = null,
  onToggleAccessibility,
  onToggleHighContrast,
  onRunPerfTest,
  onTestScreenReader,
  aiEnabled = false,
  aiOptIn = false,
  lastPrompt = null,
  onToggleAI,
  onGeneratePrompt,
  onToggleOptIn,
  aiModel = 'Unknown',
  aiStatus = 'idle',
  onAISearch,
  onAISummarize,
  lastAISearchQuery,
  lastAISearchResult,
  lastAISummary,
  onboardingComplete = false,
  onRunPreflightCheck,
  preflightResults,
  appVersion,
  appBuild,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const theme = useTheme();
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [calendarEventsLoading, setCalendarEventsLoading] = useState(false);
  const [calendarEventsError, setCalendarEventsError] = useState<string | null>(null);
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);
  const [calendarActionError, setCalendarActionError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  const handleConnectGoogleCalendar = async () => {
    setGoogleCalendarLoading(true);
    try {
      await GoogleCalendarService.startOAuthFlow();
      Alert.alert(
        'Google Calendar',
        'OAuth flow started. Complete authentication in the browser or app.'
      );
    } catch (e) {
      Alert.alert('Google Calendar Error', e instanceof Error ? e.message : String(e));
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const handleFetchCalendarEvents = async () => {
    setCalendarEventsLoading(true);
    setCalendarEventsError(null);
    try {
      const events = await GoogleCalendarService.fetchEvents();
      setCalendarEvents(events);
    } catch (e) {
      setCalendarEventsError(e instanceof Error ? e.message : String(e));
    } finally {
      setCalendarEventsLoading(false);
    }
  };

  const handleCreateCalendarEvent = async () => {
    setCalendarActionLoading(true);
    setCalendarActionError(null);
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      await GoogleCalendarService.createEvent({
        id: '',
        summary: 'EchoPages Test Event',
        description: 'This is a test event created from EchoPages diagnostics.',
        start: now.toISOString(),
        end: inOneHour.toISOString(),
        location: 'Online',
        attendees: [],
      });
      await handleFetchCalendarEvents();
    } catch (e) {
      setCalendarActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setCalendarActionLoading(false);
    }
  };

  const handleUpdateCalendarEvent = async () => {
    if (!calendarEvents.length) return;
    setCalendarActionLoading(true);
    setCalendarActionError(null);
    try {
      const event = calendarEvents[0];
      await GoogleCalendarService.updateEvent({
        ...event,
        summary: event.summary + ' (Updated)',
      });
      await handleFetchCalendarEvents();
    } catch (e) {
      setCalendarActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setCalendarActionLoading(false);
    }
  };

  const handleDeleteCalendarEvent = async () => {
    if (!calendarEvents.length) return;
    setCalendarActionLoading(true);
    setCalendarActionError(null);
    try {
      await GoogleCalendarService.deleteEvent(calendarEvents[0].id);
      await handleFetchCalendarEvents();
    } catch (e) {
      setCalendarActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setCalendarActionLoading(false);
    }
  };

  const handleTagWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);
    try {
      // Use a dummy entryId for demonstration
      const data = await WeatherLocationService.tagEntryWithWeather('demo-entry-id');
      setWeatherData(data);
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : String(e));
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleTagAppleHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    setHealthData(null);
    try {
      // Use a dummy entryId for demonstration
      const data = await AppleHealthService.tagEntryWithHealth('demo-entry-id');
      setHealthData(data);
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : String(e));
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <ThemeModal
      visible={visible}
      onClose={onClose}
      title="Diagnostics & System Status"
      accessibilityLabel="Diagnostics modal"
    >
      <ScrollView style={{ maxHeight: 400 }}>
        <Text>
          Status: {syncStatus} ({isOnline ? 'Online' : 'Offline'})
        </Text>
        {isOffline && (
          <Text style={{ color: '#b00', fontWeight: 'bold' }}>
            Offline Mode: Changes will be queued
          </Text>
        )}
        <Text>Last sync: {lastSyncTime || 'Never'}</Text>
        <Text>Last payload: {lastPayloadSize !== null ? `${lastPayloadSize} bytes` : 'N/A'}</Text>
        <Text>
          Last sync duration: {lastSyncDuration !== null ? `${lastSyncDuration} ms` : 'N/A'}
        </Text>
        <Text>Queued changes: {queuedCount}</Text>
        {lastOfflineSync && (
          <Text>Last offline-to-online sync: {new Date(lastOfflineSync).toLocaleString()}</Text>
        )}
        <Text>Unresolved conflicts: {conflictCount}</Text>
        <Text>Auto-resolved conflicts: {autoResolvedCount}</Text>
        <Text>Manually resolved conflicts: {manualResolvedCount}</Text>
        <Text style={{ color: lastError ? '#b00' : '#333' }}>
          Last error: {lastError || 'None'}
        </Text>
        {recentResolvedConflicts.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Recently Resolved Conflicts</Text>
            {recentResolvedConflicts.map(c => (
              <View key={c.id} style={{ marginBottom: 6 }}>
                <Text>
                  {c.entityType} - {c.strategy} - {new Date(c.resolvedAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
        {/* Offline Sync Section */}
        {isOffline && (
          <View style={{ marginTop: 12 }}>
            <ThemeButton
              title="Sync Now"
              onPress={onSyncQueued}
              variant="primary"
              disabled={queuedCount === 0}
            />
          </View>
        )}
        {/* Organization & Search Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Organization & Search</Text>
          <Text>Tags: {tagCount}</Text>
          <Text>Folders: {folderCount}</Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold' }}>Recent Searches:</Text>
          {recentSearches.length === 0 ? (
            <Text style={{ color: '#888' }}>None</Text>
          ) : (
            recentSearches.map((s, i) => (
              <Text key={i} style={{ fontSize: 12 }}>
                {s}
              </Text>
            ))
          )}
          {currentFilter && (
            <Text style={{ color: '#007bff', marginTop: 6 }}>Current filter: {currentFilter}</Text>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <ThemeButton
              title="Create Tag"
              onPress={event => {
                if (onCreateTag) onCreateTag();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Create Folder"
              onPress={event => {
                if (onCreateFolder) onCreateFolder();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Run Search"
              onPress={event => {
                if (onRunSearch) onRunSearch();
              }}
              variant="outline"
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            <ThemeButton
              title="Calendar View"
              onPress={event => {
                if (onOpenCalendar) onOpenCalendar();
              }}
              variant="primary"
            />
          </View>
        </View>
        {/* Bandwidth Optimization Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Bandwidth Optimization</Text>
          <Text>
            Last sync payload: {lastPayloadSize !== null ? `${lastPayloadSize} bytes` : 'N/A'}
          </Text>
          <Text>
            Last sync duration: {lastSyncDuration !== null ? `${lastSyncDuration} ms` : 'N/A'}
          </Text>
          <Text>Bandwidth saved: {bandwidthSaved}</Text>
          <Text>Compression: {compressionStatus}</Text>
        </View>
        {/* Cloud Storage Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Cloud Storage</Text>
          <Text>Provider: {cloudProvider || 'None connected'}</Text>
          <Text>Status: {cloudStatus || 'Disconnected'}</Text>
          <Text>Last cloud sync: {lastCloudSync || 'Never'}</Text>
          <Text>Quota: {cloudQuota || 'N/A'}</Text>
          <Text style={{ color: cloudError ? '#b00' : '#333' }}>
            Cloud error: {cloudError || 'None'}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <ThemeButton
              title="Connect Provider"
              onPress={event => {
                if (onConnectCloud) onConnectCloud();
              }}
              variant="primary"
              disabled={!!cloudProvider}
            />
            <ThemeButton
              title="Disconnect"
              onPress={event => {
                if (onDisconnectCloud) onDisconnectCloud();
              }}
              variant="outline"
              disabled={!cloudProvider}
            />
            <ThemeButton
              title="Manual Cloud Sync"
              onPress={event => {
                if (onManualCloudSync) onManualCloudSync();
              }}
              variant="secondary"
              disabled={!cloudProvider}
            />
          </View>
        </View>
        {/* Multimedia Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text
            style={{
              fontWeight: 'bold',
              marginBottom: 4,
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Multimedia
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Images: {imageCount}
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Videos: {videoCount}
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Audio: {audioCount}
          </Text>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Handwritten Notes: {noteCount}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontWeight: 'bold',
              color: theme.colors.onSurface,
              fontSize: theme.typography.fontSize.caption,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Recent Media:
          </Text>
          {recentMedia.length === 0 ? (
            <Text
              style={{
                color: theme.colors.outline,
                fontSize: theme.typography.fontSize.caption,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              None
            </Text>
          ) : (
            recentMedia.map((m, i) => (
              <Text
                key={i}
                style={{
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.fontSize.caption,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {m}
              </Text>
            ))
          )}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Add Image"
              onPress={event => {
                if (onAddImage) onAddImage();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Add Video"
              onPress={event => {
                if (onAddVideo) onAddVideo();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Record Audio"
              onPress={event => {
                if (onRecordAudio) onRecordAudio();
              }}
              variant="outline"
            />
            <ThemeButton
              title="Add Handwritten Note"
              onPress={event => {
                if (onAddNote) onAddNote();
              }}
              variant="primary"
            />
          </View>
        </View>
        {/* Export & Backup Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Export & Backup</Text>
          <Text>Last export: {lastExport ? new Date(lastExport).toLocaleString() : 'Never'}</Text>
          <Text>Last backup: {lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}</Text>
          <Text>Backup status: {backupStatus}</Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold' }}>Available Formats:</Text>
          <Text>PDF, RTF, Encrypted Archive</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Export as PDF"
              onPress={event => {
                if (onExportPDF) onExportPDF();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Export as RTF"
              onPress={event => {
                if (onExportRTF) onExportRTF();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Export Encrypted Archive"
              onPress={event => {
                if (onExportArchive) onExportArchive();
              }}
              variant="outline"
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <ThemeButton
              title="Backup Now"
              onPress={event => {
                if (onBackupNow) onBackupNow();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Verify Backup"
              onPress={event => {
                if (onVerifyBackup) onVerifyBackup();
              }}
              variant="danger"
            />
          </View>
        </View>
        {/* Customization & Themes Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Customization & Themes</Text>
          <Text>Current theme: {userTheme}</Text>
          <Text>Font size: {fontSize}</Text>
          <Text>Sticker count: {stickerCount}</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Switch Theme"
              onPress={event => {
                if (onSwitchTheme) onSwitchTheme();
              }}
              variant="primary"
            />
            <ThemeButton
              title="A+"
              onPress={event => {
                if (onFontSizeUp) onFontSizeUp();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="A-"
              onPress={event => {
                if (onFontSizeDown) onFontSizeDown();
              }}
              variant="outline"
            />
            <ThemeButton
              title="Add Sticker"
              onPress={event => {
                if (onAddSticker) onAddSticker();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Sync Theme"
              onPress={event => {
                if (onSyncTheme) onSyncTheme();
              }}
              variant="secondary"
            />
          </View>
        </View>
        {/* Habit Tracking & Notifications Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
            Habit Tracking & Notifications
          </Text>
          <Text>
            Current streak: {streak} day{streak === 1 ? '' : 's'}
          </Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold' }}>Goals:</Text>
          {goals.length === 0 ? (
            <Text style={{ color: '#888' }}>None</Text>
          ) : (
            goals.map((g, i) => (
              <Text key={i} style={{ fontSize: 12 }}>
                {g}
              </Text>
            ))
          )}
          <Text style={{ marginTop: 4, fontWeight: 'bold' }}>Achievements:</Text>
          {achievements.length === 0 ? (
            <Text style={{ color: '#888' }}>None</Text>
          ) : (
            achievements.map((a, i) => (
              <Text key={i} style={{ fontSize: 12 }}>
                {a}
              </Text>
            ))
          )}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Log Entry Today"
              onPress={event => {
                if (onLogEntry) onLogEntry();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Set Goal"
              onPress={event => {
                if (onSetGoal) onSetGoal();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Send Test Notification"
              onPress={event => {
                if (onSendNotification) onSendNotification();
              }}
              variant="outline"
            />
            <ThemeButton
              title="View Achievements"
              onPress={event => {
                if (onViewAchievements) onViewAchievements();
              }}
              variant="primary"
            />
          </View>
        </View>
        {/* External Services Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>External Services</Text>
          <Text>Google Calendar: {googleCalendarStatus}</Text>
          <Text>
            Last sync:{' '}
            {googleCalendarLastSync ? new Date(googleCalendarLastSync).toLocaleString() : 'Never'}
          </Text>
          <Text>Apple Health: {appleHealthStatus}</Text>
          <Text>
            Last sync:{' '}
            {appleHealthLastSync ? new Date(appleHealthLastSync).toLocaleString() : 'Never'}
          </Text>
          <Text>Weather/Location: {weatherStatus}</Text>
          <Text>
            Last tag: {weatherLastTag ? new Date(weatherLastTag).toLocaleString() : 'Never'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title={googleCalendarLoading ? 'Connecting...' : 'Connect Google Calendar'}
              onPress={handleConnectGoogleCalendar}
              variant="primary"
              disabled={googleCalendarLoading}
            />
            <ThemeButton
              title={healthLoading ? 'Connecting...' : 'Connect Apple Health'}
              onPress={handleTagAppleHealth}
              variant="secondary"
              disabled={healthLoading}
            />
            <ThemeButton
              title={weatherLoading ? 'Tagging Weather...' : 'Tag Weather/Location'}
              onPress={handleTagWeather}
              variant="outline"
              disabled={weatherLoading}
            />
            <ThemeButton
              title="Share Entry"
              onPress={onShareEntry ? () => onShareEntry() : () => {}}
              variant="primary"
            />
          </View>
        </View>
        {/* Accessibility & Performance Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Accessibility & Performance</Text>
          <Text>Accessibility mode: {accessibilityMode ? 'On' : 'Off'}</Text>
          <Text>High-contrast mode: {highContrastMode ? 'On' : 'Off'}</Text>
          <Text>
            Last performance test:{' '}
            {lastPerfTest ? new Date(lastPerfTest).toLocaleString() : 'Never'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Toggle Accessibility"
              onPress={event => {
                if (onToggleAccessibility) onToggleAccessibility();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Toggle High Contrast"
              onPress={event => {
                if (onToggleHighContrast) onToggleHighContrast();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Run Performance Test"
              onPress={event => {
                if (onRunPerfTest) onRunPerfTest();
              }}
              variant="outline"
            />
            <ThemeButton
              title="Test Screen Reader"
              onPress={event => {
                if (onTestScreenReader) onTestScreenReader();
              }}
              variant="primary"
            />
          </View>
        </View>
        {/* AI Features & Prompts Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Features & Prompts</Text>
          <Text>AI integration: {aiEnabled ? 'Enabled' : 'Disabled'}</Text>
          <Text>Opt-in: {aiOptIn ? 'Yes' : 'No'}</Text>
          <Text>Model: {aiModel}</Text>
          <Text>Status: {aiStatus}</Text>
          <Text>Last prompt: {lastPrompt || 'None'}</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <ThemeButton
              title="Toggle AI Features"
              onPress={event => {
                if (onToggleAI) onToggleAI();
              }}
              variant="primary"
            />
            <ThemeButton
              title="Generate Prompt"
              onPress={event => {
                if (onGeneratePrompt) onGeneratePrompt();
              }}
              variant="secondary"
            />
            <ThemeButton
              title="Opt In/Out"
              onPress={event => {
                if (onToggleOptIn) onToggleOptIn();
              }}
              variant="outline"
            />
          </View>
          {/* AI Search */}
          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>AI Search</Text>
          <TextInput
            placeholder="Enter search query"
            value={searchInput}
            onChangeText={setSearchInput}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              padding: 6,
              marginBottom: 4,
            }}
          />
          <ThemeButton
            title="Run AI Search"
            onPress={event => {
              if (onAISearch) onAISearch(searchInput);
            }}
            variant="primary"
          />
          <Text>Last search: {lastAISearchQuery || 'None'}</Text>
          <Text>Results: {lastAISearchResult ? lastAISearchResult.join(', ') : 'None'}</Text>
          {/* AI Summarization */}
          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>AI Summarization</Text>
          <ThemeButton
            title="Summarize Entries"
            onPress={event => {
              if (onAISummarize) onAISummarize();
            }}
            variant="secondary"
          />
          <Text>Last summary: {lastAISummary || 'None'}</Text>
        </View>
        {/* Launch Readiness Section */}
        <View style={{ marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Launch Readiness</Text>
          <Text>Onboarding complete: {onboardingComplete ? 'Yes' : 'No'}</Text>
          <ThemeButton
            title="Run Preflight Check"
            onPress={event => {
              if (onRunPreflightCheck) onRunPreflightCheck();
            }}
            variant="primary"
          />
          <Text style={{ marginTop: 8 }}>Preflight Results:</Text>
          <Text>Sync: {preflightResults?.sync || 'N/A'}</Text>
          <Text>Storage: {preflightResults?.storage || 'N/A'}</Text>
          <Text>AI: {preflightResults?.ai || 'N/A'}</Text>
          <Text>Export: {preflightResults?.export || 'N/A'}</Text>
          <Text style={{ marginTop: 8 }}>App Version: {appVersion || 'N/A'}</Text>
          <Text>Build: {appBuild || 'N/A'}</Text>
        </View>
        <ThemeButton
          title={calendarEventsLoading ? 'Fetching Events...' : 'Show Google Calendar Events'}
          onPress={handleFetchCalendarEvents}
          variant="outline"
          disabled={calendarEventsLoading || calendarActionLoading}
        />
        <ThemeButton
          title={calendarActionLoading ? 'Creating Event...' : 'Create Test Event'}
          onPress={handleCreateCalendarEvent}
          variant="primary"
          disabled={calendarActionLoading}
        />
        <ThemeButton
          title={calendarActionLoading ? 'Updating Event...' : 'Update First Event'}
          onPress={handleUpdateCalendarEvent}
          variant="secondary"
          disabled={calendarActionLoading || !calendarEvents.length}
        />
        <ThemeButton
          title={calendarActionLoading ? 'Deleting Event...' : 'Delete First Event'}
          onPress={handleDeleteCalendarEvent}
          variant="danger"
          disabled={calendarActionLoading || !calendarEvents.length}
        />
        {calendarEventsError && <Text style={{ color: 'red' }}>{calendarEventsError}</Text>}
        {calendarActionError && <Text style={{ color: 'red' }}>{calendarActionError}</Text>}
        {calendarEvents.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Upcoming Events:</Text>
            {calendarEvents.map(ev => (
              <Text key={ev.id} style={{ fontSize: 12 }}>
                {ev.summary} ({ev.start} - {ev.end})
              </Text>
            ))}
          </View>
        )}
        {weatherError && <Text style={{ color: 'red' }}>{weatherError}</Text>}
        {weatherData && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Weather Data:</Text>
            <Text>Location: {weatherData.location}</Text>
            <Text>Condition: {weatherData.condition}</Text>
            <Text>Temperature: {weatherData.temperature}°C</Text>
          </View>
        )}
        {healthError && <Text style={{ color: 'red' }}>{healthError}</Text>}
        {healthData && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Apple Health Data:</Text>
            {healthData.steps !== undefined && <Text>Steps: {healthData.steps}</Text>}
            {healthData.mood && <Text>Mood: {healthData.mood}</Text>}
            {healthData.activity && <Text>Activity: {healthData.activity}</Text>}
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <ThemeButton
          title="Manual Sync"
          onPress={event => {
            if (onManualSync) onManualSync();
          }}
          variant="primary"
        />
        <ThemeButton
          title="Clear Outbox"
          onPress={event => {
            if (onClearOutbox) onClearOutbox();
          }}
          variant="outline"
        />
        <ThemeButton
          title="Close"
          onPress={event => {
            if (onClose) onClose();
          }}
          variant="danger"
        />
      </View>
    </ThemeModal>
  );
};

export default SyncDiagnosticsModal;
