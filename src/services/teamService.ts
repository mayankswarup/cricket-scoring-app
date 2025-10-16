import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Team {
  id: string;
  name: string;
  description?: string;
  location?: string;
  maxMembers: number;
  ownerId: string;
  captainId: string;
  members: TeamMember[];
  createdAt: any;
  updatedAt?: any;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  playerId: string;
  teamId: string;
  role: 'captain' | 'vice-captain' | 'member';
  joinedAt: string;
  isActive: boolean;
}

class TeamService {
  private teamsCollection = collection(db, 'teams');

  /**
   * Create a new team
   */
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🏏 Creating team:', teamData.name);
      
      const docRef = await addDoc(this.teamsCollection, {
        ...teamData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Team created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const teamDoc = await getDoc(doc(this.teamsCollection, teamId));
      if (teamDoc.exists()) {
        return { id: teamDoc.id, ...teamDoc.data() } as Team;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting team:', error);
      throw error;
    }
  }

  /**
   * Get teams by owner ID
   */
  async getTeamsByOwner(ownerId: string): Promise<Team[]> {
    try {
      const q = query(
        this.teamsCollection,
        where('ownerId', '==', ownerId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const teams: Team[] = [];
      
      querySnapshot.forEach((doc) => {
        teams.push({ id: doc.id, ...doc.data() } as Team);
      });
      
      return teams;
    } catch (error) {
      console.error('❌ Error getting teams by owner:', error);
      throw error;
    }
  }

  /**
   * Get teams by member ID
   */
  async getTeamsByMember(memberId: string): Promise<Team[]> {
    try {
      // Get all teams (no complex queries to avoid index issues)
      const querySnapshot = await getDocs(this.teamsCollection);
      const teams: Team[] = [];
      
      querySnapshot.forEach((doc) => {
        const teamData = { id: doc.id, ...doc.data() } as Team;
        
        // Only include active teams where the user is a member
        if (teamData.isActive && teamData.members.some(member => 
          member.playerId === memberId && member.isActive
        )) {
          teams.push(teamData);
        }
      });
      
      // Sort by creation date (newest first)
      teams.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      return teams;
    } catch (error) {
      console.error('❌ Error getting teams by member:', error);
      throw error;
    }
  }

  /**
   * Add member to team
   */
  async addMemberToTeam(teamId: string, memberData: Omit<TeamMember, 'id' | 'teamId'>): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data() as Team;
      const newMember: TeamMember = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teamId,
        ...memberData,
      };
      
      const updatedMembers = [...teamData.members, newMember];
      
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Member added to team:', memberData.playerId);
    } catch (error) {
      console.error('❌ Error adding member to team:', error);
      throw error;
    }
  }

  /**
   * Add multiple players to team
   * @param teamId - The ID of the team
   * @param players - Array of player data to add
   */
  async addPlayersToTeam(teamId: string, players: { playerId: string; name: string; phoneNumber: string }[]): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data() as Team;
      
      // Filter out players who are already members
      const existingPlayerIds = teamData.members
        .filter(member => member.isActive)
        .map(member => member.playerId);
      
      const newPlayers = players.filter(player => {
        // Normalize phone number for comparison
        let normalizedPlayerId = player.playerId;
        if (!normalizedPlayerId.startsWith('+91')) {
          if (normalizedPlayerId.startsWith('91')) {
            normalizedPlayerId = '+' + normalizedPlayerId;
          } else {
            normalizedPlayerId = '+91' + normalizedPlayerId;
          }
        }
        
        // Check against both original and normalized existing IDs
        return !existingPlayerIds.includes(player.playerId) && 
               !existingPlayerIds.includes(normalizedPlayerId);
      });

      if (newPlayers.length === 0) {
        console.log('⚠️ All selected players are already members of this team');
        return;
      }

      // Create member objects for each new player
      const newMembers: TeamMember[] = newPlayers.map(player => {
        // Normalize phone number - ensure it has +91 prefix
        let normalizedPlayerId = player.playerId;
        if (!normalizedPlayerId.startsWith('+91')) {
          if (normalizedPlayerId.startsWith('91')) {
            normalizedPlayerId = '+' + normalizedPlayerId;
          } else {
            normalizedPlayerId = '+91' + normalizedPlayerId;
          }
        }
        
        return {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          teamId,
          playerId: normalizedPlayerId,
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          isActive: true,
        };
      });

      // Add only new members to existing members
      const updatedMembers = [...teamData.members, ...newMembers];
      
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Added ${newPlayers.length} new players to team ${teamId}`);
    } catch (error) {
      console.error('❌ Error adding players to team:', error);
      throw error;
    }
  }

  /**
   * Remove duplicate members from team
   * @param teamId - The ID of the team
   */
  async removeDuplicateMembers(teamId: string): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data() as Team;
      
      // Group members by playerId and keep only the most recent one
      const memberMap = new Map<string, TeamMember>();
      
      console.log(`🔍 Checking for duplicates in team ${teamId}: ${teamData.members.length} total members`);
      
      teamData.members.forEach((member, index) => {
        console.log(`🔍 Member ${index}: ${member.playerId}, active: ${member.isActive}, joined: ${member.joinedAt}`);
        if (member.isActive) {
          const existing = memberMap.get(member.playerId);
          if (!existing || new Date(member.joinedAt) > new Date(existing.joinedAt)) {
            memberMap.set(member.playerId, member);
            console.log(`✅ Keeping member: ${member.playerId}`);
          } else {
            console.log(`❌ Removing duplicate: ${member.playerId}`);
          }
        }
      });
      
      // Convert back to array
      const uniqueMembers = Array.from(memberMap.values());
      
      console.log(`🔍 After cleanup: ${uniqueMembers.length} unique members`);
      
      if (uniqueMembers.length !== teamData.members.length) {
        await updateDoc(teamRef, {
          members: uniqueMembers,
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Removed ${teamData.members.length - uniqueMembers.length} duplicate members from team ${teamId}`);
      } else {
        console.log(`✅ No duplicates found in team ${teamId}`);
      }
    } catch (error) {
      console.error('❌ Error removing duplicate members:', error);
      throw error;
    }
  }

  /**
   * Remove member from team
   */
  async removeMemberFromTeam(teamId: string, memberId: string): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data() as Team;
      const updatedMembers = teamData.members.filter(member => member.playerId !== memberId);
      
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Member removed from team:', memberId);
    } catch (error) {
      console.error('❌ Error removing member from team:', error);
      throw error;
    }
  }

  /**
   * Update team
   */
  async updateTeam(teamId: string, updateData: Partial<Team>): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      await updateDoc(teamRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Team updated successfully:', teamId);
    } catch (error) {
      console.error('❌ Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete team
   */
  async transferOwnership(teamId: string, newOwnerId: string): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      await updateDoc(teamRef, {
        ownerId: newOwnerId,
        captainId: newOwnerId,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Ownership transferred to ${newOwnerId} for team ${teamId}`);
    } catch (error) {
      console.error('❌ Error transferring ownership:', error);
      throw error;
    }
  }

  async updateMemberRole(teamId: string, memberId: string, newRole: string): Promise<void> {
    try {
      const teamRef = doc(this.teamsCollection, teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data() as Team;
      const updatedMembers = teamData.members.map(member => 
        member.playerId === memberId 
          ? { ...member, role: newRole as any }
          : member
      );
      
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Updated role for ${memberId} to ${newRole} in team ${teamId}`);
    } catch (error) {
      console.error('❌ Error updating member role:', error);
      throw error;
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      console.log(`🗑️ teamService.deleteTeam called for teamId: ${teamId}`);
      
      // First get the team to remove all members from their profiles
      const teamDoc = await getDoc(doc(this.teamsCollection, teamId));
      console.log(`🗑️ Team document exists: ${teamDoc.exists()}`);
      
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        console.log(`🗑️ Team has ${teamData.members.length} members`);
        
        // Remove team from all members' profiles
        for (const member of teamData.members) {
          try {
            console.log(`🗑️ Removing team from member: ${member.playerId}`);
            // Import userProfileService here to avoid circular dependency
            const { userProfileService } = await import('./userProfileService');
            await userProfileService.removeUserFromTeam(member.playerId, teamId);
            console.log(`✅ Removed team from member: ${member.playerId}`);
          } catch (error) {
            console.error(`❌ Failed to remove team from member ${member.playerId}:`, error);
            // Continue with other members even if one fails
          }
        }
      }
      
      // Then delete the team document
      console.log(`🗑️ Deleting team document from Firebase...`);
      const teamRef = doc(this.teamsCollection, teamId);
      await deleteDoc(teamRef);
      console.log('✅ Team document deleted from Firebase');
      
      console.log('✅ Team deleted successfully:', teamId);
    } catch (error) {
      console.error('❌ Error deleting team:', error);
      throw error;
    }
  }
}

export const teamService = new TeamService();
