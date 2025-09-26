import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { UI_CONFIG } from '../config/appConfig';

interface Playing11ScreenProps {
  teamA: string;
  teamB: string;
  tossWinner: string;
  tossDecision: string;
  onBack: () => void;
  onStartMatch: () => void;
}

interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  isSelected: boolean;
}

const Playing11Screen: React.FC<Playing11ScreenProps> = ({ 
  teamA, 
  teamB, 
  tossWinner, 
  tossDecision,
  onBack, 
  onStartMatch 
}) => {
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([
    { id: '1', name: 'Virat Kohli', role: 'batsman', isSelected: false },
    { id: '2', name: 'Rohit Sharma', role: 'batsman', isSelected: false },
    { id: '3', name: 'MS Dhoni', role: 'wicket-keeper', isSelected: false },
    { id: '4', name: 'Jasprit Bumrah', role: 'bowler', isSelected: false },
    { id: '5', name: 'Ravindra Jadeja', role: 'all-rounder', isSelected: false },
    { id: '6', name: 'KL Rahul', role: 'batsman', isSelected: false },
    { id: '7', name: 'Hardik Pandya', role: 'all-rounder', isSelected: false },
    { id: '8', name: 'Mohammed Shami', role: 'bowler', isSelected: false },
    { id: '9', name: 'Yuzvendra Chahal', role: 'bowler', isSelected: false },
    { id: '10', name: 'Shikhar Dhawan', role: 'batsman', isSelected: false },
    { id: '11', name: 'Rishabh Pant', role: 'wicket-keeper', isSelected: false },
    { id: '12', name: 'Bhuvneshwar Kumar', role: 'bowler', isSelected: false },
  ]);
  
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([
    { id: '13', name: 'Steve Smith', role: 'batsman', isSelected: false },
    { id: '14', name: 'David Warner', role: 'batsman', isSelected: false },
    { id: '15', name: 'Pat Cummins', role: 'bowler', isSelected: false },
    { id: '16', name: 'Glenn Maxwell', role: 'all-rounder', isSelected: false },
    { id: '17', name: 'Mitchell Starc', role: 'bowler', isSelected: false },
    { id: '18', name: 'Aaron Finch', role: 'batsman', isSelected: false },
    { id: '19', name: 'Josh Hazlewood', role: 'bowler', isSelected: false },
    { id: '20', name: 'Marcus Stoinis', role: 'all-rounder', isSelected: false },
    { id: '21', name: 'Alex Carey', role: 'wicket-keeper', isSelected: false },
    { id: '22', name: 'Adam Zampa', role: 'bowler', isSelected: false },
    { id: '23', name: 'Marnus Labuschagne', role: 'batsman', isSelected: false },
    { id: '24', name: 'Nathan Lyon', role: 'bowler', isSelected: false },
  ]);

  const currentPlayers = currentTeam === 'A' ? teamAPlayers : teamBPlayers;
  const selectedCount = currentPlayers.filter(p => p.isSelected).length;
  const canProceed = selectedCount === 11;

  const handlePlayerToggle = (playerId: string) => {
    if (currentTeam === 'A') {
      setTeamAPlayers(prev => 
        prev.map(p => 
          p.id === playerId ? { ...p, isSelected: !p.isSelected } : p
        )
      );
    } else {
      setTeamBPlayers(prev => 
        prev.map(p => 
          p.id === playerId ? { ...p, isSelected: !p.isSelected } : p
        )
      );
    }
  };

  const handleNext = () => {
    if (currentTeam === 'A') {
      setCurrentTeam('B');
    } else {
      // Both teams selected, start match
      onStartMatch();
    }
  };

  const handleBack = () => {
    if (currentTeam === 'B') {
      setCurrentTeam('A');
    } else {
      onBack();
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Playing 11 - {currentTeam === 'A' ? teamA : teamB}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>{teamA} vs {teamB}</Text>
          <Text style={styles.tossInfo}>
            {tossWinner} won toss & chose to {tossDecision.toLowerCase()}
          </Text>
        </View>

        {/* Team Tabs */}
        <View style={styles.teamTabs}>
          <TouchableOpacity
            style={[styles.teamTab, currentTeam === 'A' && styles.activeTeamTab]}
            onPress={() => setCurrentTeam('A')}
          >
            <Text style={[styles.teamTabText, currentTeam === 'A' && styles.activeTeamTabText]}>
              {teamA}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.teamTab, currentTeam === 'B' && styles.activeTeamTab]}
            onPress={() => setCurrentTeam('B')}
          >
            <Text style={[styles.teamTabText, currentTeam === 'B' && styles.activeTeamTabText]}>
              {teamB}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selection Status */}
        <View style={styles.selectionStatus}>
          <Text style={styles.selectionText}>
            {selectedCount}/11 players selected
          </Text>
          {selectedCount === 11 && (
            <Text style={styles.readyText}>✅ Ready!</Text>
          )}
        </View>

        {/* Players List */}
        <ScrollView style={styles.playersList}>
          {currentPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                player.isSelected && styles.selectedPlayerCard
              ]}
              onPress={() => handlePlayerToggle(player.id)}
            >
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>
                  {getRoleIcon(player.role)} {player.role.replace('-', ' ')}
                </Text>
              </View>
              {player.isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.nextButton, !canProceed && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={styles.nextButtonText}>
              {currentTeam === 'A' ? 'Next Team' : 'Start Match'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
    paddingTop: SIZES.lg,
  },
  matchTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  tossInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  teamTabs: {
    flexDirection: 'row',
    marginBottom: SIZES.lg,
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: 4,
  },
  teamTab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderRadius: UI_CONFIG.BORDER_RADIUS,
  },
  activeTeamTab: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
  },
  teamTabText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  activeTeamTabText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  selectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.md,
  },
  selectionText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  readyText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.SUCCESS_COLOR,
  },
  playersList: {
    flex: 1,
    marginBottom: SIZES.lg,
  },
  playerCard: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPlayerCard: {
    borderColor: UI_CONFIG.SUCCESS_COLOR,
    borderWidth: 2,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.xs,
  },
  playerRole: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UI_CONFIG.SUCCESS_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  actionButtons: {
    paddingBottom: SIZES.lg,
  },
  nextButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default Playing11Screen;
