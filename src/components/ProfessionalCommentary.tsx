import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface BallEvent {
  id: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  isWide?: boolean;
  isNoBall?: boolean;
  batsman?: string;
  bowler?: string;
  commentary?: string;
  dismissal?: string;
  timestamp: number;
}

interface CurrentOver {
  over: number;
  balls: BallEvent[];
  runs: number;
  wickets: number;
}

interface ProfessionalCommentaryProps {
  currentOver: CurrentOver;
  recentBalls: BallEvent[];
  currentBatsman: string;
  currentBowler: string;
  totalRuns: number;
  totalWickets: number;
}

const ProfessionalCommentary: React.FC<ProfessionalCommentaryProps> = ({
  currentOver,
  recentBalls,
  currentBatsman,
  currentBowler,
  totalRuns,
  totalWickets,
}) => {
  const getBallSymbol = (ball: BallEvent) => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return 'WD';
    if (ball.isNoBall) return 'NB';
    if (ball.runs === 0) return '0';
    return ball.runs.toString();
  };

  const getBallColor = (ball: BallEvent) => {
    if (ball.isWicket) return COLORS.error;
    if (ball.isWide || ball.isNoBall) return COLORS.warning;
    if (ball.runs === 4) return COLORS.success;
    if (ball.runs === 6) return COLORS.primary;
    return COLORS.gray;
  };

  const renderCurrentOver = () => (
    <View style={styles.currentOverContainer}>
      <View style={styles.overHeader}>
        <Text style={styles.overTitle}>OVER {currentOver.over}</Text>
        <Text style={styles.overSummary}>
          {currentOver.runs} Runs | {currentOver.wickets} Wkt
        </Text>
        <Text style={styles.matchScore}>
          {totalRuns}/{totalWickets}
        </Text>
      </View>
      
      <View style={styles.ballsContainer}>
        {currentOver.balls.map((ball, index) => (
          <View key={index} style={styles.ballChip}>
            <Text style={[styles.ballSymbol, { color: getBallColor(ball) }]}>
              {getBallSymbol(ball)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCurrentPlayers = () => (
    <View style={styles.currentPlayersContainer}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{currentBatsman}</Text>
        <Text style={styles.playerStats}>1(1)</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{currentBowler}</Text>
        <Text style={styles.playerStats}>2-0-12-2</Text>
      </View>
    </View>
  );

  const renderCommentaryList = () => (
    <View style={styles.commentaryContainer}>
      <Text style={styles.commentaryTitle}>COMMENTARY</Text>
      
      {recentBalls.map((ball, index) => (
        <View key={ball.id} style={styles.commentaryItem}>
          <View style={styles.ballInfo}>
            <View style={[styles.ballCircle, { backgroundColor: getBallColor(ball) }]}>
              <Text style={styles.ballText}>
                {getBallSymbol(ball)}
              </Text>
            </View>
            <Text style={styles.overBall}>
              {ball.over}.{ball.ball}
            </Text>
          </View>
          
          <View style={styles.commentaryText}>
            <Text style={styles.commentaryMain}>
              {ball.bowler || 'Bowler'} to {ball.batsman || 'Batsman'}, {ball.commentary || `${ball.runs} run${ball.runs > 1 ? 's' : ''}`}
            </Text>
            {ball.dismissal && (
              <Text style={styles.dismissalText}>
                {ball.dismissal}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderCurrentOver()}
      {renderCurrentPlayers()}
      {renderCommentaryList()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  currentOverContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  overHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  overTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  overSummary: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  matchScore: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  ballsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ballChip: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 15,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    marginRight: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  ballSymbol: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  currentPlayersContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  playerInfo: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  playerStats: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  commentaryContainer: {
    backgroundColor: COLORS.white,
  },
  commentaryTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  commentaryItem: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  ballInfo: {
    alignItems: 'center',
    marginRight: SIZES.md,
    minWidth: 50,
  },
  ballCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  ballText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  overBall: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  commentaryText: {
    flex: 1,
  },
  commentaryMain: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  dismissalText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SIZES.xs,
  },
});

export default ProfessionalCommentary;
