import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  RefreshControl,
  AppState,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import BottomNavigation from '../components/BottomNavigation';
import TopNavigation from '../components/TopNavigation';
import { useUser } from '../contexts/UserContext';
// UserLoginScreen removed - using PhoneLoginScreen in App.tsx instead
import AdminManagement from '../components/AdminManagement';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import SideDrawer from '../components/SideDrawer';
// import LiveMatchesList from '../components/LiveMatchesList';
// import MatchDetailScreen from './MatchDetailScreen';
// import PlayerLoginScreen from './PlayerLoginScreen';
// SimpleOTPLoginScreen removed - using PhoneLoginScreen instead
import PlayerRegistrationScreen from './PlayerRegistrationScreen';
import UserProfileScreen from './UserProfileScreen';
import TossScreen from './TossScreen';
import LiveScoringScreen, { MatchSummary } from './LiveScoringScreen';
import MatchManagementScreen from './MatchManagementScreen';
import StartMatchScreen from './StartMatchScreen';
import Playing11Screen from './Playing11Screen';
import MatchSetupScreen from './MatchSetupScreen';
import SpectatorScreen from './SpectatorScreen';
import { MatchHistoryScreen } from './MatchHistoryScreen';
import MatchDetailsModal from '../components/MatchDetailsModal';
import TeamSelectionScreen from './TeamSelectionScreen';
import NotificationTestScreen from './NotificationTestScreen';
import EnhancedFeaturesDemoScreen from './EnhancedFeaturesDemoScreen';
import PlayerSearchScreen from './PlayerSearchScreen';
import TeamCreationScreen from './TeamCreationScreen';
import MyTeamsScreen from './MyTeamsScreen';
import TermsOfServiceScreen from './TermsOfServiceScreen';
import RateUsScreen from './RateUsScreen';
import SuperAdminScreen from './SuperAdminScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import AboutUsScreen from './AboutUsScreen';
import OverSelectionScreen from './OverSelectionScreen';
// import TeamCreationScreen from './TeamCreationScreen';
// import { apiService } from '../services/api';
import { authService } from '../services/authService';
import { PlayerRegistration } from '../types';
import { initializeDemoData, MANUAL_TEST_TEAMS } from '../utils/demoData';
import { liveScoringService, Team as LiveTeam, Player as LivePlayer } from '../services/liveScoringService';
import { REAL_CRICKET_TEAMS } from '../data/realCricketData';
const sanitizeForFirestore = (value: any): any => {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeForFirestore)
      .filter((item) => item !== undefined && item !== null);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      if (val === undefined || val === null) {
        return acc;
      }
      const sanitized = sanitizeForFirestore(val);
      if (sanitized !== undefined && sanitized !== null) {
        acc[key] = sanitized;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  return value;
};

const normalizeLivePlayers = (players: any[] = []): LivePlayer[] =>
  players
    .filter(Boolean)
    .map((player) => ({
      id: player.id,
      name: player.name,
      role: player.role || 'batsman',
      shortName: player.shortName || player.name?.split(' ')[0] || player.name,
      battingStyle: player.battingStyle || null,
      bowlingStyle: player.bowlingStyle || null,
      nationality: player.nationality || null,
      jerseyNumber: player.jerseyNumber || null,
      isCaptain: !!player.isCaptain,
      isWicketKeeper: !!player.isWicketKeeper,
    }));

const toLiveTeam = (team: any | null | undefined): LiveTeam | null => {
  if (!team || !team.id || !team.name) {
    return null;
  }
  const players = normalizeLivePlayers(team.players);
  const captainId =
    team.captain ||
    players.find((player) => player.isCaptain)?.id ||
    players[0]?.id;
  const wicketKeeperId =
    team.wicketKeeper ||
    players.find((player) => player.isWicketKeeper)?.id ||
    players[0]?.id;

  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
    city: team.city,
    logo: team.logo,
    players,
    captain: captainId,
    wicketKeeper: wicketKeeperId,
    coach: team.coach,
  };
};

const MATCH_STORAGE_KEYS = [
  'currentMatchId',
  'currentMatchTeams',
  'currentPlayingXI',
  'currentMatchSetup',
  'currentTossResult',
  'currentMatchOvers',
];
// import { Match } from '../types';
// import { TeamCreation } from '../types';

type AutoMatchStep =
  | 'idle'
  | 'teamSelection'
  | 'toss'
  | 'overSelection'
  | 'playingXI'
  | 'matchSetup'
  | 'simulate'
  | 'complete';

const HomeScreen: React.FC = () => {
  // Navigation states
  const [activeTab, setActiveTab] = useState('home');
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    { id: 'home', label: 'Home', onPress: () => handleBreadcrumbPress('home') }
  ]);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [navigationStack, setNavigationStack] = useState(['home']);

  // Match Slides Data (Configurable - can be easily modified)
  // First slide shows user's team playing
  const getUserTeamMatch = () => {
    // This would come from user's profile/team data
    // For now, using mock data - in real app, this would be dynamic
    return {
      status: 'LIVE',
      overs: '12.4',
      team1: { name: 'My Team', score: '89/2' }, // User's team
      team2: { name: 'Opponent Team', score: '92/1' },
      batsman: 'You (Captain)',
      bowler: 'Opponent Bowler',
      commentary: 'Great shot! You hit a boundary!',
      venue: 'Local Cricket Ground',
      time: '6:45 PM'
    };
  };

  const staticMatchSlides = [
    {
      status: 'LIVE',
      overs: '15.3',
      team1: { name: 'MI', score: '142/3' },
      team2: { name: 'CSK', score: '138/5' },
      batsman: 'Rohit Sharma',
      bowler: 'Jadeja',
      commentary: 'Rohit hits a beautiful six over long-on!',
      venue: 'Wankhede Stadium, Mumbai',
      time: '7:30 PM'
    },
    {
      status: 'LIVE',
      overs: '18.2',
      team1: { name: 'RCB', score: '165/4' },
      team2: { name: 'DC', score: '158/7' },
      batsman: 'Virat Kohli',
      bowler: 'Rabada',
      commentary: 'Kohli plays a classic cover drive for four!',
      venue: 'Chinnaswamy Stadium, Bangalore',
      time: '8:15 PM'
    },
    {
      status: 'COMPLETED',
      overs: '20.0',
      team1: { name: 'KKR', score: '189/5' },
      team2: { name: 'PBKS', score: '175/8' },
      batsman: 'Shubman Gill',
      bowler: 'Arshdeep Singh',
      commentary: 'KKR won by 14 runs!',
      venue: 'Eden Gardens, Kolkata',
      time: 'Yesterday'
    },
    {
      status: 'LIVE',
      overs: '19.4',
      team1: { name: 'RR', score: '178/6' },
      team2: { name: 'SRH', score: '175/8' },
      batsman: 'Sanju Samson',
      bowler: 'Bhuvi',
      commentary: 'Samson goes for the big shot over mid-wicket!',
      venue: 'Sawai Mansingh Stadium, Jaipur',
      time: '9:00 PM'
    },
    {
      status: 'UPCOMING',
      overs: '0.0',
      team1: { name: 'GT', score: '0/0' },
      team2: { name: 'LSG', score: '0/0' },
      batsman: 'Toss at 7:30 PM',
      bowler: '',
      commentary: 'Match starts in 2 hours',
      venue: 'Narendra Modi Stadium, Ahmedabad',
      time: '7:30 PM'
    }
  ];

  const buildInitialSlides = () => [getUserTeamMatch(), ...staticMatchSlides];
  const [recentMatches, setRecentMatches] = useState(() => buildInitialSlides());
  
  // Player authentication states
  const [currentPlayer, setCurrentPlayer] = useState<PlayerRegistration | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // showOTPLogin removed - using PhoneLoginScreen in App.tsx instead
  const [showPlayerRegistration, setShowPlayerRegistration] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showToss, setShowToss] = useState(false);
  const [showQuickToss, setShowQuickToss] = useState(false);
  const [showLiveScoring, setShowLiveScoring] = useState(false);
  const [showMatchManagement, setShowMatchManagement] = useState(false);
  const [showStartMatch, setShowStartMatch] = useState(false);
  const [showPlaying11, setShowPlaying11] = useState(false);
  const [showMatchSetup, setShowMatchSetup] = useState(false);
  const [showSpectator, setShowSpectator] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [sessionMatchId, setSessionMatchId] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<{ teamA: LiveTeam; teamB: LiveTeam } | null>(null);
  const [tossResult, setTossResult] = useState<{winner: string, decision: string} | null>(null);
  const [showOverSelection, setShowOverSelection] = useState(false);
  const [selectedOvers, setSelectedOvers] = useState<number>(20);
  const [matchSetupData, setMatchSetupData] = useState<{
    battingOrder: string[];
    bowlingOrder: string[];
    teamAPlayers: any[];
    teamBPlayers: any[];
  } | null>(null);
  const [selectedPlayingXI, setSelectedPlayingXI] = useState<{ teamA: LivePlayer[]; teamB: LivePlayer[] } | null>(null);
  
  // User and Admin Management
  const { user, logout } = useUser();
  // showLogin removed - using PhoneLoginScreen in App.tsx instead
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [selectedTeamForAdmin, setSelectedTeamForAdmin] = useState<{id: string, name: string} | null>(null);
  
  // Match Details Modal
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<any>(null);
  
  // Team Selection
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  
  // Notification Test
  const [showNotificationTest, setShowNotificationTest] = useState(false);
  
  // Enhanced Features Demo
  const [showEnhancedDemo, setShowEnhancedDemo] = useState(false);
  
  // Player Search
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [selectedTeamForPlayerSearch, setSelectedTeamForPlayerSearch] = useState<{id: string, name: string} | null>(null);
  const [showTeamCreation, setShowTeamCreation] = useState(false);
  const [showMyTeams, setShowMyTeams] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showRateUs, setShowRateUs] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [isAutoMatchRunning, setIsAutoMatchRunning] = useState(false);
  const [autoMatchStep, setAutoMatchStep] = useState<AutoMatchStep>('idle');
  const [autoMatchStatus, setAutoMatchStatus] = useState<string>('');
  const [autoSimulationRequested, setAutoSimulationRequested] = useState(false);

  const hasActiveMatch = !!(selectedMatchId || sessionMatchId);

  const AUTO_TEAM_A_ID = 'mumbai-indians';
  const AUTO_TEAM_B_ID = 'chennai-super-kings';

  const fetchAutoMatchTeams = useCallback(async () => {
    const normalizePlayer = (player: any): LivePlayer => ({
      id: player.id,
      name: player.name,
      role: player.role || 'batsman',
      shortName: player.shortName || player.name,
      battingStyle: player.battingStyle || null,
      bowlingStyle: player.bowlingStyle || null,
      jerseyNumber: player.jerseyNumber,
      isCaptain: player.isCaptain,
      isWicketKeeper: player.isWicketKeeper,
    });

    const convertRealTeam = (team: typeof REAL_CRICKET_TEAMS[number]): LiveTeam => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      city: team.city,
      logo: team.logo,
      players: team.players.map(normalizePlayer),
      captain: team.players.find(player => player.isCaptain)?.id,
      wicketKeeper: team.players.find(player => player.isWicketKeeper)?.id,
    });

    const realTeamsMap = new Map(REAL_CRICKET_TEAMS.map(team => [team.id, convertRealTeam(team)]));

    let teams = await liveScoringService.getAllTeams();
    if (!teams.length) {
      await initializeDemoData();
      teams = await liveScoringService.getAllTeams();
    }

    const sanitizedTeams = teams
      .map(team => ({
        ...team,
        players: (team.players || []).map(normalizePlayer),
      }))
      .filter(team => team.players && team.players.length > 0);

    const resolveTeam = (teamId: string, fallbackId?: string): LiveTeam => {
      const fromDb = sanitizedTeams.find(team => team.id === teamId);
      if (fromDb && fromDb.players.length >= 11) {
        return {
          ...fromDb,
          shortName: fromDb.shortName || fromDb.name.slice(0, 3).toUpperCase(),
          players: fromDb.players.slice(0, 11),
        };
      }

      const fallback = realTeamsMap.get(teamId) || (fallbackId ? realTeamsMap.get(fallbackId) : undefined);
      if (fallback) {
        return {
          ...fallback,
          players: fallback.players.slice(0, 11),
        };
      }

      throw new Error(`Team ${teamId} not found with sufficient players`);
    };

    const teamA = resolveTeam(AUTO_TEAM_A_ID, sanitizedTeams[0]?.id);
    const teamB = resolveTeam(
      AUTO_TEAM_B_ID,
      sanitizedTeams.find(team => team.id !== teamA.id)?.id || REAL_CRICKET_TEAMS.find(team => team.id !== teamA.id)?.id
    );

    const teamAPlayers = teamA.players.slice(0, 11);
    const teamBPlayers = teamB.players.slice(0, 11);

    const battingOrder = teamAPlayers.map(player => player.id);

    const preferredBowlers = teamBPlayers.filter(player => {
      const role = (player.role || '').toLowerCase();
      return role.includes('bowler') || role.includes('all-rounder') || role.includes('allrounder');
    });
    const supportingBowlers = teamBPlayers.filter(player => !preferredBowlers.includes(player));
    const composedBowlingOrder = [...preferredBowlers, ...supportingBowlers]
      .slice(0, Math.min(8, teamBPlayers.length))
      .map(player => player.id);

    const bowlingOrder = composedBowlingOrder.length
      ? composedBowlingOrder
      : teamBPlayers.map(player => player.id);

    return {
      teamA,
      teamB,
      battingOrder,
      bowlingOrder,
      teamAPlayers,
      teamBPlayers,
    };
  }, []);

  // Helper functions for navigation stack
  const pushToStack = (screen: string) => {
    setNavigationStack(prev => [...prev, screen]);
  };

  const popFromStack = () => {
    const prevScreen = navigationStack[navigationStack.length - 1];
    setNavigationStack(prev => prev.slice(0, -1));
    return prevScreen;
  };

  const getPreviousScreen = () => {
    return navigationStack[navigationStack.length - 1];
  };

  useEffect(() => {
    // loadAsiaCupMatches();
    checkAuthentication();
    loadMatchState();
    
    // User authentication handled in App.tsx with PhoneLoginScreen
  }, [user]);

  // Load match state from localStorage on app start
  const loadMatchState = async () => {
    try {
      const savedMatchId = await AsyncStorage.getItem('currentMatchId');
      const savedMatchTeams = await AsyncStorage.getItem('currentMatchTeams');
      const savedPlayingXI = await AsyncStorage.getItem('currentPlayingXI');
      const savedMatchSetup = await AsyncStorage.getItem('currentMatchSetup');
      const savedTossResult = await AsyncStorage.getItem('currentTossResult');
      const savedOvers = await AsyncStorage.getItem('currentMatchOvers');

      if (savedMatchId) {
        setSelectedMatchId(savedMatchId);
        setSessionMatchId(savedMatchId);
        console.log('🔄 Restored match state:', savedMatchId);
      }

      let restoredTeamA: LiveTeam | null = null;
      let restoredTeamB: LiveTeam | null = null;

      if (savedMatchTeams) {
        const parsed = JSON.parse(savedMatchTeams);
        const storedTeamA = parsed?.teamA;
        const storedTeamB = parsed?.teamB;

        const tryResolveTeam = async (storedTeam: any): Promise<LiveTeam | null> => {
          if (!storedTeam) {
            return null;
          }
          if (storedTeam.id) {
            try {
              const teamFromDb = await liveScoringService.getTeam(storedTeam.id);
              if (teamFromDb) {
                return toLiveTeam(teamFromDb);
              }
            } catch (err) {
              console.warn('⚠️ Failed to restore team from Firestore:', storedTeam.id, err);
            }
          }
          const localTeam = toLiveTeam(storedTeam);
          if (localTeam) {
            return localTeam;
          }
          const manualTeam =
            MANUAL_TEST_TEAMS.find((team) => team.id === storedTeam.id) ||
            REAL_CRICKET_TEAMS.find((team) => team.id === storedTeam.id);
          return toLiveTeam(manualTeam);
        };

        restoredTeamA = await tryResolveTeam(storedTeamA);
        restoredTeamB = await tryResolveTeam(storedTeamB);

        if (restoredTeamA && restoredTeamB) {
          setSelectedTeams({ teamA: restoredTeamA, teamB: restoredTeamB });
        }
      }

      if (savedPlayingXI) {
        try {
          const parsed = JSON.parse(savedPlayingXI);
          if (parsed?.teamA || parsed?.teamB) {
            setSelectedPlayingXI({
              teamA: normalizeLivePlayers(parsed.teamA),
              teamB: normalizeLivePlayers(parsed.teamB),
            });
          }
        } catch (err) {
          console.warn('⚠️ Failed to parse saved playing XI', err);
        }
      }

      if (savedMatchSetup) {
        try {
          const parsed = JSON.parse(savedMatchSetup);
          if (parsed?.teamAPlayers && parsed?.teamBPlayers) {
            setMatchSetupData({
              battingOrder: parsed.battingOrder || [],
              bowlingOrder: parsed.bowlingOrder || [],
              teamAPlayers: normalizeLivePlayers(parsed.teamAPlayers),
              teamBPlayers: normalizeLivePlayers(parsed.teamBPlayers),
            });
          }
        } catch (err) {
          console.warn('⚠️ Failed to parse saved match setup', err);
        }
      }

      if (savedTossResult) {
        setTossResult(JSON.parse(savedTossResult));
      }

      if (savedOvers) {
        const parsedOvers = Number(savedOvers);
        if (!Number.isNaN(parsedOvers) && parsedOvers > 0) {
          setSelectedOvers(parsedOvers);
        }
      }
    } catch (error) {
      console.error('Error loading match state:', error);
    }
  };

  // Removed auto-refresh to prevent continuous refreshing

  // Check if user is already authenticated
  const checkAuthentication = async () => {
    try {
      setIsCheckingAuth(true);
      // Sync data between platforms first
      await authService.syncData();
      
      if (await authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        if (user) {
          console.log('Loaded user:', { name: user.name, hasProfileImage: !!user.profileImage });
          setCurrentPlayer(user);
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // const loadAsiaCupMatches = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const asiaCupMatches = await apiService.getAsiaCupMatches();
  //     setMatches(asiaCupMatches);
  //   } catch (err) {
  //     setError('Failed to load Asia Cup matches');
  //     console.error('Error loading matches:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleGetStarted = () => {
  //   console.log('Get Started pressed');
  //   // TODO: Navigate to main app
  // };

  // const handleMatchPress = (match: Match) => {
  //   setSelectedMatch(match);
  // };

  // const handleBack = () => {
  //   setSelectedMatch(null);
  // };


  // Player authentication handlers
  // const handlePlayerLogin = () => {
  //   setShowPlayerLogin(true);
  // };

  // handleOTPLogin removed - SimpleOTPLoginScreen no longer used

  const handlePlayerRegistration = () => {
    setShowPlayerRegistration(true);
  };

  // const handlePlayerSearch = () => {
  //   setShowPlayerSearch(true);
  // };

  // const handleTeamCreation = () => {
  //   setShowTeamCreation(true);
  // };

  const handleLoginSuccess = (player: PlayerRegistration) => {
    setCurrentPlayer(player);
    // setShowPlayerLogin(false);
    // setShowOTPLogin(false); // SimpleOTPLoginScreen no longer used
  };

  const handleRegistrationComplete = (player: PlayerRegistration) => {
    setCurrentPlayer(player);
    setShowPlayerRegistration(false);
  };

  // handleLogout removed - using handleUserLogout with Firebase logout instead

  const handleUserProfile = () => {
    pushToStack('home');
    setShowUserProfile(true);
  };

  const handleProfileBack = async () => {
    setShowUserProfile(false);
    // Auto-refresh user data when returning from profile
    console.log('🔄 Returning from profile, auto-refreshing data...');
    
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      // Stay on home screen (default behavior)
      console.log('🏠 Returning to home screen');
    } else {
      // Default fallback to side drawer
      setShowSideDrawer(true);
    }
    
    await checkAuthentication();
  };

  // Navigation handlers
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
    console.log(`Tab pressed: ${tab}`);
    
    // Update navigation stack
    const newStack = ['home', tab];
    setNavigationStack(newStack);
    
    // Update breadcrumb when switching tabs
    if (tab === 'home') {
      setBreadcrumbItems([
        { id: 'home', label: 'Home', onPress: () => handleBreadcrumbPress('home') }
      ]);
    } else {
      const newBreadcrumbs = [
        { id: 'home', label: 'Home', onPress: () => handleBreadcrumbPress('home') },
        { id: tab, label: getScreenLabel(tab), onPress: () => handleBreadcrumbPress(tab) }
      ];
      setBreadcrumbItems(newBreadcrumbs);
    }
  };

  const handleMenuPress = () => {
    console.log('🔴 Opening side drawer');
    setShowSideDrawer(true);
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleMessagesPress = () => {
    console.log('Messages pressed');
  };

  const handleNotificationsPress = () => {
    console.log('Notifications pressed');
  };

  const handleSideDrawerClose = () => {
    setShowSideDrawer(false);
  };

  const handleSideDrawerProfilePress = () => {
    pushToStack('sideDrawer');
    setShowSideDrawer(false);
    setShowUserProfile(true);
  };

  const handleTossPress = () => {
    setShowToss(true);
  };

  const handleTossBack = () => {
    setShowToss(false);
  };

  const handleQuickTossPress = () => {
    setShowQuickToss(true);
  };

  const handleQuickTossBack = () => {
    setShowQuickToss(false);
  };

  const handleLiveScoringPress = () => {
    console.log('🏏 Opening Live Scoring with matchId:', selectedMatchId);
    setShowLiveScoring(true);
  };

  const handleLiveScoringBack = () => {
    setShowLiveScoring(false);
    // Don't reset selectedMatchId - keep match state for "Continue Match"
  };

  const handleMatchManagementPress = () => {
    setShowMatchManagement(true);
  };

  const handleMatchManagementBack = () => {
    setShowMatchManagement(false);
  };

  const clearMatchState = useCallback(async () => {
    console.log('🧹 Clearing current match state');
    setShowLiveScoring(false);
    setShowMatchSetup(false);
    setShowPlaying11(false);
    setShowOverSelection(false);
    setShowToss(false);
    setSelectedMatchId(null);
    setSessionMatchId(null);
    setSelectedTeams(null);
    setSelectedPlayingXI(null);
    setMatchSetupData(null);
    setTossResult(null);
    setSelectedOvers(20);
    setAutoSimulationRequested(false);
    setIsAutoMatchRunning(false);
    setAutoMatchStatus('');
    setAutoMatchStep('idle');
    setActiveTab('home');
    setCurrentScreen('home');
    setNavigationStack(['home']);

    try {
      await AsyncStorage.multiRemove(MATCH_STORAGE_KEYS);
      console.log('✅ Cleared cached match state');
    } catch (error) {
      console.error('❌ Failed to clear cached match state:', error);
    }
  }, []);

  const handleResetMatch = async () => {
    if (!hasActiveMatch) {
      Alert.alert('No Active Match', 'There is no ongoing match to reset.');
      return;
    }

    let confirmed = false;
    if (Platform.OS === 'web') {
      confirmed = window.confirm(
        'Reset current match? All unsaved progress will be lost.'
      );
    } else {
      confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Reset Current Match',
          'Resetting will clear all progress for the ongoing match. Continue?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Reset', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
    }

    if (!confirmed) {
      return;
    }

    await clearMatchState();
    console.log('✅ Match state reset by user');
  };

  const handleMatchHistoryPress = () => {
    setShowMatchHistory(true);
  };

  const handleMatchHistoryBack = () => {
    setShowMatchHistory(false);
  };

  const handleStartMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowMatchManagement(false);
    setShowLiveScoring(true);
  };

  const handleStartMatchPress = () => {
    if (selectedMatchId || sessionMatchId) {
      console.log('🔁 Continue Match pressed - resuming LiveScoring');
      handleLiveScoringPress();
      return;
    }
    console.log('🏏 Start Match pressed - showing StartMatchScreen');
    setShowStartMatch(true);
  };

  const handleStartMatchBack = () => {
    setShowStartMatch(false);
    setShowToss(false);
    setShowOverSelection(false);
    setSelectedTeams(null);
    setSelectedPlayingXI(null);
    setMatchSetupData(null);
    setSelectedOvers(20);
  };

  const handleTeamSelectionBack = () => {
    setShowTeamSelection(false);
  };

  const handleTeamSelected = (team: any) => {
    setSelectedTeam(team);
    setShowTeamSelection(false);
    // After team selection, you can proceed to toss or match setup
    console.log('Team selected:', team);
    // For now, just show an alert
    Alert.alert('Team Selected', `You selected ${team.name} (${team.shortName})`);
  };

  const handleNotificationTestPress = () => {
    setShowNotificationTest(true);
  };

  const handleNotificationTestBack = () => {
    setShowNotificationTest(false);
  };

  const handleEnhancedFeaturesPress = () => {
    console.log('🎯 Enhanced Features Demo pressed!');
    setShowEnhancedDemo(true);
  };

  const handleEnhancedDemoBack = () => {
    setShowEnhancedDemo(false);
  };

  // Player Search handlers
  const handlePlayerSearch = (teamId: string, teamName: string) => {
    console.log('🔍 Opening player search for team:', teamName);
    setSelectedTeamForPlayerSearch({ id: teamId, name: teamName });
    setShowPlayerSearch(true);
  };

  const handlePlayerSearchBack = () => {
    setShowPlayerSearch(false);
    setSelectedTeamForPlayerSearch(null);
  };

  const handlePlayerAdded = async (player: any) => {
    try {
      console.log('✅ Player added to team:', player.name);
      
      // TODO: Implement actual team management
      // For now, just log the addition
      // In a real app, you would:
      // 1. Add player to team in Firebase
      // 2. Update team state
      // 3. Refresh team data
      
      console.log(`📝 Player ${player.name} should be added to team ${selectedTeamForPlayerSearch?.name}`);
    } catch (error) {
      console.error('❌ Failed to add player to team:', error);
    }
  };

  const handleCreateTeam = () => {
    setShowTeamCreation(true);
  };

  const handleTeamCreated = (teamId: string) => {
    setShowTeamCreation(false);
    // Navigate to My Teams to show the newly created team
    setShowMyTeams(true);
  };

  const handleMyTeams = () => {
    setShowMyTeams(true);
  };

  const handleTeamCreationBack = () => {
    setShowTeamCreation(false);
  };

  const handleMyTeamsBack = () => {
    setShowMyTeams(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      // Stay on home screen (default behavior)
      console.log('🏠 Returning to home screen');
    } else {
      // Default fallback to side drawer
      setShowSideDrawer(true);
    }
  };

  const handleTermsOfServiceBack = () => {
    setShowTermsOfService(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      console.log('🏠 Returning to home screen');
    }
  };

  const handleTermsOfServicePress = () => {
    pushToStack('sideDrawer');
    setShowTermsOfService(true);
    setShowSideDrawer(false);
  };

  const handleRateUsBack = () => {
    setShowRateUs(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      console.log('🏠 Returning to home screen');
    }
  };

  const handleRateUsPress = () => {
    console.log('🎯 Rate Us pressed - opening screen');
    pushToStack('sideDrawer');
    setShowRateUs(true);
    setShowSideDrawer(false);
  };

  const handleSuperAdminPress = () => {
    console.log('👑 Super Admin pressed - opening screen');
    pushToStack('sideDrawer');
    setShowSuperAdmin(true);
    setShowSideDrawer(false);
  };

  const handleSuperAdminBack = () => {
    setShowSuperAdmin(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      console.log('🏠 Returning to home screen');
    }
  };

  const handlePrivacyPolicyPress = () => {
    console.log('🔒 Privacy Policy pressed - opening screen');
    pushToStack('sideDrawer');
    setShowPrivacyPolicy(true);
    setShowSideDrawer(false);
  };

  const handlePrivacyPolicyBack = () => {
    setShowPrivacyPolicy(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      console.log('🏠 Returning to home screen');
    }
  };

  const handleFindPlayersPress = () => {
    console.log('🔍 Find Players pressed - opening screen');
    pushToStack('sideDrawer');
    setShowPlayerSearch(true);
    setShowSideDrawer(false);
  };

  const handleAboutUsPress = () => {
    console.log('ℹ️ About Us pressed - opening screen');
    pushToStack('sideDrawer');
    setShowAboutUs(true);
    setShowSideDrawer(false);
  };

  const handleAboutUsBack = () => {
    setShowAboutUs(false);
    // Get the previous screen from navigation stack
    const previousScreen = getPreviousScreen();
    popFromStack();
    
    // Navigate back to the previous screen
    if (previousScreen === 'sideDrawer') {
      setShowSideDrawer(true);
    } else if (previousScreen === 'home') {
      console.log('🏠 Returning to home screen');
    }
  };

  const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetAutoMatchFlow = (nextStep: AutoMatchStep = 'idle') => {
    setIsAutoMatchRunning(false);
    setAutoMatchStep(nextStep);
    setAutoSimulationRequested(false);
  };

  const runAutoMatchFlow = async () => {
    if (isAutoMatchRunning) {
      return;
    }

    const oversForDemo = 20;
    let payload;
    try {
      setSelectedOvers(oversForDemo);
      payload = await fetchAutoMatchTeams();
    } catch (error) {
      console.error('❌ Failed to prepare auto match teams:', error);
      setAutoMatchStatus('Unable to load teams for automation.');
      resetAutoMatchFlow('idle');
      return;
    }

    const { teamA, teamB, battingOrder, bowlingOrder, teamAPlayers, teamBPlayers } = payload;

    try {
      setIsAutoMatchRunning(true);
      setAutoMatchStatus('Opening Start Match flow...');
      setAutoMatchStep('teamSelection');

      handleStartMatchPress();
      await waitFor(1500);

      setAutoMatchStatus(`Selecting teams: ${teamA.name} vs ${teamB.name}`);
      await handleStartMatchNext(teamA, teamB);
      setAutoMatchStep('toss');

      await waitFor(2000);
      setAutoMatchStatus(`${teamA.name} win the toss and choose to bat first`);
      handleTossComplete(teamA.name, 'Batting');
      setAutoMatchStep('overSelection');

      await waitFor(1500);
      setAutoMatchStatus(`Setting total overs to ${oversForDemo}`);
      handleOverSelectionConfirm(oversForDemo);
      setAutoMatchStep('playingXI');

      await waitFor(2000);
      setAutoMatchStatus('Confirming Playing XI');
      handlePlaying11Complete({
        teamA: teamAPlayers.slice(0, 11),
        teamB: teamBPlayers.slice(0, 11),
      });
      setAutoMatchStep('matchSetup');

      await waitFor(2000);
      setAutoMatchStatus('Configuring match setup');
      await handleMatchSetupComplete({
        battingOrder,
        bowlingOrder,
        teamAPlayers,
        teamBPlayers,
      });

      setAutoMatchStatus(`Simulating ${oversForDemo}-over match...`);
      setAutoMatchStep('simulate');
      setAutoSimulationRequested(true);
    } catch (error) {
      console.error('❌ Automated flow failed', error);
      setAutoMatchStatus('Automation failed. Please try again.');
      resetAutoMatchFlow('idle');
    }
  };

  const handleAutoMatchPress = () => {
    if (!isAutoMatchRunning) {
      runAutoMatchFlow();
    }
  };

  const handleSimulationProgress = (message: string) => {
    setAutoMatchStatus(message);
  };

  const handleSimulationComplete = (summary?: MatchSummary) => {
    if (summary) {
      const newSlide = {
        status: 'COMPLETED',
        overs: summary.overs,
        team1: { name: summary.teamAName, score: summary.teamAScore },
        team2: { name: summary.teamBName, score: '—' },
        batsman: summary.topBatsman
          ? `${summary.topBatsman.name} ${summary.topBatsman.runs} (${summary.topBatsman.balls})`
          : '',
        bowler: summary.topBowler
          ? `${summary.topBowler.name} ${summary.topBowler.wickets}/${summary.topBowler.runs}`
          : '',
        commentary: summary.resultText,
        venue: 'Auto Simulation',
        time: new Date(summary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setRecentMatches(prev => {
        const withoutUserSlide = prev.slice(1);
        const updated = [newSlide, ...withoutUserSlide];
        const limited = updated.slice(0, staticMatchSlides.length);
        return [getUserTeamMatch(), ...limited];
      });

      setAutoMatchStatus(
        `Match simulation complete! ${summary.teamAName} scored ${summary.teamAScore} in ${summary.overs} overs.`
      );
    } else {
      setAutoMatchStatus('Match simulation complete! Opening match history...');
    }

    setShowMatchHistory(true);
    pushToStack('sideDrawer');
    resetAutoMatchFlow('complete');
  };

  const handleStartMatchNext = async (teamA: LiveTeam, teamB: LiveTeam) => {
    // Create ONE match ID for the entire session
    const newMatchId = `match-${Date.now()}`;
    setSelectedMatchId(newMatchId);
    setSessionMatchId(newMatchId);
    console.log('🏏 Created session match ID:', newMatchId);
    setSelectedTeams({ teamA, teamB });
    
    // Save match state to localStorage
    try {
      await AsyncStorage.setItem('currentMatchId', newMatchId);
      await AsyncStorage.setItem(
        'currentMatchTeams',
        JSON.stringify({
          teamA: sanitizeForFirestore(teamA),
          teamB: sanitizeForFirestore(teamB),
        })
      );
      console.log('💾 Saved match state to localStorage');
    } catch (error) {
      console.error('Error saving match state:', error);
    }
    
    setShowStartMatch(false);
    setShowToss(true);
  };

  const handleTossComplete = (winner: string, decision: string) => {
    setTossResult({ winner, decision });
    setShowToss(false);
    setShowOverSelection(true);
    AsyncStorage.setItem(
      'currentTossResult',
      JSON.stringify({ winner, decision })
    ).catch((error) => console.warn('⚠️ Failed to persist toss result', error));
  };

  const handleOverSelectionConfirm = (overs: number) => {
    setSelectedOvers(overs);
    setShowOverSelection(false);
    setShowPlaying11(true);
    AsyncStorage.setItem('currentMatchOvers', String(overs)).catch((error) =>
      console.warn('⚠️ Failed to persist overs selection', error)
    );
  };

  const handleOverSelectionBack = () => {
    setShowOverSelection(false);
    setShowToss(true);
  };

  const handlePlaying11Complete = (lineups: { teamA: LivePlayer[]; teamB: LivePlayer[] }) => {
    setSelectedPlayingXI(lineups);
    setShowPlaying11(false);
    setShowMatchSetup(true);
    AsyncStorage.setItem(
      'currentPlayingXI',
      JSON.stringify({
        teamA: sanitizeForFirestore(lineups.teamA),
        teamB: sanitizeForFirestore(lineups.teamB),
      })
    ).catch((error) => console.warn('⚠️ Failed to persist playing XI', error));
  };

  const handlePlaying11Back = () => {
    setSelectedPlayingXI(null);
    setShowPlaying11(false);
    setShowOverSelection(true);
  };

  const handleMatchSetupComplete = async (setupData: {
    battingOrder: string[];
    bowlingOrder: string[];
    teamAPlayers: any[];
    teamBPlayers: any[];
  }) => {
    const orderedTeamAPlayers = [
      ...setupData.battingOrder
        .map((id) => setupData.teamAPlayers.find((player) => player.id === id))
        .filter(Boolean),
      ...setupData.teamAPlayers.filter((player) => !setupData.battingOrder.includes(player.id)),
    ];

    const orderedTeamBPlayers = [
      ...setupData.bowlingOrder
        .map((id) => setupData.teamBPlayers.find((player) => player.id === id))
        .filter(Boolean),
      ...setupData.teamBPlayers.filter((player) => !setupData.bowlingOrder.includes(player.id)),
    ];

    const initialBattingOrder = (setupData.battingOrder && setupData.battingOrder.length
      ? [...setupData.battingOrder]
      : orderedTeamAPlayers.map((player) => player.id));

    const initialBowlingOrder = (setupData.bowlingOrder && setupData.bowlingOrder.length
      ? [...setupData.bowlingOrder]
      : orderedTeamBPlayers.slice(0, Math.min(6, orderedTeamBPlayers.length)).map((player) => player.id));

    const strikerSource =
      orderedTeamAPlayers.find((player) => player.id === initialBattingOrder[0]) || orderedTeamAPlayers[0];
    const nonStrikerSource =
      orderedTeamAPlayers.find((player) => player.id === initialBattingOrder[1]) ||
      orderedTeamAPlayers.find((player) => player.id !== strikerSource?.id) ||
      orderedTeamAPlayers[1] ||
      strikerSource;

    const remainingBatters = initialBattingOrder.slice(2);
    const nextBatsmanSource = remainingBatters.length
      ? orderedTeamAPlayers.find((player) => player.id === remainingBatters[0])
      : null;

    const primaryBowlerSource =
      orderedTeamBPlayers.find((player) => player.id === initialBowlingOrder[0]) || orderedTeamBPlayers[0];

    const enrichedSetup = {
      ...setupData,
      teamAPlayers: orderedTeamAPlayers,
      teamBPlayers: orderedTeamBPlayers,
      battingOrder: initialBattingOrder,
      bowlingOrder: initialBowlingOrder,
      remainingBatters,
    };

    // Store the setup data
    setMatchSetupData(enrichedSetup);
    setSelectedPlayingXI({ teamA: orderedTeamAPlayers, teamB: orderedTeamBPlayers });
    AsyncStorage.setItem(
      'currentMatchSetup',
      JSON.stringify(
        sanitizeForFirestore({
          battingOrder: enrichedSetup.battingOrder,
          bowlingOrder: enrichedSetup.bowlingOrder,
          teamAPlayers: enrichedSetup.teamAPlayers,
          teamBPlayers: enrichedSetup.teamBPlayers,
          remainingBatters,
        })
      )
    ).catch((error) => console.warn('⚠️ Failed to persist match setup', error));
    
    // Use the session match ID (should already be set)
    const matchId = selectedMatchId || sessionMatchId;
    console.log('🏏 Using match ID for live scoring:', matchId);
    console.log('🏏 Match setup data:', enrichedSetup);
    
    // Create the match in Firebase BEFORE going to live scoring
    try {
      const { liveScoringService } = await import('../services/liveScoringService');
      const matchPayload = {
        name: `${selectedTeams?.teamA.name || 'Team A'} vs ${selectedTeams?.teamB.name || 'Team B'}`,
        team1: { id: selectedTeams?.teamA.id || 'team1', name: selectedTeams?.teamA.name || 'Team A', players: orderedTeamAPlayers },
        team2: { id: selectedTeams?.teamB.id || 'team2', name: selectedTeams?.teamB.name || 'Team B', players: orderedTeamBPlayers },
        matchType: 'T20',
        totalOvers: selectedOvers,
        currentInnings: 1,
        status: 'live',
        createdBy: 'user',
        isLive: true,
        battingOrder: initialBattingOrder,
        bowlingOrder: initialBowlingOrder,
        remainingBatters,
        currentBatsmen: {
          striker: {
            id: strikerSource?.id || 'striker',
            name: strikerSource?.name || 'Striker',
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false,
          },
          nonStriker: {
            id: nonStrikerSource?.id || 'non-striker',
            name: nonStrikerSource?.name || 'Non Striker',
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOut: false,
          },
        },
        nextBatsman: {
          id: nextBatsmanSource?.id || '',
          name: nextBatsmanSource?.name || (remainingBatters.length ? 'Next Batsman' : 'All Out'),
        },
        currentBowler: {
          id: primaryBowlerSource?.id || 'bowler',
          name: primaryBowlerSource?.name || 'Bowler',
          overs: 0,
          wickets: 0,
          runs: 0,
        },
      };

      const sanitizedPayload = sanitizeForFirestore(matchPayload);

      const createdMatchId = await liveScoringService.createMatch(sanitizedPayload);
      console.log('✅ Match created in Firebase with ID:', createdMatchId);
      // Update the selectedMatchId with the actual Firebase ID
      setSelectedMatchId(createdMatchId);
      setSessionMatchId(createdMatchId);
      await AsyncStorage.setItem('currentMatchId', createdMatchId);
      await AsyncStorage.setItem(
        'currentMatchTeams',
        JSON.stringify(
          sanitizeForFirestore({
            teamA: selectedTeams?.teamA,
            teamB: selectedTeams?.teamB,
          })
        )
      );
    } catch (error) {
      console.error('❌ Error creating match:', error);
    }
    
    setShowMatchSetup(false);
    setShowLiveScoring(true);
  };

  const handleMatchSetupBack = () => {
    setShowMatchSetup(false);
    setShowPlaying11(true);
    setMatchSetupData(null);
  };

  const handleSpectatorPress = () => {
    setShowSpectator(true);
  };

  const handleSpectatorBack = () => {
    setShowSpectator(false);
  };

  // Admin Management Handlers
  const handleUserLoginSuccess = () => {
    // User login handled in App.tsx with PhoneLoginScreen
  };

  const handleUserLogout = async () => {
    try {
      await logout(); // This is Firebase logout from UserContext
      // User will be redirected to PhoneLoginScreen automatically by App.tsx
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleManageAdmins = (teamId: string, teamName: string) => {
    setSelectedTeamForAdmin({ id: teamId, name: teamName });
    setShowAdminManagement(true);
  };

  const handleMatchSlidePress = (match: any, index: number) => {
    // Enhanced match data with detailed scorecards
    const enhancedMatch = {
      ...match,
      id: `match-${index + 1}`,
      date: new Date().toLocaleDateString(),
      tossWinner: match.team1.name,
      tossDecision: 'Batting',
      currentInnings: 1,
      target: 180,
      requiredRunRate: 8.5,
      team1: {
        ...match.team1,
        batting: [
          { name: 'Rohit Sharma', runs: 45, balls: 32, fours: 6, sixes: 2, strikeRate: 140.6, isOut: false },
          { name: 'Ishan Kishan', runs: 28, balls: 24, fours: 4, sixes: 1, strikeRate: 116.7, isOut: true },
          { name: 'Suryakumar Yadav', runs: 38, balls: 28, fours: 5, sixes: 1, strikeRate: 135.7, isOut: false },
          { name: 'Tilak Varma', runs: 15, balls: 12, fours: 2, sixes: 0, strikeRate: 125.0, isOut: true }
        ],
        bowling: [
          { name: 'Jasprit Bumrah', overs: 3.3, maidens: 0, runs: 28, wickets: 2, economy: 8.0 },
          { name: 'Jadeja', overs: 4.0, maidens: 1, runs: 22, wickets: 1, economy: 5.5 },
          { name: 'Hardik Pandya', overs: 3.0, maidens: 0, runs: 25, wickets: 1, economy: 8.3 },
          { name: 'Kuldeep Yadav', overs: 4.0, maidens: 0, runs: 32, wickets: 1, economy: 8.0 }
        ]
      },
      team2: {
        ...match.team2,
        batting: [
          { name: 'Ruturaj Gaikwad', runs: 52, balls: 38, fours: 7, sixes: 1, strikeRate: 136.8, isOut: false },
          { name: 'Devon Conway', runs: 18, balls: 15, fours: 2, sixes: 0, strikeRate: 120.0, isOut: true },
          { name: 'Ajinkya Rahane', runs: 35, balls: 28, fours: 4, sixes: 1, strikeRate: 125.0, isOut: false },
          { name: 'MS Dhoni', runs: 12, balls: 8, fours: 1, sixes: 0, strikeRate: 150.0, isOut: true }
        ],
        bowling: [
          { name: 'Deepak Chahar', overs: 3.0, maidens: 0, runs: 24, wickets: 1, economy: 8.0 },
          { name: 'Tushar Deshpande', overs: 3.3, maidens: 0, runs: 28, wickets: 1, economy: 8.0 },
          { name: 'Ravindra Jadeja', overs: 4.0, maidens: 0, runs: 30, wickets: 1, economy: 7.5 },
          { name: 'Matheesha Pathirana', overs: 3.0, maidens: 0, runs: 25, wickets: 1, economy: 8.3 }
        ]
      },
      recentBalls: [
        { ball: '15.1', runs: 1, batsman: 'Rohit Sharma', bowler: 'Jadeja', commentary: 'Single to long-on' },
        { ball: '15.2', runs: 4, batsman: 'Suryakumar Yadav', bowler: 'Jadeja', commentary: 'Beautiful cover drive for four!' },
        { ball: '15.3', runs: 6, batsman: 'Rohit Sharma', bowler: 'Jadeja', commentary: 'Massive six over long-on!' },
        { ball: '15.4', runs: 0, batsman: 'Suryakumar Yadav', bowler: 'Jadeja', commentary: 'Dot ball, good line and length' },
        { ball: '15.5', runs: 2, batsman: 'Rohit Sharma', bowler: 'Jadeja', commentary: 'Quick two runs to deep mid-wicket' },
        { ball: '15.6', runs: 1, batsman: 'Suryakumar Yadav', bowler: 'Jadeja', commentary: 'Single to keep the strike' }
      ]
    };
    
    setSelectedMatchDetails(enhancedMatch);
    setShowMatchDetails(true);
  };

  const handleAdminManagementBack = () => {
    setShowAdminManagement(false);
    setSelectedTeamForAdmin(null);
  };

  const handleFinishMatch = async () => {
    console.log('🏁 handleFinishMatch called!');
    console.log('🏁 Current selectedMatchId:', selectedMatchId);
    
    // Check if running on web or mobile
    const isWeb = Platform.OS === 'web';
    
    let confirmed = false;
    
    if (isWeb) {
      // Use native browser confirm for web
      confirmed = window.confirm('Are you sure you want to finish this match? This action cannot be undone.');
    } else {
      // Use Alert.alert for mobile (with promise wrapper)
      confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Finish Match',
          'Are you sure you want to finish this match? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Finish', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
    }
    
    if (!confirmed) {
      console.log('❌ User cancelled');
      return;
    }
    
    console.log('✅ User confirmed finish!');
    
    // Save matchId before clearing state
    const matchIdToFinish = selectedMatchId || sessionMatchId;
    console.log('📝 Match ID to finish:', matchIdToFinish);
    
    // Clear state FIRST - this makes buttons disappear immediately
    await clearMatchState();
    
    // Try to update Firebase (don't block if it fails)
    if (matchIdToFinish) {
      try {
        console.log('💾 Checking if match exists in Firebase...');
        console.log('💾 Match ID:', matchIdToFinish);
        const { liveScoringService } = await import('../services/liveScoringService');
        
        // First check if match exists
        const match = await liveScoringService.getMatch(matchIdToFinish);
        if (!match) {
          console.warn('⚠️ Match not found in Firebase - it was probably a demo/temporary match');
          throw new Error('Match not found in Firebase');
        }
        
        // Match exists, update it
        await liveScoringService.updateMatch(matchIdToFinish, {
          status: 'completed',
          isLive: false,
        });
        console.log('✅ Firebase updated successfully!');
        
        // Show success message
        if (isWeb) {
          alert('Success! Match has been finished and saved to Match History!');
        } else {
          Alert.alert('Success', 'Match has been finished and saved to Match History!');
        }
      } catch (error) {
        console.error('❌ Error updating Firebase:', error);
        console.warn('⚠️ Match was closed locally, but could not update Firebase. This is OK - the match is finished on your device.');
        
        // Show partial success message
        if (isWeb) {
          alert('Match finished locally! \n\n(Note: Could not sync to Firebase, but the match is closed on your device)');
        } else {
          Alert.alert('Match Finished', 'Match finished locally!\n\n(Could not sync to Firebase)');
        }
      }
    } else {
      console.warn('⚠️ No matchId to update in Firebase');
      // Show success anyway since local state is cleared
      if (isWeb) {
        alert('Match finished!');
    } else {
        Alert.alert('Success', 'Match finished!');
      }
    }
  };

  const handleDemoMode = async () => {
    try {
      await initializeDemoData();
      Alert.alert('Demo Mode', 'Demo data loaded! You can now test all features.');
    } catch (error) {
      console.error('Error loading demo data:', error);
      Alert.alert('Error', 'Failed to load demo data');
    }
  };

  // Breadcrumb navigation handler
  const handleBreadcrumbPress = (screenId: string) => {
    console.log(`🍞 Breadcrumb pressed: ${screenId}`);
    console.log(`🍞 Current screen before: ${currentScreen}`);
    console.log(`🍞 Current active tab before: ${activeTab}`);
    
    if (screenId === 'home') {
      // Go back to home - reset everything
      console.log('🍞 Going back to home...');
      setCurrentScreen('home');
      setActiveTab('home');
      setNavigationStack(['home']);
      setBreadcrumbItems([
        { id: 'home', label: 'Home', onPress: () => handleBreadcrumbPress('home') }
      ]);
      console.log('🍞 Reset to home complete');
    } else {
      // Navigate to specific screen
      console.log(`🍞 Navigating to: ${screenId}`);
      setCurrentScreen(screenId);
      setActiveTab(screenId);
      
      // Update navigation stack
      const newStack = ['home', screenId];
      setNavigationStack(newStack);
      
      // Update breadcrumb to show navigation path
      const newBreadcrumbs = [
        { id: 'home', label: 'Home', onPress: () => handleBreadcrumbPress('home') },
        { id: screenId, label: getScreenLabel(screenId), onPress: () => handleBreadcrumbPress(screenId) }
      ];
      setBreadcrumbItems(newBreadcrumbs);
      console.log(`🍞 Navigation to ${screenId} complete`);
    }
  };

  // Get screen label for breadcrumb
  const getScreenLabel = (screenId: string): string => {
    const labels: { [key: string]: string } = {
      'home': 'Home',
      'looking': 'Looking',
      'mycricket': 'My Cricket',
      'community': 'Community',
      'profile': 'Profile',
      'matches': 'Matches',
      'leaderboard': 'Leaderboard',
      'store': 'Store',
    };
    return labels[screenId] || screenId;
  };

  // handleOTPLoginBack removed - SimpleOTPLoginScreen no longer used

  const handleRegistrationBack = async () => {
    setShowPlayerRegistration(false);
    // Auto-refresh when returning from registration
    console.log('🔄 Returning from registration, auto-refreshing data...');
    await checkAuthentication();
  };

  // Force refresh function
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing all data...');
    setIsRefreshing(true);
    await checkAuthentication();
    setIsRefreshing(false);
    console.log('✅ Force refresh completed');
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    console.log('🔄 Pull-to-refresh triggered');
    await forceRefresh();
  };

  // const handlePlayerSelect = (player: PlayerRegistration) => {
  //   // Handle player selection from search
  //   setShowPlayerSearch(false);
  // };

  // const handleTeamCreated = (team: TeamCreation) => {
  //   setShowTeamCreation(false);
  // };

  // const handleRefresh = () => {
  //   loadAsiaCupMatches();
  // };


  // Show player screens if active
  // if (showPlayerLogin) {
  //   return (
  //     <PlayerLoginScreen
  //       onLoginSuccess={handleLoginSuccess}
  //       onRegister={() => {
  //         setShowPlayerLogin(false);
  //         setShowPlayerRegistration(true);
  //       }}
  //       onBack={() => setShowPlayerLogin(false)}
  //     />
  //   );
  // }

  // SimpleOTPLoginScreen removed - using PhoneLoginScreen in App.tsx instead

  if (showPlayerRegistration) {
    return (
      <PlayerRegistrationScreen
        onRegistrationComplete={handleRegistrationComplete}
        onBack={handleRegistrationBack}
      />
    );
  }

  if (showUserProfile) {
    return (
        <UserProfileScreen
          onBack={handleProfileBack}
          onLogout={handleUserLogout}
          onProfileUpdated={async () => {
            // Refresh user data when profile is updated
            console.log('🔄 Profile updated, refreshing data...');
            await forceRefresh();
          }}
      />
    );
  }

  if (showToss) {
    if (!selectedTeams) {
      console.warn('⚠️ Toss requested without selected teams');
      return null;
    }
    return (
      <TossScreen
        onBack={handleTossBack}
        teamA={selectedTeams.teamA.name}
        teamB={selectedTeams.teamB.name}
        onTossComplete={handleTossComplete}
      />
    );
  }

  if (showOverSelection) {
    return (
      <OverSelectionScreen
        onBack={handleOverSelectionBack}
        onSelect={handleOverSelectionConfirm}
        selectedOvers={selectedOvers}
      />
    );
  }

  if (showQuickToss) {
    console.log('🪙 Rendering Quick TossScreen');
    return (
      <TossScreen
        onBack={handleQuickTossBack}
        isQuickToss={true}
      />
    );
  }

  if (showPlaying11) {
    if (!selectedTeams) {
      console.warn('⚠️ Playing XI requested without selected teams');
      return null;
    }
    return (
      <Playing11Screen
        teamAName={selectedTeams.teamA.name}
        teamBName={selectedTeams.teamB.name}
        teamAPlayers={selectedTeams.teamA.players || []}
        teamBPlayers={selectedTeams.teamB.players || []}
        tossWinner={tossResult?.winner || 'Team A'}
        tossDecision={tossResult?.decision || 'Batting'}
        onBack={handlePlaying11Back}
        onStartMatch={handlePlaying11Complete}
      />
    );
  }

  if (showMatchSetup) {
    if (!selectedTeams || !selectedPlayingXI) {
      console.warn('⚠️ Match setup requested without selected teams or playing XI');
      return null;
    }
    return (
      <MatchSetupScreen
        teamA={selectedTeams.teamA.name}
        teamB={selectedTeams.teamB.name}
        tossWinner={tossResult?.winner || 'Team A'}
        tossDecision={tossResult?.decision || 'Batting'}
        teamAPlayers={selectedPlayingXI.teamA}
        teamBPlayers={selectedPlayingXI.teamB}
        totalOvers={selectedOvers}
        onBack={handleMatchSetupBack}
        onStartMatch={handleMatchSetupComplete}
      />
    );
  }

  if (showStartMatch) {
    console.log('🏏 Rendering StartMatchScreen');
    return (
      <StartMatchScreen
        onBack={handleStartMatchBack}
        onNext={handleStartMatchNext}
        onCreateTeam={() => {
          setShowStartMatch(false);
          setShowMatchManagement(true);
        }}
      />
    );
  }

  if (showMatchManagement) {
    return (
      <MatchManagementScreen
        onBack={handleMatchManagementBack}
        onStartMatch={handleStartMatch}
      />
    );
  }

  if (showLiveScoring) {
    if (!selectedTeams) {
      console.warn('⚠️ Live scoring requested without selected teams');
    }
    return (
      <LiveScoringScreen
        onBack={handleLiveScoringBack}
        matchId={selectedMatchId || undefined}
        teamA={selectedTeams?.teamA.name}
        teamB={selectedTeams?.teamB.name}
        battingOrder={matchSetupData?.battingOrder}
        bowlingOrder={matchSetupData?.bowlingOrder}
        teamAPlayers={matchSetupData?.teamAPlayers}
        teamBPlayers={matchSetupData?.teamBPlayers}
        totalOvers={selectedOvers}
        autoSimulate={autoSimulationRequested && isAutoMatchRunning}
        onSimulationProgress={handleSimulationProgress}
        onSimulationComplete={handleSimulationComplete}
      />
    );
  }

  if (showSpectator) {
    return (
      <SpectatorScreen
        onBack={handleSpectatorBack}
        matchId={selectedMatchId || 'demo-match'}
      />
    );
  }

  if (showMatchHistory) {
    return (
      <MatchHistoryScreen
        onBack={handleMatchHistoryBack}
      />
    );
  }

  // if (showPlayerSearch) {
  //   return (
  //     <PlayerSearchScreen
  //       onPlayerSelect={handlePlayerSelect}
  //       onBack={() => setShowPlayerSearch(false)}
  //     />
  //   );
  // }

  // if (showTeamCreation && currentPlayer) {
  //   return (
  //     <TeamCreationScreen
  //       currentPlayer={currentPlayer}
  //       onTeamCreated={handleTeamCreated}
  //       onBack={() => setShowTeamCreation(false)}
  //     />
  //   );
  // }


  // Show match detail screen if a match is selected
  // if (selectedMatch) {
  //   return <MatchDetailScreen match={selectedMatch} onBack={handleBack} />;
  // }

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // UserLoginScreen removed - using PhoneLoginScreen in App.tsx instead

  // Show enhanced features demo screen
  if (showEnhancedDemo) {
    return (
      <EnhancedFeaturesDemoScreen
        onBack={handleEnhancedDemoBack}
        onMatchHistoryPress={() => {
          setShowEnhancedDemo(false);
          setShowMatchHistory(true);
        }}
        currentUserName={user?.phoneNumber || currentPlayer?.name || 'Player'}
        currentUserPhone={user?.phoneNumber || ''}
        isPro={false} // Set to true to test PRO features, false to test FREE user experience
      />
    );
  }

  // Show player search screen
  if (showPlayerSearch && selectedTeamForPlayerSearch) {
    return (
      <PlayerSearchScreen
        teamId={selectedTeamForPlayerSearch.id}
        teamName={selectedTeamForPlayerSearch.name}
        onPlayerAdded={handlePlayerAdded}
        onBack={handlePlayerSearchBack}
      />
    );
  }

  // Show Team Creation Screen
  if (showTeamCreation) {
    return (
      <TeamCreationScreen
        onBack={handleTeamCreationBack}
        onTeamCreated={handleTeamCreated}
      />
    );
  }

  // Show My Teams Screen
  if (showMyTeams) {
    return (
      <MyTeamsScreen
        onBack={handleMyTeamsBack}
        onCreateTeam={handleCreateTeam}
      />
    );
  }

  // Show Terms of Service Screen
  if (showTermsOfService) {
    return (
      <TermsOfServiceScreen
        onBack={handleTermsOfServiceBack}
      />
    );
  }

  // Show Rate Us Screen
  if (showRateUs) {
    return (
      <RateUsScreen
        onBack={handleRateUsBack}
      />
    );
  }

  // Show Super Admin Screen (only for Super Admin)
  if (showSuperAdmin && user?.isSuperAdmin) {
    return (
      <SuperAdminScreen
        onBack={handleSuperAdminBack}
      />
    );
  }

  // Show Privacy Policy Screen
  if (showPrivacyPolicy) {
    return (
      <PrivacyPolicyScreen
        onBack={handlePrivacyPolicyBack}
      />
    );
  }

  // Show About Us Screen
  if (showAboutUs) {
    return (
      <AboutUsScreen
        onBack={handleAboutUsBack}
      />
    );
  }

  // Show notification test screen
  if (showNotificationTest) {
    return (
      <NotificationTestScreen
        onBack={handleNotificationTestBack}
      />
    );
  }

  // Show team selection screen
  if (showTeamSelection) {
    return (
      <TeamSelectionScreen
        onTeamSelected={handleTeamSelected}
        onBack={handleTeamSelectionBack}
      />
    );
  }

  // Show admin management screen
  if (showAdminManagement && selectedTeamForAdmin) {
    return (
      <AdminManagement
        teamId={selectedTeamForAdmin.id}
        teamName={selectedTeamForAdmin.name}
        onClose={handleAdminManagementBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <TopNavigation
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        onMessagesPress={handleMessagesPress}
        onNotificationsPress={handleNotificationsPress}
        messageCount={1}
        notificationCount={6}
      />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={breadcrumbItems}
        activeItem={currentScreen}
      />


      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >

        {/* Screen-specific content */}
        {currentScreen === 'looking' && (
          <View style={styles.screenContent}>
            <Text style={styles.screenTitle}>🔍 Looking For</Text>
            <Text style={styles.screenDescription}>
              Find players, teams, and matches in your area
          </Text>
          </View>
        )}

        {currentScreen === 'mycricket' && (
          <View style={styles.screenContent}>
            <Text style={styles.screenTitle}>🏏 My Cricket</Text>
            <Text style={styles.screenDescription}>
              Track your performance, stats, and achievements
              </Text>
            </View>
          )}

        {currentScreen === 'community' && (
          <View style={styles.screenContent}>
            <Text style={styles.screenTitle}>👥 Community</Text>
            <Text style={styles.screenDescription}>
              Connect with cricket players and fans
              </Text>
        </View>
          )}

        {/* Loading State */}
        {/* {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading Asia Cup matches...</Text>
          </View>
        )} */}

        {/* Error State */}
        {/* {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={handleRefresh}
              size="small"
              style={styles.retryButton}
            />
          </View>
        )} */}

        {/* Live Matches List */}
        {/* {!loading && !error && (
          <LiveMatchesList 
            matches={matches} 
            onMatchPress={handleMatchPress}
          />
        )} */}

        {/* <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Live Scores</Text>
            <Text style={styles.featureDescription}>
              Get real-time cricket match scores and updates
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Player Stats</Text>
            <Text style={styles.featureDescription}>
              Detailed player statistics and performance data
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📰</Text>
            <Text style={styles.featureTitle}>Latest News</Text>
            <Text style={styles.featureDescription}>
              Stay updated with the latest cricket news and updates
            </Text>
          </View>
        </View> */}

        {/* COMMENTED OUT ALL BUTTONS - SHOWING MATCH SLIDES INSTEAD */}
        {/* <View style={styles.actions}>
          {!currentPlayer ? (
            <>
              <Button
                title="🔐 OTP Login"
                onPress={handleOTPLogin}
                size="medium"
                style={styles.primaryButton}
              />
              <Button
                title="📝 Register as Player"
                onPress={handlePlayerRegistration}
                variant="outline"
                size="medium"
                style={styles.secondaryButton}
              />
            </>
          ) : (
            <View style={styles.welcomeMessage}>
              <Button
                title="🏏 Start A Match"
                onPress={handleStartMatchPress}
                size="medium"
                style={styles.primaryButton}
              />
              {selectedMatchId && (
              <Button
                  title="🏏 Continue Match"
                  onPress={handleLiveScoringPress}
                  size="medium"
                style={styles.primaryButton}
              />
              )}
              <Button
                title="📊 Live Scoring"
                onPress={handleLiveScoringPress}
                size="medium"
                style={styles.secondaryButton}
              />
              <Button
                title="📋 Match Management"
                onPress={handleMatchManagementPress}
                size="medium"
            style={styles.secondaryButton}
              />
          <Button
                title="📚 Match History"
                onPress={handleMatchHistoryPress}
                size="medium"
            style={styles.secondaryButton}
          />
          <Button
                title="👑 Manage Admins"
                onPress={() => handleManageAdmins('demo-team-id', 'Demo Team')}
                size="medium"
            style={styles.secondaryButton}
          />
              {selectedMatchId && (
          <Button
                  title="📊 View Scorecard"
                  onPress={handleSpectatorPress}
                  size="medium"
            style={styles.secondaryButton}
          />
              )}
              {selectedMatchId && (
                <Button
                  title="🏁 Finish Match"
                  onPress={handleFinishMatch}
                  size="medium"
                  style={styles.finishButton}
                />
              )}
        </View>
          )}
        </View> */}

        {/* Start Match Button - Small and Right */}
        <View style={styles.startMatchContainer}>
          <TouchableOpacity 
            style={styles.startMatchButton}
            onPress={hasActiveMatch ? handleLiveScoringPress : handleStartMatchPress}
          >
            <Text style={styles.startMatchButtonText}>
              {hasActiveMatch ? '🏏 Continue Match' : '🏏 Start Match'}
            </Text>
          </TouchableOpacity>

          {hasActiveMatch && (
            <TouchableOpacity
              style={[styles.startMatchButton, styles.resetMatchButton]}
              onPress={handleResetMatch}
            >
              <Text style={styles.startMatchButtonText}>🔄 Reset Current Match</Text>
            </TouchableOpacity>
          )}

          {/* Debug: Enhanced Features Button */}
          <TouchableOpacity
            style={[styles.startMatchButton, { backgroundColor: COLORS.success, marginTop: 10 }]}
            onPress={handleEnhancedFeaturesPress}
          >
            <Text style={styles.startMatchButtonText}>🎯 Test PRO Features</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.startMatchButton,
              { backgroundColor: COLORS.secondary, marginTop: 10 },
              isAutoMatchRunning && styles.disabledAutoButton
            ]}
            onPress={handleAutoMatchPress}
            disabled={isAutoMatchRunning}
          >
            <Text style={styles.startMatchButtonText}>
              {isAutoMatchRunning ? '⏳ Auto Match Running...' : '🤖 Auto 20-Over Demo'}
            </Text>
          </TouchableOpacity>

          {!!autoMatchStatus && (
            <View style={styles.autoMatchStatus}>
              <Text style={styles.autoMatchStatusText}>{autoMatchStatus}</Text>
            </View>
          )}
        </View>

        {/* MATCH SLIDES SHOWCASE */}
        <View style={styles.matchSlidesContainer}>
          <Text style={styles.slidesTitle}>📊 Recent Matches</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.matchSlides}
            pagingEnabled
          >
            {recentMatches.map((match, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.matchSlide,
                  index === 0 && styles.userTeamSlide // Special styling for user's team
                ]}
                onPress={() => handleMatchSlidePress(match, index)}
              >
                <View style={styles.slideHeader}>
                  <View style={styles.slideStatusContainer}>
                    <Text style={[
                      styles.slideStatus,
                      match.status === 'LIVE' && styles.liveStatus,
                      match.status === 'COMPLETED' && styles.completedStatus,
                      match.status === 'UPCOMING' && styles.upcomingStatus
                    ]}>{match.status}</Text>
                    {index === 0 && (
                      <Text style={styles.userTeamBadge}>YOUR TEAM</Text>
                    )}
                  </View>
                  <Text style={styles.slideOvers}>{match.overs}</Text>
                </View>
                
                <View style={styles.slideTeams}>
                  <View style={styles.slideTeam}>
                    <Text style={styles.slideTeamName} numberOfLines={1}>{match.team1.name}</Text>
                    <Text style={styles.slideScore}>{match.team1.score}</Text>
                  </View>
                  
                  <Text style={styles.slideVS}>VS</Text>
                  
                  <View style={styles.slideTeam}>
                    <Text style={styles.slideTeamName} numberOfLines={1}>{match.team2.name}</Text>
                    <Text style={styles.slideScore}>{match.team2.score}</Text>
                  </View>
                </View>
                
                <View style={styles.slideFooter}>
                  <Text style={styles.slideVenue}>{match.venue}</Text>
                </View>
              </TouchableOpacity>
            ))}
      </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      {/* Side Drawer */}
      <SideDrawer
        visible={showSideDrawer}
        onClose={handleSideDrawerClose}
        user={user}
        onProfilePress={handleSideDrawerProfilePress}
        onLogout={handleUserLogout}
        onTossPress={handleQuickTossPress}
        onStartMatchPress={handleStartMatchPress}
        onEnhancedFeaturesPress={handleEnhancedFeaturesPress}
        onFindPlayersPress={() => handlePlayerSearch('find-players', 'Find Players')}
        onCreateTeamPress={handleCreateTeam}
        onMyTeamsPress={handleMyTeams}
        onTermsOfServicePress={handleTermsOfServicePress}
        onRateUsPress={handleRateUsPress}
      />

      {/* Match Details Modal */}
      {showMatchDetails && selectedMatchDetails && (
        <MatchDetailsModal
          match={selectedMatchDetails}
          onClose={() => setShowMatchDetails(false)}
        />
      )}

      {/* Side Drawer */}
      <SideDrawer
        visible={showSideDrawer}
        onClose={handleSideDrawerClose}
        user={user}
        onProfilePress={handleSideDrawerProfilePress}
        onLogout={handleUserLogout}
        onTossPress={handleQuickTossPress}
        onStartMatchPress={handleStartMatchPress}
        onNotificationTestPress={handleNotificationTestPress}
        onEnhancedFeaturesPress={handleEnhancedFeaturesPress}
        onFindPlayersPress={handleFindPlayersPress}
        onCreateTeamPress={handleCreateTeam}
        onMyTeamsPress={handleMyTeams}
        onTermsOfServicePress={handleTermsOfServicePress}
        onRateUsPress={handleRateUsPress}
        onSuperAdminPress={handleSuperAdminPress}
        onPrivacyPolicyPress={handlePrivacyPolicyPress}
        onAboutUsPress={handleAboutUsPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
    paddingBottom: 100, // Space for bottom navigation
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    marginTop: SIZES.lg,
  },
  welcomeMessage: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    marginTop: SIZES.lg,
  },
  welcomeText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: SIZES.xxl,
  },
  featureItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: SIZES.md,
  },
  primaryButton: {
    marginBottom: SIZES.xs,
    paddingVertical: SIZES.sm,
  },
  secondaryButton: {
    marginBottom: SIZES.xs,
    paddingVertical: SIZES.sm,
  },
  finishButton: {
    marginBottom: SIZES.xs,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '10',
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.lg,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  retryButton: {
    minWidth: 100,
  },
  adminButton: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  playerInfo: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginTop: SIZES.md,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  playerDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  screenContent: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.lg,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  screenDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // User Info Styles
  // Match Slides Styles
  matchSlidesContainer: {
    marginBottom: SIZES.lg,
  },
  slidesTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  matchSlides: {
    paddingHorizontal: SIZES.sm,
  },
  matchSlide: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.sm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  slideStatus: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  slideOvers: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  slideTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  slideTeam: {
    flex: 1,
    alignItems: 'center',
  },
  slideTeamName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  slideScore: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  slideVS: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.sm,
  },
  slideDetails: {
    marginBottom: SIZES.md,
  },
  slideBatsman: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  slideBowler: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  slideCommentary: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  slideFooter: {
    marginTop: SIZES.xs,
  },
  slideVenue: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  // Start Match Button Styles
  startMatchContainer: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    alignItems: 'flex-end',
  },
  startMatchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.sm,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xs,
  },
  resetMatchButton: {
    backgroundColor: COLORS.error,
  },
  startMatchButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  disabledAutoButton: {
    opacity: 0.6,
  },
  autoMatchStatus: {
    marginTop: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  autoMatchStatusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  // User Team Slide Styles
  userTeamSlide: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '05', // Slight tint
  },
  slideStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  userTeamBadge: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  // Status Colors
  liveStatus: {
    color: COLORS.success,
    backgroundColor: COLORS.success + '20',
  },
  completedStatus: {
    color: COLORS.text,
    backgroundColor: COLORS.lightGray + '40',
  },
  upcomingStatus: {
    color: COLORS.warning,
    backgroundColor: COLORS.warning + '20',
  },
});

export default HomeScreen;
