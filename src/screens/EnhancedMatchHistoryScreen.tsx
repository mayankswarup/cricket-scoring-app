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
  TextInput,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import MatchDetailsModal from '../components/MatchDetailsModal';
import { liveScoringService, Match } from '../services/liveScoringService';

interface MatchWithScores extends Match {
  totalRuns?: number;
  wickets?: number;
  currentOver?: number;
  currentBall?: number;
  ballsCount?: number;
  winner?: string;
  margin?: string;
}

interface MatchHistoryScreenProps {
  onBack: () => void;
}

type FilterType = 'all' | 'won' | 'lost' | 'recent';

export const EnhancedMatchHistoryScreen: React.FC<MatchHistoryScreenProps> = ({ onBack }) => {
  const [matches, setMatches] = useState<MatchWithScores[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithScores | null>(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const loadMatchHistory = async () => {
    try {
      console.log('📚 Loading match history...');
      const finishedMatches = await liveScoringService.getFinishedMatches();
      console.log('📚 Retrieved matches:', finishedMatches.length);
      
      if (finishedMatches.length === 0) {
        setMatches([]);
        setFilteredMatches([]);
        return;
      }
      
      const matchesWithScores = await Promise.all(
        finishedMatches.map(async (match) => {
          try {
            const balls = await liveScoringService.getMatchBalls(match.id);
            
            const totalRuns = balls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
            const totalWickets = balls.filter(ball => ball.isWicket).length;
            const totalBalls = balls.length;
            const overs = Math.floor(totalBalls / 6);
            const ballsInOver = totalBalls % 6;
            
            return {
              ...match,
              totalRuns,
              wickets: totalWickets,
              currentOver: overs,
              currentBall: ballsInOver,
              ballsCount: totalBalls,
              winner: (match as any).winner,
              margin: (match as any).margin,
            };
          } catch (error) {
            console.error(`Error loading balls for match ${match.id}:`, error);
            return {
              ...match,
              totalRuns: 0,
              wickets: 0,
              currentOver: 0,
              currentBall: 0,
              ballsCount: 0,
            };
          }
        })
      );
      
      // Sort by date (newest first)
      matchesWithScores.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setMatches(matchesWithScores);
      setFilteredMatches(matchesWithScores);
    } catch (error) {
      console.error('Error loading match history:', error);
      Alert.alert('Error', 'Failed to load match history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeFilter, matches]);

  const applyFilters = () => {
    let filtered = [...matches];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(match =>
        match.team1.name.toLowerCase().includes(query) ||
        match.team2.name.toLowerCase().includes(query) ||
        match.winner?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'won':
        filtered = filtered.filter(match => match.winner);
        break;
      case 'lost':
        filtered = filtered.filter(match => !match.winner);
        break;
      case 'recent':
        filtered = filtered.slice(0, 10);
        break;
    }

    setFilteredMatches(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMatchHistory();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getMatchResult = (match: MatchWithScores) => {
    if (match.winner && match.margin) {
      return `${match.winner} won by ${match.margin}`;
    } else if (match.status === 'completed') {
      return 'Match completed';
    }
    return 'Result unavailable';
  };

  const getMatchScore = (match: MatchWithScores) => {
    const runs = match.totalRuns || 0;
    const wickets = match.wickets || 0;
    const overs = match.currentOver || 0;
    const balls = match.currentBall || 0;
    
    if (match.ballsCount === 0) {
      return 'No score recorded';
    }
    
    return `${runs}/${wickets} (${overs}.${balls})`;
  };

  const renderFilterButton = (filter: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        activeFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMatchCard = (match: MatchWithScores) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => {
        setSelectedMatch(match);
        setShowMatchDetails(true);
      }}
    >
      {/* Date */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchDate}>{formatDate(match.createdAt)}</Text>
        <Text style={styles.matchType}>{match.matchType || 'T20'}</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsContainer}>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>{match.team1.name}</Text>
          <Text style={styles.teamScore}>{getMatchScore(match)}</Text>
        </View>
        <Text style={styles.vsText}>vs</Text>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>{match.team2.name}</Text>
          <Text style={styles.teamScore}>-</Text>
        </View>
      </View>

      {/* Result */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{getMatchResult(match)}</Text>
      </View>

      {/* Stats Preview */}
      <View style={styles.statsPreview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{match.ballsCount || 0}</Text>
          <Text style={styles.statLabel}>Balls</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{match.currentOver || 0}</Text>
          <Text style={styles.statLabel}>Overs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{match.wickets || 0}</Text>
          <Text style={styles.statLabel}>Wickets</Text>
        </View>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or results..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {renderFilterButton('all', `All (${matches.length})`)}
        {renderFilterButton('won', 'Won')}
        {renderFilterButton('lost', 'Lost')}
        {renderFilterButton('recent', 'Recent')}
      </ScrollView>

      {/* Matches List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📊</Text>
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Your completed matches will appear here'}
            </Text>
          </View>
        ) : (
          filteredMatches.map(renderMatchCard)
        )}
      </ScrollView>

      {/* Match Details Modal */}
      {showMatchDetails && selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => {
            setShowMatchDetails(false);
            setSelectedMatch(null);
          }}
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
  searchContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  filtersContainer: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  filtersContent: {
    gap: SIZES.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
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
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  matchDate: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  matchType: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  teamsContainer: {
    marginBottom: SIZES.md,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  teamName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  teamScore: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  vsText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SIZES.xs,
  },
  resultContainer: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    backgroundColor: `${COLORS.success}20`,
    borderRadius: SIZES.radius / 2,
    marginBottom: SIZES.md,
  },
  resultText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    textAlign: 'center',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewDetailsButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

