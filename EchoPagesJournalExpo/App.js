import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import InsightsScreen from './screens/InsightsScreen';
import JournalScreen from './screens/JournalScreen';
import EntryDetailScreen from './screens/EntryDetailScreen';
import QuickEntryScreen from './screens/QuickEntryScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditEntryScreen from './screens/EditEntryScreen';
import { JournalProvider } from './context/JournalContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <JournalProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Insights"
            component={InsightsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Journal" component={JournalScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="EntryDetail"
            component={EntryDetailScreen}
            options={{ title: 'Entry Detail' }}
          />
          <Stack.Screen
            name="QuickEntry"
            component={QuickEntryScreen}
            options={{ title: 'Quick Entry' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="EditEntry"
            component={EditEntryScreen}
            options={{ title: 'Edit Entry' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </JournalProvider>
  );
}
