import React, { useState, useEffect } from 'react';
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
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matchTeams, setMatchTeams] = useState<{teamA: string, teamB: string} | null>(null);
  const [tossResult, setTossResult] = useState<{winner: string, decision: string} | null>(null);

  useEffect(() => {
    // loadAsiaCupMatches();
    checkAuthentication();
  }, []);

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

  const handleStartMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowMatchManagement(false);
    setShowLiveScoring(true);
  };

  const handleStartMatchPress = () => {
    setShowStartMatch(true);
  };

  const handleStartMatchBack = () => {
    setShowStartMatch(false);
  };

  const handleStartMatchNext = (teamA: string, teamB: string) => {
    setMatchTeams({ teamA, teamB });
    setShowStartMatch(false);
    setShowToss(true);
  };

  const handleTossComplete = (winner: string, decision: string) => {
    setTossResult({ winner, decision });
    setShowToss(false);
    setShowPlaying11(true);
  };

  const handlePlaying11Complete = () => {
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
        <View style={styles.header}>
          <Text style={styles.title}>
            {currentScreen === 'home' ? '🏏 Cricket App' :
             currentScreen === 'looking' ? '🔍 Looking' :
             currentScreen === 'mycricket' ? '🏏 My Cricket' :
             currentScreen === 'community' ? '👥 Community' :
             '🏏 Cricket App'}
          </Text>
          <Text style={styles.subtitle}>
            {currentScreen === 'home' && (currentPlayer 
              ? `Welcome back, ${currentPlayer.name}!` 
              : 'Live cricket scores, news, and updates')}
            {currentScreen === 'looking' && 'Find players, teams, and matches'}
            {currentScreen === 'mycricket' && 'Your cricket journey and stats'}
            {currentScreen === 'community' && 'Connect with cricket community'}
          </Text>
          {currentPlayer && currentScreen === 'home' && (
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {currentPlayer.preferredRole === 'batsman' ? '🏏' : 
                 currentPlayer.preferredRole === 'bowler' ? '⚾' :
                 currentPlayer.preferredRole === 'all-rounder' ? '🔄' : '🧤'} 
                {currentPlayer.name}
              </Text>
              <Text style={styles.playerDetails}>
                {currentPlayer.preferredRole.toUpperCase()} - {currentPlayer.location}
              </Text>
            </View>
          )}
        </View>

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

        <View style={styles.actions}>
          {!currentPlayer ? (
            <>
              <Button
                title="🔐 OTP Login"
                onPress={handleOTPLogin}
                size="large"
                style={styles.primaryButton}
              />
              {/* <Button
                title="👤 Password Login"
                onPress={handlePlayerLogin}
                variant="outline"
                size="large"
                style={styles.secondaryButton}
              /> */}
              <Button
                title="📝 Register as Player"
                onPress={handlePlayerRegistration}
                variant="outline"
                size="large"
                style={styles.secondaryButton}
              />
            </>
          ) : (
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeText}>
                🎉 Welcome back! Use the profile icon above to manage your account.
              </Text>
              {selectedMatchId ? (
                <Button
                  title="🏏 Continue Match"
                  onPress={handleLiveScoringPress}
                  size="large"
                  style={styles.primaryButton}
                />
              ) : (
                <Button
                  title="🏏 Start A Match"
                  onPress={handleStartMatchPress}
                  size="large"
                  style={styles.primaryButton}
                />
              )}
              <Button
                title="📊 Live Scoring"
                onPress={handleLiveScoringPress}
                size="large"
                style={styles.secondaryButton}
              />
              <Button
                title="📋 Match Management"
                onPress={handleMatchManagementPress}
                size="large"
                style={styles.secondaryButton}
              />
              {selectedMatchId && (
                <Button
                  title="📊 View Scorecard"
                  onPress={handleSpectatorPress}
                  size="large"
                  style={styles.secondaryButton}
                />
              )}
            </View>
          )}
          
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
    marginBottom: SIZES.sm,
  },
  secondaryButton: {
    marginBottom: SIZES.sm,
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
  logoutButton: {
    marginTop: SIZES.sm,
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
});

export default HomeScreen;
