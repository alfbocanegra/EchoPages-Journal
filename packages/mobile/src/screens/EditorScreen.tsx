import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Button,
  Switch,
} from 'react-native';
import RichTextEditorMobile from '../components/editor/RichTextEditorMobile';
import {
  getEntry,
  JournalEntry,
  getWeatherLocationTaggingEnabled,
  setWeatherLocationTaggingEnabled,
  saveEntry,
} from '../utils/EncryptedEntryStorage';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../styles/ThemeContext';
import {
  WeatherLocationService,
  WeatherData,
} from '@echopages/shared/services/WeatherLocationService';
import { AppleHealthService, HealthData } from '@echopages/shared/services/AppleHealthService';
import {
  GoogleFitService,
  HealthData as GoogleFitHealthData,
} from '@echopages/shared/services/GoogleFitService';
import { AIJournalService } from '@echopages/shared/services/AIJournalService';

const EditorScreen = ({ route }: any) => {
  const { entryId } = route.params || {};
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherTaggingEnabled, setWeatherTaggingEnabled] = useState(true);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);
  const [fitData, setFitData] = useState<GoogleFitHealthData | null>(null);
  const [aiPrompt, setAIPrompt] = useState<string | null>(null);
  const [aiReflection, setAIReflection] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (entryId) {
        const loaded = await getEntry(entryId);
        setEntry(loaded || null);
      } else {
        // New entry
        setEntry({
          id: uuidv4(),
          title: '',
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    };
    load();
  }, [entryId]);

  useEffect(() => {
    getWeatherLocationTaggingEnabled().then(setWeatherTaggingEnabled);
  }, []);

  const handleTagWeather = async () => {
    if (!entry) return;
    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);
    try {
      const data = await WeatherLocationService.tagEntryWithWeather(entry.id);
      setWeatherData(data);
      // Reload entry from storage to reflect new weather/location
      const updated = await getEntry(entry.id);
      setEntry(updated || entry);
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : String(e));
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleToggleWeatherTagging = async (value: boolean) => {
    setWeatherTaggingEnabled(value);
    await setWeatherLocationTaggingEnabled(value);
  };

  const handleRemoveWeatherLocation = async () => {
    if (!entry) return;
    setRemovalMessage(null);
    const updated = { ...entry, weather: undefined, location: undefined };
    await saveEntry(updated);
    setEntry(updated);
    setRemovalMessage('Weather/location tags removed.');
  };

  const handleTagHealth = async () => {
    if (!entry) return;
    setHealthLoading(true);
    setHealthError(null);
    setHealthData(null);
    try {
      const data = await AppleHealthService.tagEntryWithHealth(entry.id);
      setHealthData(data);
      // Reload entry from storage to reflect new health data
      const updated = await getEntry(entry.id);
      setEntry(updated || entry);
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : String(e));
    } finally {
      setHealthLoading(false);
    }
  };

  const handleTagGoogleFit = async () => {
    if (!entry) return;
    setFitLoading(true);
    setFitError(null);
    setFitData(null);
    try {
      const data = await GoogleFitService.tagEntryWithHealth(entry.id);
      setFitData(data);
      // Reload entry from storage to reflect new health data
      const updated = await getEntry(entry.id);
      setEntry(updated || entry);
    } catch (e) {
      setFitError(e instanceof Error ? e.message : String(e));
    } finally {
      setFitLoading(false);
    }
  };

  const handleFetchPrompt = async () => {
    setAILoading(true);
    setAIError(null);
    try {
      const prompt = await AIJournalService.getPrompt();
      setAIPrompt(prompt);
    } catch (e) {
      setAIError(e instanceof Error ? e.message : String(e));
    } finally {
      setAILoading(false);
    }
  };

  const handleFetchReflection = async () => {
    setAILoading(true);
    setAIError(null);
    try {
      const suggestion = await AIJournalService.getReflectionSuggestion();
      setAIReflection(suggestion);
    } catch (e) {
      setAIError(e instanceof Error ? e.message : String(e));
    } finally {
      setAILoading(false);
    }
  };

  const handleInsertAIPrompt = () => {
    if (!aiPrompt) return;
    setEntry(entry =>
      entry ? { ...entry, content: (entry.content || '') + '\n' + aiPrompt } : entry
    );
  };

  const handleInsertAIReflection = () => {
    if (!aiReflection) return;
    setEntry(entry =>
      entry ? { ...entry, content: (entry.content || '') + '\n' + aiReflection } : entry
    );
  };

  if (loading || !entry) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? '#f3f3f3' : '#fff' }}>
      <Text
        style={{
          textAlign: 'center',
          margin: 24,
          fontSize: theme.typography.fontSize.heading,
          fontWeight: 'bold',
          color: theme.colors.onSurface,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        EchoPages Journal - Mobile Editor
      </Text>
      <RichTextEditorMobile entry={entry} />
      {entry && (
        <View style={{ margin: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ marginRight: 8 }}>Weather/Location Tagging</Text>
            <Switch
              value={weatherTaggingEnabled}
              onValueChange={handleToggleWeatherTagging}
              accessibilityLabel="Enable or disable weather/location tagging"
            />
          </View>
          {weatherTaggingEnabled && (
            <Button
              title={weatherLoading ? 'Tagging Weather...' : 'Tag Weather/Location'}
              onPress={handleTagWeather}
              disabled={weatherLoading}
            />
          )}
          <Button
            title="Remove Weather/Location Tags"
            onPress={handleRemoveWeatherLocation}
            color="#b00"
          />
          {removalMessage && <Text style={{ color: 'green', marginTop: 4 }}>{removalMessage}</Text>}
          {weatherError && <Text style={{ color: 'red' }}>{weatherError}</Text>}
          {weatherData && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>Weather Data:</Text>
              <Text>Location: {weatherData.location}</Text>
              <Text>Condition: {weatherData.condition}</Text>
              <Text>Temperature: {weatherData.temperature}°C</Text>
            </View>
          )}
          {entry && Platform.OS === 'ios' && (
            <View style={{ margin: 16 }}>
              <Button
                title={healthLoading ? 'Tagging Health Data...' : 'Tag Apple Health Data'}
                onPress={handleTagHealth}
                disabled={healthLoading}
                color="#4CAF50"
              />
              {healthError && <Text style={{ color: 'red' }}>{healthError}</Text>}
              {healthData && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Apple Health Data:</Text>
                  {healthData.steps !== undefined && <Text>Steps: {healthData.steps}</Text>}
                  {healthData.mood && <Text>Mood: {healthData.mood}</Text>}
                  {healthData.activity && <Text>Activity: {healthData.activity}</Text>}
                </View>
              )}
            </View>
          )}
          {entry && Platform.OS === 'android' && (
            <View style={{ margin: 16 }}>
              <Button
                title={fitLoading ? 'Tagging Google Fit Data...' : 'Tag Google Fit Data'}
                onPress={handleTagGoogleFit}
                disabled={fitLoading}
                color="#2196F3"
              />
              {fitError && <Text style={{ color: 'red' }}>{fitError}</Text>}
              {fitData && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Google Fit Data:</Text>
                  {fitData.steps !== undefined && <Text>Steps: {fitData.steps}</Text>}
                  {fitData.activity && <Text>Activity: {fitData.activity}</Text>}
                </View>
              )}
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Button
              title={aiLoading ? 'Loading Prompt…' : 'Get Journaling Prompt'}
              onPress={handleFetchPrompt}
              disabled={aiLoading}
              color={Platform.OS === 'ios' ? theme.colors.primary : '#673AB7'}
              accessibilityLabel="Get AI journaling prompt"
            />
            <Button
              title={aiLoading ? 'Loading Reflection…' : 'Get Reflection Suggestion'}
              onPress={handleFetchReflection}
              disabled={aiLoading}
              color={Platform.OS === 'ios' ? theme.colors.secondary : '#009688'}
              accessibilityLabel="Get AI reflection suggestion"
            />
            {aiError ? (
              <Text
                style={{ color: '#d32f2f', fontWeight: 'bold', marginLeft: 8 }}
                accessibilityLiveRegion="polite"
              >
                {aiError}
              </Text>
            ) : null}
          </View>
          {aiPrompt && (
            <View
              style={{
                backgroundColor: '#ede7f6',
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
              accessible
              accessibilityLabel="AI Journaling Prompt"
              accessibilityRole="summary"
            >
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Journaling Prompt:</Text>
              <Text style={{ marginBottom: 8 }}>{aiPrompt}</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Button
                  title="Insert Prompt"
                  onPress={handleInsertAIPrompt}
                  accessibilityLabel="Insert AI prompt into entry"
                  color={Platform.OS === 'ios' ? theme.colors.primary : '#673AB7'}
                />
                <View style={{ width: 12 }} />
                <Button
                  title="Dismiss"
                  onPress={() => setAIPrompt(null)}
                  accessibilityLabel="Dismiss AI prompt"
                  color={Platform.OS === 'ios' ? theme.colors.surface : '#fff'}
                />
              </View>
            </View>
          )}
          {aiReflection && (
            <View
              style={{
                backgroundColor: '#e0f2f1',
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
              accessible
              accessibilityLabel="AI Reflection Suggestion"
              accessibilityRole="summary"
            >
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Reflection Suggestion:</Text>
              <Text style={{ marginBottom: 8 }}>{aiReflection}</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Button
                  title="Insert Suggestion"
                  onPress={handleInsertAIReflection}
                  accessibilityLabel="Insert AI reflection into entry"
                  color={Platform.OS === 'ios' ? theme.colors.secondary : '#009688'}
                />
                <View style={{ width: 12 }} />
                <Button
                  title="Dismiss"
                  onPress={() => setAIReflection(null)}
                  accessibilityLabel="Dismiss AI reflection"
                  color={Platform.OS === 'ios' ? theme.colors.surface : '#fff'}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditorScreen;
