import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { liveScoringService } from '../services/liveScoringService';
import TeamCreationForm from '../components/TeamCreationForm';
import PlayerSearchScreen from './PlayerSearchScreen';

interface Team {
  id: string;
  name: string;
  shortName: string;
  city: string;
}

interface TeamSelectionScreenProps {
  onTeamSelected: (team: Team) => void;
  onBack: () => void;
}

const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({ onTeamSelected, onBack }) => {
  const [activeTab, setActiveTab] = useState<'myTeams' | 'opponents' | 'create'>('myTeams');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState<Team | null>(null);

  // Load teams from Firebase
  React.useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const firebaseTeams = await liveScoringService.getTeams();
      setTeams(firebaseTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      // Fallback to mock data if Firebase fails
      setTeams([
        { id: '1', name: 'Mumbai Indians', shortName: 'MI', city: 'Mumbai' },
        { id: '2', name: 'Chennai Super Kings', shortName: 'CSK', city: 'Chennai' },
        { id: '3', name: 'Royal Challengers', shortName: 'RCB', city: 'Bangalore' },
        { id: '4', name: 'Delhi Capitals', shortName: 'DC', city: 'Delhi' },
        { id: '5', name: 'Kolkata Knight Riders', shortName: 'KKR', city: 'Kolkata' },
        { id: '6', name: 'Punjab Kings', shortName: 'PBKS', city: 'Punjab' },
        { id: '7', name: 'Rajasthan Royals', shortName: 'RR', city: 'Jaipur' },
        { id: '8', name: 'Sunrisers Hyderabad', shortName: 'SRH', city: 'Hyderabad' },
        { id: '9', name: 'Gujarat Titans', shortName: 'GT', city: 'Ahmedabad' },
        { id: '10', name: 'Lucknow Super Giants', shortName: 'LSG', city: 'Lucknow' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // For now, split teams into "my teams" and "opponents" randomly
  // In real app, this would be based on user's team memberships
  const myTeams = teams.slice(0, Math.ceil(teams.length / 2));
  const opponentTeams = teams.slice(Math.ceil(teams.length / 2));

  const handleTeamCreate = async (newTeam: { name: string; shortName: string; city: string }) => {
    console.log('New team created:', newTeam);
    setShowCreateForm(false);
    setActiveTab('myTeams');
    // Refresh teams list from Firebase
    await loadTeams();
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeamForPlayers(team);
    setShowPlayerSearch(true);
  };

  const handlePlayerAdded = (player: any) => {
    console.log('Player added to team:', player);
    // You could show a success message here
  };

  const handlePlayerSearchBack = () => {
    setShowPlayerSearch(false);
    setSelectedTeamForPlayers(null);
  };

  const filteredTeams = (teams: Team[]) => {
    if (!searchQuery.trim()) return teams;
    return teams.filter(team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderTeamCard = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleTeamSelect(item)}
    >
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamShortName}>({item.shortName})</Text>
        <Text style={styles.teamCity}>📍 {item.city}</Text>
      </View>
      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'myTeams':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>My Teams</Text>
            <Text style={styles.tabDescription}>Teams you have played with before</Text>
            <FlatList
              data={filteredTeams(myTeams)}
              renderItem={renderTeamCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No teams found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search</Text>
                </View>
              }
            />
          </View>
        );

      case 'opponents':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Opponents</Text>
            <Text style={styles.tabDescription}>Other teams you can play against</Text>
            <FlatList
              data={filteredTeams(opponentTeams)}
              renderItem={renderTeamCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No teams found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search</Text>
                </View>
              }
            />
          </View>
        );

      case 'create':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Create New Team</Text>
            <Text style={styles.tabDescription}>Create a new team to play with</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.createButtonText}>+ Create New Team</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (showPlayerSearch && selectedTeamForPlayers) {
    return (
      <PlayerSearchScreen
        teamId={selectedTeamForPlayers.id}
        teamName={selectedTeamForPlayers.name}
        onPlayerAdded={handlePlayerAdded}
        onBack={handlePlayerSearchBack}
      />
    );
  }

  if (showCreateForm) {
    return (
      <TeamCreationForm
        onTeamCreated={handleTeamCreate}
        onCancel={() => setShowCreateForm(false)}
        existingTeams={teams}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Team</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myTeams' && styles.activeTab]}
          onPress={() => setActiveTab('myTeams')}
        >
          <Text style={[styles.tabText, activeTab === 'myTeams' && styles.activeTabText]}>
            My Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'opponents' && styles.activeTab]}
          onPress={() => setActiveTab('opponents')}
        >
          <Text style={[styles.tabText, activeTab === 'opponents' && styles.activeTabText]}>
            Opponents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  tabContent: {
    gap: SIZES.lg,
  },
  tabTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  tabDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  teamShortName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  teamCity: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default TeamSelectionScreen;
