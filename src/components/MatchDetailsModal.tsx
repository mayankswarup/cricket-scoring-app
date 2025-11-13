import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';
import { buildScorecardData } from '../screens/LiveScoringScreen';
import { calculateMatchStatistics } from '../utils/matchStatistics';

const { width, height } = Dimensions.get('window');

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'batting' | 'bowling' | 'commentary'>('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [matchStats, setMatchStats] = useState<any>(null);
  const [balls, setBalls] = useState<any[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load match statistics when modal opens
  useEffect(() => {
    const loadMatchStatistics = async () => {
      // Get the actual Firebase document ID - check matchId first (Firebase doc ID), then id
      // The matchId field contains the actual Firebase document ID
      const actualMatchId = (match as any)?.matchId || match?.id;
      
      console.log('🔍 MatchDetailsModal - Loading stats for match:', {
        matchId: match?.id,
        matchIdField: (match as any)?.matchId,
        actualMatchId,
        matchName: match?.name,
        team1: match?.team1?.name || match?.team1Name,
        team2: match?.team2?.name || match?.team2Name,
        status: match?.status,
        isMatchCompleted: match?.isMatchCompleted,
        fullMatch: match,
      });
      
      if (!actualMatchId) {
        console.error('❌ No match ID provided to MatchDetailsModal');
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        // Load balls for this match using the actual Firebase document ID
        const matchBalls = await liveScoringService.getMatchBalls(actualMatchId);
        console.log('🔍 Loaded balls:', {
          count: matchBalls.length,
          matchId: actualMatchId,
          sampleBall: matchBalls[0],
          ballsWithInnings: matchBalls.filter(b => b.innings !== undefined).length,
          inningsValues: [...new Set(matchBalls.map(b => b.innings).filter(v => v !== undefined))],
        });
        setBalls(matchBalls);

        if (matchBalls.length === 0) {
          console.warn('⚠️ No balls found for match:', actualMatchId);
          // Even if no balls, try to show basic match info from match document
          // Check if match has basic scoring data
          const matchRuns = (match as any).totalRuns || 0;
          const matchWickets = (match as any).wickets || 0;
          const matchOvers = (match as any).currentOver || 0;
          
          if (matchRuns > 0 || matchWickets > 0) {
            // Create basic stats from match document data
            const basicStats = {
              team1Innings: {
                teamId: match.team1?.id || 'team1',
                teamName: match.team1?.name || match.team1Name || 'Team 1',
                runs: matchRuns,
                wickets: matchWickets,
                overs: matchOvers,
                balls: 0,
                runRate: 0,
                extras: 0,
              },
              team2Innings: {
                teamId: match.team2?.id || 'team2',
                teamName: match.team2?.name || match.team2Name || 'Team 2',
                runs: 0,
                wickets: 0,
                overs: 0,
                balls: 0,
                runRate: 0,
                extras: 0,
              },
              topBatsman: null,
              topBowler: null,
              mostSixes: null,
              mostFours: null,
              playerOfMatch: null,
            };
            
            setMatchStats({ ...basicStats, scorecard: { battingStats: [], bowlingStats: [], fallOfWickets: [], extras: 0, yetToBat: [] } });
          } else {
            setMatchStats(null);
          }
          setLoadingStats(false);
          return;
        }

        // Build scorecard data
        const matchData = {
          team1: match.team1?.name || match.team1Name || 'Team 1',
          team2: match.team2?.name || match.team2Name || 'Team 2',
          balls: matchBalls,
          currentBatsmen: {
            striker: { id: '', name: '' },
            nonStriker: { id: '', name: '' },
          },
          currentBowler: { id: '', name: '' },
        };

        const scorecard = buildScorecardData(matchData as any);
        console.log('🔍 Scorecard built:', {
          battingStats: scorecard.battingStats.length,
          bowlingStats: scorecard.bowlingStats.length,
        });
        
        // Determine which team batted in which innings from inningsHistory or match data
        let team1InningsNumber: number | null = null;
        let team2InningsNumber: number | null = null;
        
        const team1Name = match.team1?.name || match.team1Name || 'Team 1';
        const team2Name = match.team2?.name || match.team2Name || 'Team 2';
        
        console.log('🔍 Determining innings assignment:', {
          team1Name,
          team2Name,
          inningsHistory: match.inningsHistory,
          battingTeamName: match.battingTeamName,
          currentInnings: match.currentInnings,
        });
        
        if (match.inningsHistory && Array.isArray(match.inningsHistory) && match.inningsHistory.length > 0) {
          // Use inningsHistory to determine which team batted in which innings
          match.inningsHistory.forEach((innings: any, index: number) => {
            const battingTeam = innings.battingTeam || innings.battingTeamName;
            const inningsNum = innings.inningsNumber || index + 1;
            if (battingTeam === team1Name) {
              team1InningsNumber = inningsNum;
            } else if (battingTeam === team2Name) {
              team2InningsNumber = inningsNum;
            }
          });
        }
        
        // If inningsHistory doesn't help, check battingTeamName for first innings
        // If match has battingTeamName, that's likely the team that batted first (innings 1)
        if (team1InningsNumber === null || team2InningsNumber === null) {
          const firstBattingTeam = match.battingTeamName || (match.inningsHistory && match.inningsHistory[0]?.battingTeam);
          if (firstBattingTeam === team1Name) {
            team1InningsNumber = 1;
            team2InningsNumber = 2;
          } else if (firstBattingTeam === team2Name) {
            team1InningsNumber = 2;
            team2InningsNumber = 1;
          } else {
            // Final fallback: assume team1 batted in innings 1, team2 in innings 2
            // But also check if balls have innings field - if all balls have innings=1, team1 batted first
            const uniqueInnings = [...new Set(matchBalls.map(b => b.innings).filter(v => v !== undefined))];
            if (uniqueInnings.length === 1 && uniqueInnings[0] === 1) {
              // All balls are from innings 1, so team1 likely batted first
              team1InningsNumber = 1;
              team2InningsNumber = 2;
            } else {
              // Default assumption
              team1InningsNumber = 1;
              team2InningsNumber = 2;
            }
          }
        }
        
        console.log('🔍 Final innings assignment:', {
          team1InningsNumber,
          team2InningsNumber,
        });

        // Calculate statistics
        const stats = calculateMatchStatistics(
          matchBalls,
          scorecard,
          match.team1?.id || 'team1',
          match.team1?.name || match.team1Name || 'Team 1',
          match.team2?.id || 'team2',
          match.team2?.name || match.team2Name || 'Team 2',
          team1InningsNumber,
          team2InningsNumber
        );

        setMatchStats({ ...stats, scorecard });
        console.log('✅ Match statistics loaded:', {
          hasStats: !!stats,
          hasScorecard: !!scorecard,
          ballsCount: matchBalls.length,
          battingStats: scorecard.battingStats.length,
          bowlingStats: scorecard.bowlingStats.length,
          team1Innings: stats.team1Innings,
          team2Innings: stats.team2Innings,
          sampleBalls: matchBalls.slice(0, 3).map(b => ({ 
            innings: b.innings, 
            runs: b.runs, 
            batsmanRuns: b.batsmanRuns,
            isExtra: b.isExtra 
          })),
          inningsDistribution: {
            innings1: matchBalls.filter(b => (b.innings || 1) === 1).length,
            innings2: matchBalls.filter(b => (b.innings || 2) === 2).length,
          }
        });
      } catch (error) {
        console.error('❌ Error loading match statistics:', error);
        setMatchStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    loadMatchStatistics();
  }, [match?.id]);

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>
          {match.team1?.name || match.team1Name || 'Team 1'} vs {match.team2?.name || match.team2Name || 'Team 2'}
        </Text>
        <Text style={styles.matchStatus}>
          {match.status || 'COMPLETED'} • {match.currentOver || match.overs || 0}.{match.currentBall || 0} overs
        </Text>
        {match.venue && (
          <Text style={styles.matchVenue}>📍 {match.venue}</Text>
        )}
        {match.time && (
          <Text style={styles.matchTime}>🕐 {match.time}</Text>
        )}
      </View>

      {/* Current Score */}
      <View style={styles.currentScore}>
        <View style={styles.scoreCard}>
          <Text style={styles.teamName}>{match.team1?.name || match.team1Name || 'Team 1'}</Text>
          <Text style={styles.teamScore}>
            {(() => {
              // Calculate from balls if available, otherwise use match data
              if (matchStats?.team1Innings) {
                return `${matchStats.team1Innings.runs}/${matchStats.team1Innings.wickets}`;
              }
              return match.team1Score || match.team1?.score || (match as any).team1Score || '0/0';
            })()}
          </Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.teamName}>{match.team2?.name || match.team2Name || 'Team 2'}</Text>
          <Text style={styles.teamScore}>
            {(() => {
              // Calculate from balls if available, otherwise use match data
              if (matchStats?.team2Innings) {
                const runs = matchStats.team2Innings.runs || 0;
                const wickets = matchStats.team2Innings.wickets || 0;
                return `${runs}/${wickets}`;
              }
              return match.team2Score || match.team2?.score || (match as any).team2Score || '—';
            })()}
          </Text>
        </View>
      </View>

      {/* Match Statistics */}
      {matchStats && !loadingStats && balls && balls.length > 0 && (
        <View style={styles.statisticsContainer}>
          <Text style={styles.sectionTitle}>🏆 Match Statistics</Text>
          
          {matchStats.playerOfMatch && matchStats.playerOfMatch.name && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Player of the Match</Text>
              <Text style={styles.statValue}>{matchStats.playerOfMatch.name}</Text>
              <Text style={styles.statSubtext}>{matchStats.playerOfMatch.reason || 'Outstanding performance'}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            {matchStats.topBatsman && matchStats.topBatsman.name && matchStats.topBatsman.runs > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Top Batsman</Text>
                <Text style={styles.statValue}>{matchStats.topBatsman.name}</Text>
                <Text style={styles.statSubtext}>
                  {matchStats.topBatsman.runs} ({matchStats.topBatsman.balls})
                </Text>
              </View>
            )}

            {matchStats.topBowler && matchStats.topBowler.name && matchStats.topBowler.wickets > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Best Bowler</Text>
                <Text style={styles.statValue}>{matchStats.topBowler.name}</Text>
                <Text style={styles.statSubtext}>
                  {matchStats.topBowler.wickets}/{matchStats.topBowler.runs}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            {matchStats.mostSixes && matchStats.mostSixes.name && matchStats.mostSixes.sixes > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Most Sixes</Text>
                <Text style={styles.statValue}>{matchStats.mostSixes.name}</Text>
                <Text style={styles.statSubtext}>{matchStats.mostSixes.sixes} sixes</Text>
              </View>
            )}

            {matchStats.mostFours && matchStats.mostFours.name && matchStats.mostFours.fours > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Most Fours</Text>
                <Text style={styles.statValue}>{matchStats.mostFours.name}</Text>
                <Text style={styles.statSubtext}>{matchStats.mostFours.fours} fours</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {loadingStats && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      )}

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Toss Winner:</Text>
          <Text style={styles.infoValue}>
            {match.tossResult?.winnerTeam?.name || match.tossWinner || (match as any).tossWinnerTeam || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Toss Decision:</Text>
          <Text style={styles.infoValue}>
            {match.tossResult?.decision === 'bat' ? 'Bat First' : 
             match.tossResult?.decision === 'bowl' ? 'Bowl First' :
             match.tossDecision || (match as any).tossDecisionText || 'N/A'}
          </Text>
        </View>
      </View>

    </View>
  );

  const renderBatting = () => {
    if (loadingStats) {
      return (
        <View style={styles.battingContainer}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Loading scorecard data...</Text>
          </View>
        </View>
      );
    }

    if (!matchStats?.scorecard || (!balls || balls.length === 0)) {
      return (
        <View style={styles.battingContainer}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No scorecard data available</Text>
          </View>
        </View>
      );
    }

    const team1Name = match.team1?.name || match.team1Name || 'Team 1';
    const team2Name = match.team2?.name || match.team2Name || 'Team 2';

    // Separate stats by innings
    // Innings 1: Team 1 bats, Team 2 bowls
    // Innings 2: Team 2 bats, Team 1 bowls (if exists)
    const innings1Balls = balls.filter((ball: any) => (ball.innings || 1) === 1);
    const innings2Balls = balls.filter((ball: any) => (ball.innings || 2) === 2);

    // Build scorecard for innings 1 (Team 1 batting, Team 2 bowling)
    const innings1Data = {
      team1: team1Name,
      team2: team2Name,
      balls: innings1Balls,
      currentBatsmen: { striker: { id: '', name: '' }, nonStriker: { id: '', name: '' } },
      currentBowler: { id: '', name: '' },
    };
    const innings1Scorecard = buildScorecardData(innings1Data as any);

    // Build scorecard for innings 2 (Team 2 batting, Team 1 bowling) if exists
    let innings2Scorecard: any = null;
    if (innings2Balls.length > 0) {
      const innings2Data = {
        team1: team2Name,
        team2: team1Name,
        balls: innings2Balls,
        currentBatsmen: { striker: { id: '', name: '' }, nonStriker: { id: '', name: '' } },
        currentBowler: { id: '', name: '' },
      };
      innings2Scorecard = buildScorecardData(innings2Data as any);
    }

    // Team 1: Batting from innings 1, Bowling from innings 2 (if exists)
    const team1Batting = innings1Scorecard.battingStats || [];
    const team1Bowling = innings2Scorecard ? (innings2Scorecard.bowlingStats || []) : [];

    // Team 2: Batting from innings 2 (if exists), Bowling from innings 1
    const team2Batting = innings2Scorecard ? (innings2Scorecard.battingStats || []) : [];
    const team2Bowling = innings1Scorecard.bowlingStats || [];

    return (
      <View style={styles.battingContainer}>
        {/* Team 1 Scorecard */}
        <TouchableOpacity 
          style={styles.accordionHeader}
          onPress={() => toggleSection('team1Scorecard')}
        >
          <Text style={styles.accordionTitle}>{team1Name} - Scorecard</Text>
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
              {team1Batting.length > 0 ? (
                team1Batting.map((batsman: any, index: number) => (
                  <View key={batsman.id || index} style={[
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
                    <Text style={styles.tableCell}>
                      {batsman.strikeRate ? batsman.strikeRate.toFixed(1) : '0.0'}
                    </Text>
                  </View>
                ))
              ) : (
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
              {team2Bowling.length > 0 ? (
                team2Bowling.map((bowler: any, index: number) => (
                  <View key={bowler.id || index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.bowlerName]}>{bowler.name}</Text>
                    <Text style={styles.tableCell}>
                      {bowler.overs ? bowler.overs.toFixed(1) : '0.0'}
                    </Text>
                    <Text style={styles.tableCell}>{bowler.maidens || 0}</Text>
                    <Text style={styles.tableCell}>{bowler.runs || 0}</Text>
                    <Text style={styles.tableCell}>{bowler.wickets || 0}</Text>
                    <Text style={styles.tableCell}>
                      {bowler.economy ? bowler.economy.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                ))
              ) : (
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
          <Text style={styles.accordionTitle}>{team2Name} - Scorecard</Text>
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
              {team2Batting.length > 0 ? (
                team2Batting.map((batsman: any, index: number) => (
                  <View key={batsman.id || index} style={[
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
                    <Text style={styles.tableCell}>
                      {batsman.strikeRate ? batsman.strikeRate.toFixed(1) : '0.0'}
                    </Text>
                  </View>
                ))
              ) : (
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
              {team1Bowling.length > 0 ? (
                team1Bowling.map((bowler: any, index: number) => (
                  <View key={bowler.id || index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.bowlerName]}>{bowler.name}</Text>
                    <Text style={styles.tableCell}>
                      {bowler.overs ? bowler.overs.toFixed(1) : '0.0'}
                    </Text>
                    <Text style={styles.tableCell}>{bowler.maidens || 0}</Text>
                    <Text style={styles.tableCell}>{bowler.runs || 0}</Text>
                    <Text style={styles.tableCell}>{bowler.wickets || 0}</Text>
                    <Text style={styles.tableCell}>
                      {bowler.economy ? bowler.economy.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No bowling data available</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderBowling = () => null;

  const getBallSymbol = (ball: any) => {
    if (ball.isWicket) return 'W';
    if (ball.extraType === 'Wide' || ball.isWide) return 'WD';
    if (ball.extraType === 'No Ball' || ball.isNoBall) return 'NB';
    if (ball.runs === 0) return '0';
    return ball.runs?.toString() || '0';
  };

  const getBallColor = (ball: any) => {
    if (ball.isWicket) return COLORS.error;
    if (ball.extraType === 'Wide' || ball.isWide || ball.extraType === 'No Ball' || ball.isNoBall) return COLORS.warning;
    if (ball.runs === 4) return COLORS.success;
    if (ball.runs === 6) return COLORS.primary;
    return COLORS.gray;
  };

  const renderCommentary = () => {
    if (loadingStats) {
      return (
        <View style={styles.commentaryContainer}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Loading commentary...</Text>
          </View>
        </View>
      );
    }

    if (!balls || balls.length === 0) {
      return (
        <View style={styles.commentaryContainer}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No commentary available</Text>
            <Text style={[styles.noDataText, { fontSize: 12, marginTop: 8, color: COLORS.gray }]}>
              No ball-by-ball data found for this match
            </Text>
          </View>
        </View>
      );
    }

    // Group balls by innings
    const inningsMap = new Map<number, any[]>();
    balls.forEach((ball: any) => {
      const innings = ball.innings || 1;
      if (!inningsMap.has(innings)) {
        inningsMap.set(innings, []);
      }
      inningsMap.get(innings)!.push(ball);
    });

    // Sort innings (most recent first) and sort balls within each innings
    const inningsArray = Array.from(inningsMap.entries())
      .sort((a, b) => b[0] - a[0]) // Last innings first
      .map(([innings, balls]) => ({
        innings,
        balls: balls.sort((a: any, b: any) => {
          const aOver = a.over || 0;
          const bOver = b.over || 0;
          if (bOver !== aOver) return bOver - aOver;
          return (b.ball || 0) - (a.ball || 0);
        }),
        teamName: innings === 1 
          ? (match.team1?.name || match.team1Name || 'Team 1')
          : (match.team2?.name || match.team2Name || 'Team 2'),
      }));

    return (
      <View style={styles.commentaryContainer}>
        {inningsArray.map(({ innings, balls: inningsBalls, teamName }) => (
          <View key={innings} style={styles.inningsSection}>
            <TouchableOpacity
              style={styles.inningsHeader}
              onPress={() => toggleSection(`innings${innings}`)}
            >
              <Text style={styles.inningsTitle}>
                {teamName} - Innings {innings}
              </Text>
              <Text style={styles.accordionIcon}>
                {expandedSections[`innings${innings}`] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections[`innings${innings}`] && (
              <View style={styles.inningsContent}>
                {inningsBalls.map((ball: any, index: number) => {
                  const ballColor = getBallColor(ball);
                  const ballSymbol = getBallSymbol(ball);
                  
                  return (
                    <View key={ball.id || index} style={styles.commentaryItemCompact}>
                      <View style={styles.ballInfoCompact}>
                        <View style={[styles.ballCircleCompact, { backgroundColor: ballColor }]}>
                          <Text style={styles.ballTextCompact}>
                            {ballSymbol}
                          </Text>
                        </View>
                        <Text style={styles.overBallCompact}>
                          {ball.over || 0}.{ball.ball || 0}
                        </Text>
                      </View>
                      
                      <View style={styles.commentaryTextCompact}>
                        <Text style={styles.commentaryMainCompact}>
                          {ball.bowlerName || ball.bowler || 'Bowler'} to {ball.batsmanOnStrike || ball.batsman || 'Batsman'}, {ball.commentary || `${ball.runs || 0} run${(ball.runs || 0) !== 1 ? 's' : ''}`}
                        </Text>
                        {ball.dismissal && (
                          <Text style={styles.dismissalTextCompact}>
                            {ball.dismissal}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

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
  // Statistics Styles
  statisticsContainer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SIZES.lg,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
  // Commentary Compact Styles (matching ProfessionalCommentary)
  inningsSection: {
    marginBottom: SIZES.sm,
  },
  inningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.xs,
  },
  inningsTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inningsContent: {
    backgroundColor: COLORS.white,
  },
  commentaryItemCompact: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  ballInfoCompact: {
    alignItems: 'center',
    marginRight: SIZES.md,
    minWidth: 50,
  },
  ballCircleCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  ballTextCompact: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  overBallCompact: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  commentaryTextCompact: {
    flex: 1,
  },
  commentaryMainCompact: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  dismissalTextCompact: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SIZES.xs,
  },
});

export default MatchDetailsModal;