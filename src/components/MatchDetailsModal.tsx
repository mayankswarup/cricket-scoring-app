import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

const { width, height } = Dimensions.get('window');

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'batting' | 'bowling' | 'commentary'>('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>{match.team1.name} vs {match.team2.name}</Text>
        <Text style={styles.matchStatus}>{match.status} • {match.overs} overs</Text>
        <Text style={styles.matchVenue}>📍 {match.venue}</Text>
        <Text style={styles.matchTime}>🕐 {match.time}</Text>
      </View>

      {/* Current Score */}
      <View style={styles.currentScore}>
        <View style={styles.scoreCard}>
          <Text style={styles.teamName}>{match.team1.name}</Text>
          <Text style={styles.teamScore}>{match.team1.score}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.teamName}>{match.team2.name}</Text>
          <Text style={styles.teamScore}>{match.team2.score}</Text>
        </View>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Toss Winner:</Text>
          <Text style={styles.infoValue}>{match.tossWinner}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Toss Decision:</Text>
          <Text style={styles.infoValue}>{match.tossDecision}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Target:</Text>
          <Text style={styles.infoValue}>{match.target} runs</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Required RR:</Text>
          <Text style={styles.infoValue}>{match.requiredRunRate}</Text>
        </View>
      </View>

      {/* Current Batsmen */}
      <View style={styles.currentBatsmen}>
        <Text style={styles.sectionTitle}>Current Batsmen</Text>
        <Text style={styles.batsmanText}>Batsman: {match.batsman}</Text>
        <Text style={styles.bowlerText}>Bowler: {match.bowler}</Text>
      </View>
    </View>
  );

  const renderBatting = () => (
    <View style={styles.battingContainer}>
      {/* Team 1 Scorecard */}
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={() => toggleSection('team1Scorecard')}
      >
        <Text style={styles.accordionTitle}>{match.team1.name} - Scorecard</Text>
        <Text style={styles.accordionIcon}>{expandedSections.team1Scorecard ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {expandedSections.team1Scorecard && (
        <View style={styles.accordionContent}>
          {/* Batting Section */}
          <Text style={styles.subSectionTitle}>🏏 Batting</Text>
          <View style={styles.battingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Batsman</Text>
              <Text style={styles.tableHeaderText}>R</Text>
              <Text style={styles.tableHeaderText}>B</Text>
              <Text style={styles.tableHeaderText}>4s</Text>
              <Text style={styles.tableHeaderText}>6s</Text>
              <Text style={styles.tableHeaderText}>SR</Text>
            </View>
            {(match.team1?.batting || []).map((batsman: any, index: number) => (
              <View key={index} style={[
                styles.tableRow,
                batsman.isOut && styles.outBatsman
              ]}>
                <Text style={[styles.tableCell, styles.batsmanName]}>
                  {batsman.name} {batsman.isOut ? '✗' : ''}
                </Text>
                <Text style={styles.tableCell}>{batsman.runs || 0}</Text>
                <Text style={styles.tableCell}>{batsman.balls || 0}</Text>
                <Text style={styles.tableCell}>{batsman.fours || 0}</Text>
                <Text style={styles.tableCell}>{batsman.sixes || 0}</Text>
                <Text style={styles.tableCell}>{batsman.strikeRate || 0}</Text>
              </View>
            ))}
            {(!match.team1?.batting || match.team1.batting.length === 0) && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No batting data available</Text>
              </View>
            )}
          </View>

          {/* Bowling Section */}
          <Text style={[styles.subSectionTitle, styles.bowlingTitle]}>⚡ Bowling</Text>
          <View style={styles.bowlingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Bowler</Text>
              <Text style={styles.tableHeaderText}>O</Text>
              <Text style={styles.tableHeaderText}>M</Text>
              <Text style={styles.tableHeaderText}>R</Text>
              <Text style={styles.tableHeaderText}>W</Text>
              <Text style={styles.tableHeaderText}>Econ</Text>
            </View>
            {(match.team2?.bowling || []).map((bowler: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bowlerName]}>{bowler.name}</Text>
                <Text style={styles.tableCell}>{bowler.overs || 0}</Text>
                <Text style={styles.tableCell}>{bowler.maidens || 0}</Text>
                <Text style={styles.tableCell}>{bowler.runs || 0}</Text>
                <Text style={styles.tableCell}>{bowler.wickets || 0}</Text>
                <Text style={styles.tableCell}>{bowler.economy || 0}</Text>
              </View>
            ))}
            {(!match.team2?.bowling || match.team2.bowling.length === 0) && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No bowling data available</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Team 2 Scorecard */}
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={() => toggleSection('team2Scorecard')}
      >
        <Text style={styles.accordionTitle}>{match.team2.name} - Scorecard</Text>
        <Text style={styles.accordionIcon}>{expandedSections.team2Scorecard ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {expandedSections.team2Scorecard && (
        <View style={styles.accordionContent}>
          {/* Batting Section */}
          <Text style={styles.subSectionTitle}>🏏 Batting</Text>
          <View style={styles.battingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Batsman</Text>
              <Text style={styles.tableHeaderText}>R</Text>
              <Text style={styles.tableHeaderText}>B</Text>
              <Text style={styles.tableHeaderText}>4s</Text>
              <Text style={styles.tableHeaderText}>6s</Text>
              <Text style={styles.tableHeaderText}>SR</Text>
            </View>
            {(match.team2?.batting || []).map((batsman: any, index: number) => (
              <View key={index} style={[
                styles.tableRow,
                batsman.isOut && styles.outBatsman
              ]}>
                <Text style={[styles.tableCell, styles.batsmanName]}>
                  {batsman.name} {batsman.isOut ? '✗' : ''}
                </Text>
                <Text style={styles.tableCell}>{batsman.runs || 0}</Text>
                <Text style={styles.tableCell}>{batsman.balls || 0}</Text>
                <Text style={styles.tableCell}>{batsman.fours || 0}</Text>
                <Text style={styles.tableCell}>{batsman.sixes || 0}</Text>
                <Text style={styles.tableCell}>{batsman.strikeRate || 0}</Text>
              </View>
            ))}
            {(!match.team2?.batting || match.team2.batting.length === 0) && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No batting data available</Text>
              </View>
            )}
          </View>

          {/* Bowling Section */}
          <Text style={[styles.subSectionTitle, styles.bowlingTitle]}>⚡ Bowling</Text>
          <View style={styles.bowlingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Bowler</Text>
              <Text style={styles.tableHeaderText}>O</Text>
              <Text style={styles.tableHeaderText}>M</Text>
              <Text style={styles.tableHeaderText}>R</Text>
              <Text style={styles.tableHeaderText}>W</Text>
              <Text style={styles.tableHeaderText}>Econ</Text>
            </View>
            {(match.team1?.bowling || []).map((bowler: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bowlerName]}>{bowler.name}</Text>
                <Text style={styles.tableCell}>{bowler.overs || 0}</Text>
                <Text style={styles.tableCell}>{bowler.maidens || 0}</Text>
                <Text style={styles.tableCell}>{bowler.runs || 0}</Text>
                <Text style={styles.tableCell}>{bowler.wickets || 0}</Text>
                <Text style={styles.tableCell}>{bowler.economy || 0}</Text>
              </View>
            ))}
            {(!match.team1?.bowling || match.team1.bowling.length === 0) && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No bowling data available</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderBowling = () => null;

  const renderCommentary = () => (
    <View style={styles.commentaryContainer}>
      <Text style={styles.sectionTitle}>Recent Balls</Text>
      {match.recentBalls.map((ball: any, index: number) => (
        <View key={index} style={styles.commentaryItem}>
          <View style={styles.commentaryHeader}>
            <Text style={styles.ballNumber}>{ball.ball}</Text>
            <Text style={styles.runsText}>{ball.runs} run{ball.runs !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.commentaryText}>{ball.commentary}</Text>
          <Text style={styles.playerInfo}>{ball.batsman} • {ball.bowler}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'batting' && styles.activeTab]}
            onPress={() => setActiveTab('batting')}
          >
            <Text style={[styles.tabText, activeTab === 'batting' && styles.activeTabText]}>
              Scorecard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'commentary' && styles.activeTab]}
            onPress={() => setActiveTab('commentary')}
          >
            <Text style={[styles.tabText, activeTab === 'commentary' && styles.activeTabText]}>
              Commentary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'batting' && renderBatting()}
          {activeTab === 'commentary' && renderCommentary()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 32,
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
    padding: SIZES.lg,
  },
  // Overview Styles
  overviewContainer: {
    gap: SIZES.lg,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  matchTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  matchStatus: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  matchVenue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  matchTime: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  currentScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.lg,
  },
  scoreCard: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamScore: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  vsText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.md,
  },
  matchInfo: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  currentBatsmen: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  batsmanText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  bowlerText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  // Accordion Styles
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
  },
  accordionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  accordionIcon: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  accordionContent: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.lg,
    overflow: 'hidden',
  },
  // Table Styles
  battingTable: {
    backgroundColor: COLORS.surface,
  },
  bowlingTable: {
    backgroundColor: COLORS.surface,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  batsmanName: {
    textAlign: 'left',
    fontFamily: FONTS.medium,
  },
  bowlerName: {
    textAlign: 'left',
    fontFamily: FONTS.medium,
  },
  outBatsman: {
    opacity: 0.6,
  },
  // Commentary Styles
  commentaryContainer: {
    gap: SIZES.md,
  },
  commentaryItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
  },
  commentaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  ballNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  runsText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  commentaryText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    lineHeight: 20,
  },
  playerInfo: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  // Container Styles
  battingContainer: {
    gap: SIZES.md,
  },
  bowlingContainer: {
    gap: SIZES.md,
  },
  noDataContainer: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
    paddingLeft: SIZES.md,
  },
  bowlingTitle: {
    marginTop: SIZES.xl,
  },
});

export default MatchDetailsModal;