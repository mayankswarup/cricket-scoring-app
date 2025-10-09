import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface OfflineStatusBarProps {
  offlineState: {
    isOnline: boolean;
    pendingActions: number;
    conflicts: number;
    lastSync: number | null;
    isSyncing: boolean;
  };
  onSyncPress?: () => void;
  onStatusPress?: () => void;
  onRefreshStatus?: () => void;
  onForceSync?: () => void;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  offlineState,
  onSyncPress,
  onStatusPress,
  onRefreshStatus,
  onForceSync,
}) => {

  const handleSyncPress = async () => {
    if (onSyncPress) {
      onSyncPress();
    }
  };

  const handleStatusPress = () => {
    if (onStatusPress) {
      onStatusPress();
    } else {
      Alert.alert(
        'Offline Status',
        `Status: ${offlineState.isOnline ? 'Online' : 'Offline'}\n` +
        `Pending Actions: ${offlineState.pendingActions}\n` +
        `Conflicts: ${offlineState.conflicts}\n` +
        `Last Sync: ${offlineState.lastSync ? new Date(offlineState.lastSync).toLocaleString() : 'Never'}`,
        [
          { text: 'Refresh', onPress: onRefreshStatus },
          { text: 'Force Sync', onPress: onForceSync },
          { text: 'OK' },
        ]
      );
    }
  };

  const getStatusColor = () => {
    if (offlineState.isSyncing) return COLORS.warning;
    if (offlineState.conflicts > 0) return COLORS.error;
    if (offlineState.pendingActions > 0) return COLORS.warning;
    if (offlineState.isOnline) return COLORS.success;
    return COLORS.gray;
  };

  const getStatusText = () => {
    if (offlineState.isSyncing) return 'Syncing...';
    if (offlineState.conflicts > 0) return `${offlineState.conflicts} conflicts`;
    if (offlineState.pendingActions > 0) return `${offlineState.pendingActions} pending`;
    if (offlineState.isOnline) return 'Online';
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (offlineState.isSyncing) return '🔄';
    if (offlineState.conflicts > 0) return '⚠️';
    if (offlineState.pendingActions > 0) return '📤';
    if (offlineState.isOnline) return '✅';
    return '📡';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.statusButton, { backgroundColor: getStatusColor() }]}
        onPress={handleStatusPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </TouchableOpacity>

      {(offlineState.pendingActions > 0 || offlineState.conflicts > 0) && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncPress}
          disabled={offlineState.isSyncing}
          activeOpacity={0.7}
        >
          {offlineState.isSyncing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.syncText}>Sync</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
    flex: 1,
  },
  statusIcon: {
    fontSize: SIZES.sm,
    marginRight: SIZES.xs,
  },
  statusText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.sm,
  },
  syncText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
});
