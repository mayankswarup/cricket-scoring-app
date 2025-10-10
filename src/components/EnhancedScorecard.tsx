import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface BatsmanScore {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
}

interface BowlerFigures {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface InningsData {
  teamName: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  runRate: number;
  batsmen: BatsmanScore[];
  bowlers: BowlerFigures[];
  extras: {
    wide: number;
    noBall: number;
    bye: number;
    legBye: number;
    total: number;
  };
  fallOfWickets: Array<{
    runs: number;
    wickets: number;
    player: string;
    over: number;
  }>;
}

interface EnhancedScorecardProps {
  innings: InningsData;
}

const EnhancedScorecard: React.FC<EnhancedScorecardProps> = ({ innings }) => {
  const [expandedSection, setExpandedSection] = useState<'batting' | 'bowling' | 'extras' | null>('batting');

  const toggleSection = (section: 'batting' | 'bowling' | 'extras') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      {/* Team Header */}
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{innings.teamName}</Text>
        <Text style={styles.teamScore}>
          {innings.totalRuns}/{innings.wickets} ({innings.overs})
        </Text>
        <Text style={styles.runRate}>RR: {innings.runRate.toFixed(2)}</Text>
      </View>

      {/* Batting Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('batting')}
      >
        <Text style={styles.sectionTitle}>🏏 Batting</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'batting' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'batting' && (
        <View style={styles.sectionContent}>
          {/* Batting Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.playerColumn]}>Batsman</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>R</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>B</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>4s</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>6s</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>SR</Text>
          </View>

          {/* Batting Rows */}
          {innings.batsmen.map((batsman, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.playerColumn}>
                <Text style={styles.playerName}>{batsman.name}</Text>
                {batsman.dismissal && (
                  <Text style={styles.dismissalText}>{batsman.dismissal}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.numColumn]}>{batsman.runs}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{batsman.balls}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{batsman.fours}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{batsman.sixes}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>
                {batsman.strikeRate.toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Bowling Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('bowling')}
      >
        <Text style={styles.sectionTitle}>⚡ Bowling</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'bowling' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'bowling' && (
        <View style={styles.sectionContent}>
          {/* Bowling Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.playerColumn]}>Bowler</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>O</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>M</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>R</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>W</Text>
            <Text style={[styles.tableHeaderText, styles.numColumn]}>Econ</Text>
          </View>

          {/* Bowling Rows */}
          {innings.bowlers.map((bowler, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.playerName, styles.playerColumn]}>{bowler.name}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{bowler.overs.toFixed(1)}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{bowler.maidens}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{bowler.runs}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>{bowler.wickets}</Text>
              <Text style={[styles.tableCell, styles.numColumn]}>
                {bowler.economy.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Extras Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('extras')}
      >
        <Text style={styles.sectionTitle}>📊 Extras & Fall of Wickets</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'extras' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'extras' && (
        <View style={styles.sectionContent}>
          {/* Extras */}
          <View style={styles.extrasContainer}>
            <Text style={styles.extrasTitle}>Extras ({innings.extras.total})</Text>
            <View style={styles.extrasRow}>
              <Text style={styles.extrasText}>Wide: {innings.extras.wide}</Text>
              <Text style={styles.extrasText}>No Ball: {innings.extras.noBall}</Text>
            </View>
            <View style={styles.extrasRow}>
              <Text style={styles.extrasText}>Bye: {innings.extras.bye}</Text>
              <Text style={styles.extrasText}>Leg Bye: {innings.extras.legBye}</Text>
            </View>
          </View>

          {/* Fall of Wickets */}
          <View style={styles.fowContainer}>
            <Text style={styles.fowTitle}>Fall of Wickets</Text>
            <View style={styles.fowList}>
              {innings.fallOfWickets.map((fow, index) => (
                <View key={index} style={styles.fowItem}>
                  <Text style={styles.fowText}>
                    {fow.runs}/{fow.wickets} ({fow.player}, {fow.over})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  teamHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  teamScore: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  runRate: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  expandIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  playerColumn: {
    flex: 2,
  },
  numColumn: {
    flex: 0.7,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  dismissalText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tableCell: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  extrasContainer: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.md,
  },
  extrasTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  extrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs,
  },
  extrasText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  fowContainer: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
  },
  fowTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  fowList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fowItem: {
    marginRight: SIZES.md,
    marginBottom: SIZES.xs,
  },
  fowText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default EnhancedScorecard;

