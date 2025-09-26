import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { APP_CONFIG, SCORING_CONFIG, UI_CONFIG } from '../config/appConfig';
import { liveScoringService, Match, BallData as FirebaseBallData } from '../services/liveScoringService';
import { REAL_CRICKET_TEAMS, getTeamById, getBatsmen, getBowlers } from '../data/realCricketData';

const { width } = Dimensions.get('window');

interface LiveScoringScreenProps {
  onBack: () => void;
  matchId?: string;
  teamA?: string;
  teamB?: string;
}

interface MatchData {
  id: string;
  team1: string;
  team2: string;
  overs: number;
  currentInnings: number;
  currentOver: number;
  currentBall: number;
  totalRuns: number;
  wickets: number;
  balls: BallData[];
  // Real player data
  currentBatsmen: {
    striker: { id: string; name: string; runs: number; balls: number; isOut: boolean };
    nonStriker: { id: string; name: string; runs: number; balls: number; isOut: boolean };
  };
  currentBowler: { id: string; name: string; overs: number; wickets: number; runs: number };
  nextBatsman: { id: string; name: string };
  team1Players: any[];
  team2Players: any[];
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

const LiveScoringScreen: React.FC<LiveScoringScreenProps> = ({ onBack, matchId, teamA, teamB }) => {
  const [matchData, setMatchData] = useState<MatchData>({
    id: '1',
    team1: teamA || 'Team A',
    team2: teamB || 'Team B',
    overs: SCORING_CONFIG.DEFAULT_OVERS,
    currentInnings: 1,
    currentOver: 0,
    currentBall: 0,
    totalRuns: 0,
    wickets: 0,
    balls: [],
    // Initialize with real players
    currentBatsmen: {
      striker: { id: 'rohit-sharma', name: 'Rohit Sharma', runs: 0, balls: 0, isOut: false },
      nonStriker: { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', runs: 0, balls: 0, isOut: false }
    },
    currentBowler: { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', overs: 0, wickets: 0, runs: 0 },
    nextBatsman: { id: 'tilak-varma', name: 'Tilak Varma' },
    team1Players: [],
    team2Players: []
  });

  const [isScoring, setIsScoring] = useState(false);
  const [selectedRuns, setSelectedRuns] = useState<number | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-save functionality
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load real players based on team names
  const loadRealPlayers = () => {
    const team1Data = REAL_CRICKET_TEAMS.find(team => team.name === matchData.team1);
    const team2Data = REAL_CRICKET_TEAMS.find(team => team.name === matchData.team2);
    
    if (team1Data && team2Data) {
      const team1Batsmen = getBatsmen(team1Data.id);
      const team2Batsmen = getBatsmen(team2Data.id);
      const team1Bowlers = getBowlers(team1Data.id);
      const team2Bowlers = getBowlers(team2Data.id);
      
      setMatchData(prev => ({
        ...prev,
        currentBatsmen: {
          striker: { 
            id: team1Batsmen[0]?.id || 'player1', 
            name: team1Batsmen[0]?.name || 'Batsman 1', 
            runs: 0, 
            balls: 0, 
            isOut: false 
          },
          nonStriker: { 
            id: team1Batsmen[1]?.id || 'player2', 
            name: team1Batsmen[1]?.name || 'Batsman 2', 
            runs: 0, 
            balls: 0, 
            isOut: false 
          }
        },
        currentBowler: { 
          id: team2Bowlers[0]?.id || 'bowler1', 
          name: team2Bowlers[0]?.name || 'Bowler 1', 
          overs: 0, 
          wickets: 0, 
          runs: 0 
        },
        nextBatsman: { 
          id: team1Batsmen[2]?.id || 'player3', 
          name: team1Batsmen[2]?.name || 'Next Batsman' 
        },
        team1Players: team1Data.players,
        team2Players: team2Data.players
      }));
    }
  };

  const createDemoMatch = async () => {
    try {
      setLoading(true);
      // Create a demo match in Firebase
      const matchId = await liveScoringService.createMatch({
        team1: teamA || 'Mumbai Indians',
        team2: teamB || 'Chennai Super Kings',
        overs: SCORING_CONFIG.DEFAULT_OVERS,
        currentInnings: 1,
        currentOver: 0,
        currentBall: 0,
        totalRuns: 0,
        wickets: 0,
        balls: [],
        currentBatsmen: {
          striker: { id: 'rohit-sharma', name: 'Rohit Sharma', runs: 0, balls: 0, isOut: false },
          nonStriker: { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', runs: 0, balls: 0, isOut: false }
        },
        currentBowler: { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', overs: 0, wickets: 0, runs: 0 },
        nextBatsman: { id: 'tilak-varma', name: 'Tilak Varma' },
        team1Players: [],
        team2Players: []
      });
      
      // Update the matchId in the component
      setMatchData(prev => ({ ...prev, id: matchId }));
      loadRealPlayers();
    } catch (error) {
      console.error('Error creating demo match:', error);
      loadRealPlayers();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      loadMatchData();
    } else {
      // Create a demo match if no matchId provided
      createDemoMatch();
    }
  }, [matchId]);

  useEffect(() => {
    // Auto-save every 30 seconds
    autoSaveRef.current = setInterval(() => {
      saveMatchData();
    }, APP_CONFIG.PERFORMANCE.AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [matchData]);

  const loadMatchData = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      const match = await liveScoringService.getMatch(matchId);
      if (match) {
        setCurrentMatch(match);
        setMatchData({
          id: match.id,
          team1: match.team1.name,
          team2: match.team2.name,
          overs: match.totalOvers,
          currentInnings: match.currentInnings,
          currentOver: 0,
          currentBall: 0,
          totalRuns: 0,
          wickets: 0,
          balls: [],
          // Initialize with default player data
          currentBatsmen: {
            striker: { id: 'player1', name: 'Batsman 1', runs: 0, balls: 0, isOut: false },
            nonStriker: { id: 'player2', name: 'Batsman 2', runs: 0, balls: 0, isOut: false }
          },
          currentBowler: { id: 'bowler1', name: 'Bowler 1', overs: 0, wickets: 0, runs: 0 },
          nextBatsman: { id: 'player3', name: 'Next Batsman' },
          team1Players: [],
          team2Players: []
        });
        
        // Load existing balls
        const balls = await liveScoringService.getMatchBalls(matchId);
        if (balls.length > 0) {
          const totalRuns = balls.reduce((sum, ball) => sum + ball.runs, 0);
          const wickets = balls.filter(ball => ball.isWicket).length;
          const lastBall = balls[balls.length - 1];
          
          setMatchData(prev => ({
            ...prev,
            totalRuns,
            wickets,
            currentOver: lastBall.over,
            currentBall: lastBall.ball,
            balls: balls.map(ball => ({
              id: ball.id,
              over: ball.over,
              ball: ball.ball,
              runs: ball.runs,
              isWicket: ball.isWicket,
              wicketType: ball.wicketType,
              isExtra: ball.isExtra,
              extraType: ball.extraType,
              timestamp: ball.timestamp.seconds * 1000,
            })),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading match data:', error);
      Alert.alert('Error', 'Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const saveMatchData = async () => {
    if (!matchId || !currentMatch) return;
    
    try {
      // Update match status if needed
      if (currentMatch.status !== 'live') {
        await liveScoringService.updateMatch(matchId, {
          status: 'live',
          isLive: true,
        });
      }
      console.log('✅ Match data saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving match data:', error);
    }
  };

  const addBall = async (runs: number, isWicket: boolean = false, wicketType?: string, isExtra: boolean = false, extraType?: string) => {
    try {
      // If we have a matchId, save to Firebase
      if (matchId) {
        const ballData = {
          over: matchData.currentOver,
          ball: matchData.currentBall,
          runs,
          isWicket,
          wicketType: isWicket ? wicketType : null, // Only include if it's a wicket
          isExtra,
          extraType: isExtra ? extraType : null, // Only include if it's an extra
          batsmanId: 'current-batsman', // TODO: Get from current batting team
          bowlerId: 'current-bowler', // TODO: Get from current bowling team
        };

        // Save to Firebase
        await liveScoringService.addBall(matchId, ballData);
      }

      const newBall: BallData = {
        id: `${matchData.currentOver}.${matchData.currentBall}`,
        over: matchData.currentOver,
        ball: matchData.currentBall,
        runs,
        isWicket,
        wicketType: isWicket ? wicketType : undefined,
        isExtra,
        extraType: isExtra ? extraType : undefined,
        timestamp: Date.now(),
      };

      const newBalls = [...matchData.balls, newBall];
      const newTotalRuns = matchData.totalRuns + runs;
      const newWickets = isWicket ? matchData.wickets + 1 : matchData.wickets;
      
      let newOver = matchData.currentOver;
      let newBallNumber = matchData.currentBall + 1;

      // Check if over is complete
      if (newBallNumber >= SCORING_CONFIG.BALLS_PER_OVER) {
        newOver += 1;
        newBallNumber = 0;
      }

      setMatchData({
        ...matchData,
        balls: newBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
        currentOver: newOver,
        currentBall: newBallNumber,
      });

      setIsScoring(false);
      setSelectedRuns(null);
    } catch (error) {
      console.error('Error adding ball:', error);
      Alert.alert('Error', 'Failed to save ball data');
    }
  };

  const handleRunsPress = (runs: number) => {
    setSelectedRuns(runs);
    addBall(runs);
  };

  const handleWicketPress = () => {
    Alert.alert(
      'Wicket Type',
      'Select wicket type',
      [
        { text: 'Bowled', onPress: () => addBall(0, true, 'Bowled') },
        { text: 'Caught', onPress: () => addBall(0, true, 'Caught') },
        { text: 'LBW', onPress: () => addBall(0, true, 'LBW') },
        { text: 'Run Out', onPress: () => addBall(0, true, 'Run Out') },
        { text: 'Stumped', onPress: () => addBall(0, true, 'Stumped') },
        { text: 'Other', onPress: () => addBall(0, true, 'Other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleExtrasPress = () => {
    setShowExtras(true);
  };

  const handleExtraPress = (extraType: string) => {
    setShowExtras(false);
    // TODO: Handle extras logic
    console.log('Extra:', extraType);
  };

  const undoLastBall = () => {
    if (matchData.balls.length > 0) {
      const lastBall = matchData.balls[matchData.balls.length - 1];
      const newBalls = matchData.balls.slice(0, -1);
      const newTotalRuns = matchData.totalRuns - lastBall.runs;
      const newWickets = lastBall.isWicket ? matchData.wickets - 1 : matchData.wickets;
      
      setMatchData({
        ...matchData,
        balls: newBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
      });
    }
  };

  const getCurrentScore = () => {
    return `${matchData.totalRuns}/${matchData.wickets}`;
  };

  const getCurrentOver = () => {
    return `${matchData.currentOver}.${matchData.currentBall}`;
  };

  const getRunRate = () => {
    const totalBalls = matchData.balls.length;
    if (totalBalls === 0) return '0.00';
    return (matchData.totalRuns / totalBalls * 6).toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading match data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏏 Live Scoring</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>{matchData.team1} vs {matchData.team2}</Text>
          <Text style={styles.matchDetails}>
            {SCORING_CONFIG.DEFAULT_OVERS} Overs • Innings {matchData.currentInnings}
          </Text>
        </View>

        {/* Live Score Display */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Live Score</Text>
            <Text style={styles.overText}>Over: {getCurrentOver()}</Text>
          </View>
          
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreText}>{getCurrentScore()}</Text>
            <Text style={styles.runRateText}>RR: {getRunRate()}</Text>
          </View>
        </View>

        {/* Current Batsmen Display */}
        <View style={styles.batsmenCard}>
          <Text style={styles.batsmenTitle}>Current Batsmen</Text>
          <View style={styles.batsmenInfo}>
            <View style={styles.batsman}>
              <Text style={styles.batsmanName}>
                {matchData.currentBatsmen.striker.name} {matchData.currentBatsmen.striker.isOut ? '(OUT)' : '*'}
              </Text>
              <Text style={styles.batsmanScore}>
                {matchData.currentBatsmen.striker.runs}* ({matchData.currentBatsmen.striker.balls})
              </Text>
            </View>
            <View style={styles.batsman}>
              <Text style={styles.batsmanName}>
                {matchData.currentBatsmen.nonStriker.name} {matchData.currentBatsmen.nonStriker.isOut ? '(OUT)' : ''}
              </Text>
              <Text style={styles.batsmanScore}>
                {matchData.currentBatsmen.nonStriker.runs} ({matchData.currentBatsmen.nonStriker.balls})
              </Text>
            </View>
          </View>
        </View>

        {/* Bowler Information */}
        <View style={styles.bowlerCard}>
          <Text style={styles.bowlerTitle}>Bowler</Text>
          <View style={styles.bowlerInfo}>
            <Text style={styles.bowlerName}>{matchData.currentBowler.name}</Text>
            <Text style={styles.bowlerStats}>
              {matchData.currentBowler.overs} overs, {matchData.currentBowler.wickets} wickets, {matchData.currentBowler.runs} runs
            </Text>
          </View>
        </View>

        {/* Next Batsman */}
        <View style={styles.nextBatsmanCard}>
          <Text style={styles.nextBatsmanTitle}>Next Batsman</Text>
          <Text style={styles.nextBatsmanName}>{matchData.nextBatsman.name}</Text>
        </View>

        {/* Scoring Buttons */}
        <View style={styles.scoringSection}>
          <Text style={styles.sectionTitle}>Score Runs</Text>
          <View style={styles.runsGrid}>
            {SCORING_CONFIG.SCORING_OPTIONS.RUNS.map((runs: number) => (
              <TouchableOpacity
                key={runs}
                style={[
                  styles.runButton,
                  selectedRuns === runs && styles.selectedRunButton,
                ]}
                onPress={() => handleRunsPress(runs)}
              >
                <Text style={[
                  styles.runButtonText,
                  selectedRuns === runs && styles.selectedRunButtonText,
                ]}>
                  {runs}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleWicketPress}>
            <Text style={styles.actionButtonText}>Wicket</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExtrasPress}>
            <Text style={styles.actionButtonText}>Extras</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={undoLastBall}>
            <Text style={styles.actionButtonText}>Undo</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Balls */}
        <View style={styles.recentBallsSection}>
          <Text style={styles.sectionTitle}>Recent Balls</Text>
          <View style={styles.ballsList}>
            {matchData.balls.slice(-6).reverse().map((ball, index) => (
              <View key={ball.id} style={styles.ballItem}>
                <Text style={styles.ballText}>
                  {ball.over}.{ball.ball} - {ball.runs} {ball.isWicket ? 'W' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Extras Modal */}
      {showExtras && (
        <View style={styles.extrasModal}>
          <View style={styles.extrasContent}>
            <Text style={styles.extrasTitle}>Select Extra</Text>
            {SCORING_CONFIG.SCORING_OPTIONS.EXTRAS.map((extra: string) => (
              <TouchableOpacity
                key={extra}
                style={styles.extraButton}
                onPress={() => handleExtraPress(extra)}
              >
                <Text style={styles.extraButtonText}>{extra}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowExtras(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  backButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  saveButton: {
    padding: SIZES.sm,
  },
  saveButtonText: {
    fontSize: 18,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  matchInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  matchTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
  },
  matchDetails: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
    marginTop: SIZES.sm,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
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
    color: UI_CONFIG.TEXT_COLOR,
  },
  overText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
  },
  scoreDisplay: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.PRIMARY_COLOR,
  },
  runRateText: {
    fontSize: 18,
    color: UI_CONFIG.TEXT_COLOR,
    marginTop: SIZES.sm,
  },
  scoringSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.md,
  },
  runsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  runButton: {
    width: (width - SIZES.lg * 2 - SIZES.md * 3) / 4,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRunButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
  },
  runButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  selectedRunButtonText: {
    color: COLORS.white,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.SECONDARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginHorizontal: SIZES.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  recentBallsSection: {
    marginBottom: SIZES.lg,
  },
  ballsList: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
  },
  ballItem: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ballText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
  },
  extrasModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extrasContent: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    width: width * 0.8,
  },
  extrasTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  extraButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginBottom: SIZES.sm,
    alignItems: 'center',
  },
  extraButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  loadingText: {
    fontSize: 18,
    color: UI_CONFIG.TEXT_COLOR,
    fontFamily: FONTS.medium,
  },
  // Current Batsmen Styles
  batsmenCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batsmenTitle: {
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
  // Bowler Styles
  bowlerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bowlerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.sm,
  },
  bowlerInfo: {
    alignItems: 'center',
  },
  bowlerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.xs,
  },
  bowlerStats: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  // Next Batsman Styles
  nextBatsmanCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
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
});

export default LiveScoringScreen;
