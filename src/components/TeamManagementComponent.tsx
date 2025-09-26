import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { Player, TeamSetup } from '../types';

interface TeamManagementComponentProps {
  team: TeamSetup;
  onTeamUpdate: (updatedTeam: TeamSetup) => void;
}

const TeamManagementComponent: React.FC<TeamManagementComponentProps> = ({
  team,
  onTeamUpdate,
}) => {
  const [selectedCaptain, setSelectedCaptain] = useState<Player | null>(team.captain);
  const [selectedViceCaptain, setSelectedViceCaptain] = useState<Player | null>(team.viceCaptain);

  const handleCaptainSelection = (player: Player) => {
    if (selectedViceCaptain && selectedViceCaptain.id === player.id) {
      Alert.alert(
        'Selection Conflict',
        'This player is already selected as Vice Captain. Please select a different player for Captain.'
      );
      return;
    }
    setSelectedCaptain(player);
    updateTeam({ captain: player });
  };

  const handleViceCaptainSelection = (player: Player) => {
    if (selectedCaptain && selectedCaptain.id === player.id) {
      Alert.alert(
        'Selection Conflict',
        'This player is already selected as Captain. Please select a different player for Vice Captain.'
      );
      return;
    }
    setSelectedViceCaptain(player);
    updateTeam({ viceCaptain: player });
  };

  const updateTeam = (updates: Partial<TeamSetup>) => {
    const updatedTeam = { ...team, ...updates };
    onTeamUpdate(updatedTeam);
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

  const isPlayerSelected = (player: Player, type: 'captain' | 'viceCaptain') => {
    if (type === 'captain') {
      return selectedCaptain?.id === player.id;
    }
    return selectedViceCaptain?.id === player.id;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamLogo}>{team.logo}</Text>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamShortName}>({team.shortName})</Text>
      </View>

      {/* Current Leadership */}
      <View style={styles.leadershipSection}>
        <Text style={styles.sectionTitle}>Team Leadership</Text>
        
        <View style={styles.leadershipCards}>
          <View style={styles.leadershipCard}>
            <Text style={styles.leadershipLabel}>Captain</Text>
            {selectedCaptain ? (
              <View style={styles.selectedLeader}>
                <Text style={styles.leaderName}>
                  {getRoleIcon(selectedCaptain.role)} {selectedCaptain.name}
                </Text>
                <Text style={styles.leaderRole}>{selectedCaptain.role}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCaptain(null);
                    updateTeam({ captain: null });
                  }}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noSelection}>No Captain Selected</Text>
            )}
          </View>

          <View style={styles.leadershipCard}>
            <Text style={styles.leadershipLabel}>Vice Captain</Text>
            {selectedViceCaptain ? (
              <View style={styles.selectedLeader}>
                <Text style={styles.leaderName}>
                  {getRoleIcon(selectedViceCaptain.role)} {selectedViceCaptain.name}
                </Text>
                <Text style={styles.leaderRole}>{selectedViceCaptain.role}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedViceCaptain(null);
                    updateTeam({ viceCaptain: null });
                  }}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noSelection}>No Vice Captain Selected</Text>
            )}
          </View>
        </View>
      </View>

      {/* Player Selection */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Select Captain & Vice Captain</Text>
        <Text style={styles.sectionSubtitle}>
          Choose from your playing XI ({team.playingXI.length} players)
        </Text>

        <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
          {team.playingXI.map((player) => {
            const isCaptain = isPlayerSelected(player, 'captain');
            const isViceCaptain = isPlayerSelected(player, 'viceCaptain');
            const isSelected = isCaptain || isViceCaptain;

            return (
              <View key={player.id} style={styles.playerCard}>
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
                  
                  <Text style={styles.playerStats}>
                    Matches: {player.stats.matches} | 
                    Runs: {player.stats.runs} | 
                    Avg: {player.stats.average}
                    {player.stats.wickets > 0 && ` | Wickets: ${player.stats.wickets}`}
                  </Text>
                </View>

                <View style={styles.selectionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      isCaptain && styles.selectedButton,
                      isViceCaptain && styles.disabledButton,
                    ]}
                    onPress={() => handleCaptainSelection(player)}
                    disabled={isViceCaptain}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      isCaptain && styles.selectedButtonText,
                      isViceCaptain && styles.disabledButtonText,
                    ]}>
                      {isCaptain ? '✓ Captain' : 'Captain'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      isViceCaptain && styles.selectedButton,
                      isCaptain && styles.disabledButton,
                    ]}
                    onPress={() => handleViceCaptainSelection(player)}
                    disabled={isCaptain}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      isViceCaptain && styles.selectedButtonText,
                      isCaptain && styles.disabledButtonText,
                    ]}>
                      {isViceCaptain ? '✓ Vice Captain' : 'Vice Captain'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Team Summary */}
      {(selectedCaptain || selectedViceCaptain) && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Team Leadership Summary</Text>
          <View style={styles.summaryContent}>
            {selectedCaptain && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Captain:</Text>
                <Text style={styles.summaryValue}>
                  {getRoleIcon(selectedCaptain.role)} {selectedCaptain.name}
                </Text>
              </View>
            )}
            {selectedViceCaptain && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Vice Captain:</Text>
                <Text style={styles.summaryValue}>
                  {getRoleIcon(selectedViceCaptain.role)} {selectedViceCaptain.name}
                </Text>
              </View>
            )}
          </View>
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
  teamShortName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  leadershipSection: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  leadershipCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leadershipCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginHorizontal: SIZES.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  leadershipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  selectedLeader: {
    alignItems: 'center',
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  leaderRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noSelection: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectionSection: {
    flex: 1,
    padding: SIZES.lg,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderRadius: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerInfo: {
    marginBottom: SIZES.md,
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
  playerStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginHorizontal: SIZES.xs,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
  },
  selectionButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedButtonText: {
    color: 'white',
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  summarySection: {
    backgroundColor: COLORS.success + '10',
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SIZES.sm,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default TeamManagementComponent;
