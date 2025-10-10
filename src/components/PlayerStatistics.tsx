import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface BattingStats {
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  highScore: number;
  average: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  notOuts: number;
}

interface BowlingStats {
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
}

interface FieldingStats {
  catches: number;
  runOuts: number;
  stumpings: number;
}

interface PlayerStatisticsProps {
  playerName: string;
  battingStats: BattingStats;
  bowlingStats: BowlingStats;
  fieldingStats: FieldingStats;
}

const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({
  playerName,
  battingStats,
  bowlingStats,
  fieldingStats,
}) => {
  const [activeTab, setActiveTab] = React.useState<'batting' | 'bowling' | 'fielding'>('batting');

  const renderStatRow = (label: string, value: string | number) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderHighlight = (label: string, value: string | number, icon: string) => (
    <View style={styles.highlightCard}>
      <Text style={styles.highlightIcon}>{icon}</Text>
      <Text style={styles.highlightValue}>{value}</Text>
      <Text style={styles.highlightLabel}>{label}</Text>
    </View>
  );

  const renderBattingStats = () => (
    <View style={styles.tabContent}>
      {/* Highlights */}
      <View style={styles.highlightsContainer}>
        {renderHighlight('Runs', battingStats.runs, '🏏')}
        {renderHighlight('Average', battingStats.average.toFixed(2), '📊')}
        {renderHighlight('Strike Rate', battingStats.strikeRate.toFixed(2), '⚡')}
      </View>

      {/* Detailed Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Career Summary</Text>
        {renderStatRow('Matches', battingStats.matches)}
        {renderStatRow('Innings', battingStats.innings)}
        {renderStatRow('Runs', battingStats.runs)}
        {renderStatRow('Balls Faced', battingStats.balls)}
        {renderStatRow('Not Outs', battingStats.notOuts)}
        {renderStatRow('High Score', battingStats.highScore)}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Boundaries</Text>
        {renderStatRow('Fours', battingStats.fours)}
        {renderStatRow('Sixes', battingStats.sixes)}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        {renderStatRow('Fifties', battingStats.fifties)}
        {renderStatRow('Hundreds', battingStats.hundreds)}
      </View>
    </View>
  );

  const renderBowlingStats = () => (
    <View style={styles.tabContent}>
      {/* Highlights */}
      <View style={styles.highlightsContainer}>
        {renderHighlight('Wickets', bowlingStats.wickets, '🎯')}
        {renderHighlight('Average', bowlingStats.average.toFixed(2), '📊')}
        {renderHighlight('Economy', bowlingStats.economy.toFixed(2), '⏱️')}
      </View>

      {/* Detailed Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Career Summary</Text>
        {renderStatRow('Matches', bowlingStats.matches)}
        {renderStatRow('Innings', bowlingStats.innings)}
        {renderStatRow('Overs', bowlingStats.overs.toFixed(1))}
        {renderStatRow('Maidens', bowlingStats.maidens)}
        {renderStatRow('Runs Conceded', bowlingStats.runs)}
        {renderStatRow('Wickets', bowlingStats.wickets)}
        {renderStatRow('Best Figures', bowlingStats.bestFigures)}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        {renderStatRow('Strike Rate', bowlingStats.strikeRate.toFixed(2))}
        {renderStatRow('Average', bowlingStats.average.toFixed(2))}
        {renderStatRow('Economy Rate', bowlingStats.economy.toFixed(2))}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        {renderStatRow('4 Wicket Hauls', bowlingStats.fourWickets)}
        {renderStatRow('5 Wicket Hauls', bowlingStats.fiveWickets)}
      </View>
    </View>
  );

  const renderFieldingStats = () => (
    <View style={styles.tabContent}>
      {/* Highlights */}
      <View style={styles.highlightsContainer}>
        {renderHighlight('Catches', fieldingStats.catches, '🧤')}
        {renderHighlight('Run Outs', fieldingStats.runOuts, '🏃')}
        {renderHighlight('Stumpings', fieldingStats.stumpings, '🥅')}
      </View>

      {/* Detailed Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Fielding Summary</Text>
        {renderStatRow('Total Dismissals', 
          fieldingStats.catches + fieldingStats.runOuts + fieldingStats.stumpings
        )}
        {renderStatRow('Catches', fieldingStats.catches)}
        {renderStatRow('Run Outs', fieldingStats.runOuts)}
        {renderStatRow('Stumpings', fieldingStats.stumpings)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Player Header */}
      <View style={styles.playerHeader}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerInitial}>{playerName.charAt(0)}</Text>
        </View>
        <Text style={styles.playerName}>{playerName}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'batting' && styles.activeTab]}
          onPress={() => setActiveTab('batting')}
        >
          <Text style={[styles.tabText, activeTab === 'batting' && styles.activeTabText]}>
            Batting
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bowling' && styles.activeTab]}
          onPress={() => setActiveTab('bowling')}
        >
          <Text style={[styles.tabText, activeTab === 'bowling' && styles.activeTabText]}>
            Bowling
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fielding' && styles.activeTab]}
          onPress={() => setActiveTab('fielding')}
        >
          <Text style={[styles.tabText, activeTab === 'fielding' && styles.activeTabText]}>
            Fielding
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'batting' && renderBattingStats()}
        {activeTab === 'bowling' && renderBowlingStats()}
        {activeTab === 'fielding' && renderFieldingStats()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  playerHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  playerInitial: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  playerName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SIZES.lg,
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: SIZES.xs,
  },
  highlightValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  highlightLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
});

export default PlayerStatistics;

