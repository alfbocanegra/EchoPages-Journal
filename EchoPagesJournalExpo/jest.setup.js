import 'react-native-gesture-handler/jestSetup';

// Mock expo modules
jest.mock('expo-secure-store');
jest.mock('expo-auth-session');
jest.mock('expo-apple-authentication');
jest.mock('expo-image-picker');
jest.mock('expo-status-bar');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  const TouchableOpacity = require('react-native/Libraries/Components/Touchable/TouchableOpacity');

  return {
    Swipeable: View,
    DrawerLayout: View,
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    Directions: {},
    gestureHandlerRootHOC: jest.fn(component => component),
    TouchableHighlight: TouchableOpacity,
    TouchableNativeFeedback: TouchableOpacity,
    TouchableOpacity: TouchableOpacity,
    TouchableWithoutFeedback: TouchableOpacity,
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RNScreens = require('react-native-screens/mock');
  return {
    ...RNScreens,
    enableScreens: jest.fn(),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Global mocks
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
