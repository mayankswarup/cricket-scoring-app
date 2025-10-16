import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

interface MatchSetupScreenProps {
  teamA: string;
  teamB: string;
  tossWinner: string;
  tossDecision: string;
  onBack: () => void;
  onStartMatch: (setupData: {
    battingOrder: string[];
    bowlingOrder: string[];
    teamAPlayers: any[];
    teamBPlayers: any[];
  }) => void;
}

interface Player {
  id: string;
  name: string;
  role: string;
}

const MatchSetupScreen: React.FC<MatchSetupScreenProps> = ({ 
  teamA, 
  teamB, 
  tossWinner, 
  tossDecision,
  onBack, 
  onStartMatch 
}) => {
  // Determine batting and bowling teams based on toss
  const battingTeam = tossDecision === 'Batting' ? tossWinner : (tossWinner === teamA ? teamB : teamA);
  const bowlingTeam = tossDecision === 'Fielding' ? tossWinner : (tossWinner === teamA ? teamB : teamA);

  // Sample players for both teams
  const [teamAPlayers] = useState<Player[]>([
    { id: '1', name: 'Virat Kohli', role: 'Batsman' },
    { id: '2', name: 'Rohit Sharma', role: 'Batsman' },
    { id: '3', name: 'MS Dhoni', role: 'Wicket Keeper' },
    { id: '4', name: 'Jasprit Bumrah', role: 'Bowler' },
    { id: '5', name: 'Ravindra Jadeja', role: 'All Rounder' },
    { id: '6', name: 'KL Rahul', role: 'Batsman' },
    { id: '7', name: 'Hardik Pandya', role: 'All Rounder' },
    { id: '8', name: 'Mohammed Shami', role: 'Bowler' },
    { id: '9', name: 'Yuzvendra Chahal', role: 'Bowler' },
    { id: '10', name: 'Shikhar Dhawan', role: 'Batsman' },
    { id: '11', name: 'Rishabh Pant', role: 'Wicket Keeper' },
  ]);

  const [teamBPlayers] = useState<Player[]>([
    { id: '1', name: 'Kane Williamson', role: 'Batsman' },
    { id: '2', name: 'Steve Smith', role: 'Batsman' },
    { id: '3', name: 'Jos Buttler', role: 'Wicket Keeper' },
    { id: '4', name: 'Pat Cummins', role: 'Bowler' },
    { id: '5', name: 'Ben Stokes', role: 'All Rounder' },
    { id: '6', name: 'David Warner', role: 'Batsman' },
    { id: '7', name: 'Mitchell Starc', role: 'Bowler' },
    { id: '8', name: 'Rashid Khan', role: 'Bowler' },
    { id: '9', name: 'Glenn Maxwell', role: 'All Rounder' },
    { id: '10', name: 'Aaron Finch', role: 'Batsman' },
    { id: '11', name: 'Quinton de Kock', role: 'Wicket Keeper' },
  ]);

  const [battingOrder, setBattingOrder] = useState<string[]>([]);
  const [bowlingOrder, setBowlingOrder] = useState<string[]>([]);
  const [currentSetup, setCurrentSetup] = useState<'batting' | 'bowling'>('batting');
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top whenever currentSetup changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentSetup]);

  const getCurrentTeamPlayers = () => {
    return currentSetup === 'batting' ? teamAPlayers : teamBPlayers;
  };

  const handlePlayerSelect = (playerId: string) => {
    if (currentSetup === 'batting') {
      if (battingOrder.includes(playerId)) {
        setBattingOrder(battingOrder.filter(id => id !== playerId));
      } else {
        setBattingOrder([...battingOrder, playerId]);
      }
    } else {
      if (bowlingOrder.includes(playerId)) {
        setBowlingOrder(bowlingOrder.filter(id => id !== playerId));
      } else {
        setBowlingOrder([...bowlingOrder, playerId]);
      }
    }
  };

  const handleNext = () => {
    if (currentSetup === 'batting') {
      if (battingOrder.length < 2) {
        Alert.alert('Error', 'Please select at least 2 batsmen');
        return;
      }
      setCurrentSetup('bowling');
    } else {
      if (bowlingOrder.length < 1) {
        Alert.alert('Error', 'Please select at least 1 bowler');
        return;
      }
      // Pass the setup data to the parent
      onStartMatch({
        battingOrder,
        bowlingOrder,
        teamAPlayers,
        teamBPlayers,
      });
    }
  };

  const getPlayerName = (playerId: string) => {
    const players = currentSetup === 'batting' ? teamAPlayers : teamBPlayers;
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Match Setup</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSetup === 'batting' ? 'Next' : 'Start Match'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.content}
      >
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>{teamA} vs {teamB}</Text>
          <Text style={styles.tossInfo}>
            {tossWinner} won toss and chose to {tossDecision.toLowerCase()}
          </Text>
        </View>

        {/* Current Setup */}
        <View style={styles.setupSection}>
          <Text style={styles.sectionTitle}>
            {currentSetup === 'batting' ? '🏏 Batting Order' : '⚾ Bowling Lineup'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {currentSetup === 'batting' 
              ? `Select batsmen for ${battingTeam}` 
              : `Select bowlers for ${bowlingTeam}`
            }
          </Text>
        </View>

        {/* Players List */}
        <View style={styles.playersContainer}>
          {getCurrentTeamPlayers().map((player) => {
            const isSelected = currentSetup === 'batting' 
              ? battingOrder.includes(player.id)
              : bowlingOrder.includes(player.id);
            
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.playerCard, isSelected && styles.selectedPlayerCard]}
                onPress={() => handlePlayerSelect(player.id)}
              >
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Players */}
        {(battingOrder.length > 0 || bowlingOrder.length > 0) && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>Selected:</Text>
            <Text style={styles.selectedText}>
              {currentSetup === 'batting' 
                ? battingOrder.map(id => getPlayerName(id)).join(', ')
                : bowlingOrder.map(id => getPlayerName(id)).join(', ')
              }
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {currentSetup === 'batting' 
              ? 'Select the batsmen in the order they will bat. You can change this during the match.'
              : 'Select the bowlers who will bowl. You can change the bowling order during the match.'
            }
          </Text>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingTop: 50,
  },
  backButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  tossInfo: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  setupSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  playersContainer: {
    marginBottom: SIZES.lg,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPlayerCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  playerRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  selectedSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 8,
    marginBottom: SIZES.lg,
  },
  selectedTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  selectedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  instructions: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 8,
    marginBottom: SIZES.lg,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MatchSetupScreen;
