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
import { REAL_CRICKET_TEAMS } from '../data/realCricketData';
import { liveScoringService } from '../services/liveScoringService';
// import { UI_CONFIG } from '../config/appConfig';

interface StartMatchScreenProps {
  onBack: () => void;
  onNext: (teamA: string, teamB: string) => void;
}

const StartMatchScreen: React.FC<StartMatchScreenProps> = ({ onBack, onNext }) => {
  const [selectedTeamA, setSelectedTeamA] = useState<string>('');
  const [selectedTeamB, setSelectedTeamB] = useState<string>('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load teams from Firebase and combine with real cricket teams
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      
      // Load teams from Firebase (user-created teams)
      const firebaseTeams = await liveScoringService.getAllTeams();
      
      // Convert Firebase teams to our format
      const firebaseTeamsFormatted = firebaseTeams.map((team: any) => ({
        id: team.id,
        name: team.name,
        shortName: team.name.substring(0, 3).toUpperCase(), // Generate short name
        city: team.location || 'Unknown',
        logo: '🏏', // Default logo
        members: team.players?.length || 0,
        location: team.location || 'Unknown',
        isUserCreated: true
      }));

      // Real cricket teams with professional players
      const realCricketTeams = REAL_CRICKET_TEAMS.map((team: any) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        logo: team.logo,
        members: team.players.length,
        location: team.city,
        isUserCreated: false
      }));

      // Combine both: User-created teams first, then real cricket teams
      const combinedTeams = [...firebaseTeamsFormatted, ...realCricketTeams];
      setAllTeams(combinedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      // Fallback to just real cricket teams
      const realCricketTeams = REAL_CRICKET_TEAMS.map((team: any) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        logo: team.logo,
        members: team.players.length,
        location: team.city,
        isUserCreated: false
      }));
      setAllTeams(realCricketTeams);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search query
  const filteredTeams = allTeams.filter((team: any) => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamSelect = (teamId: string) => {
    if (selectingFor === 'A') {
      setSelectedTeamA(teamId);
      if (teamId === selectedTeamB) {
        setSelectedTeamB('');
      }
    } else {
      setSelectedTeamB(teamId);
      if (teamId === selectedTeamA) {
        setSelectedTeamA('');
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

    const teamA = allTeams.find((t: any) => t.id === selectedTeamA);
    const teamB = allTeams.find((t: any) => t.id === selectedTeamB);
    
    if (teamA && teamB) {
      onNext(teamA.name, teamB.name);
    }
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
                  {allTeams.find((t: any) => t.id === selectedTeamA)?.logo}
                </Text>
                <View>
                  <Text style={styles.teamName}>
                    {allTeams.find((t: any) => t.id === selectedTeamA)?.name}
                  </Text>
                  <Text style={styles.teamShortName}>
                    {allTeams.find((t: any) => t.id === selectedTeamA)?.shortName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setSelectedTeamA('')}
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
                  {allTeams.find((t: any) => t.id === selectedTeamB)?.logo}
                </Text>
                <View>
                  <Text style={styles.teamName}>
                    {allTeams.find((t: any) => t.id === selectedTeamB)?.name}
                  </Text>
                  <Text style={styles.teamShortName}>
                    {allTeams.find((t: any) => t.id === selectedTeamB)?.shortName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setSelectedTeamB('')}
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
            
            <ScrollView style={styles.teamList}>
              {filteredTeams.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No teams found</Text>
                  <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                </View>
              ) : (
                filteredTeams.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamCard,
                      (selectedTeamA === team.id || selectedTeamB === team.id) && styles.selectedTeamCard
                    ]}
                    onPress={() => handleTeamSelect(team.id)}
                  >
                    <View style={styles.teamInfo}>
                      <View style={styles.teamHeader}>
                        <Text style={styles.teamLogo}>{team.logo}</Text>
                        <View style={styles.teamDetails}>
                          <Text style={styles.teamCardName}>{team.name}</Text>
                          <Text style={styles.teamShortName}>{team.shortName}</Text>
                          {team.isUserCreated && (
                            <Text style={styles.userCreatedTag}>Your Team</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.teamLocation}>{team.location}</Text>
                      <Text style={styles.teamMembers}>{team.members} players</Text>
                    </View>
                    {(selectedTeamA === team.id || selectedTeamB === team.id) && (
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
