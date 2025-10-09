import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  phoneNumber: string;
  isAdmin: boolean;
  name?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (phoneNumber: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
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

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const isAdminForTeam = async (teamId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user is admin for this team
      const { liveScoringService } = await import('../services/liveScoringService');
      return await liveScoringService.isUserAdmin(user.phoneNumber, teamId);
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
    isAdminForTeam,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
