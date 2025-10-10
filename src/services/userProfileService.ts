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
  getDocs
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
  teamIds: string[];
  isPro: boolean;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  hasCompletedProfile: boolean;
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
      const userRef = doc(db, 'users', phoneNumber);
      
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ User profile updated:', phoneNumber);
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

      if (!userProfile.teamIds.includes(teamId)) {
        userProfile.teamIds.push(teamId);
        await this.updateUserProfile(phoneNumber, { teamIds: userProfile.teamIds });
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

      const updatedTeamIds = userProfile.teamIds.filter(id => id !== teamId);
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
}

export const userProfileService = new UserProfileService();
