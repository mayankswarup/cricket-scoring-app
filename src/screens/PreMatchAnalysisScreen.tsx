import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { statisticsService, PlayerStatistics } from '../services/statisticsService';
import TeamStatsScreen from './TeamStatsScreen';

interface PreMatchAnalysisScreenProps {
  myTeamId: string;
  opponentTeamId: string;
  myTeamName: string;
  opponentTeamName: string;
  onBack: () => void;
  currentUserPhone?: string;
  isPro?: boolean;
}

const PreMatchAnalysisScreen: React.FC<PreMatchAnalysisScreenProps> = ({ 
  myTeamId,
  opponentTeamId,
  myTeamName,
  opponentTeamName,
  onBack,
  currentUserPhone,
  isPro = false 
}) => {
  const [myTeamStats, setMyTeamStats] = useState<PlayerStatistics[]>([]);
  const [opponentStats, setOpponentStats] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'myTeam' | 'opponents'>('overview');

  // Sample data for Mumbai Indians (Your Team)
  const sampleMyTeamStats: PlayerStatistics[] = [
    // Add current user as first player
    {
      playerId: 'current-user', playerName: 'You', phoneNumber: currentUserPhone || '0000000000',
      batting: { playerId: 'current-user', playerName: 'You', matches: 52, innings: 48, runs: 1654, balls: 1200, fours: 156, sixes: 45, highScore: 89, notOuts: 8, average: 41.35, strikeRate: 137.83, fifties: 9, hundreds: 2, ducks: 2 },
      bowling: { playerId: 'current-user', playerName: 'You', matches: 52, innings: 35, overs: 120.5, maidens: 3, runs: 1056, wickets: 42, bestFigures: '4/35', average: 25.14, economy: 8.74, strikeRate: 17.26, fourWickets: 1, fiveWickets: 0, dotBalls: 198 },
      fielding: { playerId: 'current-user', playerName: 'You', matches: 52, catches: 38, runOuts: 7, stumpings: 0 },
      lastUpdated: new Date()
    },
    {
      playerId: '1', playerName: 'Rohit Sharma', phoneNumber: '9876543211',
      batting: { playerId: '1', playerName: 'Rohit Sharma', matches: 45, innings: 42, runs: 1847, balls: 1356, fours: 198, sixes: 67, highScore: 128, notOuts: 4, average: 48.61, strikeRate: 136.19, fifties: 12, hundreds: 4, ducks: 2 },
      bowling: { playerId: '1', playerName: 'Rohit Sharma', matches: 45, innings: 5, overs: 12.0, maidens: 0, runs: 98, wickets: 2, bestFigures: '1/15', average: 49.0, economy: 8.17, strikeRate: 36.0, fourWickets: 0, fiveWickets: 0, dotBalls: 18 },
      fielding: { playerId: '1', playerName: 'Rohit Sharma', matches: 45, catches: 28, runOuts: 5, stumpings: 0 },
      lastUpdated: new Date()
    },
    {
      playerId: '2', playerName: 'Hardik Pandya', phoneNumber: '9876543216',
      batting: { playerId: '2', playerName: 'Hardik Pandya', matches: 52, innings: 48, runs: 1456, balls: 998, fours: 124, sixes: 78, highScore: 91, notOuts: 12, average: 40.44, strikeRate: 145.89, fifties: 8, hundreds: 0, ducks: 3 },
      bowling: { playerId: '2', playerName: 'Hardik Pandya', matches: 52, innings: 45, overs: 156.2, maidens: 2, runs: 1345, wickets: 48, bestFigures: '4/28', average: 28.02, economy: 8.60, strikeRate: 19.54, fourWickets: 2, fiveWickets: 0, dotBalls: 287 },
      fielding: { playerId: '2', playerName: 'Hardik Pandya', matches: 52, catches: 35, runOuts: 12, stumpings: 0 },
      lastUpdated: new Date()
    },
    {
      playerId: '3', playerName: 'Jasprit Bumrah', phoneNumber: '9876543213',
      batting: { playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, innings: 12, runs: 45, balls: 67, fours: 3, sixes: 1, highScore: 12, notOuts: 8, average: 11.25, strikeRate: 67.16, fifties: 0, hundreds: 0, ducks: 5 },
      bowling: { playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, innings: 38, overs: 142.3, maidens: 8, runs: 1089, wickets: 56, bestFigures: '5/23', average: 19.45, economy: 7.64, strikeRate: 15.24, fourWickets: 4, fiveWickets: 2, dotBalls: 312 },
      fielding: { playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, catches: 12, runOuts: 2, stumpings: 0 },
      lastUpdated: new Date()
    }
  ];

  // Sample data for Chennai Super Kings (Opponents)
  const sampleOpponentStats: PlayerStatistics[] = [
    {
      playerId: '4', playerName: 'MS Dhoni', phoneNumber: '9876543212',
      batting: { playerId: '4', playerName: 'MS Dhoni', matches: 55, innings: 52, runs: 1623, balls: 1234, fours: 145, sixes: 89, highScore: 84, notOuts: 18, average: 47.74, strikeRate: 131.52, fifties: 11, hundreds: 0, ducks: 1 },
      bowling: { playerId: '4', playerName: 'MS Dhoni', matches: 55, innings: 0, overs: 0, maidens: 0, runs: 0, wickets: 0, bestFigures: '0/0', average: 0, economy: 0, strikeRate: 0, fourWickets: 0, fiveWickets: 0, dotBalls: 0 },
      fielding: { playerId: '4', playerName: 'MS Dhoni', matches: 55, catches: 45, runOuts: 15, stumpings: 32 },
      lastUpdated: new Date()
    },
    {
      playerId: '5', playerName: 'Ravindra Jadeja', phoneNumber: '9876543214',
      batting: { playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, innings: 42, runs: 892, balls: 721, fours: 78, sixes: 34, highScore: 62, notOuts: 15, average: 33.03, strikeRate: 123.72, fifties: 3, hundreds: 0, ducks: 4 },
      bowling: { playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, innings: 48, overs: 168.4, maidens: 6, runs: 1256, wickets: 52, bestFigures: '4/15', average: 24.15, economy: 7.45, strikeRate: 19.46, fourWickets: 3, fiveWickets: 0, dotBalls: 398 },
      fielding: { playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, catches: 42, runOuts: 18, stumpings: 0 },
      lastUpdated: new Date()
    },
    {
      playerId: '6', playerName: 'Deepak Chahar', phoneNumber: '9876543218',
      batting: { playerId: '6', playerName: 'Deepak Chahar', matches: 35, innings: 18, runs: 234, balls: 189, fours: 23, sixes: 8, highScore: 39, notOuts: 9, average: 26.0, strikeRate: 123.81, fifties: 0, hundreds: 0, ducks: 3 },
      bowling: { playerId: '6', playerName: 'Deepak Chahar', matches: 35, innings: 35, overs: 128.5, maidens: 5, runs: 1156, wickets: 45, bestFigures: '4/32', average: 25.69, economy: 8.97, strikeRate: 17.18, fourWickets: 2, fiveWickets: 0, dotBalls: 245 },
      fielding: { playerId: '6', playerName: 'Deepak Chahar', matches: 35, catches: 18, runOuts: 4, stumpings: 0 },
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    loadBothTeamStats();
  }, []);

  const loadBothTeamStats = async () => {
    try {
      setLoading(true);
      
      // Use sample data for demo
      setMyTeamStats(sampleMyTeamStats);
      setOpponentStats(sampleOpponentStats);
      
      // Try to get real data from Firebase (fallback to sample)
      // const [myStats, oppStats] = await Promise.all([
      //   statisticsService.getTeamStats(myTeamId),
      //   statisticsService.getTeamStats(opponentTeamId)
      // ]);
      // if (myStats.length > 0) setMyTeamStats(myStats);
      // if (oppStats.length > 0) setOpponentStats(oppStats);
      
    } catch (error) {
      console.error('Error loading team stats:', error);
      setMyTeamStats(sampleMyTeamStats);
      setOpponentStats(sampleOpponentStats);
    } finally {
      setLoading(false);
    }
  };

  const getTopBatsman = (stats: PlayerStatistics[]) => {
    return stats.reduce((top, player) => 
      player.batting.runs > (top?.batting.runs || 0) ? player : top
    , stats[0]);
  };

  const getTopBowler = (stats: PlayerStatistics[]) => {
    return stats.reduce((top, player) => 
      player.bowling.wickets > (top?.bowling.wickets || 0) ? player : top
    , stats[0]);
  };

  const renderProGate = () => (
    <View style={styles.proGateContainer}>
      <Text style={styles.proGateIcon}>🔒</Text>
      <Text style={styles.proGateTitle}>PRO Feature</Text>
      <Text style={styles.proGateSubtitle}>
        Scout your opponents before the match!
      </Text>
      
      <View style={styles.proFeaturesList}>
        <Text style={styles.proFeatureItem}>🎯 See opponent team's full statistics</Text>
        <Text style={styles.proFeatureItem}>⚔️ Compare key players head-to-head</Text>
        <Text style={styles.proFeatureItem}>📊 Identify threats and weaknesses</Text>
        <Text style={styles.proFeatureItem}>💡 Get match insights and recommendations</Text>
      </View>

      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade to PRO ₹199/month</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => {
    if (!isPro) {
      return (
        <ScrollView>
          {/* My Team Preview (Always visible) */}
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Your Team: {myTeamName}</Text>
            <Text style={styles.sectionSubtext}>{myTeamStats.length} players</Text>
            
            {myTeamStats.length > 0 && (
              <View style={styles.quickStats}>
                <Text style={styles.quickStatsText}>
                  Total Runs: {myTeamStats.reduce((sum, p) => sum + p.batting.runs, 0)}
                </Text>
                <Text style={styles.quickStatsText}>
                  Total Wickets: {myTeamStats.reduce((sum, p) => sum + p.bowling.wickets, 0)}
                </Text>
              </View>
            )}
          </View>

          {/* PRO Gate for Opponent Analysis */}
          {renderProGate()}
        </ScrollView>
      );
    }

    // PRO Users - Full Analysis
    const myTopBatsman = getTopBatsman(myTeamStats);
    const myTopBowler = getTopBowler(myTeamStats);
    const oppTopBatsman = getTopBatsman(opponentStats);
    const oppTopBowler = getTopBowler(opponentStats);

    return (
      <ScrollView>
        {/* Key Players Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>🎯 Key Players</Text>
          
          {/* Top Batsmen */}
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Top Batsmen</Text>
            <View style={styles.vsContainer}>
              <View style={styles.playerCompare}>
                <Text style={styles.compareTeam}>{myTeamName}</Text>
                <Text style={styles.comparePlayerName}>{myTopBatsman?.playerName}</Text>
                <Text style={styles.compareStats}>
                  {myTopBatsman?.batting.runs} runs @ {myTopBatsman?.batting.average.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.playerCompare}>
                <Text style={styles.compareTeam}>{opponentTeamName}</Text>
                <Text style={styles.comparePlayerName}>{oppTopBatsman?.playerName}</Text>
                <Text style={styles.compareStats}>
                  {oppTopBatsman?.batting.runs} runs @ {oppTopBatsman?.batting.average.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Bowlers */}
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonLabel}>Top Bowlers</Text>
            <View style={styles.vsContainer}>
              <View style={styles.playerCompare}>
                <Text style={styles.compareTeam}>{myTeamName}</Text>
                <Text style={styles.comparePlayerName}>{myTopBowler?.playerName}</Text>
                <Text style={styles.compareStats}>
                  {myTopBowler?.bowling.wickets} wickets @ {myTopBowler?.bowling.economy.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.playerCompare}>
                <Text style={styles.compareTeam}>{opponentTeamName}</Text>
                <Text style={styles.comparePlayerName}>{oppTopBowler?.playerName}</Text>
                <Text style={styles.compareStats}>
                  {oppTopBowler?.bowling.wickets} wickets @ {oppTopBowler?.bowling.economy.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Full Team Stats Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.teamButton}
            onPress={() => setSelectedView('myTeam')}
          >
            <Text style={styles.teamButtonText}>View {myTeamName} Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.teamButton}
            onPress={() => setSelectedView('opponents')}
          >
            <Text style={styles.teamButtonText}>View {opponentTeamName} Stats</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (selectedView === 'myTeam') {
    return (
      <TeamStatsScreen
        teamId={myTeamId}
        teamName={myTeamName}
        onBack={() => setSelectedView('overview')}
        currentUserPhone={currentUserPhone}
        isPro={isPro}
      />
    );
  }

  if (selectedView === 'opponents') {
    return (
      <TeamStatsScreen
        teamId={opponentTeamId}
        teamName={opponentTeamName}
        onBack={() => setSelectedView('overview')}
        currentUserPhone={currentUserPhone}
        isPro={isPro}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pre-Match Analysis</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing teams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Match Analysis</Text>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
        {!isPro && <View style={styles.placeholder} />}
      </View>

      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>{myTeamName} vs {opponentTeamName}</Text>
        <Text style={styles.matchSubtext}>Statistical Comparison</Text>
      </View>

      {renderOverview()}
    </SafeAreaView>
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
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  matchHeader: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  matchSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  teamSection: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  sectionSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  quickStats: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
  },
  quickStatsText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  proGateContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  proGateIcon: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  proGateTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  proGateSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  proFeaturesList: {
    width: '100%',
    marginBottom: SIZES.xl,
  },
  proFeatureItem: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.md,
    paddingLeft: SIZES.md,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  comparisonSection: {
    padding: SIZES.md,
  },
  comparisonTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  comparisonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  comparisonLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerCompare: {
    flex: 1,
    alignItems: 'center',
  },
  compareTeam: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  comparePlayerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  compareStats: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.md,
  },
  actionButtons: {
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  teamButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  teamButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default PreMatchAnalysisScreen;

