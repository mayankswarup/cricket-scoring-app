import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import PlayerStatistics from '../components/PlayerStatistics';
import { statisticsService, PlayerStatistics as PlayerStats } from '../services/statisticsService';

interface PlayerProfileScreenProps {
  playerId: string;
  onBack: () => void;
  currentUserPhone?: string;
  isPro?: boolean;
}

const PlayerProfileScreen: React.FC<PlayerProfileScreenProps> = ({ 
  playerId, 
  onBack,
  currentUserPhone,
  isPro = false 
}) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Development flag - set to true during development to bypass PRO gates
  const DEVELOPMENT_MODE = true;

  useEffect(() => {
    loadPlayerStats();
  }, [playerId]);

  const loadPlayerStats = async () => {
    try {
      setLoading(true);
      
      // Use dummy data for demo
      const dummyStats: PlayerStats = {
        playerId: playerId,
        playerName: playerId === 'current-user' ? 'You' : 'Virat Kohli',
        phoneNumber: playerId === 'current-user' ? (currentUserPhone || '0000000000') : '9876543210',
        batting: {
          playerId: playerId,
          playerName: playerId === 'current-user' ? 'You' : 'Virat Kohli',
          matches: 52,
          innings: 48,
          runs: 1654,
          balls: 1200,
          fours: 156,
          sixes: 45,
          highScore: 89,
          notOuts: 8,
          average: 41.35,
          strikeRate: 137.83,
          fifties: 9,
          hundreds: 2,
          ducks: 2
        },
        bowling: {
          playerId: playerId,
          playerName: playerId === 'current-user' ? 'You' : 'Virat Kohli',
          matches: 52,
          innings: 35,
          overs: 120.5,
          maidens: 3,
          runs: 1056,
          wickets: 42,
          bestFigures: '4/35',
          average: 25.14,
          economy: 8.74,
          strikeRate: 17.26,
          fourWickets: 1,
          fiveWickets: 0,
          dotBalls: 198
        },
        fielding: {
          playerId: playerId,
          playerName: playerId === 'current-user' ? 'You' : 'Virat Kohli',
          matches: 52,
          catches: 38,
          runOuts: 7,
          stumpings: 0
        },
        lastUpdated: new Date()
      };
      
      setPlayerStats(dummyStats);
      
      // Check if this is user's own profile
      setIsOwnProfile(playerId === 'current-user' || dummyStats.phoneNumber === currentUserPhone);
      
      // Try to get real data from Firebase (fallback to dummy)
      // const stats = await statisticsService.getPlayerStats(playerId);
      // if (stats) {
      //   setPlayerStats(stats);
      //   if (currentUserPhone) {
      //     setIsOwnProfile(stats.phoneNumber === currentUserPhone);
      //   }
      // }
      
    } catch (error) {
      console.error('Error loading player stats:', error);
      // Keep dummy data on error
    } finally {
      setLoading(false);
    }
  };

  const renderProGate = () => (
    <View style={styles.proGateContainer}>
      <View style={styles.proGateContent}>
        <Text style={styles.proGateIcon}>🔒</Text>
        <Text style={styles.proGateTitle}>PRO Feature</Text>
        <Text style={styles.proGateSubtitle}>
          View detailed statistics for any player
        </Text>
        
        <View style={styles.proFeaturesList}>
          <Text style={styles.proFeatureItem}>✨ Complete career statistics</Text>
          <Text style={styles.proFeatureItem}>📊 Batting, bowling & fielding stats</Text>
          <Text style={styles.proFeatureItem}>🎯 Performance analysis</Text>
          <Text style={styles.proFeatureItem}>⚔️ Head-to-head comparisons</Text>
        </View>

        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to PRO ₹199/month</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn More →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!playerStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Player not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show PRO gate if not PRO and not own profile (unless in development mode)
  if (!DEVELOPMENT_MODE && !isPro && !isOwnProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>
        
        {/* Show limited preview */}
        <ScrollView>
          <View style={styles.playerPreview}>
            <View style={styles.playerAvatar}>
              <Text style={styles.playerInitial}>{playerStats.playerName.charAt(0)}</Text>
            </View>
            <Text style={styles.playerName}>{playerStats.playerName}</Text>
            <Text style={styles.playerPhone}>{playerStats.phoneNumber}</Text>
            
            {/* Blurred stats preview */}
            <View style={styles.blurredPreview}>
              <Text style={styles.previewText}>
                {playerStats.batting.matches} Matches • {playerStats.batting.runs} Runs
              </Text>
              <Text style={styles.previewSubtext}>Unlock full statistics with PRO</Text>
            </View>
          </View>
          
          {renderProGate()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show full stats for PRO users or own profile
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Profile</Text>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
        {!isPro && isOwnProfile && <View style={styles.placeholder} />}
      </View>

      <PlayerStatistics
        playerName={playerStats.playerName}
        battingStats={playerStats.batting}
        bowlingStats={playerStats.bowling}
        fieldingStats={playerStats.fielding}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  playerPreview: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  playerInitial: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  playerName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  playerPhone: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  blurredPreview: {
    marginTop: SIZES.lg,
    padding: SIZES.lg,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  previewSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  proGateContainer: {
    padding: SIZES.xl,
  },
  proGateContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  proGateIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  proGateTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  proGateSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  proFeaturesList: {
    width: '100%',
    marginBottom: SIZES.xl,
  },
  proFeatureItem: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    width: '100%',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  learnMoreButton: {
    paddingVertical: SIZES.sm,
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
});

export default PlayerProfileScreen;

