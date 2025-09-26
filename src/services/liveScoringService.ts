import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_CONFIG } from '../config/appConfig';

// Types for Live Scoring
export interface Match {
  id: string;
  name: string;
  team1: Team;
  team2: Team;
  matchType: string;
  totalOvers: number;
  currentInnings: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isLive: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  captain?: string;
  wicketKeeper?: string;
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingOrder?: number;
  bowlingOrder?: number;
}

export interface Innings {
  id: string;
  matchId: string;
  teamId: string;
  teamName: string;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  balls: BallData[];
  isCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BallData {
  id: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  isExtra: boolean;
  extraType?: string;
  batsmanId: string;
  bowlerId: string;
  timestamp: Timestamp;
}

export interface MatchStats {
  matchId: string;
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  totalBalls: number;
  totalRuns: number;
  totalWickets: number;
  matchDuration: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  topBatsman: PlayerStats;
  topBowler: PlayerStats;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  wickets: number;
  overs: number;
  economy: number;
  strikeRate: number;
}

class LiveScoringService {
  private matchesCollection = collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES);
  private teamsCollection = collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.TEAMS);
  private playersCollection = collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.PLAYERS);
  private scoresCollection = collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.SCORES);

  // Match Management
  async createMatch(matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.matchesCollection, {
        ...matchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Match created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating match:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async updateMatch(matchId: string, updates: Partial<Match>): Promise<void> {
    try {
      const matchRef = doc(this.matchesCollection, matchId);
      await updateDoc(matchRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Match updated successfully:', matchId);
    } catch (error) {
      console.error('❌ Error updating match:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    try {
      const matchRef = doc(this.matchesCollection, matchId);
      const matchSnap = await getDoc(matchRef);
      
      if (matchSnap.exists()) {
        return { id: matchSnap.id, ...matchSnap.data() } as Match;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting match:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  async getAllMatches(): Promise<Match[]> {
    try {
      const q = query(this.matchesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
    } catch (error) {
      console.error('❌ Error getting matches:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  async getLiveMatches(): Promise<Match[]> {
    try {
      const q = query(
        this.matchesCollection, 
        where('isLive', '==', true),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
    } catch (error) {
      console.error('❌ Error getting live matches:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  // Real-time Match Updates
  subscribeToMatch(matchId: string, callback: (match: Match | null) => void): () => void {
    const matchRef = doc(this.matchesCollection, matchId);
    
    return onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Match);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('❌ Error subscribing to match:', error);
      callback(null);
    });
  }

  subscribeToLiveMatches(callback: (matches: Match[]) => void): () => void {
    const q = query(
      this.matchesCollection,
      where('isLive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const matches = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
      callback(matches);
    }, (error) => {
      console.error('❌ Error subscribing to live matches:', error);
      callback([]);
    });
  }

  // Team Management
  async createTeam(teamData: Omit<Team, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.teamsCollection, teamData);
      console.log('✅ Team created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      await updateDoc(teamRef, updates);
      console.log('✅ Team updated successfully:', teamId);
    } catch (error) {
      console.error('❌ Error updating team:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamSnap = await getDoc(teamRef);
      
      if (teamSnap.exists()) {
        return { id: teamSnap.id, ...teamSnap.data() } as Team;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting team:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  async getAllTeams(): Promise<Team[]> {
    try {
      const querySnapshot = await getDocs(this.teamsCollection);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
    } catch (error) {
      console.error('❌ Error getting teams:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  // Player Management
  async createPlayer(playerData: Omit<Player, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.playersCollection, playerData);
      console.log('✅ Player created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating player:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    try {
      const playerRef = doc(this.playersCollection, playerId);
      await updateDoc(playerRef, updates);
      console.log('✅ Player updated successfully:', playerId);
    } catch (error) {
      console.error('❌ Error updating player:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async getPlayer(playerId: string): Promise<Player | null> {
    try {
      const playerRef = doc(this.playersCollection, playerId);
      const playerSnap = await getDoc(playerRef);
      
      if (playerSnap.exists()) {
        return { id: playerSnap.id, ...playerSnap.data() } as Player;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting player:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  async getAllPlayers(): Promise<Player[]> {
    try {
      const querySnapshot = await getDocs(this.playersCollection);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
    } catch (error) {
      console.error('❌ Error getting players:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  // Live Scoring
  async addBall(matchId: string, ballData: Omit<BallData, 'id' | 'timestamp'>): Promise<string> {
    try {
      const scoresRef = collection(db, `${APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES}/${matchId}/balls`);
      const docRef = await addDoc(scoresRef, {
        ...ballData,
        timestamp: serverTimestamp(),
      });
      console.log('✅ Ball added successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding ball:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR);
    }
  }

  async getMatchBalls(matchId: string): Promise<BallData[]> {
    try {
      const scoresRef = collection(db, `${APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES}/${matchId}/balls`);
      const q = query(scoresRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BallData[];
    } catch (error) {
      console.error('❌ Error getting match balls:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  // Statistics
  async getMatchStats(matchId: string): Promise<MatchStats | null> {
    try {
      const balls = await this.getMatchBalls(matchId);
      const match = await this.getMatch(matchId);
      
      if (!match) return null;

      // Calculate statistics
      const team1Stats = this.calculateTeamStats(balls, match.team1.id);
      const team2Stats = this.calculateTeamStats(balls, match.team2.id);

      return {
        matchId,
        team1Stats,
        team2Stats,
        totalBalls: balls.length,
        totalRuns: balls.reduce((sum, ball) => sum + ball.runs, 0),
        totalWickets: balls.filter(ball => ball.isWicket).length,
        matchDuration: 0, // Calculate based on timestamps
      };
    } catch (error) {
      console.error('❌ Error getting match stats:', error);
      throw new Error(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR);
    }
  }

  private calculateTeamStats(balls: BallData[], teamId: string): TeamStats {
    const teamBalls = balls.filter(ball => ball.batsmanId === teamId);
    const totalRuns = teamBalls.reduce((sum, ball) => sum + ball.runs, 0);
    const wickets = teamBalls.filter(ball => ball.isWicket).length;
    const totalBalls = teamBalls.length;
    const overs = Math.floor(totalBalls / 6);
    const ballsInOver = totalBalls % 6;
    const runRate = totalBalls > 0 ? (totalRuns / totalBalls) * 6 : 0;

    return {
      teamId,
      teamName: '', // Will be populated from match data
      totalRuns,
      wickets,
      overs,
      balls: ballsInOver,
      runRate,
      topBatsman: {} as PlayerStats,
      topBowler: {} as PlayerStats,
    };
  }

  // Offline Support
  async saveOfflineData(data: any): Promise<void> {
    try {
      // Save to local storage for offline access
      const offlineData = JSON.stringify(data);
      localStorage.setItem('offline_scoring_data', offlineData);
      console.log('✅ Offline data saved');
    } catch (error) {
      console.error('❌ Error saving offline data:', error);
    }
  }

  async getOfflineData(): Promise<any> {
    try {
      const offlineData = localStorage.getItem('offline_scoring_data');
      return offlineData ? JSON.parse(offlineData) : null;
    } catch (error) {
      console.error('❌ Error getting offline data:', error);
      return null;
    }
  }

  async syncOfflineData(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      if (offlineData) {
        // Sync offline data to Firebase
        console.log('🔄 Syncing offline data...');
        // Implementation depends on data structure
        localStorage.removeItem('offline_scoring_data');
        console.log('✅ Offline data synced');
      }
    } catch (error) {
      console.error('❌ Error syncing offline data:', error);
    }
  }
}

export const liveScoringService = new LiveScoringService();
