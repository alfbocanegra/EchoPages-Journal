import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppColorScheme } from '../context/JournalContext';
import AppleHealthKit from 'react-native-health';
let HealthConnect;
try {
  HealthConnect = require('react-native-health-connect');
} catch (e) {
  HealthConnect = null;
}

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // TODO: Replace with real client ID
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const DROPBOX_CLIENT_ID = 'YOUR_DROPBOX_CLIENT_ID'; // TODO: Replace with real client ID
const DROPBOX_DISCOVERY = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token',
};

const AUTH_STORAGE_KEY = 'authState';

async function saveAuthStateSecure(auth) {
  try {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }
}

async function getAuthStateSecure() {
  try {
    const stored = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const fallback = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (fallback) return JSON.parse(fallback);
  return null;
}

export default function SettingsScreen() {
  const { setEntries } = useJournal();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const { dateFormat, setDateFormat, timeFormat, setTimeFormat, theme, setTheme } = useJournal();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const dateOptions = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  ];
  const timeOptions = [
    { label: '12-hour', value: '12' },
    { label: '24-hour', value: '24' },
  ];
  const colorScheme = useAppColorScheme();
  const gradientColors =
    colorScheme === 'dark' ? ['#203A43', '#2c5364', '#0f2027'] : ['#a8edea', '#4fc3f7', '#1976d2'];

  // Theme selection logic
  const themeOptions = [
    { label: 'Device', value: 'device' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Restore auth state on mount
  useEffect(() => {
    (async () => {
      const stored = await getAuthStateSecure();
      if (stored) {
        const { provider, token, user } = stored;
        setProvider(provider);
        setToken(token);
        setUser(user);
      }
    })();
  }, []);

  // Save auth state
  const saveAuthState = (provider, token, user) => {
    setProvider(provider);
    setToken(token);
    setUser(user);
    saveAuthStateSecure({ provider, token, user });
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });
      await request.promptAsync(GOOGLE_DISCOVERY, { useProxy: false });
      if (request.response?.type === 'success' && request.response?.params?.access_token) {
        const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${request.response.params.access_token}` },
        }).then(res => res.json());
        saveAuthState('google', request.response.params.access_token, userInfo);
        Alert.alert('Signed in', `Welcome, ${userInfo.name || userInfo.email}`);
      } else {
        Alert.alert('Sign-in cancelled');
      }
    } catch (e) {
      Alert.alert('Sign-in error', e.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Apple sign-in
  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Sign-In is only available on iOS devices.');
      return;
    }
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const user = { name: credential.fullName?.givenName, email: credential.email };
      saveAuthState('apple', credential.identityToken, user);
      Alert.alert('Signed in', `Welcome, ${credential.fullName?.givenName || credential.email}`);
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        Alert.alert('Sign-in cancelled');
      } else {
        Alert.alert('Sign-in error', e.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dropbox sign-in
  const handleDropboxSignIn = async () => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });
      const request = new AuthSession.AuthRequest({
        clientId: DROPBOX_CLIENT_ID,
        scopes: [],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });
      await request.promptAsync(DROPBOX_DISCOVERY, { useProxy: false });
      if (request.response?.type === 'success' && request.response?.params?.access_token) {
        const user = { name: 'Dropbox User', email: '' };
        saveAuthState('dropbox', request.response.params.access_token, user);
        Alert.alert('Signed in', 'Welcome, Dropbox User');
      } else {
        Alert.alert('Sign-in cancelled');
      }
    } catch (e) {
      Alert.alert('Sign-in error', e.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setProvider(null);
    setToken(null);
    setUser(null);
    AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    Alert.alert('Signed out');
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to sign out and delete all local journal entries? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('journalEntries');
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setProvider(null);
            setToken(null);
            setUser(null);
            setEntries([]);
            await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
            Alert.alert(
              'Data Cleared',
              'All local data has been deleted and you have been signed out.'
            );
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      if (!token || !provider) {
        Alert.alert('Not signed in', 'Please sign in before syncing.');
        setLoading(false);
        return;
      }
      const deviceId = 'demo-device-1';
      const response = await fetch('http://localhost:3000/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ deviceId, provider, changes: [] }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Sync failed');
      }
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
        await AsyncStorage.setItem('journalEntries', JSON.stringify(data.entries));
      }
      Alert.alert('Sync Complete', `Your journal is up to date. (Provider: ${provider})`);
    } catch (e) {
      Alert.alert('Sync Error', e.message || 'Failed to sync.');
    } finally {
      setLoading(false);
    }
  };

  // Scaffold connectAppleHealth and connectHealthConnect
  function connectAppleHealth() {
    if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
      Alert.alert(
        'Apple Health Not Available',
        'Apple HealthKit is not available in this build or environment.'
      );
      return;
    }
    const healthKitOptions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.MindfulSession,
          AppleHealthKit.Constants.Permissions.MentalWellbeing,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.MindfulSession,
          AppleHealthKit.Constants.Permissions.MentalWellbeing,
        ],
      },
    };
    AppleHealthKit.initHealthKit(healthKitOptions, (err, results) => {
      if (err) {
        Alert.alert('HealthKit Error', err.message || 'Failed to connect to Apple Health.');
        return;
      }
      Alert.alert('Connected to Apple Health!');
    });
  }

  async function connectHealthConnect() {
    if (!HealthConnect || typeof HealthConnect.requestPermissions !== 'function') {
      Alert.alert(
        'Health Connect Not Available',
        'Health Connect is not available in this build or environment.'
      );
      return;
    }
    try {
      await HealthConnect.requestPermissions([
        HealthConnect.PermissionTypes.MindfulSession,
        HealthConnect.PermissionTypes.MentalWellbeing,
      ]);
      Alert.alert('Connected to Health Connect!');
    } catch (err) {
      Alert.alert('Health Connect Error', err.message || 'Failed to connect to Health Connect.');
    }
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === 'dark' || (theme === 'device' && colorScheme === 'dark')
                ? '#181A20'
                : undefined,
          },
        ]}
        testID="settings-screen"
      >
        {/* Theme Selector */}
        <View style={styles.itemContainer}>
          <Text style={styles.formatLabel}>Theme</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setThemeModalVisible(true)}
            testID="theme-dropdown"
          >
            <Text style={styles.dropdownText}>
              {themeOptions.find(opt => opt.value === theme)?.label || 'Device'}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={themeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setThemeModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setThemeModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={themeOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setTheme(item.value);
                        setThemeModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        {/* Date Format */}
        <View style={styles.itemContainer}>
          <Text style={styles.formatLabel}>Date Format</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDateModalVisible(true)}
            testID="date-format-dropdown"
          >
            <Text style={styles.dropdownText}>
              {dateOptions.find(opt => opt.value === dateFormat)?.label}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={dateModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDateModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setDateModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={dateOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setDateFormat(item.value);
                        setDateModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        {/* Time Format */}
        <View style={[styles.itemContainer, { marginBottom: 0 }]}>
          <Text style={styles.formatLabel}>Time Format</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setTimeModalVisible(true)}
            testID="time-format-dropdown"
          >
            <Text style={styles.dropdownText}>
              {timeOptions.find(opt => opt.value === timeFormat)?.label}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={timeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setTimeModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setTimeModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={timeOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setTimeFormat(item.value);
                        setTimeModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        {/* Health Connect / Apple Health Button */}
        <View style={styles.itemContainer}>
          {Platform.OS === 'ios' ? (
            <TouchableOpacity style={styles.healthButton} onPress={connectAppleHealth}>
              <Text style={styles.healthButtonText}>Connect to Apple Health</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.healthButton} onPress={connectHealthConnect}>
              <Text style={styles.healthButtonText}>Connect to Health Connect</Text>
            </TouchableOpacity>
          )}
        </View>
        {user ? (
          <View style={{ alignItems: 'center', marginBottom: 24 }} testID="user-info-section">
            <Text style={{ fontSize: 16, marginBottom: 4 }}>
              Signed in as {user.name || user.email}
            </Text>
            {provider && (
              <Text style={{ fontSize: 14, marginBottom: 8 }}>
                Signed in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </Text>
            )}
            <Button title="Sign out" onPress={handleLogout} testID="sign-out-button" />
            <Button
              title="Clear Data & Sign Out"
              color="#f44"
              onPress={handleClearData}
              testID="clear-data-button"
            />
          </View>
        ) : (
          <View testID="auth-buttons-section">
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
              testID="google-signin-button"
            >
              <Text style={styles.authButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAppleSignIn}
                disabled={loading}
                testID="apple-signin-button"
              >
                <Text style={styles.authButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleDropboxSignIn}
              disabled={loading}
              testID="dropbox-signin-button"
            >
              <Text style={styles.authButtonText}>Sign in with Dropbox</Text>
            </TouchableOpacity>
          </View>
        )}
        <Button
          title="Sync Now"
          onPress={handleSync}
          disabled={loading || !token || !provider}
          testID="sync-button"
        />
        {loading && <ActivityIndicator style={{ marginTop: 16 }} testID="loading-indicator" />}
        <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
            You can sign in with Google, Apple, or Dropbox. Your authentication tokens are stored
            securely on your device. Only your own journal entries are ever synced or visible to
            you. For more info, see our privacy policy.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  authButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    minWidth: 220,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formatSection: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  itemContainer: {
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  formatLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 0,
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#181A20',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 0,
    minWidth: 180,
    maxHeight: 180,
    alignSelf: 'center',
    marginTop: 120,
    elevation: 6,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#181A20',
  },
  gradient: {
    flex: 1,
  },
  healthButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  healthButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
