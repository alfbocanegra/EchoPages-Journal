import React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import { SettingsList } from '../components/settings/SettingsList';

const SettingsScreen = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? '#f3f3f3' : '#fff' }}>
    <SettingsList />
  </SafeAreaView>
);

export default SettingsScreen;
