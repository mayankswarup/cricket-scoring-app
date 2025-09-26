import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { APP_CONFIG, UI_CONFIG, MATCH_CONFIG } from '../config/appConfig';
import { liveScoringService, Match, Team, Player } from '../services/liveScoringService';

interface MatchManagementScreenProps {
  onBack: () => void;
  onStartMatch: (matchId: string) => void;
}

const MatchManagementScreen: React.FC<MatchManagementScreenProps> = ({ 
  onBack, 
  onStartMatch 
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreatePlayer, setShowCreatePlayer] = useState(false);

  // Create Match Form
  const [newMatch, setNewMatch] = useState({
    name: '',
    team1Id: '',
    team2Id: '',
    matchType: 'T20',
    totalOvers: 20,
  });

  // Create Team Form
  const [newTeam, setNewTeam] = useState({
    name: '',
    players: [] as string[],
    captain: '',
    wicketKeeper: '',
  });

  // Create Player Form
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    role: 'batsman' as 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper',
  });

  useEffect(() => {
    loadData();
    // Create demo data if no teams exist
    createDemoDataIfNeeded();
  }, []);

  const createDemoDataIfNeeded = async () => {
    try {
      // Check if we have any teams
      const existingTeams = await liveScoringService.getAllTeams();
      if (existingTeams.length === 0) {
        console.log('🎮 Creating demo data...');
        
        // Create sample players first
        const playerIds = [];
        for (const player of [
          { name: 'Virat Kohli', role: 'batsman' as const },
          { name: 'Rohit Sharma', role: 'batsman' as const },
          { name: 'MS Dhoni', role: 'wicket-keeper' as const },
          { name: 'Jasprit Bumrah', role: 'bowler' as const },
          { name: 'Ravindra Jadeja', role: 'all-rounder' as const },
        ]) {
          const playerId = await liveScoringService.createPlayer(player);
          playerIds.push(playerId);
        }

        // Create sample teams
        await liveScoringService.createTeam({
          name: 'Team India',
          players: playerIds.slice(0, 3).map(id => ({ id, name: '', role: 'batsman' as const })),
          captain: playerIds[0],
          wicketKeeper: playerIds[2],
        });

        await liveScoringService.createTeam({
          name: 'Team Australia',
          players: playerIds.slice(2, 5).map(id => ({ id, name: '', role: 'batsman' as const })),
          captain: playerIds[2],
          wicketKeeper: playerIds[2],
        });

        console.log('✅ Demo data created successfully');
        // Reload data
        loadData();
      }
    } catch (error) {
      console.error('Error creating demo data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData, playersData] = await Promise.all([
        liveScoringService.getAllMatches(),
        liveScoringService.getAllTeams(),
        liveScoringService.getAllPlayers(),
      ]);
      
      setMatches(matchesData);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    console.log('🏏 Creating match with data:', newMatch);
    console.log('🏏 Available teams:', teams);
    
    if (!newMatch.name || !newMatch.team1Id || !newMatch.team2Id) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (newMatch.team1Id === newMatch.team2Id) {
      Alert.alert('Error', 'Please select different teams');
      return;
    }

    setCreatingMatch(true);
    try {
      const team1 = teams.find(t => t.id === newMatch.team1Id);
      const team2 = teams.find(t => t.id === newMatch.team2Id);

      console.log('🏏 Selected teams:', { team1, team2 });

      if (!team1 || !team2) {
        Alert.alert('Error', 'Selected teams not found');
        return;
      }

      const matchData = {
        name: newMatch.name,
        team1,
        team2,
        matchType: newMatch.matchType,
        totalOvers: newMatch.totalOvers,
        currentInnings: 1,
        status: 'upcoming' as const,
        createdBy: 'current-user', // TODO: Get from auth
        isLive: false,
      };

      console.log('🏏 Creating match with data:', matchData);
      const matchId = await liveScoringService.createMatch(matchData);
      console.log('✅ Match created with ID:', matchId);
      
      Alert.alert('Success', 'Match created successfully!');
      setShowCreateMatch(false);
      setNewMatch({
        name: '',
        team1Id: '',
        team2Id: '',
        matchType: 'T20',
        totalOvers: 20,
      });
      loadData();
    } catch (error) {
      console.error('❌ Error creating match:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to create match: ${errorMessage}`);
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      Alert.alert('Error', 'Please enter team name');
      return;
    }

    try {
      const teamData = {
        name: newTeam.name,
        players: players.filter(p => newTeam.players.includes(p.id)),
        captain: newTeam.captain,
        wicketKeeper: newTeam.wicketKeeper,
      };

      await liveScoringService.createTeam(teamData);
      Alert.alert('Success', 'Team created successfully!');
      setShowCreateTeam(false);
      setNewTeam({
        name: '',
        players: [],
        captain: '',
        wicketKeeper: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayer.name) {
      Alert.alert('Error', 'Please enter player name');
      return;
    }

    try {
      await liveScoringService.createPlayer(newPlayer);
      Alert.alert('Success', 'Player created successfully!');
      setShowCreatePlayer(false);
      setNewPlayer({
        name: '',
        role: 'batsman',
      });
      loadData();
    } catch (error) {
      console.error('Error creating player:', error);
      Alert.alert('Error', 'Failed to create player');
    }
  };

  const handleStartMatch = async (match: Match) => {
    try {
      await liveScoringService.updateMatch(match.id, {
        status: 'live',
        isLive: true,
      });
      onStartMatch(match.id);
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  const handleDeleteMatch = async (match: Match) => {
    Alert.alert(
      'Delete Match',
      'Are you sure you want to delete this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete match
              Alert.alert('Success', 'Match deleted successfully!');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete match');
            }
          },
        },
      ]
    );
  };

  const renderMatch = ({ item: match }: { item: Match }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchName}>{match.name}</Text>
        <View style={styles.matchStatus}>
          <Text style={[
            styles.statusText,
            { color: match.status === 'live' ? UI_CONFIG.SUCCESS_COLOR : 
                     match.status === 'completed' ? UI_CONFIG.TEXT_COLOR : 
                     UI_CONFIG.WARNING_COLOR }
          ]}>
            {match.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.matchTeams}>
        <Text style={styles.teamText}>{match.team1.name}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamText}>{match.team2.name}</Text>
      </View>
      
      <View style={styles.matchDetails}>
        <Text style={styles.detailText}>{match.matchType}</Text>
        <Text style={styles.detailText}>{match.totalOvers} Overs</Text>
        <Text style={styles.detailText}>
          {new Date(match.createdAt.seconds * 1000).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.matchActions}>
        {match.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartMatch(match)}
          >
            <Text style={styles.startButtonText}>Start Match</Text>
          </TouchableOpacity>
        )}
        
        {match.status === 'live' && (
          <TouchableOpacity
            style={styles.liveButton}
            onPress={() => onStartMatch(match.id)}
          >
            <Text style={styles.liveButtonText}>Continue Scoring</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMatch(match)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏏 Match Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateMatch(true)}
          >
            <Text style={styles.actionButtonText}>➕ Create Match</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateTeam(true)}
          >
            <Text style={styles.actionButtonText}>👥 Create Team</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreatePlayer(true)}
          >
            <Text style={styles.actionButtonText}>👤 Add Player</Text>
          </TouchableOpacity>
        </View>

        {/* Matches List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matches ({matches.length})</Text>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No matches found</Text>
              <Text style={styles.emptySubtext}>Create your first match to get started</Text>
            </View>
          ) : (
            <FlatList
              data={matches}
              renderItem={renderMatch}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Teams List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams ({teams.length})</Text>
          {teams.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No teams found</Text>
              <Text style={styles.emptySubtext}>Create your first team to get started</Text>
            </View>
          ) : (
            <View style={styles.teamsList}>
              {teams.map((team) => (
                <View key={team.id} style={styles.teamCard}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamPlayers}>{team.players.length} players</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Match Modal */}
      <Modal visible={showCreateMatch} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Match</Text>
            <TouchableOpacity onPress={() => setShowCreateMatch(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Match Name"
              value={newMatch.name}
              onChangeText={(text) => setNewMatch({ ...newMatch, name: text })}
            />
            
            <Text style={styles.label}>Team 1</Text>
            <View style={styles.picker}>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.pickerOption,
                    newMatch.team1Id === team.id && styles.selectedOption
                  ]}
                  onPress={() => setNewMatch({ 
                    ...newMatch, 
                    team1Id: team.id,
                    team2Id: team.id === newMatch.team2Id ? '' : newMatch.team2Id
                  })}
                >
                  <Text style={styles.pickerOptionText}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Team 2</Text>
            <View style={styles.picker}>
              {teams.filter(team => team.id !== newMatch.team1Id).map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.pickerOption,
                    newMatch.team2Id === team.id && styles.selectedOption
                  ]}
                  onPress={() => setNewMatch({ ...newMatch, team2Id: team.id })}
                >
                  <Text style={styles.pickerOptionText}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Match Type</Text>
            <View style={styles.picker}>
              {Object.values(MATCH_CONFIG).map((type) => (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.pickerOption,
                    newMatch.matchType === type.name && styles.selectedOption
                  ]}
                  onPress={() => setNewMatch({ 
                    ...newMatch, 
                    matchType: type.name,
                    totalOvers: type.overs 
                  })}
                >
                  <Text style={styles.pickerOptionText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateMatch(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, creatingMatch && styles.disabledButton]}
              onPress={handleCreateMatch}
              disabled={creatingMatch}
            >
              <Text style={styles.createButtonText}>
                {creatingMatch ? 'Creating...' : 'Create Match'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Team Modal */}
      <Modal visible={showCreateTeam} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Team</Text>
            <TouchableOpacity onPress={() => setShowCreateTeam(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              value={newTeam.name}
              onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
            />
            
            <Text style={styles.label}>Select Players</Text>
            <View style={styles.playersList}>
              {players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerOption,
                    newTeam.players.includes(player.id) && styles.selectedPlayer
                  ]}
                  onPress={() => {
                    const updatedPlayers = newTeam.players.includes(player.id)
                      ? newTeam.players.filter(id => id !== player.id)
                      : [...newTeam.players, player.id];
                    setNewTeam({ ...newTeam, players: updatedPlayers });
                  }}
                >
                  <Text style={styles.playerOptionText}>
                    {player.name} ({player.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateTeam(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTeam}
            >
              <Text style={styles.createButtonText}>Create Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Player Modal */}
      <Modal visible={showCreatePlayer} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Player</Text>
            <TouchableOpacity onPress={() => setShowCreatePlayer(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Player Name"
              value={newPlayer.name}
              onChangeText={(text) => setNewPlayer({ ...newPlayer, name: text })}
            />
            
            <Text style={styles.label}>Player Role</Text>
            <View style={styles.picker}>
              {['batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.pickerOption,
                    newPlayer.role === role && styles.selectedOption
                  ]}
                  onPress={() => setNewPlayer({ ...newPlayer, role: role as any })}
                >
                  <Text style={styles.pickerOptionText}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreatePlayer(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePlayer}
            >
              <Text style={styles.createButtonText}>Add Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  refreshButton: {
    padding: SIZES.sm,
  },
  refreshButtonText: {
    fontSize: 18,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: UI_CONFIG.TEXT_COLOR,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SIZES.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginHorizontal: SIZES.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.md,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  matchName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    flex: 1,
  },
  matchStatus: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  teamText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.PRIMARY_COLOR,
    marginHorizontal: SIZES.md,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  detailText: {
    fontSize: 14,
    color: UI_CONFIG.TEXT_COLOR,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: UI_CONFIG.SUCCESS_COLOR,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    flex: 1,
    marginRight: SIZES.sm,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  liveButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    flex: 1,
    marginRight: SIZES.sm,
    alignItems: 'center',
  },
  liveButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  deleteButton: {
    backgroundColor: UI_CONFIG.ERROR_COLOR,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  teamsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    marginRight: SIZES.sm,
    marginBottom: SIZES.sm,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
    shadowRadius: 2,
    elevation: 2,
  },
  teamName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.xs,
  },
  teamPlayers: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.white,
  },
  modalContent: {
    flex: 1,
    padding: SIZES.lg,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  picker: {
    marginBottom: SIZES.lg,
  },
  pickerOption: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    borderColor: UI_CONFIG.PRIMARY_COLOR,
  },
  pickerOptionText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
  },
  playersList: {
    marginBottom: SIZES.lg,
  },
  playerOption: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPlayer: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    borderColor: UI_CONFIG.PRIMARY_COLOR,
  },
  playerOptionText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginRight: SIZES.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  createButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginLeft: SIZES.sm,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});

export default MatchManagementScreen;
