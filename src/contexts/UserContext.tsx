import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phoneAuthService } from '../services/phoneAuthService';
import { userProfileService, UserProfile } from '../services/userProfileService';

interface User {
  phoneNumber: string;
  isAdmin: boolean;
  name?: string;
  profile?: UserProfile;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (phoneNumber: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  isAdminForTeam: (teamId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from storage on app start and listen to Firebase auth changes
  useEffect(() => {
    loadUser();
    
    // Listen to Firebase auth state changes
    const unsubscribe = phoneAuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log('🔄 Firebase auth state changed in UserContext:', firebaseUser?.phoneNumber || 'Not logged in');
      
      if (firebaseUser && firebaseUser.phoneNumber) {
        // User is logged in via Firebase
        const phoneNumber = firebaseUser.phoneNumber.replace('+91', '');
        
        try {
          // Load user profile from Firebase
          const userProfile = await userProfileService.getUserProfile(phoneNumber);
          
          // Update last login time
          await userProfileService.updateLastLogin(phoneNumber);
          
          const newUser: User = {
            phoneNumber,
            isAdmin: false, // Will be determined by team membership
            name: userProfile?.name || `User ${phoneNumber}`,
            profile: userProfile || undefined,
          };
          
          AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
          
          console.log('✅ User profile loaded:', userProfile?.name || 'New user');
        } catch (error) {
          console.error('❌ Failed to load user profile:', error);
          
          // Fallback: create basic user without profile
          const newUser: User = {
            phoneNumber,
            isAdmin: false,
            name: `User ${phoneNumber}`,
          };
          
          AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
        }
      } else {
        // Not logged in - clear local storage
        AsyncStorage.removeItem('currentUser');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUser = async () => {
    try {
      // First check Firebase auth state
      const firebaseUser = await phoneAuthService.getCurrentUser();
      
      if (firebaseUser && firebaseUser.phoneNumber) {
        // User is logged in via Firebase
        const phoneNumber = firebaseUser.phoneNumber.replace('+91', '');
        
        try {
          // Load user profile from Firebase
          const userProfile = await userProfileService.getUserProfile(phoneNumber);
          
          // Update last login time
          await userProfileService.updateLastLogin(phoneNumber);
          
          const newUser: User = {
            phoneNumber,
            isAdmin: false, // Will be determined by team membership
            name: userProfile?.name || `User ${phoneNumber}`,
            profile: userProfile || undefined,
          };
          
          await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
          
          console.log('✅ User profile loaded on app start:', userProfile?.name || 'New user');
        } catch (error) {
          console.error('❌ Failed to load user profile on app start:', error);
          
          // Fallback: create basic user without profile
          const newUser: User = {
            phoneNumber,
            isAdmin: false,
            name: `User ${phoneNumber}`,
          };
          
          await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
        }
      } else {
        // Not logged in
        await AsyncStorage.removeItem('currentUser');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const login = async (phoneNumber: string, name?: string) => {
    try {
      const newUser: User = {
        phoneNumber,
        isAdmin: false, // Will be determined by team membership
        name: name || `User ${phoneNumber}`,
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase - the auth state listener will handle cleanup
      await phoneAuthService.logout();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      await userProfileService.updateUserProfile(user.phoneNumber, profileData);
      
      // Reload user profile
      const updatedProfile = await userProfileService.getUserProfile(user.phoneNumber);
      
      if (updatedProfile) {
        const updatedUser: User = {
          ...user,
          name: updatedProfile.name,
          profile: updatedProfile,
        };
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        console.log('✅ User profile updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  };

  const isAdminForTeam = async (matchId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // For now, we'll use a simple approach for testing
      // In production, this would check the match document for admin list
      console.log('🔍 Checking admin status for user:', user.phoneNumber, 'in match:', matchId);
      
      // For testing purposes, we'll return false initially
      // The user can click "Make Me Admin" button to become admin
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const value: UserContextType = {
    user,
    setUser,
    login,
    logout,
    updateUserProfile,
    isAdminForTeam,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
