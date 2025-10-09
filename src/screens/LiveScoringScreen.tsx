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
// Removed offline functionality - causing too many issues
// import { useOfflineScoring } from '../hooks/useOfflineScoring';
// import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { REAL_CRICKET_TEAMS, getTeamById, getBatsmen, getBowlers } from '../data/realCricketData';
import ShotDetailsModal, { ShotDetails } from '../components/ShotDetailsModal';
import PlayerStatsCard from '../components/PlayerStatsCard';
import ProfessionalScorecard from '../components/ProfessionalScorecard';
import ProfessionalCommentary from '../components/ProfessionalCommentary';
import ProfessionalMatchSummary from '../components/ProfessionalMatchSummary';
import { useUser } from '../contexts/UserContext';

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
    striker: { id: string; name: string; runs: number; balls: number; isOut: boolean; fours: number; sixes: number };
    nonStriker: { id: string; name: string; runs: number; balls: number; isOut: boolean; fours: number; sixes: number };
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
  // Shot details
  shotType?: string; // e.g., 'Drive', 'Pull', 'Cut', 'Sweep'
  shotRegion?: string; // e.g., 'Long On', 'Cover', 'Square Leg'
  shotQuality?: string; // e.g., 'Well Timed', 'Mistimed', 'Edge'
  // Player details
  batsmanOnStrike?: string; // Name of batsman who faced the ball
  batsmanId?: string; // ID of batsman
  bowlerName?: string; // Name of bowler
  bowlerId?: string; // ID of bowler
  // Commentary
  commentary?: string; // User-written commentary for the shot
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
      striker: { id: 'rohit-sharma', name: 'Rohit Sharma', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 },
      nonStriker: { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 }
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
  
  // Shot details modal state
  const [showShotDetails, setShowShotDetails] = useState(false);
  const [pendingBallData, setPendingBallData] = useState<Partial<BallData> | null>(null);
  
  // Professional UI state
  const [activeTab, setActiveTab] = useState<'live' | 'scorecard' | 'commentary'>('live');
  
  // User and Admin Management
  const { user, isAdminForTeam } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Auto-save functionality
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Removed offline functionality - just use Firebase directly
  // const { 
  //   offlineState, 
  //   addBallOffline, 
  //   updateMatchOffline, 
  //   syncData, 
  //   forceSync,
  //   refreshStatus 
  // } = useOfflineScoring();

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
            isOut: false,
            fours: 0,
            sixes: 0
          },
          nonStriker: { 
            id: team1Batsmen[1]?.id || 'player2', 
            name: team1Batsmen[1]?.name || 'Batsman 2', 
            runs: 0, 
            balls: 0, 
            isOut: false,
            fours: 0,
            sixes: 0
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
        name: `${teamA || 'Mumbai Indians'} vs ${teamB || 'Chennai Super Kings'}`,
        team1: { id: 'team1', name: teamA || 'Mumbai Indians', players: [] },
        team2: { id: 'team2', name: teamB || 'Chennai Super Kings', players: [] },
        matchType: 'T20',
        totalOvers: SCORING_CONFIG.DEFAULT_OVERS,
        currentInnings: 1,
        status: 'live',
        createdBy: 'user',
        isLive: true,
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

  // Track which matchId has been loaded to prevent re-loading
  const loadedMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only load if matchId changed
    if (loadedMatchIdRef.current === matchId) {
      console.log('⏭️  Data already loaded for this matchId, skipping...');
      return;
    }
    
    console.log('🔄 LiveScoringScreen useEffect - matchId:', matchId);
    if (matchId) {
      console.log('📥 Loading existing match data...');
      loadMatchData();
      loadedMatchIdRef.current = matchId;
    } else {
      console.log('🆕 No match ID provided - creating demo match...');
      createDemoMatch();
      loadedMatchIdRef.current = null;
    }
  }, [matchId]);

  // Check admin status when user or matchId changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !matchId) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        setAdminLoading(true);
        const adminStatus = await isAdminForTeam(matchId);
        setIsAdmin(adminStatus);
        console.log('👑 Admin status for', user.phoneNumber, 'in match', matchId, ':', adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, matchId, isAdminForTeam]);

  // Disabled auto-save to prevent continuous refreshing
  // Data is saved after each ball anyway
  // useEffect(() => {
  //   // Auto-save every 30 seconds (only when online and matchId exists)
  //   if (offlineState.isOnline && matchId) {
  //     autoSaveRef.current = setInterval(() => {
  //       saveMatchData();
  //     }, APP_CONFIG.PERFORMANCE.AUTO_SAVE_INTERVAL);
  //   }

  //   return () => {
  //     if (autoSaveRef.current) {
  //       clearInterval(autoSaveRef.current);
  //     }
  //   };
  // }, [offlineState.isOnline, matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Looking for match with ID:', matchId);
      const match = await liveScoringService.getMatch(matchId);
      if (match) {
        console.log('✅ Match found in Firebase:', match);
        setCurrentMatch(match);
        setMatchData({
          id: match.id,
          team1: match.team1.name,
          team2: match.team2.name,
          overs: match.totalOvers,
          currentInnings: match.currentInnings,
          currentOver: 0, // Will be calculated from balls
          currentBall: 0, // Will be calculated from balls
          totalRuns: 0, // Will be calculated from balls
          wickets: 0, // Will be calculated from balls
          balls: [], // Will be loaded from balls collection
          // Use default player data
          currentBatsmen: {
            striker: { id: 'player1', name: 'Batsman 1', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 },
            nonStriker: { id: 'player2', name: 'Batsman 2', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 }
          },
          currentBowler: { id: 'bowler1', name: 'Bowler 1', overs: 0, wickets: 0, runs: 0 },
          nextBatsman: { id: 'player3', name: 'Next Batsman' },
          team1Players: match.team1.players || [],
          team2Players: match.team2.players || []
        });
        console.log('✅ Match data loaded successfully');
        
        // Load existing balls
        const balls = await liveScoringService.getMatchBalls(matchId);
        console.log('📊 Loaded balls from Firebase:', balls.length, 'balls');
        
        if (balls.length > 0) {
          const totalRuns = balls.reduce((sum, ball) => sum + ball.runs, 0);
          const wickets = balls.filter(ball => ball.isWicket).length;
          const lastBall = balls[balls.length - 1];
          
          console.log('📊 Updating match data with balls:', totalRuns, 'runs,', wickets, 'wickets');
          
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
        } else {
          console.log('📊 No balls found, keeping match data as is');
        }
      } else {
        console.log('❌ No match found in Firebase');
        console.log('🔍 Expected match ID:', matchId);
        Alert.alert('Match Not Found', 'The match could not be found. It may have been deleted or not created yet.');
        // Don't retry - just fail gracefully
      }
    } catch (error) {
      console.error('❌ Error loading match data:', error);
      Alert.alert('Error', 'Failed to load match data');
    } finally {
      setLoading(false);
      console.log('🏁 Match data loading complete');
    }
  };

  const saveMatchData = async () => {
    if (!matchId) return;
    
    try {
      // First try to get the match to see if it exists
      const existingMatch = await liveScoringService.getMatch(matchId);
      
      if (existingMatch) {
        // Match exists, update it
        await liveScoringService.updateMatch(matchId, {
          name: `${matchData.team1} vs ${matchData.team2}`,
          team1: { id: 'team1', name: matchData.team1, players: matchData.team1Players },
          team2: { id: 'team2', name: matchData.team2, players: matchData.team2Players },
          totalOvers: matchData.overs,
          currentInnings: matchData.currentInnings,
          status: 'live',
          isLive: true,
        });
        console.log('✅ Match data updated in Firebase');
      } else {
        // Match doesn't exist, create it
        // Clean undefined values before creating match
        const cleanMatchData = {
          name: `${matchData.team1} vs ${matchData.team2}`,
          team1: { id: 'team1', name: matchData.team1, players: matchData.team1Players },
          team2: { id: 'team2', name: matchData.team2, players: matchData.team2Players },
          matchType: 'T20',
          totalOvers: matchData.overs,
          currentInnings: matchData.currentInnings,
          status: 'live' as const,
          createdBy: 'user',
          isLive: true,
        };
        
        const newMatchId = await liveScoringService.createMatch(cleanMatchData);
        console.log('✅ Match created in Firebase with ID:', newMatchId);
      }
    } catch (error) {
      console.error('❌ Error saving match data:', error);
    }
  };

  const addBall = async (runs: number, isWicket: boolean = false, wicketType?: string, isExtra: boolean = false, extraType?: string) => {
    console.log('🏏 Adding ball:', { runs, isWicket, wicketType, isExtra, extraType, matchId });
    
    // Validate wicket count - maximum 10 wickets per innings
    if (isWicket && matchData.wickets >= 10) {
      Alert.alert('All Out!', 'Innings complete! Maximum 10 wickets per innings. Start next innings or finish match.');
      return;
    }
    
    // For runs (1, 2, 3, 4, 6), show shot details modal
    if (runs > 0 && !isWicket && !isExtra) {
      setPendingBallData({
        runs,
        isWicket,
        isExtra,
        wicketType,
        extraType,
        over: matchData.currentOver,
        ball: matchData.currentBall,
        batsmanOnStrike: matchData.currentBatsmen.striker.name,
        batsmanId: matchData.currentBatsmen.striker.id,
        bowlerName: matchData.currentBowler.name,
        bowlerId: matchData.currentBowler.id,
      });
      setShowShotDetails(true);
      return;
    }
    
    // For wickets, extras, or dot balls, add directly without shot details
    await addBallWithDetails(runs, isWicket, wicketType, isExtra, extraType);
  };

  const addBallWithDetails = async (runs: number, isWicket: boolean = false, wicketType?: string, isExtra: boolean = false, extraType?: string, shotDetails?: ShotDetails) => {
    try {
      // Build ball data object, only including wicketType and extraType if applicable
      const ballData: any = {
        over: matchData.currentOver,
        ball: matchData.currentBall,
        runs,
        isWicket,
        isExtra,
        batsmanId: matchData.currentBatsmen.striker.id,
        bowlerId: matchData.currentBowler.id,
        batsmanOnStrike: matchData.currentBatsmen.striker.name,
        bowlerName: matchData.currentBowler.name,
      };
      
      // Add shot details if provided
      if (shotDetails) {
        ballData.shotType = shotDetails.shotType;
        ballData.shotRegion = shotDetails.shotRegion;
        ballData.shotQuality = shotDetails.shotQuality;
        if (shotDetails.commentary) {
          ballData.commentary = shotDetails.commentary;
        }
      }
      
      // Only add wicketType if it's a wicket
      if (isWicket && wicketType) {
        ballData.wicketType = wicketType;
      }
      
      // Only add extraType if it's an extra
      if (isExtra && extraType) {
        ballData.extraType = extraType;
      }

      // Save directly to Firebase - no offline mode
      if (matchId) {
        try {
          console.log('🌐 Saving ball to Firebase...');
          await liveScoringService.addBall(matchId, ballData);
          console.log('✅ Ball saved successfully');
        } catch (error) {
          console.log('❌ Failed to save ball:', error);
          Alert.alert('Save Failed', 'Could not save ball. Please check your internet connection.');
        }
      }

      const newBall: BallData = {
        id: `${matchData.currentOver}.${matchData.currentBall + 1}`,
        over: matchData.currentOver,
        ball: matchData.currentBall + 1,
        runs,
        isWicket,
        wicketType: isWicket ? wicketType : undefined,
        isExtra,
        extraType: isExtra ? extraType : undefined,
        timestamp: Date.now(),
        // Add shot details if provided
        shotType: shotDetails?.shotType,
        shotRegion: shotDetails?.shotRegion,
        shotQuality: shotDetails?.shotQuality,
        commentary: shotDetails?.commentary,
        batsmanOnStrike: matchData.currentBatsmen.striker.name,
        batsmanId: matchData.currentBatsmen.striker.id,
        bowlerName: matchData.currentBowler.name,
        bowlerId: matchData.currentBowler.id,
      };

      const newBalls = [...matchData.balls, newBall];
      const newTotalRuns = matchData.totalRuns + runs;
      const newWickets = isWicket ? matchData.wickets + 1 : matchData.wickets;
      
      // Check if innings is complete (10 wickets)
      const isInningsComplete = newWickets >= 10;
      
      let newOver = matchData.currentOver;
      let newBallNumber = matchData.currentBall + 1;

      // CRICKET LOGIC: Batsman rotation and updates
      let updatedCurrentBatsmen = { ...matchData.currentBatsmen };
      let updatedCurrentBowler = { ...matchData.currentBowler };

      // Check if over is complete
      if (newBallNumber >= SCORING_CONFIG.BALLS_PER_OVER) {
        newOver += 1;
        newBallNumber = 0;
        
        // CRICKET RULE: After 6 balls, batsmen swap ends
        const temp = updatedCurrentBatsmen.striker;
        updatedCurrentBatsmen.striker = updatedCurrentBatsmen.nonStriker;
        updatedCurrentBatsmen.nonStriker = temp;
      }

      // Update batsman stats
      if (!isWicket) {
        // Update striker's runs and balls
        updatedCurrentBatsmen.striker.runs += runs;
        updatedCurrentBatsmen.striker.balls += 1;
        
        // Update fours and sixes
        if (runs === 4) updatedCurrentBatsmen.striker.fours += 1;
        if (runs === 6) updatedCurrentBatsmen.striker.sixes += 1;
        
        // CRICKET RULE: Batsman rotation for odd runs (1,3,5)
        if (runs === 1 || runs === 3 || runs === 5) {
          // Swap striker and non-striker
          const temp = updatedCurrentBatsmen.striker;
          updatedCurrentBatsmen.striker = updatedCurrentBatsmen.nonStriker;
          updatedCurrentBatsmen.nonStriker = temp;
        }
      } else {
        // Wicket fall - striker is out
        updatedCurrentBatsmen.striker.isOut = true;
        updatedCurrentBatsmen.striker.balls += 1;
        
        // TODO: Add new batsman logic here
        // For now, we'll keep the same batsman but mark as out
      }

      // Update bowler stats - calculate proper cricket overs format
      const totalBalls = (newOver * 6) + newBallNumber;
      updatedCurrentBowler.overs = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10; // 1.2 = 1 over 2 balls
      updatedCurrentBowler.runs += runs;
      if (isWicket) updatedCurrentBowler.wickets += 1;

      const updatedMatchData = {
        ...matchData,
        balls: newBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
        currentOver: newOver,
        currentBall: newBallNumber,
        currentBatsmen: updatedCurrentBatsmen,
        currentBowler: updatedCurrentBowler,
      };
      
      console.log('📊 Updated match data:', updatedMatchData);
      setMatchData(updatedMatchData);

      // Check if innings is complete
      if (isInningsComplete) {
        Alert.alert(
          'Innings Complete!', 
          'All 10 wickets down! Innings finished. You can start the next innings or finish the match.',
          [
            { text: 'Continue', style: 'default' },
            { text: 'Finish Match', onPress: () => {
              // TODO: Navigate to finish match
              console.log('User wants to finish match');
            }}
          ]
        );
      }

      // Force save to Firebase after every ball
      if (matchId) {
        setTimeout(async () => {
          try {
            await saveMatchData();
            console.log('✅ Match data saved after ball');
          } catch (error) {
            console.error('❌ Failed to save match data:', error);
          }
        }, 500);
      }

      setIsScoring(false);
      setSelectedRuns(null);
    } catch (error) {
      console.error('Error adding ball:', error);
      Alert.alert('Error', 'Failed to save ball data');
    }
  };

  // Shot details modal handlers
  const handleShotDetailsConfirm = async (shotDetails: ShotDetails) => {
    if (pendingBallData) {
      await addBallWithDetails(
        pendingBallData.runs!,
        pendingBallData.isWicket!,
        pendingBallData.wicketType,
        pendingBallData.isExtra!,
        pendingBallData.extraType,
        shotDetails
      );
    }
    setShowShotDetails(false);
    setPendingBallData(null);
  };

  const handleShotDetailsCancel = () => {
    setShowShotDetails(false);
    setPendingBallData(null);
  };

  // Calculate player statistics from ball data
  const calculatePlayerStats = () => {
    const battingStats: { [key: string]: any } = {};
    const bowlingStats: { [key: string]: any } = {};

    // Initialize all players - add current batsmen and bowler if teams are empty
    const allPlayers = [
      ...matchData.team1Players,
      ...matchData.team2Players,
    ];

    // If no players in teams, add current players
    if (allPlayers.length === 0) {
      allPlayers.push(
        matchData.currentBatsmen.striker,
        matchData.currentBatsmen.nonStriker,
        matchData.currentBowler,
        matchData.nextBatsman
      );
    }

    allPlayers.forEach(player => {
      battingStats[player.id] = {
        id: player.id,
        name: player.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        isOnStrike: false,
      };
      bowlingStats[player.id] = {
        id: player.id,
        name: player.name,
        overs: 0,
        balls: 0,
        wickets: 0,
        runs: 0,
        economy: 0,
        maidens: 0,
      };
    });

    // Process each ball
    matchData.balls.forEach(ball => {
      // Batting stats
      if (ball.batsmanId && battingStats[ball.batsmanId]) {
        battingStats[ball.batsmanId].balls += 1;
        battingStats[ball.batsmanId].runs += ball.runs;
        
        if (ball.runs === 4) battingStats[ball.batsmanId].fours += 1;
        if (ball.runs === 6) battingStats[ball.batsmanId].sixes += 1;
        
        if (ball.isWicket) {
          battingStats[ball.batsmanId].isOut = true;
        }
      }

      // Bowling stats
      if (ball.bowlerId && bowlingStats[ball.bowlerId]) {
        bowlingStats[ball.bowlerId].balls += 1;
        bowlingStats[ball.bowlerId].runs += ball.runs;
        
        if (ball.isWicket) {
          bowlingStats[ball.bowlerId].wickets += 1;
        }
      }
    });

    // Calculate strike rates and economy
    Object.values(battingStats).forEach((player: any) => {
      if (player.balls > 0) {
        player.strikeRate = (player.runs / player.balls) * 100;
      }
    });

    Object.values(bowlingStats).forEach((player: any) => {
      if (player.balls > 0) {
        player.overs = Math.floor(player.balls / 6) + (player.balls % 6) / 10;
        player.economy = (player.runs / player.balls) * 6;
      }
    });

    // Mark current striker
    if (matchData.currentBatsmen.striker.id && battingStats[matchData.currentBatsmen.striker.id]) {
      battingStats[matchData.currentBatsmen.striker.id].isOnStrike = true;
    }

    return { battingStats, bowlingStats };
  };

  const handleRunsPress = (runs: number) => {
    setSelectedRuns(runs);
    addBall(runs);
  };

  const handleWicketPress = () => {
    console.log('Wicket button pressed!');
    setIsScoring(true);
    addBall(0, true, 'Bowled');
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
        {/* Removed sync button - auto-saves after each ball */}
      </View>

      {/* Professional Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            LIVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
          onPress={() => setActiveTab('scorecard')}
        >
          <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
            SCORECARD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'commentary' && styles.activeTab]}
          onPress={() => setActiveTab('commentary')}
        >
          <Text style={[styles.tabText, activeTab === 'commentary' && styles.activeTabText]}>
            COMMENTARY
          </Text>
        </TouchableOpacity>
      </View>

      {/* Removed Offline Status Bar - causing issues */}

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'live' && (
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

        {/* Player Statistics */}
        <View style={styles.playerStatsSection}>
          <Text style={styles.sectionTitle}>Player Statistics</Text>
          {(() => {
            try {
              const { battingStats, bowlingStats } = calculatePlayerStats();
              const battingArray = Object.values(battingStats).filter((player: any) => player.balls > 0 || player.isOnStrike);
              const bowlingArray = Object.values(bowlingStats).filter((player: any) => player.balls > 0);
            
              return (
              <View>
                {/* Batting Stats */}
                <View style={styles.statsCategory}>
                  <Text style={styles.statsCategoryTitle}>Batting</Text>
                  {battingArray.map((player: any) => (
                    <PlayerStatsCard
                      key={player.id}
                      player={player}
                      isBatsman={true}
                    />
                  ))}
                </View>

                {/* Bowling Stats */}
                {bowlingArray.length > 0 && (
                  <View style={styles.statsCategory}>
                    <Text style={styles.statsCategoryTitle}>Bowling</Text>
                    {bowlingArray.map((player: any) => (
                      <PlayerStatsCard
                        key={player.id}
                        player={{
                          id: player.id,
                          name: player.name,
                          runs: player.overs,
                          balls: player.wickets,
                          fours: 0,
                          sixes: 0,
                          strikeRate: player.economy,
                          isOut: false,
                          isOnStrike: false,
                        }}
                        isBatsman={false}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
            } catch (error) {
              console.error('Error calculating player stats:', error);
              return (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Unable to load player statistics</Text>
                </View>
              );
            }
          })()}
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

        {/* Scoring Buttons - Admin Only */}
        {isAdmin ? (
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
        ) : (
          <View style={styles.viewerMessage}>
            <Text style={styles.viewerMessageText}>
              👀 You are viewing this match. Only admins can score runs.
            </Text>
            <Text style={styles.viewerMessageSubtext}>
              Contact an admin to get scoring access.
            </Text>
          </View>
        )}

        {/* Action Buttons - Admin Only */}
        {isAdmin && (
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
        )}

        {/* Recent Balls */}
        <View style={styles.recentBallsSection}>
          <Text style={styles.sectionTitle}>Recent Balls</Text>
          <View style={styles.ballsList}>
            {matchData.balls.slice().reverse().slice(0, 6).map((ball, index) => (
              <View key={ball.id} style={styles.ballItem}>
                <Text style={styles.ballText}>
                  {ball.over}.{ball.ball} - {ball.runs} {ball.isWicket ? 'W' : ''}
                </Text>
                {ball.commentary && (
                  <Text style={styles.ballCommentary}>
                    💬 {ball.commentary}
                  </Text>
                )}
                {ball.shotType && (
                  <Text style={styles.ballShotDetails}>
                    🏏 {ball.shotType} to {ball.shotRegion} ({ball.shotQuality})
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
        </ScrollView>
      )}

      {/* Scorecard Tab */}
      {activeTab === 'scorecard' && (
        <ProfessionalScorecard
          battingStats={[]} // TODO: Convert matchData to batting stats
          bowlingStats={[]} // TODO: Convert matchData to bowling stats
          fallOfWickets={[]} // TODO: Extract from matchData.balls
          totalRuns={matchData.totalRuns}
          totalWickets={matchData.wickets}
          totalOvers={`${matchData.currentOver}.${matchData.currentBall}`}
          extras={0} // TODO: Calculate from matchData.balls
          runRate={parseFloat(getRunRate())}
          teamName={matchData.team1}
        />
      )}

      {/* Commentary Tab */}
      {activeTab === 'commentary' && (
        <ProfessionalCommentary
          currentOver={{
            over: matchData.currentOver,
            balls: matchData.balls.filter(ball => ball.over === matchData.currentOver),
            runs: matchData.balls.filter(ball => ball.over === matchData.currentOver).reduce((sum, ball) => sum + ball.runs, 0),
            wickets: matchData.balls.filter(ball => ball.over === matchData.currentOver).filter(ball => ball.isWicket).length,
          }}
          recentBalls={matchData.balls.slice().reverse().slice(0, 10)} // Most recent 10 balls
          currentBatsman={matchData.currentBatsmen.striker.name}
          currentBowler={matchData.currentBowler.name}
          totalRuns={matchData.totalRuns}
          totalWickets={matchData.wickets}
        />
      )}

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

      {/* Shot Details Modal */}
      <ShotDetailsModal
        visible={showShotDetails}
        onClose={handleShotDetailsCancel}
        onConfirm={handleShotDetailsConfirm}
        runs={pendingBallData?.runs || 0}
        isWicket={pendingBallData?.isWicket || false}
      />
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
    fontWeight: 'bold',
  },
  ballCommentary: {
    fontSize: 14,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  ballShotDetails: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
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
  // Player Statistics Styles
  playerStatsSection: {
    marginBottom: SIZES.lg,
  },
  statsCategory: {
    marginBottom: SIZES.md,
  },
  statsCategoryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  // Professional Tab Styles
  tabContainer: {
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
  // Viewer Message Styles
  viewerMessage: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    margin: SIZES.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  viewerMessageText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  viewerMessageSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LiveScoringScreen;
