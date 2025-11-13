import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import MatchDetailsModal from '../components/MatchDetailsModal';
import { liveScoringService, Match } from '../services/liveScoringService';

interface MatchWithScores extends Match {
  totalRuns?: number;
  wickets?: number;
  currentOver?: number;
  currentBall?: number;
  ballsCount?: number;
  team1Score?: string; // Format: "runs/wickets"
  team2Score?: string; // Format: "runs/wickets"
}

interface MatchHistoryScreenProps {
  onBack: () => void;
}

export const MatchHistoryScreen: React.FC<MatchHistoryScreenProps> = ({ onBack }) => {
  const [matches, setMatches] = useState<MatchWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithScores | null>(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const loadMatchHistory = async () => {
    try {
      console.log('📚 Loading match history...');
      const finishedMatches = await liveScoringService.getFinishedMatches();
      console.log('📚 Retrieved matches:', finishedMatches.length);
      
      if (finishedMatches.length === 0) {
        console.log('📚 No finished matches found');
        setMatches([]);
        return;
      }
      
      // Fetch detailed scoring data for each match
      console.log('📊 Loading detailed scoring data for matches...');
      const matchesWithScores = await Promise.all(
        finishedMatches.map(async (match, index) => {
          try {
            console.log(`📊 Loading balls for match ${index + 1}/${finishedMatches.length}: ${match.id}`);
            console.log(`📊 Match details: ${match.team1.name} vs ${match.team2.name}, Status: ${match.status}`);
            
            // Get balls data for this match
            const balls = await liveScoringService.getMatchBalls(match.id);
            console.log(`📊 Retrieved ${balls.length} balls for match ${match.id}`);
            
            if (balls.length > 0) {
              console.log('📊 Sample ball data:', balls[0]);
            }
            
            // Calculate totals from balls - separate by innings if available
            let team1Runs = 0;
            let team1Wickets = 0;
            let team2Runs = 0;
            let team2Wickets = 0;
            
            // Check if match has inningsHistory
            const inningsHistory = (match as any).inningsHistory || [];
            
            if (inningsHistory.length > 0) {
              // Use innings history if available
              const firstInnings = inningsHistory[0];
              team1Runs = firstInnings.totalRuns || 0;
              team1Wickets = firstInnings.wickets || 0;
              
              if (inningsHistory.length > 1) {
                const secondInnings = inningsHistory[1];
                team2Runs = secondInnings.totalRuns || 0;
                team2Wickets = secondInnings.wickets || 0;
              }
            } else {
              // Calculate from balls - separate by innings number
              const innings1Balls = balls.filter(ball => (ball.innings || 1) === 1);
              const innings2Balls = balls.filter(ball => (ball.innings || 2) === 2);
              
              // Team1 batting in innings 1
              team1Runs = innings1Balls.reduce((sum, ball) => {
                if (ball.isExtra) return sum;
                return sum + (ball.batsmanRuns || ball.runs || 0);
              }, 0);
              team1Wickets = innings1Balls.filter(ball => ball.isWicket).length;
              
              // Team2 batting in innings 2 (if exists)
              if (innings2Balls.length > 0) {
                team2Runs = innings2Balls.reduce((sum, ball) => {
                  if (ball.isExtra) return sum;
                  return sum + (ball.batsmanRuns || ball.runs || 0);
                }, 0);
                team2Wickets = innings2Balls.filter(ball => ball.isWicket).length;
              } else {
                // If no second innings, use match totals as team1 score
                const totalRuns = balls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
                const totalWickets = balls.filter(ball => ball.isWicket).length;
                team1Runs = totalRuns;
                team1Wickets = totalWickets;
              }
            }
            
            const totalBalls = balls.length;
            const overs = Math.floor(totalBalls / 6);
            const ballsInOver = totalBalls % 6;
            
            console.log(`📊 Match ${index + 1} stats: Team1 ${team1Runs}/${team1Wickets}, Team2 ${team2Runs}/${team2Wickets}, ${totalBalls} balls`);
            
            // If no balls found, try to get basic match info from the match document itself
            if (totalBalls === 0) {
              console.log(`📊 No balls found for match ${match.id}, using match document data`);
              // Check if match has any scoring data stored directly
              const matchRuns = (match as any).totalRuns || 0;
              const matchWickets = (match as any).wickets || 0;
              const matchOvers = (match as any).currentOver || 0;
              const matchBalls = (match as any).currentBall || 0;
              
              return {
                ...match,
                totalRuns: matchRuns,
                wickets: matchWickets,
                currentOver: matchOvers,
                currentBall: matchBalls,
                ballsCount: 0,
                team1Score: `${matchRuns}/${matchWickets}`,
                team2Score: undefined,
              };
            }
            
            return {
              ...match,
              totalRuns: team1Runs, // Keep for backward compatibility
              wickets: team1Wickets,
              currentOver: overs,
              currentBall: ballsInOver,
              ballsCount: totalBalls,
              team1Score: `${team1Runs}/${team1Wickets}`,
              team2Score: team2Runs > 0 || team2Wickets > 0 ? `${team2Runs}/${team2Wickets}` : undefined,
            };
          } catch (error) {
            console.error(`❌ Error loading balls for match ${match.id}:`, error);
            return {
              ...match,
              totalRuns: 0,
              wickets: 0,
              currentOver: 0,
              currentBall: 0,
              ballsCount: 0
            };
          }
        })
      );
      
      // Sort by createdAt (most recent first), then by updatedAt if createdAt is same
      matchesWithScores.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        if (dateB !== dateA) {
          return dateB - dateA; // Most recent first
        }
        // If createdAt is same, sort by updatedAt
        const updatedA = a.updatedAt?.seconds || 0;
        const updatedB = b.updatedAt?.seconds || 0;
        return updatedB - updatedA;
      });
      
      console.log('📊 Final matches with scores (sorted):', matchesWithScores.length);
      setMatches(matchesWithScores);
    } catch (error) {
      console.error('❌ Error loading match history:', error);
      Alert.alert('Error', 'Failed to load match history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMatchPress = (match: MatchWithScores) => {
    console.log('🔍 Opening match details:', {
      matchId: match.id,
      matchName: match.name,
      team1: match.team1?.name,
      team2: match.team2?.name,
      fullMatch: match,
    });
    setSelectedMatch(match);
    setShowMatchDetails(true);
  };

  const handleCloseMatchDetails = () => {
    setShowMatchDetails(false);
    setSelectedMatch(null);
  };

  useEffect(() => {
    loadMatchHistory();
  }, []);

  // Refresh match history when screen is opened (after initial load)
  useEffect(() => {
    // Small delay to ensure any pending Firebase writes complete
    const timer = setTimeout(() => {
      console.log('🔄 Refreshing match history after delay');
      loadMatchHistory();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMatchHistory();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleTimeString();
  };

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') {
      return '✅ Completed';
    }
    return '🔄 In Progress';
  };

  const getMatchScore = (match: MatchWithScores) => {
    // Use team1Score and team2Score if available, otherwise fallback to old format
    if (match.team1Score) {
      if (match.team2Score) {
        // Both innings completed
        return `${match.team1Score} | ${match.team2Score}`;
      } else {
        // Only first innings
        const overs = match.currentOver || 0;
        const balls = match.currentBall || 0;
        return `${match.team1Score} (${overs}.${balls})`;
      }
    }
    
    // Fallback to old format
    const runs = match.totalRuns || 0;
    const wickets = match.wickets || 0;
    const overs = match.currentOver || 0;
    const balls = match.currentBall || 0;
    const ballsCount = match.ballsCount || 0;
    
    if (ballsCount === 0) {
      // Check if match has any basic scoring data
      if (runs > 0 || wickets > 0) {
        return `${runs}/${wickets} (${overs}.${balls})`;
      }
      return 'Match completed (no detailed scoring)';
    }
    
    return `${runs}/${wickets} (${overs}.${balls})`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading match history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match History</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>📚 No Match History</Text>
            <Text style={styles.emptyText}>
              You haven't completed any matches yet.{'\n'}
              Finish a match to see it here!
            </Text>
          </View>
        ) : (
          <View style={styles.matchesContainer}>
            <Text style={styles.matchesCount}>
              📊 {matches.length} Completed Match{matches.length !== 1 ? 'es' : ''}
            </Text>
            
            {matches.map((match, index) => (
              <TouchableOpacity 
                key={match.id} 
                style={styles.matchCard}
                onPress={() => handleMatchPress(match)}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchNumber}>#{index + 1}</Text>
                  <Text style={styles.matchStatus}>{getMatchStatus(match)}</Text>
                </View>
                
                <View style={styles.matchTeams}>
                  <Text style={styles.teamName}>{match.team1.name}</Text>
                  <Text style={styles.vsText}>vs</Text>
                  <Text style={styles.teamName}>{match.team2.name}</Text>
                </View>
                
                <View style={styles.matchScore}>
                  <Text style={styles.scoreText}>{getMatchScore(match)}</Text>
                </View>
                
                <View style={styles.matchDetails}>
                  <Text style={styles.detailText}>
                    📅 {formatDate(match.updatedAt || match.createdAt)}
                  </Text>
                  <Text style={styles.detailText}>
                    🕐 {formatTime(match.updatedAt || match.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.matchStats}>
                  <Text style={styles.statsText}>
                    🏏 {(match.ballsCount || 0) > 0 ? `${match.ballsCount} balls played` : 'Basic match data'}
                  </Text>
                  <Text style={styles.statsText}>
                    ⚡ Run Rate: {(match.ballsCount || 0) > 0 ? (((match.totalRuns || 0) / ((match.ballsCount || 0) / 6))).toFixed(2) : 'N/A'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Match Details Modal */}
      {selectedMatch && showMatchDetails && (
        <MatchDetailsModal
          onClose={handleCloseMatchDetails}
          match={selectedMatch}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginRight: SIZES.md,
  },
  backButtonText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: SIZES.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  matchesContainer: {
    padding: SIZES.lg,
  },
  matchesCount: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  matchNumber: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  matchStatus: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginHorizontal: SIZES.sm,
  },
  matchScore: {
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  scoreText: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  matchStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
