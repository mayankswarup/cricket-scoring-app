import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { phoneAuthService } from '../services/phoneAuthService';
import { userProfileService, UserProfile } from '../services/userProfileService';

interface User {
  phoneNumber: string;
  isAdmin: boolean;
  isPro: boolean;
  isSuperAdmin: boolean;
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
          
          // Check if this is the app owner (Super Admin)
          const isAppOwner = phoneNumber === '+919019078195';
          
          // Check Pro status
          let isPro = userProfile?.isPro || false;
          
          // App owner is Super Admin with all permissions
          if (isAppOwner) {
            isPro = true;
            console.log('👑 Super Admin detected - Full access granted');
          }
          
          const newUser: User = {
            phoneNumber,
            isAdmin: false, // Will be determined by team membership
            isPro: isPro,
            isSuperAdmin: isAppOwner, // Only app owner is Super Admin
            name: userProfile?.name || `User ${phoneNumber}`,
            profile: userProfile || undefined,
          };
          
          AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
          
          console.log('✅ User profile loaded:', userProfile?.name || 'New user');
        } catch (error) {
          console.error('❌ Failed to load user profile:', error);
          
          // Fallback: create basic user without profile
          const isAppOwner = phoneNumber === '+919019078195';
          const newUser: User = {
            phoneNumber,
            isAdmin: false,
            isPro: isAppOwner, // App owner is always Pro
            isSuperAdmin: isAppOwner, // App owner is Super Admin
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
        console.log('🔍 Firebase user phone number:', firebaseUser.phoneNumber);
        // Keep the full phone number with +91 for Firebase compatibility
        const phoneNumber = firebaseUser.phoneNumber;
        console.log('🔍 Using full phone number for Firebase:', phoneNumber);
        
        try {
          // Load user profile from Firebase
          const userProfile = await userProfileService.getUserProfile(phoneNumber);
          
          // Update last login time
          await userProfileService.updateLastLogin(phoneNumber);
          
          // Check if this is the app owner (Super Admin)
          const isAppOwner = phoneNumber === '+919019078195';
          
          // Check Pro status
          let isPro = userProfile?.isPro || false;
          
          // App owner is Super Admin with all permissions
          if (isAppOwner) {
            isPro = true;
            console.log('👑 Super Admin detected - Full access granted');
          }
          
          const newUser: User = {
            phoneNumber,
            isAdmin: false, // Will be determined by team membership
            isPro: isPro,
            isSuperAdmin: isAppOwner, // Only app owner is Super Admin
            name: userProfile?.name || `User ${phoneNumber}`,
            profile: userProfile || undefined,
          };
          
          console.log('🔍 UserContext: Stored phone number:', phoneNumber);
          console.log('🔍 UserContext: Firebase user phone number:', firebaseUser.phoneNumber);
          
          await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
          
          console.log('✅ User profile loaded on app start:', userProfile?.name || 'New user');
        } catch (error) {
          console.error('❌ Failed to load user profile on app start:', error);
          
          // Fallback: create basic user without profile
          const isAppOwner = phoneNumber === '+919019078195';
          const newUser: User = {
            phoneNumber,
            isAdmin: false,
            isPro: isAppOwner, // App owner is always Pro
            isSuperAdmin: isAppOwner, // App owner is Super Admin
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
      // Check if this is the app owner (Super Admin)
      const isAppOwner = phoneNumber === '+919019078195';
      
      // Check Pro status from Firebase
      let isPro = false;
      try {
        isPro = await userProfileService.isUserPro(phoneNumber);
      } catch (error) {
        console.log('Could not check Pro status, defaulting to false');
      }
      
      // App owner is Super Admin with all permissions
      if (isAppOwner) {
        isPro = true;
        console.log('👑 Super Admin detected - Full access granted');
      }
      
      const newUser: User = {
        phoneNumber,
        isAdmin: false, // Will be determined by team membership
        isPro: isPro,
        isSuperAdmin: isAppOwner, // Only app owner is Super Admin
        name: name || `User ${phoneNumber}`,
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      
      console.log(`✅ User logged in: ${name || phoneNumber} (Pro: ${isPro}, SuperAdmin: ${isAppOwner})`);
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
      console.log('🔄 UserContext: Updating profile for phone:', user.phoneNumber);
      console.log('🔄 UserContext: Profile data to update:', profileData);
      
      // Use the full phone number as stored in Firebase
      const phoneNumberForUpdate = user.phoneNumber;
      console.log('🔄 UserContext: Using phone number for update:', phoneNumberForUpdate);
      
      await userProfileService.updateUserProfile(phoneNumberForUpdate, profileData);
      
      // Reload user profile
      const updatedProfile = await userProfileService.getUserProfile(phoneNumberForUpdate);
      
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
