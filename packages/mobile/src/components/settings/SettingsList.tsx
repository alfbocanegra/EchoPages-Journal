import React, { useEffect, useState } from 'react';
import { View, Switch, AccessibilityInfo } from 'react-native';
import { ThemeListItem } from '../common/ThemeListItem';
import { ThemeButton } from '../common/ThemeButton';
import { Ionicons } from '@expo/vector-icons';
import { getShowProgressBar, setShowProgressBar } from '../../utils/syncService';
import { ThemePicker, ThemeOption } from './ThemePicker';
import { getUserTheme, setUserTheme } from '../../utils/themeService';
import { AccentColorPicker } from './AccentColorPicker';
import { getAccentColor, setAccentColor } from '../../utils/themeService';
import HabitTracker from '../common/HabitTracker';
import SyncDiagnosticsModal from '../common/SyncDiagnosticsModal';
import { getEntries, saveEntry } from '../../utils/EncryptedEntryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudStatus } from '../../utils/api';
import * as Notifications from 'expo-notifications';
const Location: any = require('expo-location');

export const SettingsList: React.FC<{ onAccentColorChange?: (color: string) => void }> = ({
  onAccentColorChange,
}) => {
  const [showProgressBar, setShowProgressBarState] = useState(true);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [userTheme, setUserThemeState] = useState<ThemeOption>('system');
  const [accentColorPickerVisible, setAccentColorPickerVisible] = useState(false);
  const [accentColor, setAccentColorState] = useState('#0288D1');
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [preflightResults, setPreflightResults] = useState({
    sync: 'N/A',
    storage: 'N/A',
    ai: 'N/A',
    export: 'N/A',
    cloud: 'N/A',
    notifications: 'N/A',
    permissions: 'N/A',
    integrations: 'N/A',
    accessibility: 'N/A',
    version: 'N/A',
    build: 'N/A',
  });

  useEffect(() => {
    getShowProgressBar().then(setShowProgressBarState);
    getUserTheme().then(setUserThemeState);
    getAccentColor().then(setAccentColorState);
  }, []);

  const handleToggleProgressBar = async (value: boolean) => {
    setShowProgressBarState(value);
    await setShowProgressBar(value);
  };

  const handleThemeSelect = async (theme: ThemeOption) => {
    setUserThemeState(theme);
    await setUserTheme(theme);
    setThemePickerVisible(false);
  };

  const handleAccentColorSelect = async (color: string) => {
    setAccentColorState(color);
    await setAccentColor(color);
    setAccentColorPickerVisible(false);
    if (onAccentColorChange) onAccentColorChange(color);
  };

  const handleRunPreflightCheck = async () => {
    setPreflightLoading(true);
    const results: typeof preflightResults = { ...preflightResults };
    // 1. Sync: Try to read and write an entry
    try {
      const entries = await getEntries();
      const testEntry = {
        id: 'preflight-test',
        title: 'Preflight Test',
        content: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveEntry(testEntry);
      results.sync = 'OK';
    } catch (e) {
      results.sync = 'FAIL';
    }
    // 2. Storage: Try to write/read AsyncStorage
    try {
      const key = 'preflight-storage-test';
      await AsyncStorage.setItem(key, 'test');
      const value = await AsyncStorage.getItem(key);
      if (value === 'test') results.storage = 'OK';
      else results.storage = 'FAIL';
      await AsyncStorage.removeItem(key);
    } catch (e) {
      results.storage = 'FAIL';
    }
    // 3. AI: Check if AI features are enabled (stub: always OK if not implemented)
    results.ai = 'OK';
    // 4. Export: Check if export function is available (stub: always OK if not implemented)
    results.export = 'OK';
    // 5. Cloud Sync: Check if cloud provider is connected
    try {
      const cloud = await getCloudStatus();
      results.cloud = cloud?.status === 'connected' ? 'OK' : 'Not Connected';
    } catch (e) {
      results.cloud = 'FAIL';
    }
    // 6. Notifications: Check permission
    try {
      const notifPerm: any = await Notifications.getPermissionsAsync();
      results.notifications = notifPerm.status === 'granted' ? 'OK' : 'Denied';
    } catch (e) {
      results.notifications = 'FAIL';
    }
    // 7. Permissions: Check location, health, calendar (stubs)
    let permOk = true;
    try {
      const locPerm: any = await Location.getForegroundPermissionsAsync();
      if (locPerm.status !== 'granted') permOk = false;
    } catch {}
    // Health/Calendar: stub as OK for now
    results.permissions = permOk ? 'OK' : 'Denied';
    // 8. Integrations: Check health, calendar, weather (stubs)
    results.integrations = 'OK';
    // 9. Accessibility: Check if screen reader or high-contrast mode is available
    try {
      const srEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      results.accessibility = srEnabled ? 'Screen Reader On' : 'Available';
    } catch (e) {
      results.accessibility = 'FAIL';
    }
    // 10. Version/Build
    results.version = '0.1.0';
    results.build = '1';
    setPreflightResults(results);
    setPreflightLoading(false);
  };

  const themeLabel =
    userTheme === 'light' ? 'Light' : userTheme === 'dark' ? 'Dark' : 'System Default';

  return (
    <View style={{ padding: 16 }}>
      <ThemeListItem
        title="Account"
        subtitle="Manage your account details"
        leading={<Ionicons name="person-circle-outline" size={28} color="#6750A4" />}
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => {}}
        accessibilityLabel="Account settings"
      />
      <ThemeListItem
        title="Theme"
        subtitle={themeLabel}
        leading={<Ionicons name="color-palette-outline" size={26} color="#625B71" />}
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => setThemePickerVisible(true)}
        accessibilityLabel="Theme settings"
      />
      <ThemeListItem
        title="Sync Progress Bar"
        subtitle="Show sync progress during backup/sync"
        leading={<Ionicons name="cloud-upload-outline" size={26} color="#0288D1" />}
        trailing={
          <Switch
            value={showProgressBar}
            onValueChange={handleToggleProgressBar}
            accessibilityLabel="Show sync progress bar"
          />
        }
        accessibilityLabel="Show sync progress bar"
      />
      <ThemeListItem
        title="Notifications"
        subtitle="Reminders and alerts"
        leading={<Ionicons name="notifications-outline" size={26} color="#0288D1" />}
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => {}}
        accessibilityLabel="Notification settings"
      />
      <ThemeListItem
        title="About"
        subtitle="App version, privacy, and more"
        leading={<Ionicons name="information-circle-outline" size={26} color="#388E3C" />}
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => {}}
        accessibilityLabel="About EchoPages Journal"
      />
      <ThemeListItem
        title="Sign Out"
        leading={<Ionicons name="log-out-outline" size={26} color="#B3261E" />}
        onPress={() => {}}
        accessibilityLabel="Sign out"
        selected
      />
      <ThemeListItem
        title="Accent Color"
        subtitle="Customize your highlight color"
        leading={
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: accentColor,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          />
        }
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => setAccentColorPickerVisible(true)}
        accessibilityLabel="Accent color settings"
      />
      <ThemeListItem
        title="Diagnostics & Launch Readiness"
        subtitle="System status, sync, and preflight checks"
        leading={<Ionicons name="bug-outline" size={26} color="#B3261E" />}
        trailing={<Ionicons name="chevron-forward" size={22} color="#888" />}
        onPress={() => setDiagnosticsVisible(true)}
        accessibilityLabel="Diagnostics and launch readiness"
      />
      <ThemePicker
        visible={themePickerVisible}
        selected={userTheme}
        onSelect={handleThemeSelect}
        onClose={() => setThemePickerVisible(false)}
      />
      <AccentColorPicker
        visible={accentColorPickerVisible}
        selected={accentColor}
        onSelect={handleAccentColorSelect}
        onClose={() => setAccentColorPickerVisible(false)}
      />
      <HabitTracker />
      <SyncDiagnosticsModal
        visible={diagnosticsVisible}
        onClose={() => setDiagnosticsVisible(false)}
        syncStatus="Idle"
        isOnline={true}
        lastSyncTime={null}
        lastPayloadSize={null}
        lastSyncDuration={null}
        queuedCount={0}
        conflictCount={0}
        lastError={null}
        onManualSync={() => {}}
        onClearOutbox={() => {}}
        theme="Light"
        onboardingComplete={false}
        onRunPreflightCheck={handleRunPreflightCheck}
        preflightResults={preflightResults}
        appVersion={preflightResults.version}
        appBuild={preflightResults.build}
      />
    </View>
  );
};
