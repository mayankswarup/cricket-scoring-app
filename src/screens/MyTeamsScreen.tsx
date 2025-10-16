import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
  Modal,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { userProfileService } from '../services/userProfileService';
import { teamService, Team } from '../services/teamService';
import { matchAvailabilityService } from '../services/matchAvailabilityService';
import { addDummyPlayers, removeDuplicatePlayers } from '../utils/addDummyPlayers';
import TeamDetailsModal from '../components/TeamDetailsModal';

interface MyTeamsScreenProps {
  onBack: () => void;
  onCreateTeam: () => void;
}

interface TeamInfo {
  teamId: string;
  teamName: string;
  description?: string;
  location?: string;
  joinedAt: string;
  role?: string;
  isOwner?: boolean;
}

const MyTeamsScreen: React.FC<MyTeamsScreenProps> = ({
  onBack,
  onCreateTeam,
}) => {
  const { user } = useUser();
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<{ teamId: string; teamName: string } | null>(null);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [selectedTeamForMenu, setSelectedTeamForMenu] = useState<{ teamId: string; teamName: string; isOwner: boolean } | null>(null);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLeaveTeamAction, setIsLeaveTeamAction] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<{ teamId: string; teamName: string; description?: string; location?: string; maxMembers?: number } | null>(null);

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

  const loadTeams = async () => {
    if (!user) return;

    try {
      // Get teams where user is a member
      const teamsData = await teamService.getTeamsByMember(user.phoneNumber);
      
      // Convert to TeamInfo format
      const teamsInfo: TeamInfo[] = teamsData.map(team => {
        const userMember = team.members.find(member => 
          member.playerId === user.phoneNumber && member.isActive
        );
        
        const isOwner = team.ownerId === user.phoneNumber;
        console.log(`🔍 Team ${team.name}: ownerId=${team.ownerId}, userPhone=${user.phoneNumber}, isOwner=${isOwner}`);
        
        return {
          teamId: team.id,
          teamName: team.name,
          description: team.description,
          location: team.location,
          joinedAt: userMember?.joinedAt || team.createdAt,
          role: userMember?.role,
          isOwner: isOwner,
        };
      });
      
      console.log(`✅ Loaded ${teamsInfo.length} teams:`, teamsInfo.map(t => ({ name: t.teamName, isOwner: t.isOwner })));
      setTeams(teamsInfo);
    } catch (error: any) {
      console.error('❌ Failed to load teams:', error);
      
      // Check if it's a Firebase index error
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.log('🔄 Firebase index error detected, trying fallback...');
        try {
          const userTeams = await userProfileService.getUserTeams(user.phoneNumber);
          setTeams(userTeams);
          return;
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      // If Firebase query fails, try to get teams from user profile
      try {
        console.log('🔄 Trying fallback: getting teams from user profile...');
        const userTeams = await userProfileService.getUserTeams(user.phoneNumber);
        
        // Convert to TeamInfo format with proper ownership detection
        const teamsInfo: TeamInfo[] = userTeams.map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          description: undefined, // Not available in fallback
          location: undefined, // Not available in fallback
          joinedAt: team.joinedAt,
          role: 'member', // Default role
          isOwner: false, // We can't determine ownership from fallback
        }));
        
        setTeams(teamsInfo);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        showAlert('Error', 'Failed to load teams. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [user]);

  // Debug selectedTeamForMenu changes
  useEffect(() => {
    console.log(`🔍 selectedTeamForMenu changed:`, selectedTeamForMenu);
  }, [selectedTeamForMenu]);

  // Show success message if coming from team creation
  useEffect(() => {
    // Check if we have teams and show success message
    if (teams.length > 0) {
      const hasNewTeam = teams.some(team => {
        const teamCreatedDate = new Date(team.joinedAt);
        const now = new Date();
        const timeDiff = now.getTime() - teamCreatedDate.getTime();
        // If team was created within the last 5 minutes, consider it new
        return timeDiff < 5 * 60 * 1000;
      });
      
      if (hasNewTeam) {
        showAlert(
          'Team Created Successfully!',
          'Your new team has been created and you are now the captain.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [teams]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTeams();
  };

  const handleViewDetails = async (teamId: string, teamName: string) => {
    // Clean up duplicates before showing details
    try {
      console.log(`🧹 Cleaning up duplicates for team: ${teamName}`);
      await teamService.removeDuplicateMembers(teamId);
    } catch (error) {
      console.error('❌ Failed to clean up duplicates:', error);
      // Continue anyway
    }
    
    setSelectedTeamForDetails({ teamId, teamName });
    setShowTeamDetails(true);
  };

  const handleShowTeamMenu = (teamId: string, teamName: string, isOwner: boolean) => {
    setSelectedTeamForMenu({ teamId, teamName, isOwner });
    setShowTeamMenu(true);
  };

  const handleCloseTeamMenu = () => {
    setShowTeamMenu(false);
    // Don't reset selectedTeamForMenu here - it's needed for member selection
  };

  const handleMenuAction = (action: string) => {
    if (!selectedTeamForMenu) return;

    const { teamId, teamName, isOwner } = selectedTeamForMenu;
    
    // Close the main menu first
    handleCloseTeamMenu();
    
    // Then handle the action
    switch (action) {
      case 'leave':
        handleLeaveTeam(teamId, teamName, isOwner);
        break;
      case 'edit':
        handleEditTeam(teamId, teamName);
        break;
      case 'transfer':
        handleTransferCaptaincy(teamId, teamName);
        break;
      case 'delete':
        if (Platform.OS === 'web') {
          // eslint-disable-next-line no-alert
          const confirmed = typeof window !== 'undefined' && window.confirm(`Delete "${teamName}"? This will permanently remove the team and all members.`);
          if (confirmed) {
            handleDeleteTeam(teamId, teamName);
          }
        } else {
          handleDeleteTeam(teamId, teamName);
        }
        break;
    }
  };

  const handleLeaveTeam = (teamId: string, teamName: string, isOwner: boolean) => {
    if (isOwner) {
      // Owner wants to leave - they need to transfer ownership first
      // Set flag to indicate this is a leave team action
      setIsLeaveTeamAction(true);
      handleTransferCaptaincy(teamId, teamName);
    } else {
      // If user is not owner, show leave team option
      Alert.alert(
        'Leave Team',
        `Are you sure you want to leave "${teamName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              try {
                // Remove from team service
                await teamService.removeMemberFromTeam(teamId, user?.phoneNumber || '');
                // Remove from user profile
                await userProfileService.removeUserFromTeam(user?.phoneNumber || '', teamId);
                showAlert('Success', 'You have left the team');
                loadTeams(); // Refresh the list
              } catch (error) {
                console.error('❌ Failed to leave team:', error);
                showAlert('Error', 'Failed to leave team. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const handleCreateTestMemberTeam = async () => {
    try {
      // Create a test team where you're a member (not owner)
      const testTeamData = {
        name: 'Test Member Team',
        description: 'A team where you are a member, not owner',
        location: 'Test Location',
        maxMembers: 15,
        ownerId: user?.phoneNumber || '+919019078195', // Use current user as owner for test
        captainId: user?.phoneNumber || '+919019078195', // Same as owner for test
        members: [
          {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            teamId: '', // Will be set after team creation
            playerId: user?.phoneNumber || '',
            role: 'member' as const,
            joinedAt: new Date().toISOString(),
            isActive: true,
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      const teamId = await teamService.createTeam(testTeamData);
      console.log(`✅ Created test member team: ${teamId}`);
      
      // Add team to user profile
      await userProfileService.addUserToTeam(user?.phoneNumber || '', teamId);
      
      Alert.alert('Success', 'Test member team created! You can now test the "Leave Team" button.');
      loadTeams();
    } catch (error) {
      console.error('❌ Failed to create test member team:', error);
      Alert.alert('Error', 'Failed to create test member team');
    }
  };

  const handleTestMatchStart = async () => {
    try {
      // Simulate starting a match with current user only (no dummy opponent)
      const matchInfo = {
        matchId: `match_${Date.now()}`,
        homeTeam: [user?.phoneNumber || ''],
        awayTeam: [], // No dummy opponent to avoid Firebase errors
        startTime: new Date().toISOString(),
        status: 'live' as const
      };

      await matchAvailabilityService.startMatch(matchInfo);
      
      Alert.alert(
        'Match Started!', 
        'You are now marked as unavailable for team additions. Try adding yourself to a team to see the availability system in action.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to start test match:', error);
      Alert.alert('Error', 'Failed to start test match');
    }
  };

  const handleTestMatchEnd = async () => {
    try {
      // Simulate ending the match
      const matchInfo = {
        matchId: `match_${Date.now()}`,
        homeTeam: [user?.phoneNumber || ''],
        awayTeam: [], // No dummy opponent to avoid Firebase errors
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed' as const
      };

      await matchAvailabilityService.endMatch(matchInfo);
      
      Alert.alert(
        'Match Ended!', 
        'You are now available for team additions again.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to end test match:', error);
      Alert.alert('Error', 'Failed to end test match');
    }
  };

  const handleAddDummyPlayers = async () => {
    try {
      console.log('🚀 Adding 22 dummy players to Firebase...');
      await addDummyPlayers();
      
      Alert.alert(
        'Dummy Players Added!', 
        '22 dummy players have been added to Firebase. They are all available for team additions.\n\nNote: Existing players were skipped to prevent duplicates.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to add dummy players:', error);
      Alert.alert('Error', 'Failed to add dummy players. Check console for details.');
    }
  };

  const handleRemoveDuplicates = async () => {
    try {
      console.log('🧹 Removing duplicate players from Firebase...');
      await removeDuplicatePlayers();
      
      Alert.alert(
        'Duplicates Removed!', 
        'All duplicate players have been removed from Firebase. Each player now appears only once.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to remove duplicates:', error);
      Alert.alert('Error', 'Failed to remove duplicates. Check console for details.');
    }
  };

  const handleEditTeam = async (teamId: string, teamName: string) => {
    try {
      // Fetch the team details first
      const teamData = await teamService.getTeamById(teamId);
      
      if (!teamData) {
        showAlert('Error', 'Team not found');
        return;
      }
      
      // Set the team data for editing
      setSelectedTeamForEdit({
        teamId,
        teamName: teamData.name,
        description: teamData.description,
        location: teamData.location,
        maxMembers: teamData.maxMembers,
      });
      
      setShowEditTeam(true);
    } catch (error) {
      console.error('❌ Failed to load team data for editing:', error);
      showAlert('Error', 'Failed to load team data');
    }
  };

  const handleTransferCaptaincy = async (teamId: string, teamName: string) => {
    try {
      console.log(`🚀 handleTransferCaptaincy called with teamId: ${teamId}, teamName: ${teamName}`);
      console.log(`🚀 Current selectedTeamForMenu:`, selectedTeamForMenu);
      
      // Set flag to indicate this is a transfer captaincy action (not leave team)
      setIsLeaveTeamAction(false);
      
      // Get team details to show available members
      const teamData = await teamService.getTeamById(teamId);
      if (!teamData) {
        Alert.alert('Error', 'Team not found');
        return;
      }

      // Get active members (excluding current owner)
      const availableMembers = teamData.members.filter(member => 
        member.isActive && member.playerId !== user?.phoneNumber
      );

      if (availableMembers.length === 0) {
        Alert.alert('No Members', 'There are no other members to transfer ownership to. Add members first or delete the team.');
        return;
      }

      // Load member details and show selection modal
      const membersWithDetails = [];
      for (const member of availableMembers) {
        try {
          // Normalize phone number to ensure it has +91 prefix
          let normalizedPhoneNumber = member.playerId;
          if (!normalizedPhoneNumber.startsWith('+91')) {
            if (normalizedPhoneNumber.startsWith('91')) {
              normalizedPhoneNumber = '+' + normalizedPhoneNumber;
            } else {
              normalizedPhoneNumber = '+91' + normalizedPhoneNumber;
            }
          }
          
          console.log(`🔍 Looking up profile for: ${member.playerId} -> ${normalizedPhoneNumber}`);
          const userProfile = await userProfileService.getUserProfile(normalizedPhoneNumber);
          console.log(`✅ Found profile for ${normalizedPhoneNumber}:`, userProfile?.name || 'No name');
          membersWithDetails.push({
            ...member,
            name: userProfile?.name || `User ${member.playerId.slice(-4)}`,
            phoneNumber: userProfile?.phoneNumber || normalizedPhoneNumber,
          });
        } catch (error) {
          console.error(`❌ Failed to load details for member ${member.playerId}:`, error);
          membersWithDetails.push({
            ...member,
            name: `User ${member.playerId.slice(-4)}`,
            phoneNumber: member.playerId,
          });
        }
      }

      console.log(`🎯 Setting up member selection modal with ${membersWithDetails.length} members`);
      console.log(`🎯 Setting selectedTeamForMenu to:`, { teamId, teamName, isOwner: true });
      
      // Set the team info BEFORE opening the modal
      setSelectedTeamForMenu({ teamId, teamName, isOwner: true });
      setTeamMembers(membersWithDetails);
      setShowMemberSelection(true);
      
      console.log(`🎯 Modal should now be open. selectedTeamForMenu:`, { teamId, teamName, isOwner: true });
      
    } catch (error) {
      console.error('❌ Failed to get team details for transfer:', error);
      Alert.alert('Error', 'Failed to load team details. Please try again.');
    }
  };

  const handleSelectNewCaptain = async (newCaptain: any) => {
    console.log(`🎯 handleSelectNewCaptain called with:`, newCaptain);
    console.log(`🎯 selectedTeamForMenu:`, selectedTeamForMenu);
    console.log(`🎯 isLeaveTeamAction:`, isLeaveTeamAction);
    
    if (!selectedTeamForMenu) {
      console.log(`❌ No selectedTeamForMenu, returning`);
      return;
    }

    const { teamId, teamName } = selectedTeamForMenu;
    
    // Use the flag to determine if this is a leave team action
    const title = isLeaveTeamAction ? 'Transfer Ownership & Leave Team' : 'Transfer Ownership';
    const message = isLeaveTeamAction 
      ? `Transfer ownership of "${teamName}" to ${newCaptain.name} and leave the team?\n\nThis will make them the new owner and remove you from the team.`
      : `Transfer ownership of "${teamName}" to ${newCaptain.name}?\n\nThis will make them the new owner and you will become a regular member.`;
    
    // Use web-compatible alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        await executeTransfer(newCaptain, teamId, teamName);
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isLeaveTeamAction ? 'Transfer & Leave' : 'Transfer',
            style: 'default',
            onPress: () => executeTransfer(newCaptain, teamId, teamName)
          }
        ]
      );
    }
  };

  const executeTransfer = async (newCaptain: any, teamId: string, teamName: string) => {
    try {
      console.log(`🔄 Starting ownership transfer...`);
      console.log(`🔄 Team ID: ${teamId}`);
      console.log(`🔄 New Captain: ${newCaptain.name} (${newCaptain.playerId})`);
      console.log(`🔄 Current Owner: ${user?.phoneNumber}`);
      
      // Update team ownership
      await teamService.transferOwnership(teamId, newCaptain.playerId);
      console.log(`✅ Team ownership transferred to ${newCaptain.playerId}`);
      
      // Update user roles
      await teamService.updateMemberRole(teamId, user?.phoneNumber || '', 'member');
      console.log(`✅ Current owner role changed to member`);
      
      await teamService.updateMemberRole(teamId, newCaptain.playerId, 'owner');
      console.log(`✅ New captain role changed to owner`);
      
      if (isLeaveTeamAction) {
        // Remove from team service
        await teamService.removeMemberFromTeam(teamId, user?.phoneNumber || '');
        // Remove from user profile
        await userProfileService.removeUserFromTeam(user?.phoneNumber || '', teamId);
        
        const successMsg = `✅ ${newCaptain.name} is now the new captain of "${teamName}"!\n\nYou have successfully left the team.`;
        
        if (Platform.OS === 'web') {
          alert(successMsg);
        } else {
          Alert.alert('Success!', successMsg, [{ text: 'OK' }]);
        }
      } else {
        const successMsg = `✅ ${newCaptain.name} is now the new captain of "${teamName}"!\n\nYou are now a regular member of the team.`;
        
        if (Platform.OS === 'web') {
          alert(successMsg);
        } else {
          Alert.alert('Success!', successMsg, [{ text: 'OK' }]);
        }
      }
      
      loadTeams(); // Refresh the list
      setShowMemberSelection(false);
      setSelectedTeamForMenu(null);
      setIsLeaveTeamAction(false); // Reset flag
    } catch (error) {
      console.error('❌ Failed to transfer ownership:', error);
      const errorMsg = 'Failed to transfer ownership. Please try again.';
      
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      console.log(`🗑️ Starting to delete team: ${teamId}`);
      console.log(`🗑️ User phone: ${user?.phoneNumber}`);
      
      // Delete the team completely
      console.log('🗑️ Calling teamService.deleteTeam...');
      await teamService.deleteTeam(teamId);
      console.log('🗑️ Team deleted from Firebase');
      
      // Remove from user profile
      console.log('🗑️ Removing team from user profile...');
      await userProfileService.removeUserFromTeam(user?.phoneNumber || '', teamId);
      console.log('🗑️ Team removed from user profile');
      
      // Show success message
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        alert('Team deleted successfully');
      } else {
        Alert.alert('Success', 'Team deleted successfully');
      }
      
      loadTeams(); // Refresh the list
    } catch (error: any) {
      console.error('❌ Failed to delete team:', error);
      const errorMsg = `Failed to delete team: ${error?.message || 'Unknown error'}`;
      
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Teams</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading teams...</Text>
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
        <Text style={styles.title}>My Teams</Text>
         <View style={styles.headerActions}>
           <TouchableOpacity onPress={onCreateTeam} style={styles.createButton}>
             <Text style={styles.createButtonText}>+ Create Team</Text>
           </TouchableOpacity>
         </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {teams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏏</Text>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't joined any teams yet.{'\n'}
              Create a team or get invited by someone!
            </Text>
            <TouchableOpacity style={styles.createTeamButton} onPress={onCreateTeam}>
              <Text style={styles.createTeamButtonText}>Create Your First Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.teamsList}>
            {teams.map((team, index) => (
              <View key={team.teamId} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.teamName}</Text>
                    {team.description && (
                      <Text style={styles.teamDescription}>{team.description}</Text>
                    )}
                    {team.location && (
                      <Text style={styles.teamLocation}>📍 {team.location}</Text>
                    )}
                    <Text style={styles.teamId}>ID: {team.teamId}</Text>
                    <Text style={styles.teamJoined}>
                      {team.isOwner ? 'Created' : 'Joined'}: {new Date(team.joinedAt).toLocaleDateString()}
                    </Text>
                    {team.role && (
                      <Text style={styles.teamRole}>Role: {team.role}</Text>
                    )}
                  </View>
                  <View style={[styles.teamStatus, team.isOwner && styles.ownerStatus]}>
                    <Text style={[styles.teamStatusText, team.isOwner && styles.ownerStatusText]}>
                      {team.isOwner ? '👑 Owner' : 'Member'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.teamActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewDetails(team.teamId, team.teamName)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => handleShowTeamMenu(team.teamId, team.teamName, team.isOwner || false)}
                  >
                    <Text style={styles.menuButtonText}>⋮</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Team Details Modal */}
      {selectedTeamForDetails && (
        <TeamDetailsModal
          visible={showTeamDetails}
          onClose={() => {
            setShowTeamDetails(false);
            setSelectedTeamForDetails(null);
          }}
          teamId={selectedTeamForDetails.teamId}
          teamName={selectedTeamForDetails.teamName}
        />
      )}

      {/* Team Menu Modal */}
      <Modal
        visible={showTeamMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseTeamMenu}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={handleCloseTeamMenu}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>
                {selectedTeamForMenu?.teamName}
              </Text>
              <TouchableOpacity onPress={handleCloseTeamMenu}>
                <Text style={styles.menuCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuOptions}>
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => handleMenuAction('leave')}
              >
                <Text style={styles.menuOptionText}>Leave Team</Text>
              </TouchableOpacity>
              
              {selectedTeamForMenu?.isOwner && (
                <>
                  <TouchableOpacity 
                    style={styles.menuOption}
                    onPress={() => handleMenuAction('edit')}
                  >
                    <Text style={styles.menuOptionText}>✏️ Edit Team</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuOption}
                    onPress={() => handleMenuAction('transfer')}
                  >
                    <Text style={styles.menuOptionText}>Transfer Captaincy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.menuOption, styles.deleteMenuOption]}
                    onPress={() => handleMenuAction('delete')}
                  >
                    <Text style={[styles.menuOptionText, styles.deleteMenuOptionText]}>
                      🗑️ Delete Team
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Team Modal */}
      {showEditTeam && selectedTeamForEdit && (
        <Modal
          visible={showEditTeam}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditTeam(false)}
        >
          <View style={styles.menuOverlay}>
            <View style={styles.editTeamContainer}>
              <View style={styles.editTeamHeader}>
                <Text style={styles.editTeamTitle}>Edit Team</Text>
                <TouchableOpacity onPress={() => setShowEditTeam(false)}>
                  <Text style={styles.menuCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.editTeamContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Team Name</Text>
                  <Text style={styles.inputValue}>{selectedTeamForEdit.teamName}</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <Text style={styles.inputValue}>
                    {selectedTeamForEdit.description || 'No description'}
                  </Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <Text style={styles.inputValue}>
                    {selectedTeamForEdit.location || 'No location'}
                  </Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Maximum Members</Text>
                  <Text style={styles.inputValue}>
                    {selectedTeamForEdit.maxMembers || 15}
                  </Text>
                </View>
                
                <Text style={styles.comingSoonText}>
                  🚧 Full edit functionality coming soon! For now, you can view team details here.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Member Selection Modal */}
      <Modal
        visible={showMemberSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log(`🔍 Member selection modal closing - resetting state`);
          setShowMemberSelection(false);
          setSelectedTeamForMenu(null);
          setIsLeaveTeamAction(false);
        }}
      >
         <TouchableOpacity 
           style={styles.menuOverlay}
           activeOpacity={1}
           onPress={() => {
             console.log(`🔍 Member selection modal overlay pressed - resetting state`);
             setShowMemberSelection(false);
             setSelectedTeamForMenu(null);
             setIsLeaveTeamAction(false);
           }}
         >
          <View style={styles.memberSelectionContainer}>
            <View style={styles.memberSelectionHeader}>
              <Text style={styles.memberSelectionTitle}>
                {isLeaveTeamAction ? 'Select New Captain to Leave Team' : 'Select New Captain'}
              </Text>
               <TouchableOpacity onPress={() => {
                 console.log(`🔍 Member selection modal close button pressed - resetting state`);
                 setShowMemberSelection(false);
                 setSelectedTeamForMenu(null);
                 setIsLeaveTeamAction(false);
               }}>
                 <Text style={styles.menuCloseButton}>✕</Text>
               </TouchableOpacity>
            </View>
            
            <Text style={styles.memberSelectionSubtitle}>
              {isLeaveTeamAction 
                ? 'Choose who will become the new team owner so you can leave:'
                : 'Choose who will become the new team owner:'
              }
            </Text>
            
             <ScrollView style={styles.memberList} showsVerticalScrollIndicator={false}>
               {teamMembers.map((member, index) => {
                 console.log(`🎯 Rendering member ${index}:`, member);
                 return (
                   <TouchableOpacity 
                     key={member.id || index}
                     style={styles.memberItem}
                     onPress={() => {
                       console.log(`🎯 Member item pressed:`, member);
                       handleSelectNewCaptain(member);
                     }}
                   >
                     <View style={styles.memberInfo}>
                       <Text style={styles.memberName}>{member.name}</Text>
                       <Text style={styles.memberPhone}>{member.phoneNumber}</Text>
                       {member.role && (
                         <Text style={styles.memberRole}>Role: {member.role}</Text>
                       )}
                     </View>
                     <View style={styles.memberSelectButton}>
                       <Text style={styles.memberSelectButtonText}>Select</Text>
                     </View>
                   </TouchableOpacity>
                 );
               })}
             </ScrollView>
          </View>
        </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
   testButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
   matchStartButton: {
     backgroundColor: '#ff6b35',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 6,
   },
   matchStartButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
   matchEndButton: {
     backgroundColor: '#6c757d',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 6,
   },
   matchEndButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
   dummyPlayersButton: {
     backgroundColor: '#9c27b0',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 6,
   },
   dummyPlayersButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
   removeDuplicatesButton: {
     backgroundColor: '#dc3545',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 6,
   },
   removeDuplicatesButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
  content: {
    flex: 1,
    padding: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createTeamButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTeamButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  teamsList: {
    gap: 15,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  teamLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  teamId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  teamJoined: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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
  ownerStatus: {
    backgroundColor: '#ffc107',
  },
  ownerStatusText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  teamActions: {
    flexDirection: 'column',
    gap: 10,
  },
  viewButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  transferButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  menuButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  menuCloseButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  menuOptions: {
    gap: 8,
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  deleteMenuOption: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  deleteMenuOptionText: {
    color: '#dc2626',
    fontWeight: '500',
  },
  memberSelectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 320,
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memberSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  memberSelectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  memberSelectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  memberList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  memberSelectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  memberSelectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  editTeamContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  editTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editTeamTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  editTeamContent: {
    maxHeight: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
});

export default MyTeamsScreen;
