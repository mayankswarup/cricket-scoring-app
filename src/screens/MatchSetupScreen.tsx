import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { Player as LivePlayer } from '../services/liveScoringService';

interface MatchSetupScreenProps {
  teamA: string;
  teamB: string;
  tossWinner: string;
  tossDecision: string;
  teamAPlayers: LivePlayer[];
  teamBPlayers: LivePlayer[];
  totalOvers: number;
  onBack: () => void;
  onStartMatch: (setupData: {
    battingOrder: string[];
    bowlingOrder: string[];
    teamAPlayers: LivePlayer[];
    teamBPlayers: LivePlayer[];
  }) => void;
}

const MatchSetupScreen: React.FC<MatchSetupScreenProps> = ({ 
  teamA, 
  teamB, 
  tossWinner, 
  tossDecision,
  teamAPlayers,
  teamBPlayers,
  totalOvers,
  onBack, 
  onStartMatch 
}) => {
  // Determine batting and bowling teams based on toss
  const battingTeam = tossDecision === 'Batting' ? tossWinner : (tossWinner === teamA ? teamB : teamA);
  const bowlingTeam = tossDecision === 'Fielding' ? tossWinner : (tossWinner === teamA ? teamB : teamA);

  const battingTeamPlayers = useMemo(
    () => (battingTeam === teamA ? teamAPlayers : teamBPlayers),
    [battingTeam, teamA, teamB, teamAPlayers, teamBPlayers]
  );
  const bowlingTeamPlayers = useMemo(
    () => (bowlingTeam === teamA ? teamAPlayers : teamBPlayers),
    [bowlingTeam, teamA, teamB, teamAPlayers, teamBPlayers]
  );

  const [battingOrder, setBattingOrder] = useState<string[]>([]);
  const [bowlingOrder, setBowlingOrder] = useState<string[]>([]);
  const [currentSetup, setCurrentSetup] = useState<'batting' | 'bowling'>('batting');
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top whenever currentSetup changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentSetup]);

  useEffect(() => {
    if (!battingTeamPlayers.length) {
      setBattingOrder([]);
      return;
    }
    setBattingOrder((prev) => (prev.length ? prev : battingTeamPlayers.map((player) => player.id)));
  }, [battingTeamPlayers]);

  useEffect(() => {
    if (!bowlingTeamPlayers.length) {
      setBowlingOrder([]);
      return;
    }
    setBowlingOrder((prev) =>
      prev.length ? prev : bowlingTeamPlayers.slice(0, Math.min(6, bowlingTeamPlayers.length)).map((player) => player.id)
    );
  }, [bowlingTeamPlayers]);

  const getCurrentTeamPlayers = () => {
    return currentSetup === 'batting' ? battingTeamPlayers : bowlingTeamPlayers;
  };

  const handlePlayerSelect = (playerId: string) => {
    if (currentSetup === 'batting') {
      setBattingOrder((prev) =>
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
      );
    } else {
      setBowlingOrder((prev) =>
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
      );
    }
  };

  const handleNext = () => {
    if (currentSetup === 'batting') {
      if (battingOrder.length < Math.min(2, battingTeamPlayers.length)) {
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
    const players = currentSetup === 'batting' ? battingTeamPlayers : bowlingTeamPlayers;
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
          <Text style={styles.oversInfo}>
            {totalOvers} overs match
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
  oversInfo: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
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
    backgroundColor: COLORS.primary + '10',
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
