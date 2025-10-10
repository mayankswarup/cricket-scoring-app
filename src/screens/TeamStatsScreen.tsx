import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { statisticsService, PlayerStatistics } from '../services/statisticsService';
import PlayerProfileScreen from './PlayerProfileScreen';

interface TeamStatsScreenProps {
  teamId: string;
  teamName: string;
  onBack: () => void;
  currentUserPhone?: string;
  isPro?: boolean;
}

const TeamStatsScreen: React.FC<TeamStatsScreenProps> = ({ 
  teamId,
  teamName,
  onBack,
  currentUserPhone,
  isPro = false 
}) => {
  const [teamStats, setTeamStats] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStatistics | null>(null);
  const [sortBy, setSortBy] = useState<'runs' | 'wickets' | 'average'>('runs');

  // Sample team stats data for demo
  const sampleTeamStats: PlayerStatistics[] = [
    // Add current user as first player
    {
      playerId: 'current-user',
      playerName: 'You',
      phoneNumber: currentUserPhone || '0000000000',
      batting: {
        playerId: 'current-user', playerName: 'You', matches: 52, innings: 48, runs: 1654,
        balls: 1200, fours: 156, sixes: 45, highScore: 89, notOuts: 8,
        average: 41.35, strikeRate: 137.83, fifties: 9, hundreds: 2, ducks: 2
      },
      bowling: {
        playerId: 'current-user', playerName: 'You', matches: 52, innings: 35, overs: 120.5,
        maidens: 3, runs: 1056, wickets: 42, bestFigures: '4/35',
        average: 25.14, economy: 8.74, strikeRate: 17.26, fourWickets: 1, fiveWickets: 0, dotBalls: 198
      },
      fielding: {
        playerId: 'current-user', playerName: 'You', matches: 52, catches: 38, runOuts: 7, stumpings: 0
      },
      lastUpdated: new Date()
    },
    {
      playerId: '1',
      playerName: 'Rohit Sharma',
      phoneNumber: '9876543211',
      batting: {
        playerId: '1', playerName: 'Rohit Sharma', matches: 45, innings: 42, runs: 1847,
        balls: 1356, fours: 198, sixes: 67, highScore: 128, notOuts: 4,
        average: 48.61, strikeRate: 136.19, fifties: 12, hundreds: 4, ducks: 2
      },
      bowling: {
        playerId: '1', playerName: 'Rohit Sharma', matches: 45, innings: 5, overs: 12.0,
        maidens: 0, runs: 98, wickets: 2, bestFigures: '1/15',
        average: 49.0, economy: 8.17, strikeRate: 36.0, fourWickets: 0, fiveWickets: 0, dotBalls: 18
      },
      fielding: {
        playerId: '1', playerName: 'Rohit Sharma', matches: 45, catches: 28, runOuts: 5, stumpings: 0
      },
      lastUpdated: new Date()
    },
    {
      playerId: '2',
      playerName: 'Virat Kohli',
      phoneNumber: '9876543210',
      batting: {
        playerId: '2', playerName: 'Virat Kohli', matches: 48, innings: 45, runs: 2134,
        balls: 1589, fours: 215, sixes: 42, highScore: 113, notOuts: 6,
        average: 54.72, strikeRate: 134.30, fifties: 15, hundreds: 5, ducks: 1
      },
      bowling: {
        playerId: '2', playerName: 'Virat Kohli', matches: 48, innings: 2, overs: 4.0,
        maidens: 0, runs: 35, wickets: 0, bestFigures: '0/18',
        average: 0, economy: 8.75, strikeRate: 0, fourWickets: 0, fiveWickets: 0, dotBalls: 6
      },
      fielding: {
        playerId: '2', playerName: 'Virat Kohli', matches: 48, catches: 32, runOuts: 8, stumpings: 0
      },
      lastUpdated: new Date()
    },
    {
      playerId: '3',
      playerName: 'Jasprit Bumrah',
      phoneNumber: '9876543213',
      batting: {
        playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, innings: 12, runs: 45,
        balls: 67, fours: 3, sixes: 1, highScore: 12, notOuts: 8,
        average: 11.25, strikeRate: 67.16, fifties: 0, hundreds: 0, ducks: 5
      },
      bowling: {
        playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, innings: 38, overs: 142.3,
        maidens: 8, runs: 1089, wickets: 56, bestFigures: '5/23',
        average: 19.45, economy: 7.64, strikeRate: 15.24, fourWickets: 4, fiveWickets: 2, dotBalls: 312
      },
      fielding: {
        playerId: '3', playerName: 'Jasprit Bumrah', matches: 38, catches: 12, runOuts: 2, stumpings: 0
      },
      lastUpdated: new Date()
    },
    {
      playerId: '4',
      playerName: 'Hardik Pandya',
      phoneNumber: '9876543216',
      batting: {
        playerId: '4', playerName: 'Hardik Pandya', matches: 52, innings: 48, runs: 1456,
        balls: 998, fours: 124, sixes: 78, highScore: 91, notOuts: 12,
        average: 40.44, strikeRate: 145.89, fifties: 8, hundreds: 0, ducks: 3
      },
      bowling: {
        playerId: '4', playerName: 'Hardik Pandya', matches: 52, innings: 45, overs: 156.2,
        maidens: 2, runs: 1345, wickets: 48, bestFigures: '4/28',
        average: 28.02, economy: 8.60, strikeRate: 19.54, fourWickets: 2, fiveWickets: 0, dotBalls: 287
      },
      fielding: {
        playerId: '4', playerName: 'Hardik Pandya', matches: 52, catches: 35, runOuts: 12, stumpings: 0
      },
      lastUpdated: new Date()
    },
    {
      playerId: '5',
      playerName: 'Ravindra Jadeja',
      phoneNumber: '9876543214',
      batting: {
        playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, innings: 42, runs: 892,
        balls: 721, fours: 78, sixes: 34, highScore: 62, notOuts: 15,
        average: 33.03, strikeRate: 123.72, fifties: 3, hundreds: 0, ducks: 4
      },
      bowling: {
        playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, innings: 48, overs: 168.4,
        maidens: 6, runs: 1256, wickets: 52, bestFigures: '4/15',
        average: 24.15, economy: 7.45, strikeRate: 19.46, fourWickets: 3, fiveWickets: 0, dotBalls: 398
      },
      fielding: {
        playerId: '5', playerName: 'Ravindra Jadeja', matches: 50, catches: 42, runOuts: 18, stumpings: 0
      },
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    loadTeamStats();
  }, [teamId]);

  const loadTeamStats = async () => {
    try {
      setLoading(true);
      
      // Use sample data for demo
      setTeamStats(sampleTeamStats);
      
      // Try to get real data from Firebase (fallback to sample)
      // const stats = await statisticsService.getTeamStats(teamId);
      // if (stats.length > 0) {
      //   setTeamStats(stats);
      // }
    } catch (error) {
      console.error('Error loading team stats:', error);
      setTeamStats(sampleTeamStats);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPlayers = () => {
    const sorted = [...teamStats];
    
    switch (sortBy) {
      case 'runs':
        return sorted.sort((a, b) => b.batting.runs - a.batting.runs);
      case 'wickets':
        return sorted.sort((a, b) => b.bowling.wickets - a.bowling.wickets);
      case 'average':
        return sorted.sort((a, b) => b.batting.average - a.batting.average);
      default:
        return sorted;
    }
  };

  const renderSortButton = (type: 'runs' | 'wickets' | 'average', label: string) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === type && styles.activeSortButton
      ]}
      onPress={() => setSortBy(type)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === type && styles.activeSortButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPlayerStatsCard = ({ item }: { item: PlayerStatistics }) => {
    const isOwnProfile = item.phoneNumber === currentUserPhone;
    const canViewDetails = isPro || isOwnProfile;
    
    return (
      <TouchableOpacity
        style={[
          styles.playerStatsCard,
          !canViewDetails && styles.lockedCard
        ]}
        onPress={() => canViewDetails && setSelectedPlayer(item)}
      >
        <View style={styles.playerCardHeader}>
          <View style={styles.playerCardInfo}>
            <Text style={styles.playerCardName}>{item.playerName}</Text>
            {isOwnProfile && <Text style={styles.youBadge}>YOU</Text>}
            {!canViewDetails && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          <Text style={styles.matchesCount}>{item.batting.matches} matches</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Runs</Text>
            <Text style={styles.statValue}>{item.batting.runs}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{item.batting.average.toFixed(1)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SR</Text>
            <Text style={styles.statValue}>{item.batting.strikeRate.toFixed(1)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Wickets</Text>
            <Text style={styles.statValue}>{item.bowling.wickets}</Text>
          </View>
        </View>

        {canViewDetails && (
          <Text style={styles.viewDetailsText}>Tap to view full statistics →</Text>
        )}
        {!canViewDetails && (
          <Text style={styles.proOnlyText}>🔒 PRO only - Upgrade to view details</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (selectedPlayer) {
    return (
      <PlayerProfileScreen
        playerId={selectedPlayer.playerId}
        onBack={() => setSelectedPlayer(null)}
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
          <Text style={styles.headerTitle}>Team Statistics</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading team statistics...</Text>
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
        <Text style={styles.headerTitle}>Team Statistics</Text>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
        {!isPro && <View style={styles.placeholder} />}
      </View>

      {/* Team Info */}
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.teamSubtext}>{teamStats.length} players</Text>
      </View>

      {/* Sort Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sortContainer}
        contentContainerStyle={styles.sortContent}
      >
        {renderSortButton('runs', 'Top Run Scorers')}
        {renderSortButton('wickets', 'Top Wicket Takers')}
        {renderSortButton('average', 'Best Average')}
      </ScrollView>

      {/* Players List */}
      <FlatList
        data={getSortedPlayers()}
        renderItem={renderPlayerStatsCard}
        keyExtractor={(item) => item.playerId}
        contentContainerStyle={styles.playersList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No statistics available</Text>
            <Text style={styles.emptySubtext}>Stats will appear after matches are played</Text>
          </View>
        }
      />
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
  teamHeader: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  teamName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  sortContainer: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  sortContent: {
    gap: SIZES.sm,
  },
  sortButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeSortButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  activeSortButtonText: {
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
  playersList: {
    padding: SIZES.md,
  },
  playerStatsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  lockedCard: {
    backgroundColor: `${COLORS.lightGray}50`,
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  playerCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  playerCardName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  youBadge: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockIcon: {
    fontSize: 14,
  },
  matchesCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textAlign: 'center',
  },
  proOnlyText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TeamStatsScreen;

