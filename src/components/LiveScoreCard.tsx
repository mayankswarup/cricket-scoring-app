import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS, COUNTRY_COLORS } from '../constants';
import { Match } from '../types';
import { mockCurrentBatsmen, mockCurrentBowlers } from '../data/mockData';

interface LiveScoreCardProps {
  match: Match;
  onPress?: () => void;
}

const LiveScoreCard: React.FC<LiveScoreCardProps> = ({ match, onPress }) => {
  const { homeTeam, awayTeam, score, status } = match;

  // Get container style with platform-specific shadows
  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.md,
      padding: SIZES.lg,
      marginVertical: SIZES.sm,
      elevation: 5,
    };

    if (Platform.OS === 'web') {
      return {
        ...baseStyle,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      };
    } else {
      return {
        ...baseStyle,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      };
    }
  };

  // Get country-specific background color
  const getCountryBackgroundColor = () => {
    const battingTeam = score?.currentInnings === 'home' ? homeTeam.name : awayTeam.name;
    return COUNTRY_COLORS[battingTeam as keyof typeof COUNTRY_COLORS] || COLORS.surface;
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return COLORS.error; // Red for live
      case 'upcoming':
        return COLORS.warning; // Orange for upcoming
      case 'completed':
        return COLORS.success; // Green for completed
      default:
        return COLORS.textSecondary;
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'live':
        return '🔴 LIVE';
      case 'upcoming':
        return '⏰ UPCOMING';
      case 'completed':
        return '✅ COMPLETED';
      default:
        return 'UNKNOWN';
    }
  };

  // Get current score
  const getCurrentScore = () => {
    if (!score) return 'TBD';
    
    const { homeTeam: home, awayTeam: away, currentInnings } = score;
    
    if (currentInnings === 'home') {
      return `${home.runs}/${home.wickets} (${home.overs} overs)`;
    } else {
      return `${away.runs}/${away.wickets} (${away.overs} overs)`;
    }
  };

  // Get current team
  const getCurrentTeam = () => {
    if (!score) return '';
    
    const { currentInnings } = score;
    return currentInnings === 'home' ? homeTeam.name : awayTeam.name;
  };

  // Get target
  const getTarget = () => {
    if (!score || !score.target) return '';
    return `Target: ${score.target}`;
  };

  return (
    <TouchableOpacity style={getContainerStyle()} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.tournamentText}>T20 World Cup 2024</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamFlag}>{homeTeam.logo}</Text>
          <Text style={styles.teamName}>{homeTeam.name}</Text>
        </View>
        
        <Text style={styles.vsText}>vs</Text>
        
        <View style={styles.team}>
          <Text style={styles.teamFlag}>{awayTeam.logo}</Text>
          <Text style={styles.teamName}>{awayTeam.name}</Text>
        </View>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.battingTeam}>
          🏏 {getCurrentTeam()} (Batting)
        </Text>
        <Text style={styles.score}>{getCurrentScore()}</Text>
        {getTarget() && (
          <Text style={styles.target}>{getTarget()}</Text>
        )}
      </View>

      {/* Current Players */}
      <View style={styles.playersContainer}>
        <Text style={styles.playerLabel}>Current Batsmen:</Text>
        {mockCurrentBatsmen[match.id as keyof typeof mockCurrentBatsmen]?.map((batsman, index) => (
          <Text key={index} style={styles.player}>
            🏏 {batsman.name}{batsman.isStriker ? '*' : null} {batsman.runs} ({batsman.balls})
          </Text>
        ))}
        
        <Text style={styles.playerLabel}>Current Bowler:</Text>
        {mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers] && (
          <Text style={styles.player}>
            🎯 {mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers].name} {mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers].wickets}/{mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers].runs} ({mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers].overs})
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tournamentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamFlag: {
    fontSize: 24,
    marginBottom: SIZES.xs,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  vsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.md,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  battingTeam: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  target: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  playersContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.md,
  },
  playerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    marginTop: SIZES.sm,
  },
  player: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
});

export default LiveScoreCard;
