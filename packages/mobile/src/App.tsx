import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EditorScreen from './screens/EditorScreen';
import EntryListScreen from './screens/EntryListScreen';
import SyncProgressBar from './components/common/SyncProgressBar';
import { getShowProgressBar } from './utils/syncService';
import { AppState, Appearance, useColorScheme } from 'react-native';
import SettingsScreen from './screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import {
  getUserTheme,
  setUserTheme,
  ThemeOption,
  getAccentColor,
  setAccentColor,
  getFontSize,
  setFontSize,
  FontSizeOption,
} from './utils/themeService';
import { theme as baseTheme } from './styles/theme';
import { ThemeProvider } from './styles/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './store/store';

const Stack = createNativeStackNavigator();

const lightTheme = {
  ...baseTheme,
  colors: { ...baseTheme.colors, background: '#F4EFF4', surface: '#FFFFFF', onSurface: '#1C1B1F' },
};
const darkTheme = {
  ...baseTheme,
  colors: { ...baseTheme.colors, background: '#181A20', surface: '#23262F', onSurface: '#F4EFF4' },
};

export default function App() {
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [userTheme, setUserThemeState] = useState<ThemeOption>('system');
  const [fontSize, setFontSizeState] = useState<FontSizeOption>('medium');
  const [accentColor, setAccentColorState] = useState('#0288D1');
  const systemColorScheme = useColorScheme();
  const currentTheme =
    userTheme === 'system'
      ? systemColorScheme === 'dark'
        ? darkTheme
        : lightTheme
      : userTheme === 'dark'
      ? darkTheme
      : lightTheme;

  useEffect(() => {
    let mounted = true;
    const update = () =>
      getShowProgressBar().then(val => {
        if (mounted) setShowProgressBar(val);
      });
    update();
    const sub = AppState.addEventListener('change', update);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    getUserTheme().then(setUserThemeState);
    getAccentColor().then(setAccentColorState);
    getFontSize().then(setFontSizeState);
  }, []);

  const fontSizeMap = {
    small: { body: 14, heading: 20, subheading: 17, caption: 12, button: 14 },
    medium: { body: 16, heading: 24, subheading: 20, caption: 14, button: 16 },
    large: { body: 19, heading: 28, subheading: 23, caption: 16, button: 19 },
  };
  const themedTypography = { ...currentTheme.typography, fontSize: fontSizeMap[fontSize] };
  const themedColors = {
    ...currentTheme.colors,
    primary: accentColor,
    info: accentColor,
    // Optionally update other accent-related fields
  };
  const themedTheme = { ...currentTheme, colors: themedColors, typography: themedTypography };

  return (
    <ThemeProvider value={themedTheme}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              dark:
                userTheme === 'dark' || (userTheme === 'system' && systemColorScheme === 'dark'),
              colors: {
                primary: themedColors.primary,
                background: themedColors.background,
                card: themedColors.surface,
                text: themedColors.onSurface,
                border: themedColors.outline,
                notification: themedColors.info,
              },
              fonts: {
                regular: { fontFamily: 'System', fontWeight: '400' },
                medium: { fontFamily: 'System', fontWeight: '500' },
                bold: { fontFamily: 'System', fontWeight: '700' },
                heavy: { fontFamily: 'System', fontWeight: '800' },
              },
            }}
          >
            <SyncProgressBar visible={showProgressBar} />
            <Stack.Navigator initialRouteName="EntryList">
              <Stack.Screen
                name="EntryList"
                component={EntryListScreen}
                options={({ navigation }) => ({
                  title: 'Entries',
                  headerRight: () => (
                    <Ionicons
                      name="settings-outline"
                      size={26}
                      color="#625B71"
                      style={{ marginRight: 16 }}
                      onPress={() => navigation.navigate('Settings')}
                      accessibilityLabel="Open settings"
                      accessible
                    />
                  ),
                })}
              />
              <Stack.Screen
                name="Editor"
                component={EditorScreen}
                options={{ title: 'Edit Entry' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </ThemeProvider>
  );
}
