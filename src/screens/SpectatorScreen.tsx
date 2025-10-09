import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import LiveScorecard from '../components/LiveScorecard';
import { liveScoringService, Match } from '../services/liveScoringService';

interface SpectatorScreenProps {
  onBack: () => void;
  matchId: string;
}

interface MatchData {
  id: string;
  team1: string;
  team2: string;
  overs: number;
  currentInnings: number;
  currentOver: number;
  currentBall: number;
  totalRuns: number;
  wickets: number;
  currentBatsmen: {
    striker: { id: string; name: string; runs: number; balls: number; isOut: boolean };
    nonStriker: { id: string; name: string; runs: number; balls: number; isOut: boolean };
  };
  currentBowler: { id: string; name: string; overs: number; wickets: number; runs: number };
  nextBatsman: { id: string; name: string };
  recentBalls: Array<{
    over: number;
    ball: number;
    runs: number;
    type: string;
  }>;
}

const SpectatorScreen: React.FC<SpectatorScreenProps> = ({ onBack, matchId }) => {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatchData();
    // Set up real-time updates
    const interval = setInterval(loadMatchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const match = await liveScoringService.getMatch(matchId);
      if (!match) {
        // Create demo match data if not found
        const demoMatchData: MatchData = {
          id: matchId,
          team1: 'Mumbai Indians',
          team2: 'Chennai Super Kings',
          overs: 20,
          currentInnings: 1,
          currentOver: 2,
          currentBall: 3,
          totalRuns: 45,
          wickets: 1,
          currentBatsmen: {
            striker: { id: 'rohit-sharma', name: 'Rohit Sharma', runs: 25, balls: 18, isOut: false },
            nonStriker: { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', runs: 15, balls: 12, isOut: false }
          },
          currentBowler: { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', overs: 2, wickets: 1, runs: 20 },
          nextBatsman: { id: 'tilak-varma', name: 'Tilak Varma' },
          recentBalls: [
            { over: 2, ball: 1, runs: 4, type: '4' },
            { over: 2, ball: 2, runs: 1, type: '1' },
            { over: 2, ball: 3, runs: 0, type: 'dot' }
          ]
        };
        setMatchData(demoMatchData);
        return;
      }

      // Convert match data to scorecard format
      const scorecardData: MatchData = {
        id: match.id,
        team1: match.team1,
        team2: match.team2,
        overs: match.overs,
        currentInnings: match.currentInnings,
        currentOver: match.currentOver,
        currentBall: match.currentBall,
        totalRuns: match.totalRuns,
        wickets: match.wickets,
        currentBatsmen: {
          striker: {
            id: match.currentBatsmen?.striker?.id || '1',
            name: match.currentBatsmen?.striker?.name || 'Batsman 1',
            runs: match.currentBatsmen?.striker?.runs || 0,
            balls: match.currentBatsmen?.striker?.balls || 0,
            isOut: match.currentBatsmen?.striker?.isOut || false,
          },
          nonStriker: {
            id: match.currentBatsmen?.nonStriker?.id || '2',
            name: match.currentBatsmen?.nonStriker?.name || 'Batsman 2',
            runs: match.currentBatsmen?.nonStriker?.runs || 0,
            balls: match.currentBatsmen?.nonStriker?.balls || 0,
            isOut: match.currentBatsmen?.nonStriker?.isOut || false,
          },
        },
        currentBowler: {
          id: match.currentBowler?.id || '1',
          name: match.currentBowler?.name || 'Bowler 1',
          overs: match.currentBowler?.overs || 0,
          wickets: match.currentBowler?.wickets || 0,
          runs: match.currentBowler?.runs || 0,
        },
        nextBatsman: {
          id: match.nextBatsman?.id || '3',
          name: match.nextBatsman?.name || 'Next Batsman',
        },
        recentBalls: match.balls?.slice(-6).map(ball => ({
          over: ball.over,
          ball: ball.ball,
          runs: ball.runs,
          type: ball.type,
        })) || [],
      };

      setMatchData(scorecardData);
    } catch (err) {
      console.error('Error loading match data:', err);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMatchData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Scorecard</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading match data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Scorecard</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!matchData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Scorecard</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No match data available</Text>
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
        <Text style={styles.headerTitle}>Live Scorecard</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>
      <LiveScorecard matchData={matchData} isLive={true} />
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingTop: 50, // Status bar space
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerSpacer: {
    width: 60, // Same width as back button for centering
  },
  refreshButton: {
    padding: SIZES.sm,
  },
  refreshButtonText: {
    fontSize: 16,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.sm,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default SpectatorScreen;
