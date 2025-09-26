import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from './Button';
import { TeamSetup } from '../types';

interface TeamSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamSelect: (team: TeamSetup) => void;
  availableTeams: TeamSetup[];
  title: string;
  selectedTeam?: TeamSetup;
}

const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({
  visible,
  onClose,
  onTeamSelect,
  availableTeams,
  title,
  selectedTeam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamSelect = (team: TeamSetup) => {
    onTeamSelect(team);
    onClose();
  };

  const getTeamInfo = (team: TeamSetup) => {
    const playerCount = team.players.length;
    const playingXICount = team.playingXI.length;
    const hasCaptain = team.captain !== null;
    const hasViceCaptain = team.viceCaptain !== null;
    
    return {
      playerCount,
      playingXICount,
      hasCaptain,
      hasViceCaptain,
      isComplete: playingXICount === 11 && hasCaptain && hasViceCaptain,
    };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Select a team for the match</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredTeams.map((team) => {
            const teamInfo = getTeamInfo(team);
            const isSelected = selectedTeam?.id === team.id;
            
            return (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.teamCard,
                  isSelected && styles.selectedTeamCard,
                ]}
                onPress={() => handleTeamSelect(team)}
              >
                <View style={styles.teamHeader}>
                  <Text style={styles.teamLogo}>{team.logo}</Text>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamShortName}>({team.shortName})</Text>
                    <Text style={styles.coach}>Coach: {team.coach}</Text>
                  </View>
                  {isSelected && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </View>

                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Players:</Text>
                    <Text style={styles.statValue}>{teamInfo.playerCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Playing XI:</Text>
                    <Text style={[
                      styles.statValue,
                      teamInfo.playingXICount === 11 ? styles.completeStat : styles.incompleteStat
                    ]}>
                      {teamInfo.playingXICount}/11
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Captain:</Text>
                    <Text style={[
                      styles.statValue,
                      teamInfo.hasCaptain ? styles.completeStat : styles.incompleteStat
                    ]}>
                      {teamInfo.hasCaptain ? '✓' : '✗'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Vice Captain:</Text>
                    <Text style={[
                      styles.statValue,
                      teamInfo.hasViceCaptain ? styles.completeStat : styles.incompleteStat
                    ]}>
                      {teamInfo.hasViceCaptain ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>

                {teamInfo.isComplete && (
                  <View style={styles.completeBadge}>
                    <Text style={styles.completeText}>✅ Ready to Play</Text>
                  </View>
                )}

                {teamInfo.playingXICount < 11 && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>
                      ⚠️ Needs {11 - teamInfo.playingXICount} more players
                    </Text>
                  </View>
                )}

                {!teamInfo.hasCaptain && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>⚠️ Needs Captain</Text>
                  </View>
                )}

                {!teamInfo.hasViceCaptain && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>⚠️ Needs Vice Captain</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {filteredTeams.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No teams found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search terms
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
          <Button
            title="Create New Team"
            onPress={() => {
              // This would open a team creation modal
              // For now, just show an alert
              onClose();
            }}
            size="medium"
            style={styles.createButton}
          />
        </View>
      </View>
    </Modal>
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
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
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
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedTeamCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  teamLogo: {
    fontSize: 48,
    marginRight: SIZES.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamShortName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  coach: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  teamStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginBottom: SIZES.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SIZES.xs,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  completeStat: {
    color: COLORS.success,
  },
  incompleteStat: {
    color: COLORS.error,
  },
  completeBadge: {
    backgroundColor: COLORS.success + '20',
    padding: SIZES.sm,
    borderRadius: SIZES.xs,
    marginTop: SIZES.sm,
  },
  completeText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  warningBadge: {
    backgroundColor: COLORS.error + '20',
    padding: SIZES.sm,
    borderRadius: SIZES.xs,
    marginTop: SIZES.sm,
  },
  warningText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  footer: {
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
  createButton: {
    flex: 1,
  },
});

export default TeamSelectionModal;
