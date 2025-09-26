import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import { MatchSetup, TeamSetup, TossResult } from '../types';

interface TossResultScreenProps {
  matchSetup: MatchSetup;
  onTossComplete: (tossResult: TossResult) => void;
  onBack: () => void;
}

const TossResultScreen: React.FC<TossResultScreenProps> = ({
  matchSetup,
  onTossComplete,
  onBack,
}) => {
  const [tossWinner, setTossWinner] = useState<'home' | 'away' | null>(null);
  const [decision, setDecision] = useState<'bat' | 'bowl' | null>(null);
  const [isTossComplete, setIsTossComplete] = useState(false);

  const handleTossWinnerSelection = (winner: 'home' | 'away') => {
    setTossWinner(winner);
  };

  const handleDecisionSelection = (selectedDecision: 'bat' | 'bowl') => {
    setDecision(selectedDecision);
  };

  const handleCompleteToss = () => {
    if (!tossWinner || !decision) {
      Alert.alert('Incomplete Selection', 'Please select both toss winner and decision.');
      return;
    }

    const winnerTeam = tossWinner === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam;
    const tossResult: TossResult = {
      winner: tossWinner,
      winnerTeam: winnerTeam,
      decision: decision,
      electedTo: decision,
      timestamp: new Date().toISOString(),
    };

    setIsTossComplete(true);
    onTossComplete(tossResult);
  };

  const handleResetToss = () => {
    setTossWinner(null);
    setDecision(null);
    setIsTossComplete(false);
  };

  const getTeamDisplayName = (team: TeamSetup) => {
    return `${team.logo} ${team.name} (${team.shortName})`;
  };

  const getDecisionText = (decision: 'bat' | 'bowl') => {
    return decision === 'bat' ? 'Bat First' : 'Bowl First';
  };

  const getDecisionIcon = (decision: 'bat' | 'bowl') => {
    return decision === 'bat' ? '🏏' : '⚾';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏏 Toss Result</Text>
          <Text style={styles.subtitle}>
            {getTeamDisplayName(matchSetup.homeTeam)} vs {getTeamDisplayName(matchSetup.awayTeam)}
          </Text>
          <Text style={styles.venue}>{matchSetup.venue}</Text>
        </View>

        {!isTossComplete ? (
          <>
            {/* Toss Winner Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who won the toss?</Text>
              <View style={styles.teamSelection}>
                <TouchableOpacity
                  style={[
                    styles.teamCard,
                    tossWinner === 'home' && styles.selectedTeamCard,
                  ]}
                  onPress={() => handleTossWinnerSelection('home')}
                >
                  <Text style={styles.teamLogo}>{matchSetup.homeTeam.logo}</Text>
                  <Text style={styles.teamName}>{matchSetup.homeTeam.name}</Text>
                  <Text style={styles.teamShortName}>({matchSetup.homeTeam.shortName})</Text>
                  {tossWinner === 'home' && (
                    <Text style={styles.selectedIndicator}>✓ Selected</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.teamCard,
                    tossWinner === 'away' && styles.selectedTeamCard,
                  ]}
                  onPress={() => handleTossWinnerSelection('away')}
                >
                  <Text style={styles.teamLogo}>{matchSetup.awayTeam.logo}</Text>
                  <Text style={styles.teamName}>{matchSetup.awayTeam.name}</Text>
                  <Text style={styles.teamShortName}>({matchSetup.awayTeam.shortName})</Text>
                  {tossWinner === 'away' && (
                    <Text style={styles.selectedIndicator}>✓ Selected</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Decision Selection */}
            {tossWinner && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  What did {tossWinner === 'home' ? matchSetup.homeTeam.name : matchSetup.awayTeam.name} choose?
                </Text>
                <View style={styles.decisionSelection}>
                  <TouchableOpacity
                    style={[
                      styles.decisionCard,
                      decision === 'bat' && styles.selectedDecisionCard,
                    ]}
                    onPress={() => handleDecisionSelection('bat')}
                  >
                    <Text style={styles.decisionIcon}>🏏</Text>
                    <Text style={styles.decisionTitle}>Bat First</Text>
                    <Text style={styles.decisionDescription}>
                      Choose to bat and set a target
                    </Text>
                    {decision === 'bat' && (
                      <Text style={styles.selectedIndicator}>✓ Selected</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.decisionCard,
                      decision === 'bowl' && styles.selectedDecisionCard,
                    ]}
                    onPress={() => handleDecisionSelection('bowl')}
                  >
                    <Text style={styles.decisionIcon}>⚾</Text>
                    <Text style={styles.decisionTitle}>Bowl First</Text>
                    <Text style={styles.decisionDescription}>
                      Choose to bowl and chase the target
                    </Text>
                    {decision === 'bowl' && (
                      <Text style={styles.selectedIndicator}>✓ Selected</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Complete Toss Button */}
            {tossWinner && decision && (
              <View style={styles.actionSection}>
                <Button
                  title="Complete Toss"
                  onPress={handleCompleteToss}
                  size="large"
                  style={styles.completeButton}
                />
              </View>
            )}
          </>
        ) : (
          /* Toss Result Summary */
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>🎉 Toss Complete!</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Toss Winner:</Text>
              <Text style={styles.resultValue}>
                {getTeamDisplayName(tossWinner === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam)}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Decision:</Text>
              <Text style={styles.resultValue}>
                {getDecisionIcon(decision!)} {getDecisionText(decision!)}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Match Setup:</Text>
              <Text style={styles.resultValue}>
                {tossWinner === 'home' ? matchSetup.homeTeam.name : matchSetup.awayTeam.name} will {decision === 'bat' ? 'bat first' : 'bowl first'}
              </Text>
            </View>

            <View style={styles.actionSection}>
              <Button
                title="Reset Toss"
                onPress={handleResetToss}
                variant="outline"
                size="large"
                style={styles.resetButton}
              />
              <Button
                title="Proceed to Match"
                onPress={() => {
                  // This would typically navigate to the match screen
                  Alert.alert('Success', 'Toss completed! Ready to start the match.');
                }}
                size="large"
                style={styles.proceedButton}
              />
            </View>
          </View>
        )}

        {/* Back Button */}
        <View style={styles.backSection}>
          <Button
            title="Back to Setup"
            onPress={onBack}
            variant="outline"
            size="medium"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    marginTop: SIZES.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  venue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: SIZES.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  teamSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginHorizontal: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedTeamCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  teamLogo: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  teamShortName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  selectedIndicator: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  decisionSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  decisionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginHorizontal: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedDecisionCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  decisionIcon: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  decisionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  decisionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  actionSection: {
    marginBottom: SIZES.xxl,
  },
  completeButton: {
    marginBottom: SIZES.md,
  },
  resultSection: {
    marginBottom: SIZES.xxl,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  resultValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  resetButton: {
    marginBottom: SIZES.md,
  },
  proceedButton: {
    marginBottom: SIZES.md,
  },
  backSection: {
    marginTop: SIZES.xl,
  },
});

export default TossResultScreen;
