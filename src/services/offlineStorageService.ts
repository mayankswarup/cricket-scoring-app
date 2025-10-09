import AsyncStorage from '@react-native-async-storage/async-storage';
import { BallData, Match } from './liveScoringService';

// Offline storage keys
const OFFLINE_KEYS = {
  MATCHES: 'offline_matches',
  BALLS: 'offline_balls',
  PENDING_ACTIONS: 'offline_pending_actions',
  CONFLICT_RESOLUTION: 'offline_conflicts',
  LAST_SYNC: 'offline_last_sync',
};

// Offline action types
export interface OfflineAction {
  id: string;
  type: 'ADD_BALL' | 'UPDATE_MATCH' | 'CREATE_MATCH' | 'DELETE_MATCH';
  matchId: string;
  data: any;
  timestamp: number;
  deviceId: string;
  sequenceNumber: number;
}

// Conflict resolution data
export interface ConflictData {
  matchId: string;
  localActions: OfflineAction[];
  serverActions: OfflineAction[];
  resolution: 'LOCAL_WINS' | 'SERVER_WINS' | 'MERGE' | 'MANUAL';
  resolvedAt?: number;
}

class OfflineStorageService {
  private deviceId: string;
  private sequenceCounter: number = 0;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.loadSequenceCounter();
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadSequenceCounter(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`${OFFLINE_KEYS.PENDING_ACTIONS}_counter`);
      this.sequenceCounter = stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('❌ Error loading sequence counter:', error);
      this.sequenceCounter = 0;
    }
  }

  private async saveSequenceCounter(): Promise<void> {
    try {
      await AsyncStorage.setItem(`${OFFLINE_KEYS.PENDING_ACTIONS}_counter`, this.sequenceCounter.toString());
    } catch (error) {
      console.error('❌ Error saving sequence counter:', error);
    }
  }

  // Store match data offline
  async storeMatchOffline(match: Match): Promise<void> {
    try {
      console.log('💾 Storing match offline:', match.id);
      const key = `${OFFLINE_KEYS.MATCHES}_${match.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(match));
      console.log('✅ Match stored offline successfully');
    } catch (error) {
      console.error('❌ Error storing match offline:', error);
      throw new Error('Failed to store match offline');
    }
  }

  // Get match data from offline storage
  async getMatchOffline(matchId: string): Promise<Match | null> {
    try {
      const key = `${OFFLINE_KEYS.MATCHES}_${matchId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Error getting match offline:', error);
      return null;
    }
  }

  // Store ball data offline
  async storeBallOffline(matchId: string, ball: BallData): Promise<void> {
    try {
      console.log('💾 Storing ball offline:', ball.id);
      const key = `${OFFLINE_KEYS.BALLS}_${matchId}`;
      
      // Get existing balls
      const existing = await this.getBallsOffline(matchId);
      const updatedBalls = [...existing, ball];
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedBalls));
      console.log('✅ Ball stored offline successfully');
    } catch (error) {
      console.error('❌ Error storing ball offline:', error);
      throw new Error('Failed to store ball offline');
    }
  }

  // Get balls data from offline storage
  async getBallsOffline(matchId: string): Promise<BallData[]> {
    try {
      const key = `${OFFLINE_KEYS.BALLS}_${matchId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting balls offline:', error);
      return [];
    }
  }

  // Add offline action to queue
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'deviceId' | 'sequenceNumber'>): Promise<string> {
    try {
      this.sequenceCounter++;
      const actionId = `action_${Date.now()}_${this.sequenceCounter}`;
      
      const offlineAction: OfflineAction = {
        id: actionId,
        ...action,
        timestamp: Date.now(),
        deviceId: this.deviceId,
        sequenceNumber: this.sequenceCounter,
      };

      console.log('📝 Adding offline action:', actionId, action.type);
      
      // Get existing actions
      const existing = await this.getPendingActions();
      const updatedActions = [...existing, offlineAction];
      
      await AsyncStorage.setItem(OFFLINE_KEYS.PENDING_ACTIONS, JSON.stringify(updatedActions));
      await this.saveSequenceCounter();
      
      console.log('✅ Offline action added successfully');
      return actionId;
    } catch (error) {
      console.error('❌ Error adding offline action:', error);
      throw new Error('Failed to add offline action');
    }
  }

  // Get pending offline actions
  async getPendingActions(): Promise<OfflineAction[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_KEYS.PENDING_ACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting pending actions:', error);
      return [];
    }
  }

  // Remove completed action
  async removeAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      const filtered = actions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(OFFLINE_KEYS.PENDING_ACTIONS, JSON.stringify(filtered));
      console.log('✅ Action removed:', actionId);
    } catch (error) {
      console.error('❌ Error removing action:', error);
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    try {
      console.log('🧹 Clearing all offline data...');
      await AsyncStorage.multiRemove([
        OFFLINE_KEYS.MATCHES,
        OFFLINE_KEYS.BALLS,
        OFFLINE_KEYS.PENDING_ACTIONS,
        OFFLINE_KEYS.CONFLICT_RESOLUTION,
        OFFLINE_KEYS.LAST_SYNC,
        `${OFFLINE_KEYS.PENDING_ACTIONS}_counter`,
      ]);
      console.log('✅ Offline data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
    }
  }

  // Check if device is online
  async isOnline(): Promise<boolean> {
    try {
      // For web browsers, use navigator.onLine
      if (typeof navigator !== 'undefined') {
        return navigator.onLine;
      }
      
      // For React Native, try a simple network check
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Sync offline data with server
  async syncOfflineData(): Promise<{ success: number; conflicts: number; errors: number }> {
    try {
      console.log('🔄 Starting offline data sync...');
      
      const isOnline = await this.isOnline();
      if (!isOnline) {
        console.log('📡 Device is offline, skipping sync');
        return { success: 0, conflicts: 0, errors: 0 };
      }

      const actions = await this.getPendingActions();
      let successCount = 0;
      let conflictCount = 0;
      let errorCount = 0;

      console.log(`📊 Found ${actions.length} pending actions to sync`);

      for (const action of actions) {
        try {
          console.log(`🔄 Syncing action: ${action.id} (${action.type})`);
          
          // Import liveScoringService dynamically to avoid circular dependencies
          const { liveScoringService } = await import('./liveScoringService');
          
          switch (action.type) {
            case 'ADD_BALL':
              await liveScoringService.addBall(action.matchId, action.data);
              break;
            case 'UPDATE_MATCH':
              await liveScoringService.updateMatch(action.matchId, action.data);
              break;
            case 'CREATE_MATCH':
              await liveScoringService.createMatch(action.data);
              break;
            case 'DELETE_MATCH':
              // Implement delete match if needed
              break;
          }
          
          // Remove successful action
          await this.removeAction(action.id);
          successCount++;
          console.log(`✅ Action synced successfully: ${action.id}`);
          
        } catch (error) {
          console.error(`❌ Error syncing action ${action.id}:`, error);
          
          // Check if it's a conflict error
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('conflict') || errorMessage.includes('version')) {
            conflictCount++;
            await this.handleConflict(action);
          } else {
            errorCount++;
          }
        }
      }

      // Update last sync time
      await AsyncStorage.setItem(OFFLINE_KEYS.LAST_SYNC, Date.now().toString());
      
      console.log(`✅ Sync completed: ${successCount} success, ${conflictCount} conflicts, ${errorCount} errors`);
      return { success: successCount, conflicts: conflictCount, errors: errorCount };
      
    } catch (error) {
      console.error('❌ Error during sync:', error);
      return { success: 0, conflicts: 0, errors: 1 };
    }
  }

  // Handle conflict resolution
  private async handleConflict(action: OfflineAction): Promise<void> {
    try {
      console.log(`🔧 Handling conflict for action: ${action.id}`);
      
      const conflictData: ConflictData = {
        matchId: action.matchId,
        localActions: [action],
        serverActions: [], // Would be populated from server
        resolution: 'MANUAL', // Default to manual resolution
      };
      
      // Store conflict for manual resolution
      const conflicts = await this.getConflicts();
      conflicts.push(conflictData);
      await AsyncStorage.setItem(OFFLINE_KEYS.CONFLICT_RESOLUTION, JSON.stringify(conflicts));
      
      console.log('⚠️ Conflict stored for manual resolution');
    } catch (error) {
      console.error('❌ Error handling conflict:', error);
    }
  }

  // Get stored conflicts
  async getConflicts(): Promise<ConflictData[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_KEYS.CONFLICT_RESOLUTION);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting conflicts:', error);
      return [];
    }
  }

  // Resolve conflict
  async resolveConflict(conflictId: string, resolution: ConflictData['resolution']): Promise<void> {
    try {
      const conflicts = await this.getConflicts();
      const conflict = conflicts.find(c => c.matchId === conflictId);
      
      if (conflict) {
        conflict.resolution = resolution;
        conflict.resolvedAt = Date.now();
        
        await AsyncStorage.setItem(OFFLINE_KEYS.CONFLICT_RESOLUTION, JSON.stringify(conflicts));
        console.log(`✅ Conflict resolved: ${conflictId} -> ${resolution}`);
      }
    } catch (error) {
      console.error('❌ Error resolving conflict:', error);
    }
  }

  // Get offline status
  async getOfflineStatus(): Promise<{
    isOnline: boolean;
    pendingActions: number;
    conflicts: number;
    lastSync: number | null;
  }> {
    try {
      const isOnline = await this.isOnline();
      const actions = await this.getPendingActions();
      const conflicts = await this.getConflicts();
      const lastSync = await AsyncStorage.getItem(OFFLINE_KEYS.LAST_SYNC);
      
      return {
        isOnline,
        pendingActions: actions.length,
        conflicts: conflicts.length,
        lastSync: lastSync ? parseInt(lastSync, 10) : null,
      };
    } catch (error) {
      console.error('❌ Error getting offline status:', error);
      return {
        isOnline: false,
        pendingActions: 0,
        conflicts: 0,
        lastSync: null,
      };
    }
  }
}

export const offlineStorageService = new OfflineStorageService();
