import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ThemeButton } from './ThemeButton';
import { useTheme } from '../../styles/ThemeContext';

export interface ConflictItem {
  id: string;
  entityType: string;
  local: any;
  remote: any;
}

interface ConflictBannerProps {
  conflicts: ConflictItem[];
  autoResolvedCount?: number;
  resolvingIds?: string[];
  onResolve: (conflictId: string, resolution: any) => void;
  onMerge?: (conflictId: string) => void;
  onDismiss: () => void;
}

const ConflictBanner: React.FC<ConflictBannerProps> = ({
  conflicts,
  autoResolvedCount = 0,
  resolvingIds = [],
  onResolve,
  onMerge,
  onDismiss,
}) => {
  const theme = useTheme();
  if (conflicts.length === 0 && autoResolvedCount === 0) return null;
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>⚠️ Conflict Detected</Text>
      <Text style={styles(theme).entity}>Sync Conflict Detected</Text>
      {autoResolvedCount > 0 && (
        <Text style={styles(theme).autoResolved}>
          {autoResolvedCount} conflict{autoResolvedCount > 1 ? 's' : ''} auto-resolved
        </Text>
      )}
      <ScrollView style={styles(theme).scrollView}>
        {conflicts.map(conflict => (
          <View key={conflict.id} style={styles(theme).conflictItem}>
            <Text style={styles(theme).conflictType}>{conflict.entityType} Conflict</Text>
            <Text style={styles(theme).label}>Local Version:</Text>
            <Text style={styles(theme).json}>{JSON.stringify(conflict.local, null, 2)}</Text>
            <Text style={styles(theme).label}>Remote Version:</Text>
            <Text style={styles(theme).json}>{JSON.stringify(conflict.remote, null, 2)}</Text>
            <View style={styles(theme).actions}>
              <TouchableOpacity
                onPress={() => onResolve(conflict.id, conflict.local)}
                style={styles(theme).resolveBtn}
                accessibilityLabel="Resolve conflict"
              >
                <Text style={styles(theme).resolveText}>Keep Local</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onResolve(conflict.id, conflict.remote)}
                style={styles(theme).resolveBtn}
                accessibilityLabel="Resolve conflict"
              >
                <Text style={styles(theme).resolveText}>Keep Remote</Text>
              </TouchableOpacity>
              {onMerge && (
                <TouchableOpacity
                  onPress={() => onMerge(conflict.id)}
                  style={styles(theme).resolveBtn}
                  accessibilityLabel="Merge conflict"
                >
                  <Text style={styles(theme).resolveText}>Merge</Text>
                </TouchableOpacity>
              )}
              {resolvingIds.includes(conflict.id) && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.accent}
                  style={styles(theme).loadingIndicator}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles(theme).dismissContainer}>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles(theme).dismissBtn}
          accessibilityLabel="Dismiss conflict"
        >
          <Text style={styles(theme).dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
      {conflicts.length > 0 && (
        <Text style={styles(theme).warning}>
          Please resolve these conflicts to continue syncing.
        </Text>
      )}
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.error + '11',
      borderColor: theme.colors.error,
      borderWidth: 1,
      borderRadius: theme.shape.borderRadius.medium,
      padding: theme.spacing[3],
      marginVertical: theme.spacing[2],
    },
    title: {
      fontWeight: 'bold',
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.body,
      marginBottom: theme.spacing[1],
      fontFamily: theme.typography.fontFamily,
    },
    entity: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.body,
      marginBottom: theme.spacing[1],
      fontFamily: theme.typography.fontFamily,
    },
    autoResolved: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
    scrollView: {
      maxHeight: 200,
    },
    conflictItem: {
      marginBottom: theme.spacing[2],
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.small,
      padding: theme.spacing[2],
    },
    conflictType: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.body,
      marginBottom: theme.spacing[1],
      fontFamily: theme.typography.fontFamily,
    },
    label: {
      marginTop: theme.spacing[1],
      color: theme.colors.onSurface,
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
    json: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing[1],
      borderRadius: theme.shape.borderRadius.small,
      marginBottom: theme.spacing[1],
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing[2],
    },
    resolveBtn: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.shape.borderRadius.small,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
    },
    resolveText: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
    },
    loadingIndicator: {
      marginLeft: theme.spacing[2],
    },
    dismissContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing[2],
    },
    dismissBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.shape.borderRadius.small,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    dismissText: {
      color: theme.colors.onSurface,
      fontWeight: 'bold',
      fontSize: theme.typography.fontSize.body,
      fontFamily: theme.typography.fontFamily,
    },
    warning: {
      color: theme.colors.error,
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.caption,
      fontFamily: theme.typography.fontFamily,
    },
  });

export default ConflictBanner;
