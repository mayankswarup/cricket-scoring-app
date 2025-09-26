import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import Button from '../components/Button';
import PlayerSelectionComponent from '../components/PlayerSelectionComponent';
import TeamManagementComponent from '../components/TeamManagementComponent';
import AddPlayerComponent from '../components/AddPlayerComponent';
import TeamSelectionModal from '../components/TeamSelectionModal';
import TossResultScreen from './TossResultScreen';
import { MatchSetup, TeamSetup, TossResult, Player } from '../types';
import { mockTeamSetups, mockMatchSetups } from '../data/mockData';

interface AdminMatchSetupScreenProps {
  onBack: () => void;
}

type SetupStep = 'teams' | 'homeTeam' | 'awayTeam' | 'toss' | 'complete';

const AdminMatchSetupScreen: React.FC<AdminMatchSetupScreenProps> = ({
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('teams');
  const [matchSetup, setMatchSetup] = useState<MatchSetup>({
    id: 'new-match',
    homeTeam: mockTeamSetups[0],
    awayTeam: mockTeamSetups[1],
    venue: 'Melbourne Cricket Ground',
    date: new Date().toISOString(),
    status: 'setup',
    tossResult: undefined,
  });

  // Modal states
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [currentTeamType, setCurrentTeamType] = useState<'home' | 'away'>('home');
  const [availableTeams, setAvailableTeams] = useState<TeamSetup[]>(mockTeamSetups);

  const handleTeamUpdate = (teamType: 'home' | 'away', updatedTeam: TeamSetup) => {
    setMatchSetup(prev => ({
      ...prev,
      [teamType === 'home' ? 'homeTeam' : 'awayTeam']: updatedTeam,
    }));
  };

  const handleTossComplete = (tossResult: TossResult) => {
    setMatchSetup(prev => ({
      ...prev,
      tossResult,
      status: 'ready',
    }));
    setCurrentStep('complete');
  };

  const handleTeamSelect = (team: TeamSetup) => {
    handleTeamUpdate(currentTeamType, team);
    setShowTeamSelection(false);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    const currentTeam = currentTeamType === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam;
    const updatedTeam = {
      ...currentTeam,
      players: [...currentTeam.players, newPlayer],
    };
    handleTeamUpdate(currentTeamType, updatedTeam);
    setShowAddPlayer(false);
  };

  const handleOpenTeamSelection = (teamType: 'home' | 'away') => {
    setCurrentTeamType(teamType);
    setShowTeamSelection(true);
  };

  const handleOpenAddPlayer = (teamType: 'home' | 'away') => {
    setCurrentTeamType(teamType);
    setShowAddPlayer(true);
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'teams':
        setCurrentStep('homeTeam');
        break;
      case 'homeTeam':
        setCurrentStep('awayTeam');
        break;
      case 'awayTeam':
        setCurrentStep('toss');
        break;
      case 'toss':
        setCurrentStep('complete');
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'homeTeam':
        setCurrentStep('teams');
        break;
      case 'awayTeam':
        setCurrentStep('homeTeam');
        break;
      case 'toss':
        setCurrentStep('awayTeam');
        break;
      case 'complete':
        setCurrentStep('toss');
        break;
      default:
        break;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'teams':
        return true;
      case 'homeTeam':
        return matchSetup.homeTeam.playingXI.length === 11 && 
               matchSetup.homeTeam.captain && 
               matchSetup.homeTeam.viceCaptain;
      case 'awayTeam':
        return matchSetup.awayTeam.playingXI.length === 11 && 
               matchSetup.awayTeam.captain && 
               matchSetup.awayTeam.viceCaptain;
      case 'toss':
        return matchSetup.tossResult !== undefined;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'teams':
        return 'Select Teams';
      case 'homeTeam':
        return `Setup ${matchSetup.homeTeam.name}`;
      case 'awayTeam':
        return `Setup ${matchSetup.awayTeam.name}`;
      case 'toss':
        return 'Toss Result';
      case 'complete':
        return 'Match Ready';
      default:
        return 'Match Setup';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'teams':
        return 'Choose the two teams for the match';
      case 'homeTeam':
        return `Select 11 players and assign captain/vice-captain for ${matchSetup.homeTeam.name}`;
      case 'awayTeam':
        return `Select 11 players and assign captain/vice-captain for ${matchSetup.awayTeam.name}`;
      case 'toss':
        return 'Record the toss result and team decisions';
      case 'complete':
        return 'Match setup is complete and ready to start';
      default:
        return '';
    }
  };

  const renderTeamsSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>{getStepDescription()}</Text>
      
      <View style={styles.teamsContainer}>
        <TouchableOpacity
          style={styles.teamCard}
          onPress={() => handleOpenTeamSelection('home')}
        >
          <Text style={styles.teamLogo}>{matchSetup.homeTeam.logo}</Text>
          <Text style={styles.teamName}>{matchSetup.homeTeam.name}</Text>
          <Text style={styles.teamShortName}>({matchSetup.homeTeam.shortName})</Text>
          <Text style={styles.teamAction}>Tap to change team</Text>
        </TouchableOpacity>

        <Text style={styles.vsText}>VS</Text>

        <TouchableOpacity
          style={styles.teamCard}
          onPress={() => handleOpenTeamSelection('away')}
        >
          <Text style={styles.teamLogo}>{matchSetup.awayTeam.logo}</Text>
          <Text style={styles.teamName}>{matchSetup.awayTeam.name}</Text>
          <Text style={styles.teamShortName}>({matchSetup.awayTeam.shortName})</Text>
          <Text style={styles.teamAction}>Tap to change team</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.infoLabel}>Venue:</Text>
        <Text style={styles.infoValue}>{matchSetup.venue}</Text>
        
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>
          {new Date(matchSetup.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderTeamSetup = (teamType: 'home' | 'away') => {
    const team = teamType === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam;
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>{getStepDescription()}</Text>
        
        <View style={styles.teamSetupContainer}>
          <View style={styles.teamActions}>
            <Button
              title="➕ Add New Player"
              onPress={() => handleOpenAddPlayer(teamType)}
              variant="outline"
              size="small"
              style={styles.addPlayerButton}
            />
            <Button
              title="🔄 Change Team"
              onPress={() => handleOpenTeamSelection(teamType)}
              variant="outline"
              size="small"
              style={styles.changeTeamButton}
            />
          </View>

          <PlayerSelectionComponent
            teamName={team.name}
            teamLogo={team.logo}
            availablePlayers={team.players}
            selectedPlayers={team.playingXI}
            onSelectionChange={(players) => {
              handleTeamUpdate(teamType, { ...team, playingXI: players });
            }}
            maxPlayers={11}
          />
        </View>
      </View>
    );
  };

  const renderLeadershipSetup = (teamType: 'home' | 'away') => {
    const team = teamType === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam;
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>{getStepDescription()}</Text>
        
        <TeamManagementComponent
          team={team}
          onTeamUpdate={(updatedTeam) => handleTeamUpdate(teamType, updatedTeam)}
        />
      </View>
    );
  };

  const renderComplete = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeContainer}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>Match Setup Complete!</Text>
        <Text style={styles.completeDescription}>
          Your match is ready to begin. All teams have been configured and toss has been completed.
        </Text>

        <View style={styles.matchSummary}>
          <Text style={styles.summaryTitle}>Match Summary</Text>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Teams:</Text>
            <Text style={styles.summaryValue}>
              {matchSetup.homeTeam.logo} {matchSetup.homeTeam.name} vs {matchSetup.awayTeam.logo} {matchSetup.awayTeam.name}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Venue:</Text>
            <Text style={styles.summaryValue}>{matchSetup.venue}</Text>
          </View>

          {matchSetup.tossResult && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Toss Winner:</Text>
              <Text style={styles.summaryValue}>
                {matchSetup.tossResult.winnerTeam.logo} {matchSetup.tossResult.winnerTeam.name} 
                ({matchSetup.tossResult.electedTo === 'bat' ? 'Bat First' : 'Bowl First'})
              </Text>
            </View>
          )}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <Text style={[styles.summaryValue, styles.readyStatus]}>Ready to Start</Text>
          </View>
        </View>

        <Button
          title="Start Match"
          onPress={() => {
            Alert.alert('Success', 'Match is ready to start!');
            onBack();
          }}
          size="large"
          style={styles.startButton}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'teams':
        return renderTeamsSelection();
      case 'homeTeam':
        return renderTeamSetup('home');
      case 'awayTeam':
        return renderTeamSetup('away');
      case 'toss':
        return (
          <TossResultScreen
            matchSetup={matchSetup}
            onTossComplete={handleTossComplete}
            onBack={handlePreviousStep}
          />
        );
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getStepTitle()}</Text>
        <Text style={styles.subtitle}>{getStepDescription()}</Text>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {['teams', 'homeTeam', 'awayTeam', 'toss', 'complete'].map((step, index) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                currentStep === step && styles.activeProgressDot,
                ['teams', 'homeTeam', 'awayTeam', 'toss'].indexOf(currentStep) > index && styles.completedProgressDot,
              ]} />
              {index < 4 && <View style={styles.progressLine} />}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      {currentStep !== 'toss' && currentStep !== 'complete' && (
        <View style={styles.navigation}>
          <Button
            title="Previous"
            onPress={handlePreviousStep}
            variant="outline"
            size="medium"
            disabled={currentStep === 'teams'}
          />
          <Button
            title={currentStep === 'awayTeam' ? 'Toss' : 'Next'}
            onPress={handleNextStep}
            size="medium"
            disabled={!canProceedToNext()}
          />
        </View>
      )}

      {/* Modals */}
      <TeamSelectionModal
        visible={showTeamSelection}
        onClose={() => setShowTeamSelection(false)}
        onTeamSelect={handleTeamSelect}
        availableTeams={availableTeams}
        title={`Select ${currentTeamType === 'home' ? 'Home' : 'Away'} Team`}
        selectedTeam={currentTeamType === 'home' ? matchSetup.homeTeam : matchSetup.awayTeam}
      />

      <AddPlayerComponent
        visible={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onPlayerAdd={handleAddPlayer}
        teamName={currentTeamType === 'home' ? matchSetup.homeTeam.name : matchSetup.awayTeam.name}
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
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  activeProgressDot: {
    backgroundColor: COLORS.primary,
  },
  completedProgressDot: {
    backgroundColor: COLORS.success,
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.sm,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: SIZES.lg,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  teamsContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
  },
  teamLogo: {
    fontSize: 48,
    marginBottom: SIZES.sm,
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
  },
  teamAction: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: SIZES.xs,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: SIZES.md,
  },
  matchInfo: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginTop: SIZES.lg,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  teamSetupContainer: {
    flex: 1,
  },
  teamActions: {
    flexDirection: 'row',
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  addPlayerButton: {
    flex: 1,
  },
  changeTeamButton: {
    flex: 1,
  },
  completeContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: SIZES.lg,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  completeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xl,
  },
  matchSummary: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    marginBottom: SIZES.xl,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: SIZES.md,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  readyStatus: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: SIZES.lg,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default AdminMatchSetupScreen;
