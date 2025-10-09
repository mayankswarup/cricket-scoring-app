import React, { useState, useEffect, useRef } from 'react';
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
import UserLoginScreen from './UserLoginScreen';
import AdminManagement from '../components/AdminManagement';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import SideDrawer from '../components/SideDrawer';
// import LiveMatchesList from '../components/LiveMatchesList';
// import MatchDetailScreen from './MatchDetailScreen';
// import PlayerLoginScreen from './PlayerLoginScreen';
import SimpleOTPLoginScreen from './SimpleOTPLoginScreen';
import PlayerRegistrationScreen from './PlayerRegistrationScreen';
import UserProfileScreen from './UserProfileScreen';
import TossScreen from './TossScreen';
import LiveScoringScreen from './LiveScoringScreen';
import MatchManagementScreen from './MatchManagementScreen';
import StartMatchScreen from './StartMatchScreen';
import Playing11Screen from './Playing11Screen';
import SpectatorScreen from './SpectatorScreen';
import { MatchHistoryScreen } from './MatchHistoryScreen';
import MatchDetailsModal from '../components/MatchDetailsModal';
import TeamSelectionScreen from './TeamSelectionScreen';
// import PlayerSearchScreen from './PlayerSearchScreen';
// import TeamCreationScreen from './TeamCreationScreen';
// import { apiService } from '../services/api';
import { authService } from '../services/authService';
import { PlayerRegistration } from '../types';
import { initializeDemoData } from '../utils/demoData';
// import { Match } from '../types';
// import { TeamCreation } from '../types';

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

  const matchSlides = [
    getUserTeamMatch(), // First slide is always user's team
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
  
  // Player authentication states
  const [currentPlayer, setCurrentPlayer] = useState<PlayerRegistration | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [showPlayerRegistration, setShowPlayerRegistration] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showToss, setShowToss] = useState(false);
  const [showLiveScoring, setShowLiveScoring] = useState(false);
  const [showMatchManagement, setShowMatchManagement] = useState(false);
  const [showStartMatch, setShowStartMatch] = useState(false);
  const [showPlaying11, setShowPlaying11] = useState(false);
  const [showSpectator, setShowSpectator] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [sessionMatchId, setSessionMatchId] = useState<string | null>(null);
  const [matchTeams, setMatchTeams] = useState<{teamA: string, teamB: string} | null>(null);
  const [tossResult, setTossResult] = useState<{winner: string, decision: string} | null>(null);
  
  // User and Admin Management
  const { user, logout } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [selectedTeamForAdmin, setSelectedTeamForAdmin] = useState<{id: string, name: string} | null>(null);
  
  // Match Details Modal
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<any>(null);
  
  // Team Selection
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  useEffect(() => {
    // loadAsiaCupMatches();
    checkAuthentication();
    loadMatchState();
    
    // Check if user is logged in
    if (!user) {
      setShowLogin(true);
    }
  }, [user]);

  // Load match state from localStorage on app start
  const loadMatchState = async () => {
    try {
      const savedMatchId = await AsyncStorage.getItem('currentMatchId');
      const savedMatchTeams = await AsyncStorage.getItem('currentMatchTeams');
      const savedTossResult = await AsyncStorage.getItem('currentTossResult');
      
      if (savedMatchId) {
        setSelectedMatchId(savedMatchId);
        console.log('🔄 Restored match state:', savedMatchId);
      }
      if (savedMatchTeams) {
        setMatchTeams(JSON.parse(savedMatchTeams));
      }
      if (savedTossResult) {
        setTossResult(JSON.parse(savedTossResult));
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

  const handleOTPLogin = () => {
    setShowOTPLogin(true);
  };

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
    setShowOTPLogin(false);
  };

  const handleRegistrationComplete = (player: PlayerRegistration) => {
    setCurrentPlayer(player);
    setShowPlayerRegistration(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentPlayer(null);
    setShowUserProfile(false);
  };

  const handleUserProfile = () => {
    setShowUserProfile(true);
  };

  const handleProfileBack = async () => {
    setShowUserProfile(false);
    // Auto-refresh user data when returning from profile
    console.log('🔄 Returning from profile, auto-refreshing data...');
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
    setShowSideDrawer(false);
    setShowUserProfile(true);
  };

  const handleTossPress = () => {
    setShowToss(true);
  };

  const handleTossBack = () => {
    setShowToss(false);
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
    setShowTeamSelection(true);
  };

  const handleStartMatchBack = () => {
    setShowStartMatch(false);
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

  const handleStartMatchNext = async (teamA: string, teamB: string) => {
    // Create ONE match ID for the entire session
    const newMatchId = `match-${Date.now()}`;
    setSelectedMatchId(newMatchId);
    setSessionMatchId(newMatchId);
    console.log('🏏 Created session match ID:', newMatchId);
    setMatchTeams({ teamA, teamB });
    
    // Save match state to localStorage
    try {
      await AsyncStorage.setItem('currentMatchId', newMatchId);
      await AsyncStorage.setItem('currentMatchTeams', JSON.stringify({ teamA, teamB }));
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
    setShowPlaying11(true);
  };

  const handlePlaying11Complete = async () => {
    // Use the session match ID (should already be set)
    const matchId = selectedMatchId || sessionMatchId;
    console.log('🏏 Using match ID for live scoring:', matchId);
    
    // Create the match in Firebase BEFORE going to live scoring
    try {
      const { liveScoringService } = await import('../services/liveScoringService');
      const createdMatchId = await liveScoringService.createMatch({
        name: `${matchTeams?.teamA || 'Team A'} vs ${matchTeams?.teamB || 'Team B'}`,
        team1: { id: 'team1', name: matchTeams?.teamA || 'Team A', players: [] },
        team2: { id: 'team2', name: matchTeams?.teamB || 'Team B', players: [] },
        matchType: 'T20',
        totalOvers: 20,
        currentInnings: 1,
        status: 'live',
        createdBy: 'user',
        isLive: true,
      });
      console.log('✅ Match created in Firebase with ID:', createdMatchId);
      // Update the selectedMatchId with the actual Firebase ID
      setSelectedMatchId(createdMatchId);
    } catch (error) {
      console.error('❌ Error creating match:', error);
    }
    
    setShowPlaying11(false);
    setShowLiveScoring(true);
  };

  const handlePlaying11Back = () => {
    setShowPlaying11(false);
    setShowToss(true);
  };

  const handleSpectatorPress = () => {
    setShowSpectator(true);
  };

  const handleSpectatorBack = () => {
    setShowSpectator(false);
  };

  // Admin Management Handlers
  const handleUserLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleUserLogout = async () => {
    try {
      await logout();
      setShowLogin(true);
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
    const matchIdToFinish = selectedMatchId;
    console.log('📝 Match ID to finish:', matchIdToFinish);
    
    // Clear state FIRST - this makes buttons disappear immediately
    console.log('🧹 Clearing state...');
    setSelectedMatchId(null);
    setSessionMatchId(null);
    setMatchTeams(null);
    setTossResult(null);
    console.log('✅ State cleared - buttons should disappear now!');
    
    // Clear match state from localStorage first
    try {
      console.log('🗑️ Clearing localStorage...');
      await AsyncStorage.removeItem('currentMatchId');
      await AsyncStorage.removeItem('currentMatchTeams');
      await AsyncStorage.removeItem('currentTossResult');
      console.log('✅ localStorage cleared!');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
    
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

  const handleOTPLoginBack = async () => {
    setShowOTPLogin(false);
    // Auto-refresh when returning from OTP login
    console.log('🔄 Returning from OTP login, auto-refreshing data...');
    await checkAuthentication();
  };

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

  if (showOTPLogin) {
    return (
      <SimpleOTPLoginScreen
        onLoginSuccess={handleLoginSuccess}
        onRegister={() => {
          setShowOTPLogin(false);
          setShowPlayerRegistration(true);
        }}
        onBack={handleOTPLoginBack}
      />
    );
  }

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
          onLogout={handleLogout}
          onProfileUpdated={async () => {
            // Refresh user data when profile is updated
            console.log('🔄 Profile updated, refreshing data...');
            await forceRefresh();
          }}
        />
    );
  }

  if (showToss) {
    return (
      <TossScreen
        onBack={handleTossBack}
        teamA={matchTeams?.teamA || 'Team A'}
        teamB={matchTeams?.teamB || 'Team B'}
        onTossComplete={handleTossComplete}
      />
    );
  }

  if (showPlaying11) {
    return (
      <Playing11Screen
        teamA={matchTeams?.teamA || 'Team A'}
        teamB={matchTeams?.teamB || 'Team B'}
        tossWinner={tossResult?.winner || 'Team A'}
        tossDecision={tossResult?.decision || 'Batting'}
        onBack={handlePlaying11Back}
        onStartMatch={handlePlaying11Complete}
      />
    );
  }

  if (showStartMatch) {
    return (
      <StartMatchScreen
        onBack={handleStartMatchBack}
        onNext={handleStartMatchNext}
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
    return (
      <LiveScoringScreen
        onBack={handleLiveScoringBack}
        matchId={selectedMatchId || undefined}
        teamA={matchTeams?.teamA}
        teamB={matchTeams?.teamB}
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

  // Show login screen if user is not logged in
  if (showLogin) {
    return <UserLoginScreen onLogin={handleUserLoginSuccess} />;
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
            onPress={handleStartMatchPress}
          >
            <Text style={styles.startMatchButtonText}>🏏 Start Match</Text>
          </TouchableOpacity>
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
            {matchSlides.map((match, index) => (
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
        user={currentPlayer}
        onProfilePress={handleSideDrawerProfilePress}
        onLogout={handleLogout}
        onTossPress={handleTossPress}
      />

      {/* Match Details Modal */}
      {showMatchDetails && selectedMatchDetails && (
        <MatchDetailsModal
          match={selectedMatchDetails}
          onClose={() => setShowMatchDetails(false)}
        />
      )}
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
  },
  startMatchButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
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
