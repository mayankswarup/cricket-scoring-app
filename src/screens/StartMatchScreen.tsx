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
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService, Team, Player } from '../services/liveScoringService';
import { initializeDemoData, MANUAL_TEST_TEAMS } from '../utils/demoData';
// import { UI_CONFIG } from '../config/appConfig';

interface StartMatchScreenProps {
  onBack: () => void;
  onNext: (teamA: Team, teamB: Team) => void;
  onCreateTeam?: () => void;
}

const StartMatchScreen: React.FC<StartMatchScreenProps> = ({ onBack, onNext, onCreateTeam }) => {
  const [selectedTeamA, setSelectedTeamA] = useState<Team | null>(null);
  const [selectedTeamB, setSelectedTeamB] = useState<Team | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Load teams from Firebase and combine with real cricket teams
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);

      let firebaseTeams = await liveScoringService.getAllTeams();

      if (!firebaseTeams.length) {
        console.log('⚠️ No teams found in Firestore. Seeding demo data...');
        await initializeDemoData();
        firebaseTeams = await liveScoringService.getAllTeams();
      }

      let sanitizedTeams: Team[] = firebaseTeams
        .map((team: Team) => ({
          id: team.id,
          name: team.name,
          shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
          city: team.city,
          logo: team.logo,
          players: (team.players || []).map((player) => ({
            id: player.id,
            name: player.name,
            role: player.role || 'batsman',
            shortName: player.shortName || player.name,
            battingStyle: player.battingStyle,
            bowlingStyle: player.bowlingStyle,
            nationality: player.nationality,
            jerseyNumber: player.jerseyNumber,
            isCaptain: player.isCaptain,
            isWicketKeeper: player.isWicketKeeper,
          })) as Player[],
          captain: team.captain,
          wicketKeeper: team.wicketKeeper,
          coach: team.coach,
        }))
        .filter((team) => team.players && team.players.length >= 11);

      if (!sanitizedTeams.length) {
        console.log('⚠️ Firestore still empty after seeding. Falling back to manual teams.');
        const manualFallback: Team[] = MANUAL_TEST_TEAMS.map((team) => ({
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          city: team.city,
          logo: team.logo,
          players: team.players.map((player) => ({
            id: player.id,
            name: player.name,
            role: player.role,
            shortName: player.name.split(' ')[0] || player.name,
            battingStyle: player.battingStyle,
            bowlingStyle: player.bowlingStyle,
            nationality: undefined,
            jerseyNumber: undefined,
            isCaptain: player.isCaptain,
            isWicketKeeper: player.isWicketKeeper,
          })),
          captain: team.players.find((player) => player.isCaptain)?.id,
          wicketKeeper: team.players.find((player) => player.isWicketKeeper)?.id,
          coach: undefined,
        }));
        sanitizedTeams = manualFallback;
      }

      const sortedTeams = sanitizedTeams.sort((a, b) => a.name.localeCompare(b.name));
      setAllTeams(sortedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      setAllTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search query
  const filteredTeams = allTeams.filter((team: Team) => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.shortName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamSelect = (team: Team) => {
    if (selectingFor === 'A') {
      setSelectedTeamA(team);
      if (team.id === selectedTeamB?.id) {
        setSelectedTeamB(null);
      }
    } else {
      setSelectedTeamB(team);
      if (team.id === selectedTeamA?.id) {
        setSelectedTeamA(null);
      }
    }
    setShowTeamModal(false);
    setSearchQuery('');
  };

  const openTeamModal = (forTeam: 'A' | 'B') => {
    setSelectingFor(forTeam);
    setShowTeamModal(true);
    setSearchQuery('');
  };

  const handleNext = () => {
    if (!selectedTeamA || !selectedTeamB) {
      Alert.alert('Error', 'Please select both teams');
      return;
    }

    if (!selectedTeamA.players || selectedTeamA.players.length < 11) {
      Alert.alert('Team A Incomplete', 'Selected Team A does not have at least 11 players.');
      return;
    }

    if (!selectedTeamB.players || selectedTeamB.players.length < 11) {
      Alert.alert('Team B Incomplete', 'Selected Team B does not have at least 11 players.');
      return;
    }
    
    onNext(selectedTeamA, selectedTeamB);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Start A Match</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        ) : (
          <>
            {/* Team A Selection */}
            <View style={styles.teamSection}>
          <View style={styles.teamIcon}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => openTeamModal('A')}
          >
            <Text style={styles.selectButtonText}>SELECT TEAM A</Text>
          </TouchableOpacity>
          
          {selectedTeamA && (
            <View style={styles.selectedTeam}>
              <View style={styles.selectedTeamInfo}>
                <Text style={styles.selectedTeamLogo}>
                  {selectedTeamA.logo || '🏏'}
                </Text>
                <View>
                  <Text style={styles.teamName}>
                    {selectedTeamA.name}
                  </Text>
                  <Text style={styles.teamShortName}>
                    {selectedTeamA.shortName || selectedTeamA.name.slice(0, 3).toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setSelectedTeamA(null)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* VS Separator */}
        <View style={styles.vsContainer}>
          <View style={styles.vsLine} />
          <View style={styles.vsBox}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        </View>

        {/* Team B Selection */}
        <View style={styles.teamSection}>
          <View style={styles.teamIcon}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => openTeamModal('B')}
          >
            <Text style={styles.selectButtonText}>SELECT TEAM B</Text>
          </TouchableOpacity>
          
          {selectedTeamB && (
            <View style={styles.selectedTeam}>
              <View style={styles.selectedTeamInfo}>
                <Text style={styles.selectedTeamLogo}>
                  {selectedTeamB.logo || '🏏'}
                </Text>
                <View>
                  <Text style={styles.teamName}>
                    {selectedTeamB.name}
                  </Text>
                  <Text style={styles.teamShortName}>
                    {selectedTeamB.shortName || selectedTeamB.name.slice(0, 3).toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setSelectedTeamB(null)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Team Selection Modal */}
        <Modal visible={showTeamModal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Select Team {selectingFor}
              </Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            
            {/* Create New Team Button */}
            {onCreateTeam && (
              <TouchableOpacity 
                style={styles.createTeamButton}
                onPress={() => {
                  setShowTeamModal(false);
                  onCreateTeam();
                }}
              >
                <Text style={styles.createTeamIcon}>➕</Text>
                <Text style={styles.createTeamText}>Create New Team</Text>
              </TouchableOpacity>
            )}
            
            <ScrollView style={styles.teamList}>
              {filteredTeams.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No teams found</Text>
                  <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                </View>
              ) : (
                filteredTeams.map((team: Team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamCard,
                      (selectedTeamA?.id === team.id || selectedTeamB?.id === team.id) && styles.selectedTeamCard
                    ]}
                    onPress={() => handleTeamSelect(team)}
                  >
                    <View style={styles.teamInfo}>
                      <View style={styles.teamHeader}>
                        <Text style={styles.teamLogo}>{team.logo || '🏏'}</Text>
                        <View style={styles.teamDetails}>
                          <Text style={styles.teamCardName}>{team.name}</Text>
                          <Text style={styles.teamShortName}>{team.shortName || team.name.slice(0, 3).toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.teamLocation}>{team.city || 'Unknown location'}</Text>
                      <Text style={styles.teamMembers}>
                        {(team.players && team.players.length) || 0} players
                      </Text>
                    </View>
                    {(selectedTeamA?.id === team.id || selectedTeamB?.id === team.id) && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B4513',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  nextButton: {
    padding: SIZES.sm,
  },
  nextButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  teamSection: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  teamIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  plusIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  selectButton: {
    backgroundColor: '#28a745',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  selectedTeam: {
    marginTop: SIZES.md,
    alignItems: 'center',
  },
  selectedTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  selectedTeamLogo: {
    fontSize: 32,
    marginRight: SIZES.sm,
  },
  teamName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333333',
    marginBottom: SIZES.sm,
  },
  changeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  vsLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
  },
  vsBox: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 4,
    marginTop: -10,
  },
  vsText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333333',
    marginBottom: SIZES.md,
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTeamCard: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  teamInfo: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  teamLogo: {
    fontSize: 24,
    marginRight: SIZES.sm,
  },
  teamDetails: {
    flex: 1,
  },
  teamShortName: {
    fontSize: 12,
    color: '#666',
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  userCreatedTag: {
    fontSize: 10,
    color: '#28a745',
    fontFamily: FONTS.bold,
    marginTop: 2,
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  teamCardName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#333333',
    marginBottom: SIZES.xs,
  },
  teamLocation: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B4513',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SIZES.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  createTeamButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTeamIcon: {
    fontSize: 20,
    marginRight: SIZES.sm,
  },
  createTeamText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  teamList: {
    flex: 1,
    padding: SIZES.lg,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333333',
    marginBottom: SIZES.sm,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  teamMembers: {
    fontSize: 12,
    color: '#999',
    marginTop: SIZES.xs,
  },
});

export default StartMatchScreen;
