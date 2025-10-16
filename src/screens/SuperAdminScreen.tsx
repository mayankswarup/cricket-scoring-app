import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { teamService } from '../services/teamService';

interface SuperAdminScreenProps {
  onBack: () => void;
}

const SuperAdminScreen: React.FC<SuperAdminScreenProps> = ({ onBack }) => {
  const { user } = useUser();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Platform-specific alert function
  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 0) {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        alert(`${title}\n\n${message}`);
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Super Admin: Loading all data...');
      
      // Load all users
      const users = await userProfileService.getAllUsersForAdmin();
      setAllUsers(users);
      
      // Load all teams (you'll need to implement this in teamService)
      // const teams = await teamService.getAllTeams();
      // setAllTeams(teams);
      
      console.log(`✅ Loaded ${users.length} users`);
    } catch (error) {
      console.error('❌ Failed to load admin data:', error);
      showAlert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.phoneNumber === '+919019078195') {
      showAlert('Cannot Delete', 'Cannot delete Super Admin account');
      return;
    }

    showAlert(
      'Delete User',
      `Are you sure you want to delete ${user.name} (${user.phoneNumber})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userProfileService.deleteUser(user.phoneNumber);
              showAlert('Success', 'User deleted successfully');
              loadAllData();
            } catch (error) {
              console.error('❌ Failed to delete user:', error);
              showAlert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleMakeCaptain = async (user: UserProfile, teamId: string) => {
    try {
      await userProfileService.makeUserCaptain(user.phoneNumber, teamId);
      showAlert('Success', `${user.name} is now captain of the team`);
    } catch (error) {
      console.error('❌ Failed to make user captain:', error);
      showAlert('Error', 'Failed to make user captain');
    }
  };

  const handleDeleteTeam = async (team: any) => {
    showAlert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This will remove all team members.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamService.deleteTeam(team.id);
              showAlert('Success', 'Team deleted successfully');
              loadAllData();
            } catch (error) {
              console.error('❌ Failed to delete team:', error);
              showAlert('Error', 'Failed to delete team');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  const renderUserItem = (user: UserProfile) => (
    <View key={user.phoneNumber} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{user.name}</Text>
        <Text style={styles.itemPhone}>{user.phoneNumber}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemDetail}>Pro: {user.isPro ? '✅' : '❌'}</Text>
        <Text style={styles.itemDetail}>Teams: {user.teamIds?.length || 0}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => handleDeleteUser(user)}
        >
          <Text style={styles.actionButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            setSelectedUser(user);
            setShowUserModal(true);
          }}
        >
          <Text style={styles.actionButtonText}>👑 Make Captain</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Super Admin</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👑 Super Admin</Text>
        <TouchableOpacity onPress={loadAllData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Users ({filteredUsers.length})</Text>
          {filteredUsers.map(renderUserItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Teams (Coming Soon)</Text>
          <Text style={styles.comingSoonText}>
            🚧 Team management features coming soon!
          </Text>
        </View>
      </ScrollView>

      {/* User Management Modal */}
      <Modal
        visible={showUserModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage User</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Name: {selectedUser.name}</Text>
                <Text style={styles.modalText}>Phone: {selectedUser.phoneNumber}</Text>
                <Text style={styles.modalText}>Pro: {selectedUser.isPro ? 'Yes' : 'No'}</Text>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    // Handle make captain logic
                    setShowUserModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Make Captain of Team</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  refreshButton: {
    padding: 10,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  itemDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  modalContent: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SuperAdminScreen;
