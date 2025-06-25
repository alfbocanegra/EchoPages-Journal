import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadHabits,
  selectStreak,
  selectGoals,
  selectReminders,
  selectAchievements,
  selectHabitsLoading,
  selectHabitsError,
  addGoalAsync,
  updateGoalAsync,
  removeGoalAsync,
  addReminderAsync,
  removeReminderAsync,
  updateReminderAsync,
} from '../../store/slices/habitsSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';
import { EntryCalendar } from './EntryCalendar';
import * as Notifications from 'expo-notifications';
import type { HabitReminder } from '@echopages/shared/database/services/HabitTrackingService';

/**
 * HabitTracker
 * Displays and manages streak, goals, reminders, and achievements from Redux store.
 * Allows adding, editing, and removing goals and reminders.
 * Accessible and simple UI.
 */
const HabitTracker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const streak = useSelector((state: RootState) => selectStreak(state));
  const goals = useSelector((state: RootState) => selectGoals(state)) || [];
  const reminders = useSelector((state: RootState) => selectReminders(state)) || [];
  const achievements = useSelector((state: RootState) => selectAchievements(state)) || [];
  const loading = useSelector((state: RootState) => selectHabitsLoading(state));
  const error = useSelector((state: RootState) => selectHabitsError(state));

  // State for add/edit goal modal
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalTarget, setGoalTarget] = useState('');
  const [goalType, setGoalType] = useState<'days' | 'entries'>('days');
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalProgress, setGoalProgress] = useState('');

  // State for add reminder modal
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    dispatch(loadHabits());
    requestNotificationPermission().then(setNotificationsEnabled);
  }, [dispatch]);

  // Goal handlers
  const handleAddOrEditGoal = () => {
    if (!goalTarget.trim() || isNaN(Number(goalTarget))) return;
    const goal = {
      id: editingGoal ? editingGoal.id : uuidv4(),
      type: goalType,
      target: Number(goalTarget),
      progress: Number(goalProgress) || 0,
      startDate: editingGoal ? editingGoal.startDate : new Date().toISOString(),
      completed: editingGoal ? editingGoal.completed : false,
    };
    if (editingGoal) {
      dispatch(updateGoalAsync(goal));
    } else {
      dispatch(addGoalAsync(goal));
    }
    setGoalTarget('');
    setGoalType('days');
    setGoalProgress('');
    setEditingGoal(null);
    setGoalModalVisible(false);
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalType(goal.type);
    setGoalTarget(goal.target.toString());
    setGoalProgress(goal.progress.toString());
    setGoalModalVisible(true);
  };

  const handleRemoveGoal = (id: string) => {
    dispatch(removeGoalAsync(id));
  };

  // Reminder handlers
  const handleAddOrEditReminder = async () => {
    if (!reminderTime.trim()) return;
    const reminder: HabitReminder = {
      id: editingReminder ? editingReminder.id : uuidv4(),
      time: reminderTime,
      frequency: reminderFrequency,
      enabled: reminderEnabled,
      notificationId: editingReminder ? editingReminder.notificationId : undefined,
    };
    if (editingReminder) {
      // Cancel previous notification if disabled or time changed
      if (!reminder.enabled && editingReminder.notificationId) {
        await cancelReminderNotification(editingReminder.notificationId);
      }
      if (reminder.enabled) {
        const notificationId = await scheduleReminderNotification(reminder);
        reminder.notificationId = notificationId;
      } else {
        reminder.notificationId = undefined;
      }
      dispatch(updateReminderAsync(reminder));
    } else {
      if (reminder.enabled) {
        const notificationId = await scheduleReminderNotification(reminder);
        reminder.notificationId = notificationId;
      }
      dispatch(addReminderAsync(reminder));
    }
    setReminderTime('08:00');
    setReminderFrequency('daily');
    setReminderEnabled(true);
    setEditingReminder(null);
    setReminderModalVisible(false);
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setReminderTime(reminder.time);
    setReminderFrequency(reminder.frequency);
    setReminderEnabled(reminder.enabled);
    setReminderModalVisible(true);
  };

  const handleRemoveReminder = async (id: string) => {
    const reminder = reminders.find((r: HabitReminder) => r.id === id);
    if (reminder && reminder.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    dispatch(removeReminderAsync(id));
  };

  const handleToggleReminder = async (reminder: HabitReminder) => {
    if (reminder.enabled) {
      // Disable: cancel notification
      if (reminder.notificationId) await cancelReminderNotification(reminder.notificationId);
      dispatch(updateReminderAsync({ ...reminder, enabled: false, notificationId: undefined }));
    } else {
      // Enable: schedule notification
      const notificationId = await scheduleReminderNotification(reminder);
      dispatch(updateReminderAsync({ ...reminder, enabled: true, notificationId }));
    }
  };

  const requestNotificationPermission = async () => {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      const { granted: newGranted } = await Notifications.requestPermissionsAsync();
      return newGranted;
    }
    return true;
  };

  const scheduleReminderNotification = async (reminder: HabitReminder): Promise<string> => {
    const [hour, minute] = reminder.time.split(':').map(Number);
    let trigger: Notifications.CalendarTriggerInput = {
      hour,
      minute,
      repeats: true,
      type: 'calendar',
    };
    if (reminder.frequency === 'weekly' && reminder.daysOfWeek && reminder.daysOfWeek.length > 0) {
      // Expo: weekday 1=Sunday, 7=Saturday
      trigger = { ...trigger, weekday: (reminder.daysOfWeek[0] + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 };
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder',
        body: `It's time for your habit! (${reminder.time})`,
        sound: true,
      },
      trigger,
    });
    return id;
  };

  const cancelReminderNotification = async (notificationId: string | undefined) => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  };

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.header}>
        Habit Tracker
      </Text>
      {loading && <ActivityIndicator accessibilityLabel="Loading habits" />}
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      <Button
        title="Reload"
        onPress={() => dispatch(loadHabits())}
        accessibilityLabel="Reload habits"
      />
      {/* Habit Calendar Visualization */}
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Habit Calendar
        </Text>
        <EntryCalendar
          entries={goals.map(g => ({ createdAt: g.startDate }))} // TODO: Replace with actual completion dates
          onSelect={() => {}}
        />
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Current Streak
        </Text>
        <Text>
          {streak && typeof streak === 'object' && 'current' in streak
            ? `${streak.current} days`
            : 'No streak yet'}
        </Text>
      </View>
      {/* Visual Timeline Section */}
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Habit Timeline (Last 30 Days)
        </Text>
        <EntryCalendar
          entries={goals.flatMap(g => g.completions || [])}
          highlightStreaks={true}
          streak={streak}
          days={30}
          accessibilityLabel="Visual timeline of habit completions for the last 30 days. Streak days are highlighted."
        />
        <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Each dot represents a day with a completed habit. Streak days are highlighted for
          motivation.
        </Text>
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Goals
        </Text>
        <Button
          title="Add Goal"
          onPress={() => {
            setEditingGoal(null);
            setGoalModalVisible(true);
          }}
          accessibilityLabel="Add a new goal"
        />
        <FlatList
          data={Array.isArray(goals) ? goals : []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalItem}>
              <Text>
                Goal: {item.type} ({item.progress}/{item.target}){item.completed ? ' ✅' : ''}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => handleEditGoal(item)}
                  accessibilityLabel={`Edit goal of type ${item.type}`}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveGoal(item.id)}
                  accessibilityLabel={`Delete goal of type ${item.type}`}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No goals set</Text>}
        />
        <Modal
          visible={goalModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setGoalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionHeader}>{editingGoal ? 'Edit Goal' : 'Add Goal'}</Text>
              {Platform.OS === 'ios' ? (
                <Picker
                  selectedValue={goalType}
                  onValueChange={(v: 'days' | 'entries') => setGoalType(v)}
                  style={styles.input}
                  accessibilityLabel="Goal type"
                >
                  <Picker.Item label="Days" value="days" />
                  <Picker.Item label="Entries" value="entries" />
                </Picker>
              ) : (
                <View style={styles.pickerRow}>
                  <Button
                    title="Days"
                    onPress={() => setGoalType('days')}
                    color={goalType === 'days' ? '#0288D1' : '#ccc'}
                  />
                  <Button
                    title="Entries"
                    onPress={() => setGoalType('entries')}
                    color={goalType === 'entries' ? '#0288D1' : '#ccc'}
                  />
                </View>
              )}
              <TextInput
                placeholder="Target (number)"
                value={goalTarget}
                onChangeText={setGoalTarget}
                keyboardType="numeric"
                style={styles.input}
                accessibilityLabel="Goal target"
              />
              <TextInput
                placeholder="Progress (number)"
                value={goalProgress}
                onChangeText={setGoalProgress}
                keyboardType="numeric"
                style={styles.input}
                accessibilityLabel="Goal progress"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setGoalModalVisible(false);
                    setEditingGoal(null);
                  }}
                />
                <Button
                  title={editingGoal ? 'Save' : 'Add'}
                  onPress={handleAddOrEditGoal}
                  accessibilityLabel={editingGoal ? 'Save goal' : 'Add goal'}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Reminders
        </Text>
        <Button
          title="Add Reminder"
          onPress={() => {
            setEditingReminder(null);
            setReminderModalVisible(true);
          }}
          accessibilityLabel="Add a new reminder"
        />
        <FlatList
          data={Array.isArray(reminders) ? reminders : []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.reminderItem}>
              <Text>
                {item.time} - {item.frequency} {item.enabled ? '(on)' : '(off)'}
              </Text>
              <Switch
                value={item.enabled}
                onValueChange={() => handleToggleReminder(item)}
                accessibilityLabel={`Toggle reminder at ${item.time}`}
              />
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => handleEditReminder(item)}
                  accessibilityLabel={`Edit reminder at ${item.time}`}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveReminder(item.id)}
                  accessibilityLabel={`Delete reminder at ${item.time}`}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No reminders</Text>}
        />
        <Modal
          visible={reminderModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setReminderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionHeader}>
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
              </Text>
              <TextInput
                placeholder="Time (HH:mm)"
                value={reminderTime}
                onChangeText={setReminderTime}
                style={styles.input}
                accessibilityLabel="Reminder time"
              />
              {Platform.OS === 'ios' ? (
                <Picker
                  selectedValue={reminderFrequency}
                  onValueChange={(v: 'daily' | 'weekly') => setReminderFrequency(v)}
                  style={styles.input}
                  accessibilityLabel="Reminder frequency"
                >
                  <Picker.Item label="Daily" value="daily" />
                  <Picker.Item label="Weekly" value="weekly" />
                </Picker>
              ) : (
                <View style={styles.pickerRow}>
                  <Button
                    title="Daily"
                    onPress={() => setReminderFrequency('daily')}
                    color={reminderFrequency === 'daily' ? '#0288D1' : '#ccc'}
                  />
                  <Button
                    title="Weekly"
                    onPress={() => setReminderFrequency('weekly')}
                    color={reminderFrequency === 'weekly' ? '#0288D1' : '#ccc'}
                  />
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text>Enabled</Text>
                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setReminderModalVisible(false);
                    setEditingReminder(null);
                  }}
                />
                <Button
                  title={editingReminder ? 'Save' : 'Add'}
                  onPress={handleAddOrEditReminder}
                  accessibilityLabel={editingReminder ? 'Save reminder' : 'Add reminder'}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          Achievements
        </Text>
        <FlatList
          data={Array.isArray(achievements) ? achievements : []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Text>
              Achievement: {item.id} unlocked at {item.unlockedAt}
            </Text>
          )}
          ListEmptyComponent={<Text>No achievements yet</Text>}
        />
      </View>
      {!notificationsEnabled && (
        <View style={styles.section}>
          <Text style={{ color: 'red' }}>
            Notifications are disabled. Enable them in system settings to receive reminders.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deleteButton: { marginLeft: 12, backgroundColor: '#B3261E', padding: 6, borderRadius: 4 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  editButton: { marginLeft: 8, backgroundColor: '#0288D1', padding: 6, borderRadius: 4 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: 300 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 12 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
});

export default HabitTracker;
