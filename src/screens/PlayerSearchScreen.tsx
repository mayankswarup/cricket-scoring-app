import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { PlayerRegistration, PlayerAvailability, MatchSchedule } from '../types';

interface PlayerSearchScreenProps {
  onPlayerSelect: (player: PlayerRegistration) => void;
  onBack: () => void;
  matchDate?: string;
  matchTime?: string;
  duration?: number;
}

const PlayerSearchScreen: React.FC<PlayerSearchScreenProps> = ({
  onPlayerSelect,
  onBack,
  matchDate,
  matchTime,
  duration = 180, // 3 hours default
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterExperience, setFilterExperience] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  
  // Mock data - in real app, this would come from API
  const [allPlayers, setAllPlayers] = useState<PlayerRegistration[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerRegistration[]>([]);

  useEffect(() => {
    // Load mock players
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    // Mock data - in real app, this would be an API call
    const mockPlayers: PlayerRegistration[] = [
      {
        id: '1',
        name: 'Virat Kohli',
        email: 'virat@example.com',
        phone: '+91-9876543210',
        password: 'hashed_password',
        dateOfBirth: '1988-11-05',
        preferredRole: 'batsman',
        battingStyle: 'right-handed',
        experience: 'professional',
        location: 'Delhi',
        availability: [],
        stats: { matches: 100, runs: 5000, wickets: 0, average: 50.0, strikeRate: 120.0 },
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true,
      },
      {
        id: '2',
        name: 'Rohit Sharma',
        email: 'rohit@example.com',
        phone: '+91-9876543211',
        password: 'hashed_password',
        dateOfBirth: '1987-04-30',
        preferredRole: 'batsman',
        battingStyle: 'right-handed',
        experience: 'professional',
        location: 'Mumbai',
        availability: [],
        stats: { matches: 150, runs: 6000, wickets: 0, average: 45.0, strikeRate: 110.0 },
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true,
      },
      // Add more mock players...
    ];
    setAllPlayers(mockPlayers);
  };

  const checkPlayerAvailability = (player: PlayerRegistration): boolean => {
    if (!matchDate || !matchTime) return true;
    
    // In real app, this would check against actual match schedules
    // For now, return true for demo
    return true;
  };

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || player.preferredRole === filterRole;
    const matchesExperience = filterExperience === 'all' || player.experience === filterExperience;
    const matchesLocation = filterLocation === 'all' || player.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    const isAvailable = !showAvailableOnly || checkPlayerAvailability(player);
    
    return matchesSearch && matchesRole && matchesExperience && matchesLocation && isAvailable;
  });

  const handlePlayerSelect = (player: PlayerRegistration) => {
    if (selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
    } else {
      setSelectedPlayers(prev => [...prev, player]);
    }
  };

  const handleAddSelectedPlayers = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert('No Players Selected', 'Please select at least one player to add.');
      return;
    }
    
    // In real app, this would add players to the team
    Alert.alert('Success', `${selectedPlayers.length} players added to team!`);
    onBack();
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

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#2196F3';
      case 'professional': return '#9C27B0';
      default: return COLORS.textSecondary;
    }
  };

  const isPlayerSelected = (player: PlayerRegistration) => {
    return selectedPlayers.some(p => p.id === player.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Search Players</Text>
        <Text style={styles.subtitle}>Find and add players to your team</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Role:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterChip,
                    filterRole === role && styles.activeFilterChip,
                  ]}
                  onPress={() => setFilterRole(role)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterRole === role && styles.activeFilterChipText,
                  ]}>
                    {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Experience:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'beginner', 'intermediate', 'advanced', 'professional'].map((exp) => (
                <TouchableOpacity
                  key={exp}
                  style={[
                    styles.filterChip,
                    filterExperience === exp && styles.activeFilterChip,
                  ]}
                  onPress={() => setFilterExperience(exp)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterExperience === exp && styles.activeFilterChipText,
                  ]}>
                    {exp === 'all' ? 'All' : exp.charAt(0).toUpperCase() + exp.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.availabilityToggle,
                showAvailableOnly && styles.activeAvailabilityToggle,
              ]}
              onPress={() => setShowAvailableOnly(!showAvailableOnly)}
            >
              <Text style={[
                styles.availabilityText,
                showAvailableOnly && styles.activeAvailabilityText,
              ]}>
                {showAvailableOnly ? '✅' : '⚪'} Available Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Selected Players Summary */}
      {selectedPlayers.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedTitle}>
            Selected Players ({selectedPlayers.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedPlayers.map((player) => (
              <View key={player.id} style={styles.selectedPlayerChip}>
                <Text style={styles.selectedPlayerText}>
                  {getRoleIcon(player.preferredRole)} {player.name}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePlayerSelect(player)}
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
          const isAvailable = checkPlayerAvailability(player);
          
          return (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                isSelected && styles.selectedPlayerCard,
                !isAvailable && styles.unavailablePlayerCard,
              ]}
              onPress={() => handlePlayerSelect(player)}
            >
              <View style={styles.playerInfo}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerName}>
                    {getRoleIcon(player.preferredRole)} {player.name}
                  </Text>
                  <View style={styles.playerBadges}>
                    <View style={[
                      styles.experienceBadge,
                      { backgroundColor: getExperienceColor(player.experience) }
                    ]}>
                      <Text style={styles.experienceBadgeText}>
                        {player.experience.toUpperCase()}
                      </Text>
                    </View>
                    {!isAvailable && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableBadgeText}>❌</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <Text style={styles.playerDetails}>
                  {player.preferredRole.toUpperCase()} • {player.battingStyle}
                  {player.bowlingStyle && ` • ${player.bowlingStyle}`}
                </Text>
                
                <Text style={styles.playerLocation}>📍 {player.location}</Text>
                
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

        {filteredPlayers.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No players found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onBack}
          variant="outline"
          size="medium"
          style={styles.cancelButton}
        />
        <Button
          title={`Add ${selectedPlayers.length} Players`}
          onPress={handleAddSelectedPlayers}
          size="medium"
          style={styles.addButton}
          disabled={selectedPlayers.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
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
  filtersContainer: {
    gap: SIZES.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 80,
  },
  filterChip: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.xs,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeFilterChipText: {
    color: 'white',
  },
  availabilityToggle: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeAvailabilityToggle: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeAvailabilityText: {
    color: 'white',
  },
  selectedSummary: {
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  selectedPlayerText: {
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
    padding: SIZES.lg,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderRadius: SIZES.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayerCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  unavailablePlayerCard: {
    opacity: 0.6,
    backgroundColor: COLORS.error + '10',
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
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  playerBadges: {
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  experienceBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  experienceBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unavailableBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  unavailableBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  playerLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
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
  noResults: {
    alignItems: 'center',
    padding: SIZES.xl,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.md,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});

export default PlayerSearchScreen;
