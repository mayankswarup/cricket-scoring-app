import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

const { width } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  runs: number;
  balls: number;
  isOut: boolean;
}

interface Bowler {
  id: string;
  name: string;
  overs: number;
  wickets: number;
  runs: number;
}

interface MatchData {
  team1: string;
  team2: string;
  overs: number;
  currentInnings: number;
  currentOver: number;
  currentBall: number;
  totalRuns: number;
  wickets: number;
  currentBatsmen: {
    striker: Player;
    nonStriker: Player;
  };
  currentBowler: Bowler;
  nextBatsman: Player;
  recentBalls: Array<{
    over: number;
    ball: number;
    runs: number;
    type: string;
  }>;
}

interface LiveScorecardProps {
  matchData: MatchData;
  isLive?: boolean;
}

const LiveScorecard: React.FC<LiveScorecardProps> = ({ matchData, isLive = true }) => {
  const {
    team1,
    team2,
    overs,
    currentInnings,
    currentOver,
    currentBall,
    totalRuns,
    wickets,
    currentBatsmen,
    currentBowler,
    nextBatsman,
    recentBalls,
  } = matchData;

  const runRate = currentOver > 0 ? (totalRuns / currentOver).toFixed(2) : '0.00';
  const requiredRunRate = currentOver > 0 ? ((totalRuns + 1) / currentOver).toFixed(2) : '0.00';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamName}>{team1}</Text>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.teamName}>{team2}</Text>
        </View>
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Score Summary */}
      <View style={styles.scoreSummary}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{totalRuns}</Text>
          <Text style={styles.scoreLabel}>Runs</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{wickets}</Text>
          <Text style={styles.scoreLabel}>Wickets</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{currentOver}.{currentBall}</Text>
          <Text style={styles.scoreLabel}>Overs</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{runRate}</Text>
          <Text style={styles.scoreLabel}>Run Rate</Text>
        </View>
      </View>

      {/* Current Batsmen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Batsmen</Text>
        <View style={styles.batsmenContainer}>
          <View style={styles.batsmanCard}>
            <Text style={styles.batsmanName}>
              {currentBatsmen.striker.name}*
            </Text>
            <Text style={styles.batsmanScore}>
              {currentBatsmen.striker.runs} ({currentBatsmen.striker.balls})
            </Text>
          </View>
          <View style={styles.batsmanCard}>
            <Text style={styles.batsmanName}>
              {currentBatsmen.nonStriker.name}
            </Text>
            <Text style={styles.batsmanScore}>
              {currentBatsmen.nonStriker.runs} ({currentBatsmen.nonStriker.balls})
            </Text>
          </View>
        </View>
      </View>

      {/* Current Bowler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Bowler</Text>
        <View style={styles.bowlerCard}>
          <Text style={styles.bowlerName}>{currentBowler.name}</Text>
          <Text style={styles.bowlerStats}>
            {currentBowler.overs} overs, {currentBowler.wickets} wickets, {currentBowler.runs} runs
          </Text>
        </View>
      </View>

      {/* Next Batsman */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Batsman</Text>
        <View style={styles.nextBatsmanCard}>
          <Text style={styles.nextBatsmanName}>{nextBatsman.name}</Text>
        </View>
      </View>

      {/* Recent Balls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Balls</Text>
        <View style={styles.recentBallsContainer}>
          {recentBalls.slice(-6).reverse().map((ball, index) => (
            <View key={index} style={styles.ballItem}>
              <Text style={styles.ballOver}>{ball.over}.{ball.ball}</Text>
              <Text style={[
                styles.ballRuns,
                ball.runs === 0 && styles.ballDot,
                ball.runs === 4 && styles.ballFour,
                ball.runs === 6 && styles.ballSix,
              ]}>
                {ball.runs}
              </Text>
              <Text style={styles.ballType}>{ball.type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Match Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Information</Text>
        <View style={styles.matchInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Innings:</Text>
            <Text style={styles.infoValue}>{currentInnings}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Overs:</Text>
            <Text style={styles.infoValue}>{overs}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Over:</Text>
            <Text style={styles.infoValue}>{currentOver}.{currentBall}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  matchHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    alignItems: 'center',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginHorizontal: SIZES.md,
  },
  vsText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: SIZES.xs,
  },
  liveText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  scoreSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    justifyContent: 'space-around',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SIZES.sm,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  batsmenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batsmanCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginHorizontal: SIZES.xs,
    alignItems: 'center',
  },
  batsmanName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  batsmanScore: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  bowlerCard: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
  },
  bowlerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  bowlerStats: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  nextBatsmanCard: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
  },
  nextBatsmanName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  recentBallsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ballItem: {
    width: (width - 80) / 3,
    backgroundColor: COLORS.background,
    padding: SIZES.sm,
    borderRadius: SIZES.sm,
    marginBottom: SIZES.sm,
    alignItems: 'center',
  },
  ballOver: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  ballRuns: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  ballDot: {
    color: COLORS.textSecondary,
  },
  ballFour: {
    color: COLORS.success,
  },
  ballSix: {
    color: COLORS.primary,
  },
  ballType: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  matchInfoContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
});

export default LiveScorecard;