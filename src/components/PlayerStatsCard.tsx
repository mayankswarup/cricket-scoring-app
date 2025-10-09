import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface PlayerStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  isOnStrike: boolean;
  // Bowling stats
  overs?: number;
  wickets?: number;
  economy?: number;
  maidens?: number;
}

interface PlayerStatsCardProps {
  player: PlayerStats;
  isBatsman?: boolean;
  onPress?: () => void;
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  player,
  isBatsman = true,
  onPress,
}) => {
  const getStrikeRateColor = (sr: number) => {
    if (sr >= 150) return COLORS.success;
    if (sr >= 100) return COLORS.primary;
    if (sr >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const getRunsColor = (runs: number) => {
    if (runs >= 50) return COLORS.success;
    if (runs >= 20) return COLORS.primary;
    return COLORS.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        player.isOnStrike && styles.strikerContainer,
        player.isOut && styles.outContainer,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={[
          styles.playerName,
          player.isOnStrike && styles.strikerText,
          player.isOut && styles.outText,
        ]}>
          {player.name}
          {player.isOnStrike && ' ⭐'}
          {player.isOut && ' ❌'}
        </Text>
        {isBatsman && (
          <View style={styles.statsRow}>
            <Text style={[styles.runs, { color: getRunsColor(player.runs) }]}>
              {player.runs}
            </Text>
            <Text style={styles.balls}>({player.balls})</Text>
          </View>
        )}
      </View>

      {isBatsman && (
        <View style={styles.battingStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>4s</Text>
            <Text style={styles.statValue}>{player.fours}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>6s</Text>
            <Text style={styles.statValue}>{player.sixes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SR</Text>
            <Text style={[styles.statValue, { color: getStrikeRateColor(player.strikeRate) }]}>
              {player.strikeRate.toFixed(1)}
            </Text>
          </View>
        </View>
      )}

      {!isBatsman && (
        <View style={styles.bowlingStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Overs</Text>
            <Text style={styles.statValue}>{player.overs?.toFixed(1) || '0.0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wickets</Text>
            <Text style={styles.statValue}>{player.wickets || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Runs</Text>
            <Text style={styles.statValue}>{player.runs}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Economy</Text>
            <Text style={styles.statValue}>{player.economy?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strikerContainer: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.lightGray,
  },
  outContainer: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  strikerText: {
    color: COLORS.primary,
  },
  outText: {
    color: COLORS.error,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runs: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balls: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  battingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bowlingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
});

export default PlayerStatsCard;
