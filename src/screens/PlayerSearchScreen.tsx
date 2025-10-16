import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useUser } from '../contexts/UserContext';
import TeamSelectionModal from '../components/TeamSelectionModal';
import { teamService } from '../services/teamService';

interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  city?: string;
  isAvailable: boolean;
  currentTeam?: string;
  profilePicture?: string | null;
  battingHand?: 'left' | 'right' | null;
  bowlingStyle?: 'fast' | 'medium' | 'spin' | null;
  jerseyNumber?: number | null;
  // Match availability fields
  isPlayingMatch?: boolean;
  currentMatchId?: string | null;
  matchStartTime?: string | null;
}

interface PlayerSearchScreenProps {
  teamId: string;
  teamName: string;
  onPlayerAdded: (player: Player) => void;
  onBack: () => void;
}

const PlayerSearchScreen: React.FC<PlayerSearchScreenProps> = ({ 
  teamId, 
  teamName, 
  onPlayerAdded, 
  onBack 
}) => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedPlayerForTeam, setSelectedPlayerForTeam] = useState<Player | null>(null);

  // Platform-specific alert function
  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 0) {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        alert(`${title}\n\n${message}`);
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  useEffect(() => {
    loadPlayers();
    // Clear any previous selections when screen loads
    setSelectedPlayers([]);
    setShowTeamSelection(false);
    setSelectedPlayerForTeam(null);
  }, []);

  // Refresh players when screen comes into focus
  useEffect(() => {
    const refreshPlayers = () => {
      console.log('🔄 Refreshing players data...');
      loadPlayers();
    };

    // Refresh when component mounts or when user changes
    refreshPlayers();
  }, [user?.phoneNumber]);

  const loadPlayers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('🔍 Loading players from Firebase...');
      
      // Fetch all users from Firebase, excluding current user
      const firebaseUsers = await userProfileService.getAllUsers(user?.phoneNumber);
      
      // Convert UserProfile to Player format
      const firebasePlayers: Player[] = firebaseUsers.map((userProfile: UserProfile) => {
        // Safely handle teamIds - it might be undefined for older users
        const teamIds = userProfile.teamIds || [];
        
        // Debug log to see what data we're getting
        console.log('🔍 User profile data:', {
          phoneNumber: userProfile.phoneNumber,
          name: userProfile.name,
          playingRole: userProfile.playingRole,
          teamIds: userProfile.teamIds
        });
        
        return {
          id: userProfile.phoneNumber || 'unknown',
          name: userProfile.name || `User ${userProfile.phoneNumber?.slice(-4)}`,
          phoneNumber: userProfile.phoneNumber || '',
          role: userProfile.playingRole || 'batsman',
          city: 'Unknown', // We don't have city in UserProfile yet
          isAvailable: !userProfile.isPlayingMatch, // Available if not playing a match (can be in multiple teams)
          currentTeam: teamIds.length > 0 ? `Team ${teamIds[0]}` : undefined,
          profilePicture: userProfile.profilePicture,
          battingHand: userProfile.battingHand,
          bowlingStyle: userProfile.bowlingStyle,
          jerseyNumber: userProfile.jerseyNumber,
          // Match availability fields
          isPlayingMatch: userProfile.isPlayingMatch || false,
          currentMatchId: userProfile.currentMatchId,
          matchStartTime: userProfile.matchStartTime,
        };
      });
      
      console.log(`✅ Loaded ${firebasePlayers.length} players from Firebase`);
      setPlayers(firebasePlayers);
    } catch (error) {
      console.error('❌ Error loading players from Firebase:', error);
      // Fallback to empty array if Firebase fails
      setPlayers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('🔄 Pull to refresh triggered - forcing fresh data from Firebase');
    // Clear current players to force fresh load
    setPlayers([]);
    loadPlayers(true);
  };

  const filteredPlayers = players.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (player.name && player.name.toLowerCase().includes(query)) ||
      (player.phoneNumber && player.phoneNumber.includes(query)) ||
      (player.city && player.city.toLowerCase().includes(query)) ||
      (player.role && player.role.toLowerCase().includes(query)) ||
      (player.battingHand && player.battingHand.toLowerCase().includes(query)) ||
      (player.bowlingStyle && player.bowlingStyle.toLowerCase().includes(query))
    );
  });

  const handlePlayerSelect = (player: Player) => {
    if (!player.isAvailable) {
      if (player.isPlayingMatch) {
        showAlert(
          'Player Currently in Match',
          `${player.name} is currently playing a match and cannot be added to teams. Please try again after the match ends.`
        );
      } else {
        showAlert(
          'Player Not Available',
          `${player.name} is currently unavailable for team additions.`
        );
      }
      return;
    }
    
    // Toggle selection
    const isAlreadySelected = selectedPlayers.some(p => p.id === player.id);
    if (isAlreadySelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleAddPlayers = async () => {
    if (selectedPlayers.length === 0) return;

    // Show team selection modal
    setSelectedPlayerForTeam(selectedPlayers[0]); // For now, just use first player for team selection
    setShowTeamSelection(true);
  };

  const handleTeamSelected = async (teamId: string, teamName: string) => {
    if (!selectedPlayerForTeam) return;

    try {
      // Check if any selected players are already in this team
      const teamData = await teamService.getTeamById(teamId);
      if (!teamData) {
        showAlert('Error', 'Team not found');
        return;
      }

      const existingMemberIds = teamData.members
        .filter(member => member.isActive)
        .map(member => member.playerId);

      const alreadyInTeam = selectedPlayers.filter(player => 
        existingMemberIds.includes(player.phoneNumber)
      );

      if (alreadyInTeam.length > 0) {
        const alreadyInTeamNames = alreadyInTeam.map(p => p.name).join(', ');
        showAlert(
          'Players Already in Team',
          `${alreadyInTeamNames} ${alreadyInTeam.length === 1 ? 'is' : 'are'} already a member of ${teamName}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Others', 
              onPress: () => {
                // Filter out players who are already in the team
                const newPlayers = selectedPlayers.filter(player => 
                  !existingMemberIds.includes(player.phoneNumber)
                );
                if (newPlayers.length > 0) {
                  addPlayersToTeam(teamId, teamName, newPlayers);
                } else {
                  showAlert('No New Players', 'All selected players are already in this team');
                }
              }
            }
          ]
        );
        return;
      }

      // Add players to team in Firebase
      await addPlayersToTeam(teamId, teamName, selectedPlayers);
      
    } catch (error) {
      console.error('Error adding players:', error);
      showAlert('Error', 'Failed to add players. Please try again.');
    }
  };

  const addPlayersToTeam = async (teamId: string, teamName: string, players: Player[]) => {
    try {
      // Check availability of all players before adding
      const unavailablePlayers = [];
      for (const player of players) {
        const isAvailable = await userProfileService.isPlayerAvailable(player.phoneNumber);
        if (!isAvailable) {
          unavailablePlayers.push(player);
        }
      }

      // If any players became unavailable, show error
      if (unavailablePlayers.length > 0) {
        const unavailableNames = unavailablePlayers.map(p => p.name).join(', ');
        showAlert(
          'Players No Longer Available',
          `${unavailableNames} ${unavailablePlayers.length === 1 ? 'is' : 'are'} currently playing a match and cannot be added to teams.`
        );
        return;
      }

      // Prepare player data for Firebase
      const playersToAdd = players.map(player => ({
        playerId: player.phoneNumber, // Use phone number as player ID
        name: player.name,
        phoneNumber: player.phoneNumber,
      }));

      // Add players to team in Firebase
      await teamService.addPlayersToTeam(teamId, playersToAdd);
      
      // Also add team to each player's profile (only for new players)
      for (const player of players) {
        try {
          await userProfileService.addUserToTeam(player.phoneNumber, teamId);
        } catch (error) {
          console.error(`❌ Failed to add team to player ${player.name}:`, error);
          // Continue with other players even if one fails
        }
      }
      
      const playerNames = players.map(p => p.name).join(', ');
      console.log(`✅ Added ${players.length} player(s) to ${teamName}: ${playerNames}`);
      
      // Call onPlayerAdded for each player
      players.forEach(player => onPlayerAdded(player));
      
      // Clear selections and close screen
      setSelectedPlayers([]);
      setShowTeamSelection(false);
      setSelectedPlayerForTeam(null);
      
      showAlert(
        'Players Added Successfully!',
        `${players.length} player(s) have been added to ${teamName}`,
        [
          {
            text: 'OK',
            onPress: () => onBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding players:', error);
      showAlert('Error', 'Failed to add players. Please try again.');
    }
  };

  const isPlayerSelected = (player: Player) => {
    return selectedPlayers.some(p => p.id === player.id);
  };

  const renderPlayerCard = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[
        styles.playerCard,
        !item.isAvailable && styles.unavailablePlayerCard,
        isPlayerSelected(item) && styles.selectedPlayerCard
      ]}
      onPress={() => handlePlayerSelect(item)}
    >
      <View style={styles.playerInfo}>
        <Text style={[
          styles.playerName,
          !item.isAvailable && styles.unavailableText
        ]}>
          {item.name}
        </Text>
        <Text style={styles.playerDetails}>
          📱 {item.phoneNumber} • 🏙️ {item.city || 'Unknown'}
        </Text>
        <Text style={styles.playerRole}>
          {item.role.charAt(0).toUpperCase() + item.role.slice(1).replace('-', ' ')}
          {item.battingHand && ` • ${item.battingHand}-handed`}
          {item.bowlingStyle && ` • ${item.bowlingStyle} bowler`}
          {item.jerseyNumber && ` • #${item.jerseyNumber}`}
        </Text>
        {!item.isAvailable && (
          <Text style={styles.unavailableText}>
            {item.isPlayingMatch 
              ? `🏏 Currently playing a match (Match ID: ${item.currentMatchId?.slice(-6) || 'Unknown'})`
              : `⚠️ Currently unavailable`
            }
          </Text>
        )}
      </View>
      <View style={styles.statusIndicator}>
        {isPlayerSelected(item) ? (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        ) : (
          <View style={[
            styles.statusDot,
            { backgroundColor: item.isAvailable ? COLORS.success : COLORS.error }
          ]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Players</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Team Info */}
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.teamSubtext}>Search and add players to your team</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, city, or role..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selected Players Actions */}
      {selectedPlayers.length > 0 && (
        <View style={styles.selectedPlayerActions}>
          <View style={styles.selectedPlayerInfo}>
            <Text style={styles.selectedPlayerCount}>
              {selectedPlayers.length} player(s) selected
            </Text>
            <Text style={styles.selectedPlayerNames} numberOfLines={1}>
              {selectedPlayers.map(p => p.name).join(', ')}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              selectedPlayers.length === 0 && styles.addButtonDisabled
            ]}
            onPress={selectedPlayers.length > 0 ? handleAddPlayers : undefined}
            disabled={selectedPlayers.length === 0}
          >
            <Text style={styles.addButtonText}>
              Add to Team
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Players List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          renderItem={renderPlayerCard}
          keyExtractor={(item, index) => `${item.phoneNumber}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.playersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {players.length === 0 ? 'No registered players found' : 'No players match your search'}
              </Text>
              <Text style={styles.emptySubtext}>
                {players.length === 0 
                  ? 'Be the first to register and invite others!' 
                  : 'Try adjusting your search terms'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Team Selection Modal */}
      <TeamSelectionModal
        visible={showTeamSelection}
        onClose={() => {
          setShowTeamSelection(false);
          setSelectedPlayerForTeam(null);
        }}
        onTeamSelected={handleTeamSelected}
        playerName={selectedPlayerForTeam?.name || 'Player'}
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
  teamInfo: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  teamName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  searchInput: {
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
  selectedPlayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedPlayerInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  selectedPlayerCount: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  selectedPlayerNames: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  playersList: {
    padding: SIZES.lg,
  },
  playerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unavailablePlayerCard: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  selectedPlayerCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  playerDetails: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  playerRole: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  unavailableText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: SIZES.xs,
  },
  statusIndicator: {
    marginLeft: SIZES.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});

export default PlayerSearchScreen;