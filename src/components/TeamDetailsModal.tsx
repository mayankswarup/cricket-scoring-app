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
import { teamService, Team, TeamMember } from '../services/teamService';
import { userProfileService } from '../services/userProfileService';

interface TeamDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface TeamMemberWithDetails extends TeamMember {
  name?: string;
  phoneNumber?: string;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  visible,
  onClose,
  teamId,
  teamName,
}) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Loading team details for ID: ${teamId}, Name: ${teamName}`);
      const teamData = await teamService.getTeamById(teamId);
      
      if (!teamData) {
        Alert.alert('Error', 'Team not found');
        onClose();
        return;
      }
      
      setTeam(teamData);
      console.log(`🔍 Team data loaded - Name: ${teamData.name}, ID: ${teamData.id}`);
      
      // Clean up any duplicate members first
      let currentTeamData = teamData;
      try {
        await teamService.removeDuplicateMembers(teamId);
        // Reload team data after cleanup
        const cleanedTeamData = await teamService.getTeamById(teamId);
        if (cleanedTeamData) {
          currentTeamData = cleanedTeamData;
          setTeam(cleanedTeamData);
        }
      } catch (error) {
        console.error('❌ Failed to clean up duplicates:', error);
        // Continue with original data if cleanup fails
      }
      
      // Get member details
      const membersWithDetails: TeamMemberWithDetails[] = [];
      
      console.log(`🔍 Team has ${currentTeamData.members.length} total members`);
      console.log(`🔍 Active members: ${currentTeamData.members.filter(m => m.isActive).length}`);
      
      for (const member of currentTeamData.members) {
        console.log(`🔍 Processing member: ${member.playerId}, isActive: ${member.isActive}, role: ${member.role}`);
        if (member.isActive) {
          try {
            // Normalize phone number - ensure it has +91 prefix
            let normalizedPhoneNumber = member.playerId;
            if (!normalizedPhoneNumber.startsWith('+91')) {
              if (normalizedPhoneNumber.startsWith('91')) {
                normalizedPhoneNumber = '+' + normalizedPhoneNumber;
              } else {
                normalizedPhoneNumber = '+91' + normalizedPhoneNumber;
              }
            }
            
            console.log(`🔍 Looking up profile for: ${member.playerId} -> ${normalizedPhoneNumber}`);
            
            // Get user profile for member details
            const userProfile = await userProfileService.getUserProfile(normalizedPhoneNumber);
            membersWithDetails.push({
              ...member,
              name: userProfile?.name || `User ${member.playerId.slice(-4)}`,
              phoneNumber: userProfile?.phoneNumber || normalizedPhoneNumber,
            });
          } catch (error) {
            console.error(`❌ Failed to load details for member ${member.playerId}:`, error);
            // Add member without details
            membersWithDetails.push({
              ...member,
              name: `User ${member.playerId.slice(-4)}`,
              phoneNumber: member.playerId,
            });
          }
        }
      }
      
      console.log(`✅ Loaded ${membersWithDetails.length} members with details`);
      console.log(`📋 Members:`, membersWithDetails.map(m => ({ name: m.name, phone: m.phoneNumber, role: m.role })));
      setMembers(membersWithDetails);
    } catch (error) {
      console.error('❌ Failed to load team details:', error);
      Alert.alert('Error', 'Failed to load team details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && teamId) {
      loadTeamDetails();
    }
  }, [visible, teamId]);

  const renderMemberItem = ({ item: member }: { item: TeamMemberWithDetails }) => {
    const isCaptain = member.role === 'captain';
    const isOwner = team?.ownerId === member.playerId;
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberPhone}>{member.phoneNumber}</Text>
          <Text style={styles.memberJoined}>
            Joined: {new Date(member.joinedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.memberStatus}>
          {isOwner && (
            <Text style={styles.ownerBadge}>👑 Owner</Text>
          )}
          {isCaptain && !isOwner && (
            <Text style={styles.captainBadge}>🏆 Captain</Text>
          )}
          {!isCaptain && !isOwner && (
            <Text style={styles.memberBadge}>Member</Text>
          )}
        </View>
      </View>
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
          <Text style={styles.title}>Team Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team?.name || teamName}</Text>
            {team?.description && (
              <Text style={styles.teamDescription}>{team.description}</Text>
            )}
            {team?.location && (
              <Text style={styles.teamLocation}>📍 {team.location}</Text>
            )}
            <Text style={styles.memberCount}>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading team members...</Text>
            </View>
          ) : members.length === 0 ? (
            <View style={styles.noMembersContainer}>
              <Text style={styles.noMembersText}>No members in this team yet</Text>
              <Text style={styles.noMembersSubtext}>Add players to get started!</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberItem}
              style={styles.membersList}
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
  teamInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teamLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
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
  noMembersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMembersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noMembersSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
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
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberJoined: {
    fontSize: 12,
    color: '#999',
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  ownerBadge: {
    backgroundColor: '#ffc107',
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  captainBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  memberBadge: {
    backgroundColor: '#6c757d',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TeamDetailsModal;
