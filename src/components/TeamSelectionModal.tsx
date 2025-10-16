import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { teamService, Team } from '../services/teamService';

interface TeamSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onTeamSelected: (teamId: string, teamName: string) => void;
  playerName: string;
}

const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({
  visible,
  onClose,
  onTeamSelected,
  playerName,
}) => {
  const { user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const teamsData = await teamService.getTeamsByMember(user.phoneNumber);
      setTeams(teamsData);
    } catch (error) {
      console.error('❌ Failed to load teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadTeams();
    }
  }, [visible, user]);

  const handleTeamSelect = (team: Team) => {
    onTeamSelected(team.id, team.name);
    onClose();
  };

  const renderTeamItem = ({ item: team }: { item: Team }) => {
    const isOwner = team.ownerId === user?.phoneNumber;
    
    return (
      <TouchableOpacity
        style={styles.teamItem}
        onPress={() => handleTeamSelect(team)}
      >
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.description && (
            <Text style={styles.teamDescription}>{team.description}</Text>
          )}
          {team.location && (
            <Text style={styles.teamLocation}>📍 {team.location}</Text>
          )}
          <Text style={styles.teamId}>ID: {team.id}</Text>
        </View>
        <View style={styles.teamStatus}>
          <Text style={[styles.teamStatusText, isOwner && styles.ownerStatusText]}>
            {isOwner ? '👑 Owner' : 'Member'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Team</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Add <Text style={styles.playerName}>{playerName}</Text> to which team?
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading your teams...</Text>
            </View>
          ) : teams.length === 0 ? (
            <View style={styles.noTeamsContainer}>
              <Text style={styles.noTeamsText}>You are not in any teams yet</Text>
              <Text style={styles.noTeamsSubtext}>Create a team first to add players</Text>
            </View>
          ) : (
            <FlatList
              data={teams}
              keyExtractor={(item) => item.id}
              renderItem={renderTeamItem}
              style={styles.teamsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerName: {
    fontWeight: '600',
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noTeamsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTeamsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noTeamsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  teamsList: {
    flex: 1,
  },
  teamItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teamLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  teamId: {
    fontSize: 12,
    color: '#999',
  },
  teamStatus: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ownerStatusText: {
    color: '#333',
  },
});

export default TeamSelectionModal;