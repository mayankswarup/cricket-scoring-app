/**
 * User Profile Service
 * Handles user profile data in Firebase Firestore
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  phoneNumber: string;
  name: string;
  email?: string | null;
  profilePicture?: string | null;
  dateOfBirth?: string | null;
  playingRole?: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper' | null;
  battingHand?: 'left' | 'right' | null;
  bowlingStyle?: 'fast' | 'medium' | 'spin' | null;
  jerseyNumber?: number | null;
  teamIds?: string[];
  isPro: boolean;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  hasCompletedProfile: boolean;
  // Match availability fields
  isPlayingMatch?: boolean;
  currentMatchId?: string | null;
  matchStartTime?: string | null;
  matchEndTime?: string | null;
}

class UserProfileService {
  /**
   * Get user profile by phone number
   * @param phoneNumber - User's phone number
   * @returns UserProfile or null if not found
   */
  async getUserProfile(phoneNumber: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Create new user profile
   * @param phoneNumber - User's phone number
   * @param initialData - Initial profile data
   */
  async createUserProfile(phoneNumber: string, initialData: Partial<UserProfile> = {}): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      
      const userProfile: UserProfile = {
        phoneNumber,
        name: `User ${phoneNumber}`,
        email: null,
        profilePicture: null,
        dateOfBirth: null,
        playingRole: null,
        battingHand: null,
        bowlingStyle: null,
        jerseyNumber: null,
        teamIds: [],
        isPro: false,
        hasCompletedProfile: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        ...initialData, // Override with any provided data
      };

      await setDoc(userRef, userProfile);
      console.log('✅ User profile created:', phoneNumber);
    } catch (error) {
      console.error('❌ Failed to create user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param phoneNumber - User's phone number
   * @param updateData - Data to update
   */
  async updateUserProfile(phoneNumber: string, updateData: Partial<UserProfile>): Promise<void> {
    try {
      console.log('🔄 Updating user profile in Firebase:', phoneNumber, updateData);
      console.log('🔍 Phone number type:', typeof phoneNumber);
      console.log('🔍 Phone number length:', phoneNumber.length);
      console.log('🔍 Phone number value:', JSON.stringify(phoneNumber));
      const userRef = doc(db, 'users', phoneNumber);
      
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User profile updated successfully in Firebase:', phoneNumber);
      console.log('📝 Updated data:', updateData);
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update last login time
   * @param phoneNumber - User's phone number
   */
  async updateLastLogin(phoneNumber: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Last login updated:', phoneNumber);
    } catch (error) {
      console.error('❌ Failed to update last login:', error);
      throw error;
    }
  }

  /**
   * Add user to a team
   * @param phoneNumber - User's phone number
   * @param teamId - Team ID to add user to
   */
  async addUserToTeam(phoneNumber: string, teamId: string): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(phoneNumber);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const teamIds = userProfile.teamIds || [];
      if (!teamIds.includes(teamId)) {
        teamIds.push(teamId);
        await this.updateUserProfile(phoneNumber, { teamIds });
        console.log('✅ User added to team:', phoneNumber, teamId);
      }
    } catch (error) {
      console.error('❌ Failed to add user to team:', error);
      throw error;
    }
  }

  /**
   * Remove user from a team
   * @param phoneNumber - User's phone number
   * @param teamId - Team ID to remove user from
   */
  async removeUserFromTeam(phoneNumber: string, teamId: string): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(phoneNumber);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const teamIds = userProfile.teamIds || [];
      const updatedTeamIds = teamIds.filter(id => id !== teamId);
      await this.updateUserProfile(phoneNumber, { teamIds: updatedTeamIds });
      console.log('✅ User removed from team:', phoneNumber, teamId);
    } catch (error) {
      console.error('❌ Failed to remove user from team:', error);
      throw error;
    }
  }

  /**
   * Check if user profile exists
   * @param phoneNumber - User's phone number
   * @returns boolean
   */
  async userProfileExists(phoneNumber: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(phoneNumber);
      return userProfile !== null;
    } catch (error) {
      console.error('❌ Failed to check user profile existence:', error);
      return false;
    }
  }

  /**
   * Search users by name or phone number
   * @param searchTerm - Search term
   * @returns Array of matching user profiles
   */
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      
      // Search by name (case insensitive)
      const nameQuery = query(
        usersRef,
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      const users: UserProfile[] = [];
      
      nameSnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      
      // Also search by phone number if it matches
      if (searchTerm.length >= 10 && /^\d+$/.test(searchTerm)) {
        const phoneNumber = searchTerm;
        const userProfile = await this.getUserProfile(phoneNumber);
        if (userProfile && !users.find(u => u.phoneNumber === phoneNumber)) {
          users.push(userProfile);
        }
      }
      
      return users;
    } catch (error) {
      console.error('❌ Failed to search users:', error);
      return [];
    }
  }

  /**
   * Get user's team memberships
   * @param phoneNumber - User's phone number
   * @returns Array of team information
   */
  async getUserTeams(phoneNumber: string): Promise<{ teamId: string; teamName: string; joinedAt: string }[]> {
    try {
      console.log('🔍 Fetching user teams for:', phoneNumber);
      const userProfile = await this.getUserProfile(phoneNumber);
      
      if (!userProfile || !userProfile.teamIds || userProfile.teamIds.length === 0) {
        console.log('📝 User is not in any teams');
        return [];
      }

      // For now, return basic team info
      // In a real app, you would fetch team details from teams collection
      const teams = userProfile.teamIds.map(teamId => ({
        teamId,
        teamName: `Team ${teamId.slice(-4)}`, // Temporary name
        joinedAt: new Date().toISOString() // Temporary date
      }));

      console.log(`✅ Found ${teams.length} teams for user`);
      return teams;
    } catch (error) {
      console.error('❌ Error fetching user teams:', error);
      return [];
    }
  }

  /**
   * Get all registered users (for player search)
   * @param excludePhoneNumber - Phone number to exclude from results (current user)
   * @returns Array of UserProfile objects
   */
  async getAllUsers(excludePhoneNumber?: string): Promise<UserProfile[]> {
    try {
      console.log('🔍 Fetching all users from Firebase...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const users: UserProfile[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        // Exclude current user if specified (handle both formats)
        const shouldExclude = excludePhoneNumber && (
          userData.phoneNumber === excludePhoneNumber ||
          userData.phoneNumber === excludePhoneNumber.replace('+91', '') ||
          userData.phoneNumber === `+91${excludePhoneNumber}` ||
          userData.phoneNumber === excludePhoneNumber.replace(/^\+91/, '')
        );
        
        console.log(`🔍 Comparing: ${userData.phoneNumber} vs ${excludePhoneNumber} (exclude: ${shouldExclude})`);
        
        if (!shouldExclude) {
          users.push(userData);
        }
      });
      
      console.log(`✅ Found ${users.length} users in Firebase`);
      return users;
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Set player as unavailable (playing a match)
   * @param phoneNumber - Player's phone number
   * @param matchId - Match ID
   * @param matchStartTime - When the match started
   */
  async setPlayerUnavailable(phoneNumber: string, matchId: string, matchStartTime: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      await updateDoc(userRef, {
        isPlayingMatch: true,
        currentMatchId: matchId,
        matchStartTime: matchStartTime,
        matchEndTime: null,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Player ${phoneNumber} marked as unavailable for match ${matchId}`);
    } catch (error) {
      console.error('❌ Failed to set player unavailable:', error);
      throw error;
    }
  }

  /**
   * Set player as available (match ended)
   * @param phoneNumber - Player's phone number
   * @param matchEndTime - When the match ended
   */
  async setPlayerAvailable(phoneNumber: string, matchEndTime: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      await updateDoc(userRef, {
        isPlayingMatch: false,
        currentMatchId: null,
        matchEndTime: matchEndTime,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Player ${phoneNumber} marked as available`);
    } catch (error) {
      console.error('❌ Failed to set player available:', error);
      throw error;
    }
  }

  /**
   * Check if player is available for team addition
   * @param phoneNumber - Player's phone number
   * @returns boolean - true if available, false if playing a match
   */
  async isPlayerAvailable(phoneNumber: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(phoneNumber);
      if (!userProfile) {
        return false; // Player not found
      }
      
      // Player is available if not playing a match
      return !userProfile.isPlayingMatch;
    } catch (error) {
      console.error('❌ Failed to check player availability:', error);
      return false; // Assume unavailable on error
    }
  }

  /**
   * Set user as Pro Player (for app owner)
   * @param phoneNumber - User's phone number
   */
  async setUserAsPro(phoneNumber: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      await updateDoc(userRef, {
        isPro: true,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User set as Pro:', phoneNumber);
    } catch (error) {
      console.error('❌ Failed to set user as Pro:', error);
      throw error;
    }
  }

  /**
   * Check if user is Pro Player
   * @param phoneNumber - User's phone number
   * @returns boolean - true if Pro, false otherwise
   */
  async isUserPro(phoneNumber: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(phoneNumber);
      return userProfile?.isPro || false;
    } catch (error) {
      console.error('❌ Failed to check Pro status:', error);
      return false;
    }
  }

  /**
   * Initialize app owner as Super Admin
   * This should be called once to set up the app owner
   */
  async initializeAppOwner(): Promise<void> {
    const ownerPhoneNumber = '+919019078195'; // Your phone number
    
    try {
      // Check if owner profile exists
      const ownerProfile = await this.getUserProfile(ownerPhoneNumber);
      
      if (ownerProfile) {
        // Update existing profile to Pro
        await this.setUserAsPro(ownerPhoneNumber);
        console.log('✅ App owner updated to Pro status');
      } else {
        // Create new Pro profile for owner
        await this.createUserProfile(ownerPhoneNumber, {
          name: 'Super Admin',
          isPro: true,
          hasCompletedProfile: true,
        });
        console.log('✅ Super Admin profile created with Pro status');
      }
    } catch (error) {
      console.error('❌ Failed to initialize app owner:', error);
      throw error;
    }
  }

  /**
   * Delete any user (Super Admin only)
   * @param phoneNumber - User's phone number to delete
   */
  async deleteUser(phoneNumber: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', phoneNumber);
      await deleteDoc(userRef);
      console.log('✅ User deleted:', phoneNumber);
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Make any user captain of any team (Super Admin only)
   * @param phoneNumber - User's phone number
   * @param teamId - Team ID
   */
  async makeUserCaptain(phoneNumber: string, teamId: string): Promise<void> {
    try {
      // This would require teamService integration
      // For now, just log the action
      console.log(`👑 Super Admin: Making ${phoneNumber} captain of team ${teamId}`);
    } catch (error) {
      console.error('❌ Failed to make user captain:', error);
      throw error;
    }
  }

  /**
   * Get all users (Super Admin only)
   * @returns Array of all user profiles
   */
  async getAllUsersForAdmin(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const users: UserProfile[] = [];
      usersSnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error('❌ Failed to get all users for admin:', error);
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();
