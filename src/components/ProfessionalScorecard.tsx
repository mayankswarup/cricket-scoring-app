import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface BattingStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  minutes: number;
  isOut: boolean;
  dismissal?: string;
}

interface BowlingStats {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface FallOfWicket {
  wicket: number;
  batsman: string;
  score: number;
  over: string;
}

interface ProfessionalScorecardProps {
  battingStats: BattingStats[];
  bowlingStats: BowlingStats[];
  fallOfWickets: FallOfWicket[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: string;
  extras: number;
  runRate: number;
  teamName: string;
}

const ProfessionalScorecard: React.FC<ProfessionalScorecardProps> = ({
  battingStats,
  bowlingStats,
  fallOfWickets,
  totalRuns,
  totalWickets,
  totalOvers,
  extras,
  runRate,
  teamName,
}) => {
  const renderBattingTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.sectionTitle}>Batting</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.batterColumn]}>Batters</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>R</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>B</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>4s</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>6s</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>SR</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>Min</Text>
      </View>
      
      {battingStats.map((player, index) => (
        <View key={player.id} style={styles.tableRow}>
          <View style={styles.batterColumn}>
            <Text style={styles.batterName}>
              {player.name} {!player.isOut && '*'}
            </Text>
            {player.dismissal && (
              <Text style={styles.dismissal}>{player.dismissal}</Text>
            )}
          </View>
          <Text style={[styles.numberCell, { color: player.runs >= 50 ? COLORS.success : COLORS.text }]}>
            {player.runs}
          </Text>
          <Text style={styles.numberCell}>{player.balls}</Text>
          <Text style={styles.numberCell}>{player.fours}</Text>
          <Text style={styles.numberCell}>{player.sixes}</Text>
          <Text style={[styles.numberCell, { color: player.strikeRate >= 100 ? COLORS.success : COLORS.text }]}>
            {player.strikeRate.toFixed(1)}
          </Text>
          <Text style={styles.numberCell}>{player.minutes}</Text>
        </View>
      ))}
    </View>
  );

  const renderBowlingTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.sectionTitle}>Bowling</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.bowlerColumn]}>Bowlers</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>O</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>M</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>R</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>W</Text>
        <Text style={[styles.headerCell, styles.numberColumn]}>Eco</Text>
      </View>
      
      {bowlingStats.map((bowler, index) => (
        <View key={bowler.id} style={styles.tableRow}>
          <Text style={styles.bowlerName}>{bowler.name}</Text>
          <Text style={styles.numberCell}>{bowler.overs.toFixed(1)}</Text>
          <Text style={styles.numberCell}>{bowler.maidens}</Text>
          <Text style={styles.numberCell}>{bowler.runs}</Text>
          <Text style={[styles.numberCell, { color: bowler.wickets > 0 ? COLORS.success : COLORS.text }]}>
            {bowler.wickets}
          </Text>
          <Text style={[styles.numberCell, { color: bowler.economy <= 6 ? COLORS.success : bowler.economy <= 9 ? COLORS.warning : COLORS.error }]}>
            {bowler.economy.toFixed(1)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFallOfWickets = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.sectionTitle}>Fall of Wickets</Text>
      <View style={styles.fowHeader}>
        <Text style={styles.fowHeaderCell}>Wicket</Text>
        <Text style={styles.fowHeaderCell}>Batsman</Text>
        <Text style={styles.fowHeaderCell}>Score (over)</Text>
      </View>
      
      {fallOfWickets.map((wicket, index) => (
        <View key={index} style={styles.fowRow}>
          <Text style={styles.fowCell}>{wicket.wicket}</Text>
          <Text style={styles.fowBatsman}>{wicket.batsman}</Text>
          <Text style={styles.fowScore}>{wicket.score} ({wicket.over})</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Match Summary */}
      <View style={styles.matchSummary}>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.score}>
          {totalRuns}/{totalWickets} ({totalOvers} Ov)
        </Text>
        <Text style={styles.runRate}>CRR {runRate.toFixed(2)}</Text>
      </View>

      {/* Extras */}
      <View style={styles.extrasContainer}>
        <Text style={styles.extrasText}>
          Extras: {extras} (wd {extras})
        </Text>
      </View>

      {/* Batting Table */}
      {renderBattingTable()}

      {/* Bowling Table */}
      {renderBowlingTable()}

      {/* Fall of Wickets */}
      {fallOfWickets.length > 0 && renderFallOfWickets()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  matchSummary: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  teamName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  score: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  runRate: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  extrasContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  extrasText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  tableContainer: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  headerCell: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  batterColumn: {
    flex: 2,
    textAlign: 'left',
  },
  bowlerColumn: {
    flex: 2,
    textAlign: 'left',
  },
  numberColumn: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  batterName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    marginBottom: 2,
  },
  bowlerName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    flex: 2,
  },
  dismissal: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  numberCell: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  fowHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  fowHeaderCell: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  fowRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  fowCell: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  fowBatsman: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    flex: 2,
    textAlign: 'left',
  },
  fowScore: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
});

export default ProfessionalScorecard;
