import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { offlineStorageService, OfflineAction } from '../services/offlineStorageService';
import { BallData, Match } from '../services/liveScoringService';

interface OfflineScoringState {
  isOnline: boolean;
  pendingActions: number;
  conflicts: number;
  lastSync: number | null;
  isSyncing: boolean;
}

interface UseOfflineScoringReturn {
  // State
  offlineState: OfflineScoringState;
  
  // Actions
  addBallOffline: (matchId: string, ballData: Omit<BallData, 'id' | 'timestamp'>) => Promise<string>;
  updateMatchOffline: (matchId: string, updates: Partial<Match>) => Promise<string>;
  createMatchOffline: (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  
  // Sync
  syncData: () => Promise<void>;
  forceSync: () => Promise<void>;
  
  // Status
  refreshStatus: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

export const useOfflineScoring = (): UseOfflineScoringReturn => {
  const [offlineState, setOfflineState] = useState<OfflineScoringState>({
    isOnline: false,
    pendingActions: 0,
    conflicts: 0,
    lastSync: null,
    isSyncing: false,
  });

  // Refresh offline status
  const refreshStatus = useCallback(async () => {
    try {
      const status = await offlineStorageService.getOfflineStatus();
      setOfflineState(prev => ({
        ...prev,
        ...status,
      }));
    } catch (error) {
      console.error('❌ Error refreshing offline status:', error);
    }
  }, []);

  // Add ball offline
  const addBallOffline = useCallback(async (
    matchId: string, 
    ballData: Omit<BallData, 'id' | 'timestamp'>
  ): Promise<string> => {
    try {
      console.log('🏏 Adding ball offline:', ballData);
      
      // Store ball data locally
      const ball: BallData = {
        id: `ball_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...ballData,
        timestamp: new Date() as any, // Will be converted to Timestamp on sync
      };
      
      await offlineStorageService.storeBallOffline(matchId, ball);
      
      // Add to action queue
      const actionId = await offlineStorageService.addOfflineAction({
        type: 'ADD_BALL',
        matchId,
        data: ballData,
      });
      
      // Update status
      await refreshStatus();
      
      console.log('✅ Ball added offline successfully');
      return actionId;
    } catch (error) {
      console.error('❌ Error adding ball offline:', error);
      throw new Error('Failed to add ball offline');
    }
  }, [refreshStatus]);

  // Update match offline
  const updateMatchOffline = useCallback(async (
    matchId: string, 
    updates: Partial<Match>
  ): Promise<string> => {
    try {
      console.log('📝 Updating match offline:', matchId, updates);
      
      // Store match data locally
      const existingMatch = await offlineStorageService.getMatchOffline(matchId);
      if (existingMatch) {
        const updatedMatch = { ...existingMatch, ...updates };
        await offlineStorageService.storeMatchOffline(updatedMatch);
      }
      
      // Add to action queue
      const actionId = await offlineStorageService.addOfflineAction({
        type: 'UPDATE_MATCH',
        matchId,
        data: updates,
      });
      
      // Update status
      await refreshStatus();
      
      console.log('✅ Match updated offline successfully');
      return actionId;
    } catch (error) {
      console.error('❌ Error updating match offline:', error);
      throw new Error('Failed to update match offline');
    }
  }, [refreshStatus]);

  // Create match offline
  const createMatchOffline = useCallback(async (
    matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      console.log('🏏 Creating match offline:', matchData.name);
      
      const matchId = `offline_match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const match: Match = {
        id: matchId,
        ...matchData,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };
      
      // Store match data locally
      await offlineStorageService.storeMatchOffline(match);
      
      // Add to action queue
      const actionId = await offlineStorageService.addOfflineAction({
        type: 'CREATE_MATCH',
        matchId,
        data: matchData,
      });
      
      // Update status
      await refreshStatus();
      
      console.log('✅ Match created offline successfully');
      return actionId;
    } catch (error) {
      console.error('❌ Error creating match offline:', error);
      throw new Error('Failed to create match offline');
    }
  }, [refreshStatus]);

  // Sync data
  const syncData = useCallback(async () => {
    if (offlineState.isSyncing) {
      console.log('🔄 Sync already in progress, skipping...');
      return;
    }

    try {
      setOfflineState(prev => ({ ...prev, isSyncing: true }));
      console.log('🔄 Starting data sync...');
      
      const result = await offlineStorageService.syncOfflineData();
      
      if (result.conflicts > 0) {
        Alert.alert(
          'Sync Conflicts',
          `Found ${result.conflicts} conflicts during sync. Please resolve them manually.`,
          [{ text: 'OK' }]
        );
      }
      
      if (result.errors > 0) {
        Alert.alert(
          'Sync Errors',
          `Encountered ${result.errors} errors during sync. Some data may not have been synced.`,
          [{ text: 'OK' }]
        );
      }
      
      if (result.success > 0) {
        console.log(`✅ Successfully synced ${result.success} actions`);
      }
      
      // Refresh status after sync
      await refreshStatus();
      
    } catch (error) {
      console.error('❌ Error during sync:', error);
      Alert.alert('Sync Error', 'Failed to sync data. Please try again.');
    } finally {
      setOfflineState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [offlineState.isSyncing, refreshStatus]);

  // Force sync (retry failed actions)
  const forceSync = useCallback(async () => {
    try {
      console.log('🔄 Force syncing...');
      await syncData();
    } catch (error) {
      console.error('❌ Error during force sync:', error);
    }
  }, [syncData]);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      Alert.alert(
        'Clear Offline Data',
        'This will remove all offline data and pending actions. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              await offlineStorageService.clearOfflineData();
              await refreshStatus();
              Alert.alert('Success', 'Offline data cleared successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      Alert.alert('Error', 'Failed to clear offline data');
    }
  }, [refreshStatus]);

  // Disabled auto-refresh to prevent page refreshing
  // Status is updated manually when needed (after adding balls, syncing, etc.)
  // useEffect(() => {
  //   const interval = setInterval(refreshStatus, 30000); // Every 30 seconds
  //   return () => clearInterval(interval);
  // }, [refreshStatus]);

  // Initial status load (only once on mount)
  useEffect(() => {
    refreshStatus();
  }, []); // Empty dependency array - only run once on mount

  return {
    offlineState,
    addBallOffline,
    updateMatchOffline,
    createMatchOffline,
    syncData,
    forceSync,
    refreshStatus,
    clearOfflineData,
  };
};
