import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { Player } from '../types';

interface PlayerSelectionComponentProps {
  teamName: string;
  teamLogo: string;
  availablePlayers: Player[];
  selectedPlayers: Player[];
  onSelectionChange: (players: Player[]) => void;
  maxPlayers?: number;
}

const PlayerSelectionComponent: React.FC<PlayerSelectionComponentProps> = ({
  teamName,
  teamLogo,
  availablePlayers,
  selectedPlayers,
  onSelectionChange,
  maxPlayers = 11,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const isPlayerSelected = (player: Player) => {
    return selectedPlayers.some(selected => selected.id === player.id);
  };

  const togglePlayerSelection = (player: Player) => {
    if (isPlayerSelected(player)) {
      // Remove player
      const updatedSelection = selectedPlayers.filter(p => p.id !== player.id);
      onSelectionChange(updatedSelection);
    } else {
      // Add player (if under limit)
      if (selectedPlayers.length < maxPlayers) {
        const updatedSelection = [...selectedPlayers, player];
        onSelectionChange(updatedSelection);
      } else {
        Alert.alert(
          'Selection Limit',
          `You can only select ${maxPlayers} players for the playing XI.`
        );
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'batsman': return '🏏';
      case 'bowler': return '⚾';
      case 'all-rounder': return '🔄';
      case 'wicket-keeper': return '🧤';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman': return '#4CAF50';
      case 'bowler': return '#F44336';
      case 'all-rounder': return '#FF9800';
      case 'wicket-keeper': return '#2196F3';
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamLogo}>{teamLogo}</Text>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.selectionCount}>
          {selectedPlayers.length}/{maxPlayers} players selected
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by role:</Text>
          <View style={styles.filterOptions}>
            {['all', 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.filterOption,
                  filterRole === role && styles.activeFilterOption,
                ]}
                onPress={() => setFilterRole(role)}
              >
                <Text style={[
                  styles.filterText,
                  filterRole === role && styles.activeFilterText,
                ]}>
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Players Summary */}
      {selectedPlayers.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.summaryTitle}>Selected Players:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedPlayers.map((player, index) => (
              <View key={player.id} style={styles.selectedPlayerChip}>
                <Text style={styles.chipText}>
                  {getRoleIcon(player.role)} {player.name}
                </Text>
                <TouchableOpacity
                  onPress={() => togglePlayerSelection(player)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Players List */}
      <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
        {filteredPlayers.map((player) => {
          const isSelected = isPlayerSelected(player);
          const isDisabled = !isSelected && selectedPlayers.length >= maxPlayers;
          
          return (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerItem,
                isSelected && styles.selectedPlayerItem,
                isDisabled && styles.disabledPlayerItem,
              ]}
              onPress={() => togglePlayerSelection(player)}
              disabled={isDisabled}
            >
              <View style={styles.playerInfo}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(player.role) }
                  ]}>
                    <Text style={styles.roleText}>
                      {getRoleIcon(player.role)} {player.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.playerDetails}>
                  <Text style={styles.playerDetail}>
                    Batting: {player.battingStyle}
                  </Text>
                  {player.bowlingStyle && (
                    <Text style={styles.playerDetail}>
                      Bowling: {player.bowlingStyle}
                    </Text>
                  )}
                </View>

                <View style={styles.playerStats}>
                  <Text style={styles.statText}>
                    Matches: {player.stats.matches} | 
                    Runs: {player.stats.runs} | 
                    Avg: {player.stats.average}
                  </Text>
                  {player.stats.wickets > 0 && (
                    <Text style={styles.statText}>
                      Wickets: {player.stats.wickets} | 
                      SR: {player.stats.strikeRate}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.selectionIndicator}>
                {isSelected ? (
                  <Text style={styles.selectedIcon}>✓</Text>
                ) : (
                  <View style={styles.unselectedIcon} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedPlayers.length === maxPlayers && (
        <View style={styles.completeMessage}>
          <Text style={styles.completeText}>
            ✅ Playing XI complete! You can now proceed to captain selection.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamLogo: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  selectionCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedSummary: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  selectedPlayerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.sm,
    marginRight: SIZES.sm,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: SIZES.xs,
    paddingHorizontal: SIZES.xs,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playersList: {
    flex: 1,
    padding: SIZES.md,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderRadius: SIZES.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPlayerItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  disabledPlayerItem: {
    opacity: 0.5,
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerDetails: {
    marginBottom: SIZES.xs,
  },
  playerDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  playerStats: {
    marginTop: SIZES.xs,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  selectionIndicator: {
    marginLeft: SIZES.md,
  },
  selectedIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  unselectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  completeMessage: {
    backgroundColor: COLORS.success + '20',
    padding: SIZES.md,
    margin: SIZES.md,
    borderRadius: SIZES.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  completeText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  filterContainer: {
    marginTop: SIZES.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
  },
  filterOption: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeFilterText: {
    color: 'white',
  },
});

export default PlayerSelectionComponent;
