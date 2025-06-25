import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { subscribeSyncProgress, SyncProgress } from '../../utils/syncService';
import { useTheme } from '../../styles/ThemeContext';

interface SyncProgressBarProps {
  visible: boolean;
}

const SyncProgressBar: React.FC<SyncProgressBarProps> = ({ visible }) => {
  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    status: 'idle',
  });
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = subscribeSyncProgress(setProgress);
    return unsubscribe;
  }, []);

  if (!visible || progress.status === 'idle' || progress.status === 'done') return null;

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <View
      style={styles(theme).container}
      accessibilityRole="progressbar"
      accessibilityLabel="Sync progress"
    >
      <View style={styles(theme).barBg}>
        <View
          style={[
            styles(theme).bar,
            {
              width: `${percent}%`,
              backgroundColor:
                progress.status === 'error' ? theme.colors.error : theme.colors.accent,
            },
          ]}
        />
      </View>
      <View style={styles(theme).textRow}>
        <Text style={styles(theme).text}>
          {progress.status === 'error' ? 'Sync error' : `${percent}%`}
        </Text>
        {progress.current && <Text style={styles(theme).current}>{progress.current}</Text>}
        {progress.error && <Text style={styles(theme).error}>{progress.error}</Text>}
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing[2],
      zIndex: 100,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: theme.colors.outline,
    },
    barBg: {
      width: '90%',
      height: 8,
      backgroundColor: theme.colors.outline,
      borderRadius: theme.shape.borderRadius.medium,
      overflow: 'hidden',
      marginBottom: theme.spacing[1],
    },
    bar: {
      height: 8,
      borderRadius: theme.shape.borderRadius.full,
    },
    textRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[1],
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
    current: {
      color: theme.colors.accent,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
    error: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
  });

export default SyncProgressBar;
