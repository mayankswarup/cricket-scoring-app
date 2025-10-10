import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface BattingStats {
  playerId: string;
  playerName: string;
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  highScore: number;
  notOuts: number;
  average: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  ducks: number;
}

export interface BowlingStats {
  playerId: string;
  playerName: string;
  matches: number;
  innings: number;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  bestFigures: string;
  average: number;
  economy: number;
  strikeRate: number;
  fourWickets: number;
  fiveWickets: number;
  dotBalls: number;
}

export interface FieldingStats {
  playerId: string;
  playerName: string;
  matches: number;
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface PlayerStatistics {
  playerId: string;
  playerName: string;
  phoneNumber: string;
  batting: BattingStats;
  bowling: BowlingStats;
  fielding: FieldingStats;
  lastUpdated: any;
}

class StatisticsService {
  
  // Calculate player statistics from all matches
  async calculatePlayerStats(playerId: string): Promise<PlayerStatistics | null> {
    try {
      console.log('📊 Calculating stats for player:', playerId);
      
      // Get all matches where player participated
      const matchesQuery = query(
        collection(db, 'matches'),
        where('status', '==', 'completed')
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Initialize stats
      const battingStats: BattingStats = {
        playerId,
        playerName: '',
        matches: 0,
        innings: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        highScore: 0,
        notOuts: 0,
        average: 0,
        strikeRate: 0,
        fifties: 0,
        hundreds: 0,
        ducks: 0,
      };
      
      const bowlingStats: BowlingStats = {
        playerId,
        playerName: '',
        matches: 0,
        innings: 0,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        bestFigures: '0/0',
        average: 0,
        economy: 0,
        strikeRate: 0,
        fourWickets: 0,
        fiveWickets: 0,
        dotBalls: 0,
      };
      
      const fieldingStats: FieldingStats = {
        playerId,
        playerName: '',
        matches: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
      };
      
      // Process each match
      for (const match of matches) {
        // Get all balls for this match
        const ballsQuery = query(
          collection(db, 'matches', match.id, 'balls')
        );
        const ballsSnapshot = await getDocs(ballsQuery);
        const balls = ballsSnapshot.docs.map(doc => doc.data());
        
        // Check if player participated
        const playerBalls = balls.filter(ball => 
          ball.batsmanId === playerId || ball.bowlerId === playerId
        );
        
        if (playerBalls.length > 0) {
          // Process batting stats
          const battingBalls = balls.filter(ball => ball.batsmanId === playerId);
          if (battingBalls.length > 0) {
            battingStats.innings++;
            
            const inningsRuns = battingBalls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
            const inningsBalls = battingBalls.length;
            const inningsFours = battingBalls.filter(ball => ball.runs === 4).length;
            const inningsSixes = battingBalls.filter(ball => ball.runs === 6).length;
            const isOut = battingBalls.some(ball => ball.isWicket);
            
            battingStats.runs += inningsRuns;
            battingStats.balls += inningsBalls;
            battingStats.fours += inningsFours;
            battingStats.sixes += inningsSixes;
            
            if (!isOut) battingStats.notOuts++;
            if (inningsRuns === 0 && isOut) battingStats.ducks++;
            if (inningsRuns >= 50 && inningsRuns < 100) battingStats.fifties++;
            if (inningsRuns >= 100) battingStats.hundreds++;
            if (inningsRuns > battingStats.highScore) battingStats.highScore = inningsRuns;
          }
          
          // Process bowling stats
          const bowlingBalls = balls.filter(ball => ball.bowlerId === playerId);
          if (bowlingBalls.length > 0) {
            bowlingStats.innings++;
            
            const bowlingRuns = bowlingBalls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
            const bowlingWickets = bowlingBalls.filter(ball => ball.isWicket).length;
            const bowlingOvers = Math.floor(bowlingBalls.length / 6) + (bowlingBalls.length % 6) / 10;
            const dotBalls = bowlingBalls.filter(ball => ball.runs === 0 && !ball.isWide && !ball.isNoBall).length;
            
            bowlingStats.runs += bowlingRuns;
            bowlingStats.wickets += bowlingWickets;
            bowlingStats.overs += bowlingOvers;
            bowlingStats.dotBalls += dotBalls;
            
            // Track best figures
            const currentFigures = `${bowlingWickets}/${bowlingRuns}`;
            if (bowlingWickets > parseInt(bowlingStats.bestFigures.split('/')[0])) {
              bowlingStats.bestFigures = currentFigures;
            }
            
            if (bowlingWickets === 4) bowlingStats.fourWickets++;
            if (bowlingWickets >= 5) bowlingStats.fiveWickets++;
          }
          
          battingStats.matches++;
          bowlingStats.matches++;
          fieldingStats.matches++;
        }
      }
      
      // Calculate averages
      const dismissals = battingStats.innings - battingStats.notOuts;
      battingStats.average = dismissals > 0 ? battingStats.runs / dismissals : battingStats.runs;
      battingStats.strikeRate = battingStats.balls > 0 ? (battingStats.runs / battingStats.balls) * 100 : 0;
      
      bowlingStats.average = bowlingStats.wickets > 0 ? bowlingStats.runs / bowlingStats.wickets : 0;
      bowlingStats.economy = bowlingStats.overs > 0 ? bowlingStats.runs / bowlingStats.overs : 0;
      bowlingStats.strikeRate = bowlingStats.wickets > 0 ? bowlingStats.balls / bowlingStats.wickets : 0;
      
      // Get player info
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      const playerName = playerDoc.exists() ? playerDoc.data().name : 'Unknown Player';
      const phoneNumber = playerDoc.exists() ? playerDoc.data().phoneNumber : '';
      
      battingStats.playerName = playerName;
      bowlingStats.playerName = playerName;
      fieldingStats.playerName = playerName;
      
      const playerStats: PlayerStatistics = {
        playerId,
        playerName,
        phoneNumber,
        batting: battingStats,
        bowling: bowlingStats,
        fielding: fieldingStats,
        lastUpdated: serverTimestamp(),
      };
      
      // Save to Firebase for caching
      await setDoc(doc(db, 'playerStatistics', playerId), playerStats);
      
      console.log('✅ Stats calculated for:', playerName);
      return playerStats;
      
    } catch (error) {
      console.error('❌ Error calculating player stats:', error);
      return null;
    }
  }
  
  // Get cached player statistics
  async getPlayerStats(playerId: string): Promise<PlayerStatistics | null> {
    try {
      const statsDoc = await getDoc(doc(db, 'playerStatistics', playerId));
      
      if (statsDoc.exists()) {
        return statsDoc.data() as PlayerStatistics;
      }
      
      // If not cached, calculate fresh
      return await this.calculatePlayerStats(playerId);
      
    } catch (error) {
      console.error('❌ Error getting player stats:', error);
      return null;
    }
  }
  
  // Search players by name or phone
  async searchPlayers(searchQuery: string): Promise<any[]> {
    try {
      const playersQuery = query(collection(db, 'players'));
      const playersSnapshot = await getDocs(playersQuery);
      
      const players = playersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(player => 
          player.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.phoneNumber?.includes(searchQuery)
        );
      
      return players;
      
    } catch (error) {
      console.error('❌ Error searching players:', error);
      return [];
    }
  }
  
  // Get team statistics
  async getTeamStats(teamId: string): Promise<PlayerStatistics[]> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      
      if (!teamDoc.exists()) {
        return [];
      }
      
      const team = teamDoc.data();
      const playerIds = team.players || [];
      
      const teamStats: PlayerStatistics[] = [];
      
      for (const playerId of playerIds) {
        const stats = await this.getPlayerStats(playerId);
        if (stats) {
          teamStats.push(stats);
        }
      }
      
      return teamStats;
      
    } catch (error) {
      console.error('❌ Error getting team stats:', error);
      return [];
    }
  }
  
  // Recalculate stats for all players in a match (call after match ends)
  async updateMatchPlayerStats(matchId: string): Promise<void> {
    try {
      console.log('📊 Updating stats for match:', matchId);
      
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      if (!matchDoc.exists()) return;
      
      const match = matchDoc.data();
      const allPlayers = [
        ...(match.team1?.players || []),
        ...(match.team2?.players || [])
      ];
      
      for (const playerId of allPlayers) {
        await this.calculatePlayerStats(playerId);
      }
      
      console.log('✅ Stats updated for all players in match');
      
    } catch (error) {
      console.error('❌ Error updating match player stats:', error);
    }
  }
}

export const statisticsService = new StatisticsService();

