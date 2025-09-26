import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, COUNTRY_COLORS } from '../constants';
import { Match } from '../types';
import { mockCurrentBatsmen, mockCurrentBowlers, mockScorecardData, mockRecentBalls } from '../data/mockData';
import CollapsibleSection from '../components/CollapsibleSection';

interface MatchDetailScreenProps {
  match: Match;
  onBack: () => void;
}

const MatchDetailScreen: React.FC<MatchDetailScreenProps> = ({ match, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'scorecard' | 'commentary'>('summary');
  const [expandedSection, setExpandedSection] = useState<string | null>('battingTeam');

  const { homeTeam, awayTeam, score, status, venue, date } = match;

  // Determine which team is batting and which is bowling
  const battingTeam = score?.currentInnings === 'home' ? homeTeam : awayTeam;
  const bowlingTeam = score?.currentInnings === 'home' ? awayTeam : homeTeam;

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Get country-specific background color
  const getCountryBackgroundColor = () => {
    return COUNTRY_COLORS[battingTeam.name as keyof typeof COUNTRY_COLORS] || COLORS.background;
  };

  // Get current players for this match
  const currentBatsmen = mockCurrentBatsmen[match.id as keyof typeof mockCurrentBatsmen] || [];
  const currentBowler = mockCurrentBowlers[match.id as keyof typeof mockCurrentBowlers];
  const recentBalls = mockRecentBalls[match.id as keyof typeof mockRecentBalls] || [];

  // Mock commentary data
  const mockCommentary = [
    { over: '19.6', ball: '6', text: 'SIX! Virat Kohli smashes it over long-on for a maximum!', runs: 6 },
    { over: '19.5', ball: '5', text: 'Single to deep mid-wicket. Good running between the wickets.', runs: 1 },
    { over: '19.4', ball: '4', text: 'FOUR! Rohit Sharma finds the gap at cover point.', runs: 4 },
    { over: '19.3', ball: '3', text: 'Dot ball. Good line and length from Pat Cummins.', runs: 0 },
    { over: '19.2', ball: '2', text: 'Two runs to long-on. India need 12 more from 4 balls.', runs: 2 },
    { over: '19.1', ball: '1', text: 'Wide ball. Extra run to India.', runs: 1 },
  ];

  const renderSummary = () => (
    <View style={styles.tabContent}>
      <View style={styles.matchInfo}>
        <Text style={styles.venue}>{venue}</Text>
        <Text style={styles.date}>{new Date(date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.scoreSummary}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{homeTeam.name}</Text>
          <Text style={styles.score}>
            {score?.homeTeam.runs}/{score?.homeTeam.wickets} ({score?.homeTeam.overs} overs)
          </Text>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{awayTeam.name}</Text>
          <Text style={styles.score}>
            {score?.awayTeam.runs}/{score?.awayTeam.wickets} ({score?.awayTeam.overs} overs)
          </Text>
        </View>
      </View>

      {currentBatsmen.length > 0 && (
        <View style={[styles.currentPlayers, { borderLeftColor: COUNTRY_COLORS[battingTeam.name as keyof typeof COUNTRY_COLORS], borderLeftWidth: 4 }]}>
          <Text style={[styles.sectionTitle, { color: COUNTRY_COLORS[battingTeam.name as keyof typeof COUNTRY_COLORS] }]}>Current Batsmen</Text>
          {currentBatsmen.map((batsman, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerName}>
                {batsman.name}{batsman.isStriker ? ' *' : ''}
              </Text>
              <Text style={styles.playerStats}>
                {batsman.runs} ({batsman.balls})
              </Text>
            </View>
          ))}
        </View>
      )}

      {currentBowler && (
        <View style={[styles.currentPlayers, { borderLeftColor: COUNTRY_COLORS[bowlingTeam.name as keyof typeof COUNTRY_COLORS], borderLeftWidth: 4 }]}>
          <Text style={[styles.sectionTitle, { color: COUNTRY_COLORS[bowlingTeam.name as keyof typeof COUNTRY_COLORS] }]}>Current Bowler</Text>
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{currentBowler.name}</Text>
            <Text style={styles.playerStats}>
              {currentBowler.wickets}/{currentBowler.runs} ({currentBowler.overs} overs)
            </Text>
          </View>
        </View>
      )}

      {/* Recent Balls */}
      {recentBalls.length > 0 && (
        <View style={styles.currentPlayers}>
          <Text style={styles.sectionTitle}>Recent Balls</Text>
          {recentBalls.map((ball, index) => (
            <View key={index} style={styles.recentBallRow}>
              <Text style={styles.ballNumber}>{ball.ball}</Text>
              <Text style={[
                styles.ballRuns,
                { color: ball.runs === 6 ? COLORS.success : ball.runs === 4 ? COLORS.primary : COLORS.text }
              ]}>
                {ball.runs === 0 ? '•' : ball.runs}
              </Text>
              <Text style={styles.ballDescription}>{ball.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderScorecard = () => {
    const scorecardData = mockScorecardData[match.id as keyof typeof mockScorecardData];
    
    if (!scorecardData) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Scorecard</Text>
          <Text style={styles.noDataText}>No scorecard data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Batting Team Scorecard */}
        <CollapsibleSection
          title={`${battingTeam.name} Batting`}
          isExpanded={expandedSection === 'battingTeam'}
          onToggle={() => handleSectionToggle('battingTeam')}
        >
          <View style={styles.scorecardTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Batsman</Text>
              <Text style={styles.headerText}>R</Text>
              <Text style={styles.headerText}>B</Text>
              <Text style={styles.headerText}>4s</Text>
              <Text style={styles.headerText}>6s</Text>
              <Text style={styles.headerText}>SR</Text>
            </View>

            {(scorecardData.batting as any)[battingTeam.name]?.map((batsman: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellText}>
                  {batsman.name}{batsman.isStriker ? ' *' : ''}{batsman.isNotOut ? ' (not out)' : ''}
                </Text>
                <Text style={styles.cellText}>{batsman.runs}</Text>
                <Text style={styles.cellText}>{batsman.balls}</Text>
                <Text style={styles.cellText}>{batsman.fours}</Text>
                <Text style={styles.cellText}>{batsman.sixes}</Text>
                <Text style={styles.cellText}>
                  {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                </Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>

        {/* Bowling Team Scorecard */}
        <CollapsibleSection
          title={`${bowlingTeam.name} Bowling`}
          isExpanded={expandedSection === 'bowlingTeam'}
          onToggle={() => handleSectionToggle('bowlingTeam')}
        >
          <View style={styles.scorecardTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Bowler</Text>
              <Text style={styles.headerText}>O</Text>
              <Text style={styles.headerText}>M</Text>
              <Text style={styles.headerText}>R</Text>
              <Text style={styles.headerText}>W</Text>
              <Text style={styles.headerText}>ER</Text>
            </View>

            {(scorecardData.bowling as any)[bowlingTeam.name]?.map((bowler: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellText}>{bowler.name}</Text>
                <Text style={styles.cellText}>{bowler.overs}</Text>
                <Text style={styles.cellText}>{bowler.maidens}</Text>
                <Text style={styles.cellText}>{bowler.runs}</Text>
                <Text style={styles.cellText}>{bowler.wickets}</Text>
                <Text style={styles.cellText}>{bowler.economy.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>

        {/* Other Team Batting (Collapsed by default) */}
        <CollapsibleSection
          title={`${bowlingTeam.name} Batting`}
          isExpanded={expandedSection === 'otherBatting'}
          onToggle={() => handleSectionToggle('otherBatting')}
        >
          <View style={styles.scorecardTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Batsman</Text>
              <Text style={styles.headerText}>R</Text>
              <Text style={styles.headerText}>B</Text>
              <Text style={styles.headerText}>4s</Text>
              <Text style={styles.headerText}>6s</Text>
              <Text style={styles.headerText}>SR</Text>
            </View>

            {(scorecardData.batting as any)[bowlingTeam.name]?.map((batsman: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellText}>
                  {batsman.name}{batsman.isStriker ? ' *' : ''}{batsman.isNotOut ? ' (not out)' : ''}
                </Text>
                <Text style={styles.cellText}>{batsman.runs}</Text>
                <Text style={styles.cellText}>{batsman.balls}</Text>
                <Text style={styles.cellText}>{batsman.fours}</Text>
                <Text style={styles.cellText}>{batsman.sixes}</Text>
                <Text style={styles.cellText}>
                  {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                </Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>

        {/* Other Team Bowling (Collapsed by default) */}
        <CollapsibleSection
          title={`${battingTeam.name} Bowling`}
          isExpanded={expandedSection === 'otherBowling'}
          onToggle={() => handleSectionToggle('otherBowling')}
        >
          <View style={styles.scorecardTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Bowler</Text>
              <Text style={styles.headerText}>O</Text>
              <Text style={styles.headerText}>M</Text>
              <Text style={styles.headerText}>R</Text>
              <Text style={styles.headerText}>W</Text>
              <Text style={styles.headerText}>ER</Text>
            </View>

            {(scorecardData.bowling as any)[battingTeam.name]?.map((bowler: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellText}>{bowler.name}</Text>
                <Text style={styles.cellText}>{bowler.overs}</Text>
                <Text style={styles.cellText}>{bowler.maidens}</Text>
                <Text style={styles.cellText}>{bowler.runs}</Text>
                <Text style={styles.cellText}>{bowler.wickets}</Text>
                <Text style={styles.cellText}>{bowler.economy.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>
      </View>
    );
  };

  const renderCommentary = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ball-by-Ball Commentary</Text>
      
      {mockCommentary.map((comment, index) => (
        <View key={index} style={styles.commentaryItem}>
          <View style={styles.commentaryHeader}>
            <Text style={styles.overText}>{comment.over}</Text>
            <Text style={styles.ballText}>Ball {comment.ball}</Text>
            <Text style={[
              styles.runsText,
              { color: comment.runs === 6 ? COLORS.success : comment.runs === 4 ? COLORS.primary : COLORS.text }
            ]}>
              {comment.runs === 0 ? '•' : comment.runs}
            </Text>
          </View>
          <Text style={styles.commentaryText}>{comment.text}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {homeTeam.name} vs {awayTeam.name}
        </Text>
      </View>

       {/* Match Status */}
       <View style={styles.statusBar}>
         <Text style={[styles.statusText, { color: status === 'live' ? COLORS.error : COLORS.warning }]}>
           {status.toUpperCase()}
         </Text>
         <Text style={styles.statusSubtext}>
           {battingTeam.name} batting
         </Text>
       </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
          onPress={() => setActiveTab('scorecard')}
        >
          <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
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
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'scorecard' && renderScorecard()}
        {activeTab === 'commentary' && renderCommentary()}
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
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SIZES.md,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    padding: SIZES.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SIZES.lg,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  venue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scoreSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  teamScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  score: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  currentPlayers: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  playerName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  playerStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scorecardTable: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderTopLeftRadius: SIZES.sm,
    borderTopRightRadius: SIZES.sm,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.surface,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cellText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  commentaryItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  commentaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  overText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SIZES.sm,
  },
  ballText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: SIZES.sm,
  },
  runsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  commentaryText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.sm,
  },
  recentBallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  ballNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 40,
  },
  ballRuns: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  ballDescription: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    marginLeft: SIZES.sm,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.lg,
  },
});

export default MatchDetailScreen;
