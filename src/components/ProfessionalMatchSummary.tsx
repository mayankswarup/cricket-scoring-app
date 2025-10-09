import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface MatchSummaryProps {
  team1Name: string;
  team2Name: string;
  team1Score: string;
  team2Score: string;
  team1Overs: string;
  team2Overs: string;
  team1RunRate: number;
  team2RunRate: number;
  team1Extras: number;
  team2Extras: number;
  target?: number;
  requiredRuns?: number;
  requiredBalls?: number;
  isLive: boolean;
}

const ProfessionalMatchSummary: React.FC<MatchSummaryProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Overs,
  team2Overs,
  team1RunRate,
  team2RunRate,
  team1Extras,
  team2Extras,
  target,
  requiredRuns,
  requiredBalls,
  isLive,
}) => {
  const renderTeamScore = (teamName: string, score: string, overs: string, runRate: number, extras: number, isBatting: boolean) => (
    <View style={styles.teamContainer}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{teamName}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.overs}>({overs} Ov)</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.runRate}>RR {runRate.toFixed(2)}</Text>
        <Text style={styles.extras}>Extras: {extras}</Text>
      </View>
    </View>
  );

  const renderTargetInfo = () => {
    if (!target || !requiredRuns || !requiredBalls) return null;
    
    return (
      <View style={styles.targetContainer}>
        <Text style={styles.targetText}>
          {team2Name} need {requiredRuns} runs in {requiredBalls} balls
        </Text>
        <Text style={styles.targetRate}>
          Required RR: {(requiredRuns / (requiredBalls / 6)).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTeamScore(team1Name, team1Score, team1Overs, team1RunRate, team1Extras, true)}
      
      {renderTargetInfo()}
      
      {renderTeamScore(team2Name, team2Score, team2Overs, team2RunRate, team2Extras, false)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  teamContainer: {
    marginBottom: SIZES.md,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  liveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
  },
  liveText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  score: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: SIZES.sm,
  },
  overs: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runRate: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  extras: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  targetContainer: {
    backgroundColor: COLORS.warning,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.sm,
    alignItems: 'center',
  },
  targetText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  targetRate: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
});

export default ProfessionalMatchSummary;
