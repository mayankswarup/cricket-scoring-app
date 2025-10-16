import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { userProfileService } from '../services/userProfileService';
import { teamService } from '../services/teamService';

interface TeamCreationScreenProps {
  onBack: () => void;
  onTeamCreated: (teamId: string) => void;
}

const TeamCreationScreen: React.FC<TeamCreationScreenProps> = ({
  onBack,
  onTeamCreated,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    maxMembers: 15,
  });

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter team name');
      return;
    }

    if (formData.maxMembers < 5) {
      Alert.alert('Error', 'Maximum members must be at least 5');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a team');
      return;
    }

    try {
      setLoading(true);

        // Create team data
        const teamData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          maxMembers: formData.maxMembers,
          ownerId: user.phoneNumber,
          captainId: user.phoneNumber,
          members: [
            {
              id: `${Date.now()}_1`,
              playerId: user.phoneNumber,
              teamId: '', // Will be set after team creation
              role: 'captain' as const,
              joinedAt: new Date().toISOString(),
              isActive: true,
            }
          ],
          isActive: true,
        };
        
        console.log('🔍 Creating team with ownerId:', user.phoneNumber);

      // Create team in Firebase
      const teamId = await teamService.createTeam(teamData);
      
      // Update the team document with the correct teamId for the captain
      await teamService.addMemberToTeam(teamId, {
        playerId: user.phoneNumber,
        role: 'captain',
        joinedAt: new Date().toISOString(),
        isActive: true,
      });
      
      // Add user to team in their profile
      await userProfileService.addUserToTeam(user.phoneNumber, teamId);

      // Navigate to My Teams to show the newly created team
      onTeamCreated(teamId);

    } catch (error) {
      console.error('❌ Error creating team:', error);
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Team</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter team name"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe your team (optional)"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="City, State (optional)"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Members</Text>
            <TextInput
              style={styles.input}
              value={formData.maxMembers.toString()}
              onChangeText={(text) => {
                // Handle empty string
                if (text === '') {
                  setFormData({ ...formData, maxMembers: 15 });
                  return;
                }
                
                const num = parseInt(text);
                if (!isNaN(num)) {
                  // Always update the state, even if less than 5
                  // This allows typing and then validation can happen on submit
                  setFormData({ ...formData, maxMembers: num });
                }
              }}
              placeholder="15"
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>Minimum 5 members</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Rules</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>• You will be the team captain</Text>
            <Text style={styles.ruleText}>• You can invite players to join</Text>
            <Text style={styles.ruleText}>• You can manage team members</Text>
            <Text style={styles.ruleText}>• You can create matches for your team</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateTeam}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Team</Text>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rulesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamCreationScreen;