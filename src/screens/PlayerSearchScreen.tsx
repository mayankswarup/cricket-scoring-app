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
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';

interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  city: string;
  isAvailable: boolean;
  currentTeam?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  // Mock player data - in real app, this would come from Firebase
  const mockPlayers: Player[] = [
    { id: '1', name: 'Virat Kohli', phoneNumber: '9876543210', role: 'batsman', city: 'Delhi', isAvailable: true },
    { id: '2', name: 'Rohit Sharma', phoneNumber: '9876543211', role: 'batsman', city: 'Mumbai', isAvailable: true },
    { id: '3', name: 'MS Dhoni', phoneNumber: '9876543212', role: 'wicket-keeper', city: 'Chennai', isAvailable: false, currentTeam: 'CSK' },
    { id: '4', name: 'Jasprit Bumrah', phoneNumber: '9876543213', role: 'bowler', city: 'Mumbai', isAvailable: true },
    { id: '5', name: 'Ravindra Jadeja', phoneNumber: '9876543214', role: 'all-rounder', city: 'Gujarat', isAvailable: true },
    { id: '6', name: 'KL Rahul', phoneNumber: '9876543215', role: 'batsman', city: 'Bangalore', isAvailable: false, currentTeam: 'LSG' },
    { id: '7', name: 'Hardik Pandya', phoneNumber: '9876543216', role: 'all-rounder', city: 'Gujarat', isAvailable: true },
    { id: '8', name: 'Mohammed Shami', phoneNumber: '9876543217', role: 'bowler', city: 'Gujarat', isAvailable: true },
    { id: '9', name: 'Rishabh Pant', phoneNumber: '9876543218', role: 'wicket-keeper', city: 'Delhi', isAvailable: true },
    { id: '10', name: 'Shubman Gill', phoneNumber: '9876543219', role: 'batsman', city: 'Gujarat', isAvailable: true },
  ];

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      // In real app, fetch from Firebase
      // const firebasePlayers = await liveScoringService.getPlayers();
      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayers(mockPlayers);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(query) ||
      player.phoneNumber.includes(query) ||
      player.city.toLowerCase().includes(query) ||
      player.role.toLowerCase().includes(query)
    );
  });

  const handlePlayerSelect = (player: Player) => {
    if (!player.isAvailable) {
      Alert.alert(
        'Player Not Available',
        `${player.name} is currently playing for ${player.currentTeam}. They cannot join another team simultaneously.`
      );
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

    try {
      // In real app, add players to team in Firebase
      // await liveScoringService.addPlayersToTeam(teamId, selectedPlayers.map(p => p.id));
      
      const playerNames = selectedPlayers.map(p => p.name).join(', ');
      console.log(`✅ Added ${selectedPlayers.length} player(s) to ${teamName}: ${playerNames}`);
      
      // Call onPlayerAdded for each player
      selectedPlayers.forEach(player => onPlayerAdded(player));
      
      Alert.alert(
        'Players Added',
        `${selectedPlayers.length} player(s) have been added to ${teamName}`,
        [
          {
            text: 'Add More',
            onPress: () => setSelectedPlayers([])
          },
          {
            text: 'Done',
            onPress: () => onBack()
          }
        ]
      );
      
      setSelectedPlayers([]);
      
    } catch (error) {
      console.error('Error adding players:', error);
      Alert.alert('Error', 'Failed to add players. Please try again.');
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
          📱 {item.phoneNumber} • 🏙️ {item.city}
        </Text>
        <Text style={styles.playerRole}>
          {item.role.charAt(0).toUpperCase() + item.role.slice(1).replace('-', ' ')}
        </Text>
        {!item.isAvailable && (
          <Text style={styles.unavailableText}>
            ⚠️ Currently playing for {item.currentTeam}
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
            style={styles.addButton}
            onPress={handleAddPlayers}
          >
            <Text style={styles.addButtonText}>
              Add to Team
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.playersList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No players found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        }
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
});

export default PlayerSearchScreen;