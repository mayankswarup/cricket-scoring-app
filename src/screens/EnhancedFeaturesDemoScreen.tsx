import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import PlayerStatistics from '../components/PlayerStatistics';
import EnhancedScorecard from '../components/EnhancedScorecard';
import PlayerAnalysisScreen from './PlayerAnalysisScreen';
import TeamStatsScreen from './TeamStatsScreen';
import PreMatchAnalysisScreen from './PreMatchAnalysisScreen';
import UpgradeToProScreen from './UpgradeToProScreen';

interface EnhancedFeaturesDemoScreenProps {
  onBack: () => void;
  onMatchHistoryPress?: () => void;
  currentUserName?: string;
  currentUserPhone?: string;
  isPro?: boolean;
}

const EnhancedFeaturesDemoScreen: React.FC<EnhancedFeaturesDemoScreenProps> = ({ 
  onBack, 
  onMatchHistoryPress,
  currentUserName = 'Player',
  currentUserPhone = '',
  isPro = false
}) => {
  const [activeDemo, setActiveDemo] = useState<'stats' | 'scorecard' | 'playerAnalysis' | 'teamStats' | 'preMatch' | 'upgrade' | null>(null);
  
  // Development flag - set to true during development to bypass PRO gates
  const DEVELOPMENT_MODE = true;

  console.log('🎯 Enhanced Features Demo Screen loaded!');

  // Sample Player Stats Data
  const sampleBattingStats = {
    matches: 45,
    innings: 42,
    runs: 1847,
    balls: 1356,
    fours: 198,
    sixes: 67,
    highScore: 128,
    average: 48.61,
    strikeRate: 136.19,
    fifties: 12,
    hundreds: 4,
    notOuts: 4,
  };

  const sampleBowlingStats = {
    matches: 45,
    innings: 38,
    overs: 142.3,
    maidens: 8,
    runs: 1234,
    wickets: 52,
    bestFigures: '5/23',
    average: 23.73,
    economy: 8.65,
    strikeRate: 16.44,
    fourWickets: 3,
    fiveWickets: 1,
  };

  const sampleFieldingStats = {
    catches: 28,
    runOuts: 5,
    stumpings: 0,
  };

  // Sample Scorecard Data
  const sampleInningsData = {
    teamName: 'Mumbai Indians',
    totalRuns: 189,
    wickets: 5,
    overs: 20.0,
    runRate: 9.45,
    batsmen: [
      {
        name: 'Rohit Sharma',
        runs: 85,
        balls: 52,
        fours: 8,
        sixes: 4,
        strikeRate: 163.46,
        isOut: true,
        dismissal: 'c Dhoni b Jadeja',
      },
      {
        name: 'Ishan Kishan',
        runs: 42,
        balls: 28,
        fours: 5,
        sixes: 2,
        strikeRate: 150.0,
        isOut: true,
        dismissal: 'lbw b Chahar',
      },
      {
        name: 'Suryakumar Yadav',
        runs: 31,
        balls: 18,
        fours: 3,
        sixes: 2,
        strikeRate: 172.22,
        isOut: true,
        dismissal: 'run out',
      },
      {
        name: 'Hardik Pandya',
        runs: 18,
        balls: 12,
        fours: 1,
        sixes: 1,
        strikeRate: 150.0,
        isOut: false,
      },
      {
        name: 'Kieron Pollard',
        runs: 8,
        balls: 6,
        fours: 0,
        sixes: 1,
        strikeRate: 133.33,
        isOut: true,
        dismissal: 'b Bravo',
      },
      {
        name: 'Krunal Pandya',
        runs: 5,
        balls: 4,
        fours: 0,
        sixes: 0,
        strikeRate: 125.0,
        isOut: false,
      },
    ],
    bowlers: [
      {
        name: 'Deepak Chahar',
        overs: 4.0,
        maidens: 0,
        runs: 38,
        wickets: 1,
        economy: 9.5,
      },
      {
        name: 'Ravindra Jadeja',
        overs: 4.0,
        maidens: 0,
        runs: 32,
        wickets: 1,
        economy: 8.0,
      },
      {
        name: 'Shardul Thakur',
        overs: 4.0,
        maidens: 0,
        runs: 42,
        wickets: 0,
        economy: 10.5,
      },
      {
        name: 'Dwayne Bravo',
        overs: 4.0,
        maidens: 0,
        runs: 35,
        wickets: 1,
        economy: 8.75,
      },
      {
        name: 'Moeen Ali',
        overs: 4.0,
        maidens: 0,
        runs: 37,
        wickets: 1,
        economy: 9.25,
      },
    ],
    extras: {
      wide: 3,
      noBall: 1,
      bye: 1,
      legBye: 0,
      total: 5,
    },
    fallOfWickets: [
      { runs: 68, wickets: 1, player: 'Ishan Kishan', over: 7.2 },
      { runs: 125, wickets: 2, player: 'Rohit Sharma', over: 14.3 },
      { runs: 156, wickets: 3, player: 'Suryakumar Yadav', over: 17.1 },
      { runs: 178, wickets: 4, player: 'Kieron Pollard', over: 19.2 },
    ],
  };

  if (activeDemo === 'stats') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveDemo(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Statistics Demo</Text>
          <View style={styles.placeholder} />
        </View>
        <PlayerStatistics
          playerName={currentUserName}
          battingStats={sampleBattingStats}
          bowlingStats={sampleBowlingStats}
          fieldingStats={sampleFieldingStats}
        />
      </SafeAreaView>
    );
  }

  if (activeDemo === 'scorecard') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveDemo(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enhanced Scorecard Demo</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView>
          <EnhancedScorecard innings={sampleInningsData} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (activeDemo === 'playerAnalysis') {
    return (
              <PlayerAnalysisScreen 
                onBack={() => setActiveDemo(null)}
                currentUserPhone={currentUserPhone}
                isPro={DEVELOPMENT_MODE || isPro}
              />
    );
  }

  if (activeDemo === 'teamStats') {
    return (
      <TeamStatsScreen
        teamId="demo-team-1"
        teamName="Mumbai Indians"
        onBack={() => setActiveDemo(null)}
        currentUserPhone={currentUserPhone}
        isPro={DEVELOPMENT_MODE || isPro}
      />
    );
  }

  if (activeDemo === 'preMatch') {
    return (
      <PreMatchAnalysisScreen
        myTeamId="demo-team-1"
        opponentTeamId="demo-team-2"
        myTeamName="Mumbai Indians"
        opponentTeamName="Chennai Super Kings"
        onBack={() => setActiveDemo(null)}
        currentUserPhone={currentUserPhone}
        isPro={DEVELOPMENT_MODE || isPro}
      />
    );
  }

  if (activeDemo === 'upgrade') {
    return (
      <UpgradeToProScreen
        onBack={() => setActiveDemo(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enhanced Features Demo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Test Enhanced Features</Text>
          <Text style={styles.sectionSubtitle}>
            Click any card below to test features. Toggle PRO mode to see gating.
          </Text>
        </View>

        {/* PRO Status Toggle */}
        <View style={styles.proToggleContainer}>
          <Text style={styles.proToggleLabel}>
            Testing as: {isPro ? '💎 PRO User' : '👤 Free User'}
          </Text>
          <Text style={styles.proToggleHint}>
            (In real app, this is based on subscription)
          </Text>
        </View>

        {/* Basic Components Section */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>📱 Basic Components</Text>
        </View>

        {/* Player Statistics Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => setActiveDemo('stats')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>📊</Text>
          </View>
          <View style={styles.demoContent}>
            <Text style={styles.demoTitle}>Player Statistics</Text>
            <Text style={styles.demoDescription}>
              Comprehensive batting, bowling, and fielding statistics with visual highlights
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Batting Stats</Text>
              <Text style={styles.featureTag}>✓ Bowling Stats</Text>
              <Text style={styles.featureTag}>✓ Fielding Stats</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* Enhanced Scorecard Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => setActiveDemo('scorecard')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>🏏</Text>
          </View>
          <View style={styles.demoContent}>
            <Text style={styles.demoTitle}>Enhanced Scorecard</Text>
            <Text style={styles.demoDescription}>
              Professional scorecard with batting, bowling tables, extras and fall of wickets
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Batting Table</Text>
              <Text style={styles.featureTag}>✓ Bowling Figures</Text>
              <Text style={styles.featureTag}>✓ Fall of Wickets</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* Match History Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => {
            if (onMatchHistoryPress) {
              onMatchHistoryPress();
            }
          }}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>📚</Text>
          </View>
          <View style={styles.demoContent}>
            <Text style={styles.demoTitle}>Enhanced Match History</Text>
            <Text style={styles.demoDescription}>
              View match history with search, filters, and detailed stats preview
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Search & Filters</Text>
              <Text style={styles.featureTag}>✓ Better Layout</Text>
              <Text style={styles.featureTag}>✓ Stats Preview</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* PRO Features Section */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>💎 PRO Features</Text>
          {!isPro && (
            <Text style={styles.categorySubtitle}>
              These features show PRO gates for free users
            </Text>
          )}
        </View>

        {/* Player Analysis Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => setActiveDemo('playerAnalysis')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>🔍</Text>
          </View>
          <View style={styles.demoContent}>
            <View style={styles.titleRow}>
              <Text style={styles.demoTitle}>Player Analysis</Text>
              {!isPro && <Text style={styles.proTag}>PRO</Text>}
            </View>
            <Text style={styles.demoDescription}>
              Search and analyze any player's complete statistics
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Search Players</Text>
              <Text style={styles.featureTag}>✓ View Stats</Text>
              <Text style={styles.featureTag}>✓ Compare Performance</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* Team Stats Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => setActiveDemo('teamStats')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>📊</Text>
          </View>
          <View style={styles.demoContent}>
            <View style={styles.titleRow}>
              <Text style={styles.demoTitle}>Team Statistics</Text>
              {!isPro && <Text style={styles.proTag}>PRO</Text>}
            </View>
            <Text style={styles.demoDescription}>
              View complete team statistics with sorting options
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Team Overview</Text>
              <Text style={styles.featureTag}>✓ Sort Players</Text>
              <Text style={styles.featureTag}>✓ Quick Stats</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* Pre-Match Analysis Card */}
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => setActiveDemo('preMatch')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>🎯</Text>
          </View>
          <View style={styles.demoContent}>
            <View style={styles.titleRow}>
              <Text style={styles.demoTitle}>Pre-Match Analysis</Text>
              {!isPro && <Text style={styles.proTag}>PRO</Text>}
            </View>
            <Text style={styles.demoDescription}>
              Scout opponents and compare key players before matches
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Scout Opponents</Text>
              <Text style={styles.featureTag}>✓ Compare Players</Text>
              <Text style={styles.featureTag}>✓ Match Insights</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        {/* Upgrade to PRO Card */}
        <TouchableOpacity
          style={[styles.demoCard, styles.upgradeCard]}
          onPress={() => setActiveDemo('upgrade')}
        >
          <View style={styles.demoIcon}>
            <Text style={styles.demoIconText}>💳</Text>
          </View>
          <View style={styles.demoContent}>
            <Text style={styles.demoTitle}>Upgrade to PRO</Text>
            <Text style={styles.demoDescription}>
              View pricing plans and unlock all premium features
            </Text>
            <View style={styles.demoFeatures}>
              <Text style={styles.featureTag}>✓ Monthly ₹199</Text>
              <Text style={styles.featureTag}>✓ Yearly ₹1,999</Text>
              <Text style={styles.featureTag}>✓ Save 17%</Text>
            </View>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  demoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  demoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  demoIconText: {
    fontSize: 24,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  demoDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  demoFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
  },
  featureTag: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoArrow: {
    fontSize: 24,
    color: COLORS.primary,
    marginLeft: SIZES.sm,
  },
  bottomSpace: {
    height: SIZES.xl,
  },
  proToggleContainer: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SIZES.md,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  proToggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  proToggleHint: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  categorySection: {
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  categorySubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  proTag: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upgradeCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
});

export default EnhancedFeaturesDemoScreen;

