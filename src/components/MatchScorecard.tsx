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

interface BallData {
  id: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  isExtra: boolean;
  extraType?: string;
  timestamp: number;
}

interface LiveScorecardProps {
  team1: string;
  team2: string;
  currentInnings: number;
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  totalOvers: number;
  currentBatsmen: {
    striker: Player;
    nonStriker: Player;
  };
  currentBowler: {
    id: string;
    name: string;
    overs: number;
    wickets: number;
    runs: number;
  };
  nextBatsman: {
    id: string;
    name: string;
  };
  recentBalls: BallData[];
  runRate: number;
  requiredRunRate?: number;
}

const LiveScorecard: React.FC<LiveScorecardProps> = ({
  team1,
  team2,
  currentInnings,
  totalRuns,
  wickets,
  currentOver,
  currentBall,
  totalOvers,
  currentBatsmen,
  currentBowler,
  nextBatsman,
  recentBalls,
  runRate,
  requiredRunRate,
}) => {
  const getCurrentScore = () => {
    return `${totalRuns}/${wickets}`;
  };

  const getCurrentOver = () => {
    return `${currentOver}.${currentBall}`;
  };

  const getRecentBallsDisplay = () => {
    return recentBalls.slice(-6).map(ball => {
      if (ball.isWicket) return 'W';
      if (ball.isExtra) return ball.extraType === 'wide' ? 'Wd' : 'Nb';
      return ball.runs.toString();
    }).join(' ');
  };

  const getBatsmanDisplay = (batsman: Player, isStriker: boolean) => {
    const status = batsman.isOut ? '(OUT)' : (isStriker ? '*' : '');
    return `${batsman.name} ${status}`;
  };

  const getBatsmanScore = (batsman: Player) => {
    return `${batsman.runs} (${batsman.balls})`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>{team1} vs {team2}</Text>
        <Text style={styles.matchInfo}>
          {totalOvers} Overs • Innings {currentInnings}
        </Text>
      </View>

      {/* Live Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Live Score</Text>
          <Text style={styles.overText}>Over: {getCurrentOver()}</Text>
        </View>
        
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreText}>{getCurrentScore()}</Text>
          <Text style={styles.runRateText}>RR: {runRate.toFixed(2)}</Text>
        </View>

        {requiredRunRate && (
          <Text style={styles.requiredRRText}>
            Required RR: {requiredRunRate.toFixed(2)}
          </Text>
        )}
      </View>

      {/* Current Batsmen */}
      <View style={styles.batsmenCard}>
        <Text style={styles.sectionTitle}>Current Batsmen</Text>
        <View style={styles.batsmenInfo}>
          <View style={styles.batsman}>
            <Text style={styles.batsmanName}>
              {getBatsmanDisplay(currentBatsmen.striker, true)}
            </Text>
            <Text style={styles.batsmanScore}>
              {getBatsmanScore(currentBatsmen.striker)}
            </Text>
          </View>
          <View style={styles.batsman}>
            <Text style={styles.batsmanName}>
              {getBatsmanDisplay(currentBatsmen.nonStriker, false)}
            </Text>
            <Text style={styles.batsmanScore}>
              {getBatsmanScore(currentBatsmen.nonStriker)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bowler Information */}
      <View style={styles.bowlerCard}>
        <Text style={styles.sectionTitle}>Bowler</Text>
        <View style={styles.bowlerInfo}>
          <Text style={styles.bowlerName}>{currentBowler.name}</Text>
          <Text style={styles.bowlerStats}>
            {currentBowler.overs} overs, {currentBowler.wickets} wickets, {currentBowler.runs} runs
          </Text>
        </View>
      </View>

      {/* Next Batsman */}
      <View style={styles.nextBatsmanCard}>
        <Text style={styles.nextBatsmanTitle}>Next Batsman</Text>
        <Text style={styles.nextBatsmanName}>{nextBatsman.name}</Text>
      </View>

      {/* Recent Balls */}
      <View style={styles.recentBallsCard}>
        <Text style={styles.sectionTitle}>Recent Balls</Text>
        <View style={styles.recentBallsContainer}>
          <Text style={styles.recentBallsText}>
            {getRecentBallsDisplay() || 'No balls yet'}
          </Text>
        </View>
      </View>

      {/* Match Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Match Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Run Rate</Text>
            <Text style={styles.statValue}>{runRate.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wickets</Text>
            <Text style={styles.statValue}>{wickets}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Overs</Text>
            <Text style={styles.statValue}>{getCurrentOver()}</Text>
          </View>
          {requiredRunRate && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Req. RR</Text>
              <Text style={styles.statValue}>{requiredRunRate.toFixed(2)}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  matchHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  matchInfo: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    borderRadius: 8,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
  },
  overText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  scoreDisplay: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.sm,
  },
  runRateText: {
    fontSize: 18,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  requiredRRText: {
    fontSize: 16,
    color: '#e74c3c',
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  batsmenCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: 0,
    borderRadius: 8,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.md,
  },
  batsmenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batsman: {
    flex: 1,
    alignItems: 'center',
  },
  batsmanName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  batsmanScore: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  bowlerCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: 0,
    borderRadius: 8,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bowlerInfo: {
    alignItems: 'center',
  },
  bowlerName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.xs,
  },
  bowlerStats: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  nextBatsmanCard: {
    backgroundColor: '#e8f5e8',
    margin: SIZES.md,
    marginTop: 0,
    borderRadius: 8,
    padding: SIZES.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  nextBatsmanTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#666',
    marginBottom: SIZES.xs,
  },
  nextBatsmanName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
  },
  recentBallsCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: 0,
    borderRadius: 8,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentBallsContainer: {
    backgroundColor: '#f8f9fa',
    padding: SIZES.md,
    borderRadius: 4,
    alignItems: 'center',
  },
  recentBallsText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
    letterSpacing: 2,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: 0,
    borderRadius: 8,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.medium,
    marginBottom: SIZES.xs,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#333',
  },
});

export default LiveScorecard;