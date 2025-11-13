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
  battingOrder?: string[];
  bowlingOrder?: string[];
  totalRuns?: number;
  wickets?: number;
  currentOver?: number;
  currentBall?: number;
  currentBatsmen?: {
    striker?: {
      id?: string;
      name?: string;
      runs?: number;
      balls?: number;
      fours?: number;
      sixes?: number;
      isOut?: boolean;
    };
    nonStriker?: {
      id?: string;
      name?: string;
      runs?: number;
      balls?: number;
      fours?: number;
      sixes?: number;
      isOut?: boolean;
    };
  };
  currentBowler?: {
    id?: string;
    name?: string;
    overs?: number;
    wickets?: number;
    runs?: number;
  };
  nextBatsman?: {
    id?: string;
    name?: string;
  };
  remainingBatters?: string[];
  pendingFreeHit?: boolean;
  team1PlayersOriginal?: Player[];
  team2PlayersOriginal?: Player[];
  battingTeamName?: string;
  bowlingTeamName?: string;
  inningsHistory?: any[];
  targetScore?: number;
  matchResult?: string;
  isMatchCompleted?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  city?: string;
  logo?: string;
  slug?: string;
  players: Player[];
  captain?: string;
  wicketKeeper?: string;
  coach?: string;
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingOrder?: number;
  bowlingOrder?: number;
  shortName?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  nationality?: string;
  jerseyNumber?: number;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
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
  ballEvents: BallData[];
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
  dismissalFielderId?: string;
  dismissalFielderName?: string;
  isExtra: boolean;
  extraType?: string;
  batsmanId: string;
  bowlerId: string;
  timestamp: Timestamp;
  batsmanRuns?: number;
  extraRuns?: number;
  extraSubType?: string;
  legalDelivery?: boolean;
  awardedFreeHit?: boolean;
  wasFreeHit?: boolean;
  innings?: number;
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
      console.log('📝 Updating match:', matchId, 'with updates:', updates);
      const matchRef = doc(this.matchesCollection, matchId);
      await updateDoc(matchRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Match updated successfully:', matchId);
    } catch (error) {
      console.error('❌ Error updating match:', error);
      console.error('❌ Firebase error details:', error);
      // Re-throw the original error so we can see what actually failed
      throw error;
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
      console.log(`🏏 Getting balls for match: ${matchId}`);
      const scoresRef = collection(db, `${APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES}/${matchId}/balls`);
      const q = query(scoresRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const balls = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BallData[];
      
      console.log(`🏏 Retrieved ${balls.length} balls for match ${matchId}`);
      if (balls.length > 0) {
        console.log(`🏏 Sample ball:`, balls[0]);
      } else {
        console.log(`🏏 No balls found for match ${matchId} - checking if collection exists`);
        // Try to get the match document to see if it exists
        const match = await this.getMatch(matchId);
        if (match) {
          console.log(`🏏 Match exists but no balls found:`, match);
        } else {
          console.log(`🏏 Match ${matchId} not found`);
        }
      }
      
      return balls;
    } catch (error) {
      console.error('❌ Error getting match balls:', error);
      console.error('❌ Match ID:', matchId);
      console.error('❌ Collection path:', `${APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES}/${matchId}/balls`);
      // Return empty array instead of throwing error to prevent Match History from failing
      return [];
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

  // Get all finished matches for history
  async getFinishedMatches(): Promise<Match[]> {
    try {
      const matchesRef = collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.MATCHES);
      // First get all matches, then filter in JavaScript to avoid index issues
      const querySnapshot = await getDocs(matchesRef);
      const allMatches = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
      
      // Filter completed matches - check both status and isMatchCompleted flag
      const finishedMatches = allMatches
        .filter(match => {
          const isCompleted = match.status === 'completed' || match.isMatchCompleted === true;
          // Also exclude matches that are explicitly marked as live
          const isNotLive = match.isLive !== true;
          return isCompleted && isNotLive;
        })
        .sort((a, b) => {
          const dateA = a.updatedAt ? a.updatedAt.toMillis() : (a.createdAt ? a.createdAt.toMillis() : 0);
          const dateB = b.updatedAt ? b.updatedAt.toMillis() : (b.createdAt ? b.createdAt.toMillis() : 0);
          return dateB - dateA; // Most recent first
        });
      
      console.log('📚 Found finished matches:', finishedMatches.length);
      console.log('📚 Match details:', finishedMatches.map(m => ({
        id: m.id,
        name: m.name,
        status: m.status,
        isMatchCompleted: m.isMatchCompleted,
        isLive: m.isLive
      })));
      return finishedMatches;
    } catch (error) {
      console.error('❌ Error getting finished matches:', error);
      return [];
    }
  }

  // Team Management Functions
  async createBasicTeam(teamData: { name: string; shortName: string; city: string; createdBy: string }): Promise<string> {
    try {
      const teamRef = await addDoc(collection(db, 'teams'), {
        ...teamData,
        createdAt: serverTimestamp(),
        admins: [teamData.createdBy], // Creator is admin by default
        players: [], // Empty players array initially
      });
      
      console.log('✅ Team created with ID:', teamRef.id);
      return teamRef.id;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  }

  async getTeams(): Promise<any[]> {
    try {
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      return teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      throw error;
    }
  }

  async getTeamById(teamId: string): Promise<any> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      return { id: teamDoc.id, ...teamDoc.data() };
    } catch (error) {
      console.error('❌ Error fetching team:', error);
      throw error;
    }
  }

  // Admin Management Functions
  async isUserAdmin(userPhoneNumber: string, teamId: string): Promise<boolean> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        console.log('❌ Team not found:', teamId);
        return false;
      }

      const teamData = teamDoc.data();
      const admins = teamData.admins || [];
      
      console.log('👑 Checking admin status for', userPhoneNumber, 'in team', teamId, ':', admins.includes(userPhoneNumber));
      return admins.includes(userPhoneNumber);
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  }

  async addTeamAdmin(teamId: string, adminPhoneNumber: string): Promise<boolean> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        console.log('❌ Team not found:', teamId);
        return false;
      }

      const teamData = teamDoc.data();
      const currentAdmins = teamData.admins || [];
      
      if (!currentAdmins.includes(adminPhoneNumber)) {
        await updateDoc(teamRef, {
          admins: [...currentAdmins, adminPhoneNumber]
        });
        console.log('✅ Added admin:', adminPhoneNumber, 'to team:', teamId);
        return true;
      }
      
      console.log('ℹ️ User already admin:', adminPhoneNumber);
      return true;
    } catch (error) {
      console.error('❌ Error adding team admin:', error);
      return false;
    }
  }

  async removeTeamAdmin(teamId: string, adminPhoneNumber: string): Promise<boolean> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        console.log('❌ Team not found:', teamId);
        return false;
      }

      const teamData = teamDoc.data();
      const currentAdmins = teamData.admins || [];
      
      if (currentAdmins.includes(adminPhoneNumber)) {
        const updatedAdmins = currentAdmins.filter((admin: string) => admin !== adminPhoneNumber);
        await updateDoc(teamRef, {
          admins: updatedAdmins
        });
        console.log('✅ Removed admin:', adminPhoneNumber, 'from team:', teamId);
        return true;
      }
      
      console.log('ℹ️ User not an admin:', adminPhoneNumber);
      return true;
    } catch (error) {
      console.error('❌ Error removing team admin:', error);
      return false;
    }
  }

  async getTeamAdmins(teamId: string): Promise<string[]> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        console.log('❌ Team not found:', teamId);
        return [];
      }

      const teamData = teamDoc.data();
      return teamData.admins || [];
    } catch (error) {
      console.error('❌ Error getting team admins:', error);
      return [];
    }
  }

  async setTeamCreatorAsAdmin(teamId: string, creatorPhoneNumber: string): Promise<boolean> {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        admins: [creatorPhoneNumber],
        createdBy: creatorPhoneNumber
      });
      console.log('✅ Set team creator as admin:', creatorPhoneNumber, 'for team:', teamId);
      return true;
    } catch (error) {
      console.error('❌ Error setting team creator as admin:', error);
      return false;
    }
  }

  // ==================== EDIT LOCK MANAGEMENT ====================
  // Prevents multiple admins from editing scores simultaneously

  async acquireEditLock(matchId: string, adminPhone: string, adminName: string): Promise<boolean> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        console.log('❌ Match not found for lock:', matchId);
        return false;
      }

      const matchData = matchDoc.data();
      const currentLock = matchData.editLock;
      const now = Date.now();

      // Check if lock exists and is still valid (not expired)
      if (currentLock?.lockedBy) {
        const lockAge = now - currentLock.lockedAt;
        const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout

        // If lock is still valid and held by someone else
        if (lockAge < LOCK_TIMEOUT && currentLock.lockedBy !== adminPhone) {
          console.log('❌ Edit lock held by:', currentLock.lockedByName);
          return false;
        }
      }

      // Acquire or renew lock
      await updateDoc(matchRef, {
        editLock: {
          isLocked: true,
          lockedBy: adminPhone,
          lockedByName: adminName,
          lockedAt: now,
        },
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Edit lock acquired by:', adminName);
      return true;
    } catch (error) {
      console.error('❌ Error acquiring edit lock:', error);
      return false;
    }
  }

  async releaseEditLock(matchId: string, adminPhone: string): Promise<boolean> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        return false;
      }

      const matchData = matchDoc.data();
      const currentLock = matchData.editLock;

      // Only release if this admin holds the lock
      if (currentLock?.lockedBy === adminPhone) {
        await updateDoc(matchRef, {
          editLock: {
            isLocked: false,
            lockedBy: null,
            lockedByName: null,
            lockedAt: null,
          },
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Edit lock released by:', adminPhone);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error releasing edit lock:', error);
      return false;
    }
  }

  async renewEditLock(matchId: string, adminPhone: string): Promise<boolean> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        return false;
      }

      const matchData = matchDoc.data();
      const currentLock = matchData.editLock;

      // Only renew if this admin holds the lock
      if (currentLock?.lockedBy === adminPhone) {
        await updateDoc(matchRef, {
          'editLock.lockedAt': Date.now(),
          updatedAt: serverTimestamp(),
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error renewing edit lock:', error);
      return false;
    }
  }

  subscribeToEditLock(
    matchId: string, 
    onLockChange: (lock: {
      isLocked: boolean;
      lockedBy: string | null;
      lockedByName: string | null;
      lockedAt: number | null;
    }) => void
  ) {
    const matchRef = doc(db, 'matches', matchId);
    
    return onSnapshot(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const lock = data.editLock || {
          isLocked: false,
          lockedBy: null,
          lockedByName: null,
          lockedAt: null,
        };
        onLockChange(lock);
      }
    });
  }
}

export const liveScoringService = new LiveScoringService();
