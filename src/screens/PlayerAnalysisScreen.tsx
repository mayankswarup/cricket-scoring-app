import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { statisticsService } from '../services/statisticsService';
import PlayerProfileScreen from './PlayerProfileScreen';

interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  role?: string;
}

interface PlayerAnalysisScreenProps {
  onBack: () => void;
  currentUserPhone?: string;
  isPro?: boolean;
}

const PlayerAnalysisScreen: React.FC<PlayerAnalysisScreenProps> = ({ 
  onBack,
  currentUserPhone,
  isPro = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Sample player data for demo
  const samplePlayers: Player[] = [
    // Add current user as first player
    { id: 'current-user', name: 'You', phoneNumber: currentUserPhone || '0000000000', role: 'All-Rounder' },
    { id: '1', name: 'Virat Kohli', phoneNumber: '9876543210', role: 'Batsman' },
    { id: '2', name: 'Rohit Sharma', phoneNumber: '9876543211', role: 'Batsman' },
    { id: '3', name: 'MS Dhoni', phoneNumber: '9876543212', role: 'Wicket-Keeper' },
    { id: '4', name: 'Jasprit Bumrah', phoneNumber: '9876543213', role: 'Bowler' },
    { id: '5', name: 'Ravindra Jadeja', phoneNumber: '9876543214', role: 'All-Rounder' },
    { id: '6', name: 'KL Rahul', phoneNumber: '9876543215', role: 'Batsman' },
    { id: '7', name: 'Hardik Pandya', phoneNumber: '9876543216', role: 'All-Rounder' },
    { id: '8', name: 'Mohammed Shami', phoneNumber: '9876543217', role: 'Bowler' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Show all sample players if no search query
      setPlayers(samplePlayers);
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter sample players by search query
      const filtered = samplePlayers.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.phoneNumber.includes(searchQuery)
      );
      
      setPlayers(filtered);
      
      // Try to get real data from Firebase (fallback to sample)
      // const results = await statisticsService.searchPlayers(searchQuery);
      // if (results.length > 0) {
      //   setPlayers(results);
      // }
    } catch (error) {
      console.error('Error searching players:', error);
      setPlayers(samplePlayers);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    // Free users can only view their own stats
    if (!isPro && player.phoneNumber !== currentUserPhone) {
      setSelectedPlayer(null);
      // Show PRO prompt handled in PlayerProfileScreen
    }
    setSelectedPlayer(player);
  };

  const renderProBadge = () => (
    <View style={styles.proIndicator}>
      <Text style={styles.proIndicatorText}>PRO 💎</Text>
    </View>
  );

  const renderPlayerCard = ({ item }: { item: Player }) => {
    const isOwnProfile = item.phoneNumber === currentUserPhone;
    const canView = isPro || isOwnProfile;
    
    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          !canView && styles.lockedPlayerCard
        ]}
        onPress={() => handlePlayerSelect(item)}
      >
        <View style={styles.playerInfo}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerName}>{item.name}</Text>
            {!canView && <Text style={styles.lockIcon}>🔒</Text>}
            {isOwnProfile && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <Text style={styles.playerPhone}>📱 {item.phoneNumber}</Text>
          {item.role && (
            <Text style={styles.playerRole}>{item.role}</Text>
          )}
        </View>
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>
            {canView ? 'View Stats →' : 'PRO Only'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (selectedPlayer) {
    return (
      <PlayerProfileScreen
        playerId={selectedPlayer.id}
        onBack={() => setSelectedPlayer(null)}
        currentUserPhone={currentUserPhone}
        isPro={isPro}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Analysis</Text>
        {isPro ? renderProBadge() : <View style={styles.placeholder} />}
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          {isPro 
            ? '🎯 Search any player to view their statistics'
            : '📊 View your stats for free. Upgrade to PRO to analyze any player!'
          }
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone number..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching players...</Text>
        </View>
      ) : players.length > 0 ? (
        <FlatList
          data={players}
          renderItem={renderPlayerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.playersList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No players found' : 'Search for players to analyze'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery 
              ? 'Try a different name or phone number'
              : 'Enter a name or phone number and tap Search'
            }
          </Text>
        </View>
      )}
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
  proIndicator: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  proIndicatorText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  infoBanner: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoBannerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 14,
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
  playersList: {
    padding: SIZES.md,
  },
  playerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  lockedPlayerCard: {
    backgroundColor: `${COLORS.lightGray}50`,
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  playerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  lockIcon: {
    fontSize: 14,
  },
  youBadge: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerPhone: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  playerRole: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  viewButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  viewButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
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

export default PlayerAnalysisScreen;

