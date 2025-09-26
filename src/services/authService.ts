// Authentication Service - Enhanced for MVP with Firebase
import { PlayerRegistration } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService } from './firebaseService';

// Polyfill for btoa/atob in React Native
if (typeof btoa === 'undefined') {
  global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof atob === 'undefined') {
  global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// JWT Token interface
interface JWTPayload {
  userId: string;
  email: string;
  phone: string;
  role: 'scorer' | 'organizer' | 'fan' | 'admin';
  iat: number;
  exp: number;
}

// OTP Response interface
interface OTPResponse {
  success: boolean;
  message: string;
  otpId?: string;
}

// Login Response interface
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: PlayerRegistration;
  message: string;
}

class AuthService {
  private baseUrl: string;
  private tokenKey = 'cricket_app_token';
  private refreshTokenKey = 'cricket_app_refresh_token';
  private userKey = 'cricket_app_user';

  constructor() {
    // In MVP, we'll use mock data, but structure for real API
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  // 📱 STEP 1: OTP Generation
  // This sends OTP to user's email/phone
  async sendOTP(emailOrPhone: string, method: 'email' | 'phone'): Promise<OTPResponse> {
    try {
      console.log(`📱 Sending OTP to ${method}: ${emailOrPhone}`);
      
      // In MVP, we'll simulate OTP sending
      // In production, this would call your backend API
      const response = await fetch(`${this.baseUrl}/auth/otp/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: emailOrPhone,
          method: method
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `OTP sent to your ${method}`,
          otpId: data.otpId
        };
      } else {
        // Fallback for MVP - simulate OTP
        return {
          success: true,
          message: `OTP sent to your ${method} (Demo: 123456)`,
          otpId: 'demo_otp_id'
        };
      }
    } catch (error) {
      console.error('OTP sending failed:', error);
      // Fallback for MVP
      return {
        success: true,
        message: `OTP sent to your ${method} (Demo: 123456)`,
        otpId: 'demo_otp_id'
      };
    }
  }

  // 🔐 STEP 2: OTP Verification
  // This verifies the OTP and returns JWT token
  async verifyOTP(otpId: string, otp: string, emailOrPhone: string): Promise<LoginResponse> {
    try {
      console.log(`🔐 Verifying OTP: ${otp} for ${emailOrPhone}`);
      
      // In MVP, accept any 6-digit OTP
      if (otp === '123456' || otp.length === 6) {
        // First, try to find existing user by phone/email
        let existingUser = null;
        try {
          // Try to get user from Firebase first
          const phoneNumber = emailOrPhone.includes('@') ? '' : emailOrPhone;
          const email = emailOrPhone.includes('@') ? emailOrPhone : '';
          
          console.log('🔍 Searching for existing user:', { phoneNumber, email });
          
          if (phoneNumber) {
            // Search for user by phone number
            const users = await this.findUserByPhone(phoneNumber);
            if (users.length > 0) {
              existingUser = users[0];
              console.log('✅ Found existing user by phone:', existingUser.name);
            } else {
              console.log('❌ No existing user found by phone');
            }
          } else if (email) {
            // Search for user by email
            const users = await this.findUserByEmail(email);
            if (users.length > 0) {
              existingUser = users[0];
              console.log('✅ Found existing user by email:', existingUser.name);
            } else {
              console.log('❌ No existing user found by email');
            }
          }
        } catch (error) {
          console.log('⚠️ Could not search for existing user:', error);
          console.log('⚠️ Continuing with new user creation...');
          // Set existingUser to null to ensure we create a new user
          existingUser = null;
        }

        let user: PlayerRegistration;
        
        if (existingUser) {
          // Use existing user
          user = existingUser;
          console.log('🔄 Using existing user:', user.name);
        } else {
          // Create new user only if none exists
          user = {
            id: 'user_' + Date.now(),
            name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
            email: emailOrPhone.includes('@') ? emailOrPhone : '',
            phone: emailOrPhone.includes('@') ? '' : emailOrPhone,
            password: '', // Not needed for OTP auth
            dateOfBirth: '1990-01-01',
            preferredRole: 'all-rounder',
            battingStyle: 'right-handed',
            bowlingStyle: 'right-arm fast',
            experience: 'intermediate',
            location: 'Unknown',
            availability: [],
            stats: {
              matches: 0,
              runs: 0,
              wickets: 0,
              average: 0,
              strikeRate: 0
            },
            createdAt: new Date().toISOString(),
            isActive: true
          };
          console.log('🆕 Creating new user:', user.name);
        }

        // Generate mock JWT token
        const token = this.generateMockToken(user);
        
        // Store token locally
        await this.storeToken(token);
        console.log('🔑 Token stored successfully');
        
        // Also store user data
        console.log('👤 Storing user data:', { name: user.name, hasProfileImage: !!user.profileImage });
        await this.updateUserProfile(user);
        console.log('✅ User data stored successfully');
        
        return {
          success: true,
          token: token,
          user: user,
          message: 'Login successful!'
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        message: 'OTP verification failed. Please try again.'
      };
    }
  }

  // 🔑 STEP 3: Traditional Login (Email/Phone + Password)
  async loginWithPassword(emailOrPhone: string, password: string, method: 'email' | 'phone'): Promise<LoginResponse> {
    try {
      console.log(`🔑 Logging in with ${method}: ${emailOrPhone}`);
      
      // In MVP, we'll use mock authentication
      // In production, this would call your backend API
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: emailOrPhone,
          password: password,
          method: method
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.storeToken(data.token);
        return {
          success: true,
          token: data.token,
          user: data.user,
          message: 'Login successful!'
        };
      } else {
        // Fallback for MVP - mock login
        if (password === 'demo123' || password.length >= 6) {
          const mockUser: PlayerRegistration = {
            id: 'user_' + Date.now(),
            name: 'Demo User',
            email: method === 'email' ? emailOrPhone : '',
            phone: method === 'phone' ? emailOrPhone : '',
            password: password,
            dateOfBirth: '1990-01-01',
            preferredRole: 'all-rounder',
            battingStyle: 'right-handed',
            bowlingStyle: 'right-arm fast',
            experience: 'intermediate',
            location: 'Unknown',
            availability: [],
            stats: {
              matches: 0,
              runs: 0,
              wickets: 0,
              average: 0,
              strikeRate: 0
            },
            createdAt: new Date().toISOString(),
            isActive: true
          };

          const token = this.generateMockToken(mockUser);
          await this.storeToken(token);
          
          // Also store user data
          await this.updateUserProfile(mockUser);
          
          return {
            success: true,
            token: token,
            user: mockUser,
            message: 'Login successful!'
          };
        } else {
          return {
            success: false,
            message: 'Invalid credentials. Please try again.'
          };
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // 👤 STEP 4: User Registration
  async registerUser(userData: Partial<PlayerRegistration>): Promise<LoginResponse> {
    try {
      console.log('👤 Registering new user:', userData.name);
      
      // In MVP, we'll create a mock user
      const newUser: PlayerRegistration = {
        id: 'user_' + Date.now(),
        name: userData.name || 'New User',
        email: userData.email || '',
        phone: userData.phone || '',
        password: userData.password || '',
        dateOfBirth: userData.dateOfBirth || '1990-01-01',
        preferredRole: userData.preferredRole || 'all-rounder',
        battingStyle: userData.battingStyle || 'right-handed',
        bowlingStyle: userData.bowlingStyle || 'right-arm fast',
        experience: userData.experience || 'beginner',
        location: userData.location || 'Unknown',
        availability: [],
        stats: {
          matches: 0,
          runs: 0,
          wickets: 0,
          average: 0,
          strikeRate: 0
        },
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const token = this.generateMockToken(newUser);
      await this.storeToken(token);
      
      // Also store user data
      await this.updateUserProfile(newUser);
      
      return {
        success: true,
        token: token,
        user: newUser,
        message: 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  // 🔄 STEP 5: Token Management
  private generateMockToken(user: PlayerRegistration): string {
    // In MVP, we'll create a simple token
    // In production, use proper JWT library
    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'scorer', // Default role for MVP
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    // Simple base64 encoding for MVP (not secure for production)
    return btoa(JSON.stringify(payload));
  }

  private async storeToken(token: string): Promise<void> {
    // Store token in AsyncStorage (React Native) or localStorage (Web)
    try {
      console.log('🔑 Storing token:', { tokenLength: token.length, tokenKey: this.tokenKey });
      
      await AsyncStorage.setItem(this.tokenKey, token);
      console.log('✅ Token saved to AsyncStorage');
      
      // Also store in localStorage for web compatibility
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.tokenKey, token);
        console.log('✅ Token saved to localStorage');
      } else {
        console.log('⚠️ localStorage not available (not on web)');
      }
      
      console.log('🔑 Token stored successfully');
    } catch (error) {
      console.error('❌ Token storage failed:', error);
      throw error;
    }
  }

  // 🔍 STEP 6: Get Current User
  async getCurrentUser(): Promise<PlayerRegistration | null> {
    try {
      const token = await AsyncStorage.getItem(this.tokenKey);
      if (!token) return null;

      // Decode token (in production, use proper JWT verification)
      const payload = JSON.parse(atob(token));
      
      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        this.logout();
        return null;
      }

      // Try to get user from Firebase first (primary source)
      try {
        console.log('🔥 Attempting to load user from Firebase...');
        const firebaseUser = await firebaseService.getUser(payload.userId);
        if (firebaseUser) {
          console.log('✅ User loaded from Firebase:', { name: firebaseUser.name, hasProfileImage: !!firebaseUser.profileImage });
          
          // Also update local storage for offline support
          const userDataString = JSON.stringify(firebaseUser);
          await AsyncStorage.setItem(this.userKey, userDataString);
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.userKey, userDataString);
          }
          
          return firebaseUser;
        } else {
          console.log('❌ No user found in Firebase, checking local storage...');
        }
      } catch (firebaseError) {
        console.error('❌ Firebase load failed:', firebaseError);
        console.log('⚠️ Falling back to local storage...');
      }

      // Fallback to local storage if Firebase fails
      let storedUser = await AsyncStorage.getItem(this.userKey);
      console.log('AsyncStorage user data:', storedUser ? 'found' : 'not found');
      
      if (!storedUser && typeof window !== 'undefined' && window.localStorage) {
        storedUser = window.localStorage.getItem(this.userKey);
        console.log('localStorage user data:', storedUser ? 'found' : 'not found');
      }
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('✅ User loaded from local storage:', { name: userData.name, hasProfileImage: !!userData.profileImage });
        return userData;
      }

      // Fallback to basic user data if no stored user
      console.log('⚠️ No user data found, using fallback');
      return {
        id: payload.userId,
        name: payload.name || 'User',
        email: payload.email,
        phone: payload.phone || '',
        password: '',
        dateOfBirth: '1990-01-01',
        preferredRole: 'all-rounder',
        battingStyle: 'right-handed',
        bowlingStyle: 'right-arm fast',
        experience: 'intermediate',
        location: 'Unknown',
        availability: [],
        stats: {
          matches: 0,
          runs: 0,
          wickets: 0,
          average: 0,
          strikeRate: 0
        },
        createdAt: new Date().toISOString(),
        isActive: true
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // 🚪 STEP 7: Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.tokenKey);
      await AsyncStorage.removeItem(this.refreshTokenKey);
      await AsyncStorage.removeItem(this.userKey);
      
      // Also clear localStorage for web compatibility
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.tokenKey);
        window.localStorage.removeItem(this.refreshTokenKey);
        window.localStorage.removeItem(this.userKey);
      }
      
      console.log('🚪 User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // 🔐 STEP 8: Check Authentication Status
  async isAuthenticated(): Promise<boolean> {
    try {
      let token = await AsyncStorage.getItem(this.tokenKey);
      
      // Fallback to localStorage for web compatibility
      if (!token && typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem(this.tokenKey);
      }
      
      if (!token) return false;

      const payload = JSON.parse(atob(token));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  }

  // 👤 STEP 9: Update User Profile
  async updateUserProfile(updatedUser: any): Promise<void> {
    try {
      console.log('🔄 updateUserProfile called with:', { name: updatedUser.name, hasProfileImage: !!updatedUser.profileImage });
      
      // Try to save to Firebase first
      try {
        await firebaseService.saveUser(updatedUser.id, updatedUser);
        console.log('✅ Saved to Firebase');
      } catch (firebaseError) {
        console.error('❌ Firebase save failed:', firebaseError);
        console.log('⚠️ Falling back to local storage only');
      }
      
      // Always save to local storage for offline support
      const userDataString = JSON.stringify(updatedUser);
      await AsyncStorage.setItem(this.userKey, userDataString);
      console.log('✅ Saved to AsyncStorage');
      
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.userKey, userDataString);
        console.log('✅ Saved to localStorage');
      }
      
      console.log('👤 User profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  // 🔄 STEP 9.5: Force Sync User Data
  async forceSyncUserData(userData: any): Promise<void> {
    try {
      const userDataString = JSON.stringify(userData);
      
      // Always save to both storages
      await AsyncStorage.setItem(this.userKey, userDataString);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.userKey, userDataString);
      }
      
      console.log('🔄 Force synced user data to both platforms');
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  }

  // 🔍 Find User by Phone Number
  async findUserByPhone(phone: string): Promise<PlayerRegistration[]> {
    try {
      console.log('🔍 Searching for user by phone:', phone);
      
      // Try Firebase first
      try {
        const { firebaseService } = await import('./firebaseService');
        const users = await firebaseService.findUsersByPhone(phone);
        if (users.length > 0) {
          console.log('✅ Found users in Firebase:', users.length);
          return users;
        }
      } catch (error) {
        console.log('⚠️ Firebase search failed, trying local storage');
      }
      
      // Fallback to local storage search
      const allUsers = await this.getAllStoredUsers();
      const matchingUsers = allUsers.filter(user => user.phone === phone);
      console.log('🔍 Local storage search result:', matchingUsers.length);
      return matchingUsers;
    } catch (error) {
      console.error('❌ Phone search failed:', error);
      return [];
    }
  }

  // 🔍 Find User by Email
  async findUserByEmail(email: string): Promise<PlayerRegistration[]> {
    try {
      console.log('🔍 Searching for user by email:', email);
      
      // Try Firebase first
      try {
        const { firebaseService } = await import('./firebaseService');
        const users = await firebaseService.findUsersByEmail(email);
        if (users.length > 0) {
          console.log('✅ Found users in Firebase:', users.length);
          return users;
        }
      } catch (error) {
        console.log('⚠️ Firebase search failed, trying local storage');
      }
      
      // Fallback to local storage search
      const allUsers = await this.getAllStoredUsers();
      const matchingUsers = allUsers.filter(user => user.email === email);
      console.log('🔍 Local storage search result:', matchingUsers.length);
      return matchingUsers;
    } catch (error) {
      console.error('❌ Email search failed:', error);
      return [];
    }
  }

  // 🔍 Get All Stored Users (for local search)
  async getAllStoredUsers(): Promise<PlayerRegistration[]> {
    try {
      const users: PlayerRegistration[] = [];
      
      // Check AsyncStorage
      const asyncData = await AsyncStorage.getItem(this.userKey);
      if (asyncData) {
        try {
          const user = JSON.parse(asyncData);
          users.push(user);
        } catch (error) {
          console.log('⚠️ Could not parse AsyncStorage user data');
        }
      }
      
      // Check localStorage (web)
      if (typeof window !== 'undefined' && window.localStorage) {
        const localData = window.localStorage.getItem(this.userKey);
        if (localData) {
          try {
            const user = JSON.parse(localData);
            // Only add if not already in users array
            if (!users.find(u => u.id === user.id)) {
              users.push(user);
            }
          } catch (error) {
            console.log('⚠️ Could not parse localStorage user data');
          }
        }
      }
      
      return users;
    } catch (error) {
      console.error('❌ Failed to get stored users:', error);
      return [];
    }
  }

  // 🔄 STEP 9.6: Clear All Data (Debug)
  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all data from both platforms...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem(this.userKey);
      await AsyncStorage.removeItem(this.tokenKey);
      console.log('✅ Cleared AsyncStorage');
      
      // Clear localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.userKey);
        window.localStorage.removeItem(this.tokenKey);
        console.log('✅ Cleared localStorage');
      }
      
      console.log('🗑️ All data cleared successfully');
    } catch (error) {
      console.error('Clear data failed:', error);
    }
  }

  // 🧪 STEP 9.7: Test Storage (Debug)
  async testStorage(): Promise<void> {
    try {
      console.log('🧪 Testing storage...');
      
      const testData = { test: 'data', timestamp: Date.now() };
      const testString = JSON.stringify(testData);
      
      // Test AsyncStorage
      await AsyncStorage.setItem('test_key', testString);
      const asyncResult = await AsyncStorage.getItem('test_key');
      console.log('AsyncStorage test:', asyncResult ? '✅ Working' : '❌ Failed');
      
      // Test localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('test_key', testString);
        const localResult = window.localStorage.getItem('test_key');
        console.log('localStorage test:', localResult ? '✅ Working' : '❌ Failed');
      } else {
        console.log('localStorage test: ⚠️ Not available (not on web)');
      }
      
      // Cleanup
      await AsyncStorage.removeItem('test_key');
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('test_key');
      }
      
      console.log('🧪 Storage test completed');
    } catch (error) {
      console.error('❌ Storage test failed:', error);
    }
  }

  // 🔄 STEP 9.8: Auto Sync Data
  async autoSyncData(): Promise<void> {
    try {
      console.log('🔄 Auto-syncing data between platforms...');
      
      // Get data from both storages
      const asyncUserData = await AsyncStorage.getItem(this.userKey);
      const asyncTokenData = await AsyncStorage.getItem(this.tokenKey);
      
      let localUserData = null;
      let localTokenData = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        localUserData = window.localStorage.getItem(this.userKey);
        localTokenData = window.localStorage.getItem(this.tokenKey);
      }
      
      console.log('Auto-sync status:', {
        asyncUser: !!asyncUserData,
        asyncToken: !!asyncTokenData,
        localUser: !!localUserData,
        localToken: !!localTokenData
      });
      
      // Sync user data: prefer the one that exists and is more complete
      if (asyncUserData && localUserData) {
        try {
          const asyncUser = JSON.parse(asyncUserData);
          const localUser = JSON.parse(localUserData);
          
          // If one has profile image and other doesn't, prefer the one with image
          if (asyncUser.profileImage && !localUser.profileImage) {
            // Copy AsyncStorage to localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(this.userKey, asyncUserData);
              console.log('✅ Auto-synced user data from AsyncStorage to localStorage');
            }
          } else if (localUser.profileImage && !asyncUser.profileImage) {
            // Copy localStorage to AsyncStorage
            await AsyncStorage.setItem(this.userKey, localUserData);
            console.log('✅ Auto-synced user data from localStorage to AsyncStorage');
          }
        } catch (e) {
          console.log('⚠️ Error comparing user data, skipping sync');
        }
      } else if (asyncUserData && !localUserData) {
        // Copy AsyncStorage to localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(this.userKey, asyncUserData);
          console.log('✅ Auto-synced user data from AsyncStorage to localStorage');
        }
      } else if (localUserData && !asyncUserData) {
        // Copy localStorage to AsyncStorage
        await AsyncStorage.setItem(this.userKey, localUserData);
        console.log('✅ Auto-synced user data from localStorage to AsyncStorage');
      }
      
      // Sync token data: prefer AsyncStorage (mobile-first)
      if (asyncTokenData && !localTokenData && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.tokenKey, asyncTokenData);
        console.log('✅ Auto-synced token from AsyncStorage to localStorage');
      } else if (localTokenData && !asyncTokenData) {
        await AsyncStorage.setItem(this.tokenKey, localTokenData);
        console.log('✅ Auto-synced token from localStorage to AsyncStorage');
      }
      
      console.log('🔄 Auto-sync completed');
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  }

  // 📤 STEP 9.9: Export Data for Web
  async exportDataForWeb(): Promise<string> {
    try {
      console.log('📤 Exporting data for web...');
      
      const userData = await AsyncStorage.getItem(this.userKey);
      const tokenData = await AsyncStorage.getItem(this.tokenKey);
      
      const exportData = {
        user: userData,
        token: tokenData,
        timestamp: Date.now()
      };
      
      const exportString = JSON.stringify(exportData);
      console.log('📤 Data exported for web:', { userData: !!userData, tokenData: !!tokenData });
      
      return exportString;
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  // 🔄 STEP 10: Sync Data Between Platforms
  async syncData(): Promise<void> {
    try {
      console.log('🔄 Syncing data between platforms...');
      
      // Get data from AsyncStorage
      const asyncUserData = await AsyncStorage.getItem(this.userKey);
      const asyncTokenData = await AsyncStorage.getItem(this.tokenKey);
      
      // Get data from localStorage
      let localUserData = null;
      let localTokenData = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        localUserData = window.localStorage.getItem(this.userKey);
        localTokenData = window.localStorage.getItem(this.tokenKey);
      }
      
      console.log('Data sync status:', {
        asyncUser: !!asyncUserData,
        asyncToken: !!asyncTokenData,
        localUser: !!localUserData,
        localToken: !!localTokenData
      });
      
      // Check if we're on web (localStorage available)
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🌐 Running on web - syncing from AsyncStorage to localStorage');
        
        // Copy AsyncStorage to localStorage
        if (asyncUserData) {
          window.localStorage.setItem(this.userKey, asyncUserData);
          console.log('✅ Copied user data from AsyncStorage to localStorage');
        }
        
        if (asyncTokenData) {
          window.localStorage.setItem(this.tokenKey, asyncTokenData);
          console.log('✅ Copied token from AsyncStorage to localStorage');
        }
        
        // Copy localStorage to AsyncStorage if AsyncStorage is empty
        if (!asyncUserData && localUserData) {
          await AsyncStorage.setItem(this.userKey, localUserData);
          console.log('✅ Copied user data from localStorage to AsyncStorage');
        }
        
        if (!asyncTokenData && localTokenData) {
          await AsyncStorage.setItem(this.tokenKey, localTokenData);
          console.log('✅ Copied token from localStorage to AsyncStorage');
        }
      } else {
        console.log('📱 Running on mobile - localStorage not available');
        console.log('📱 Data is stored in AsyncStorage only');
        console.log('📱 To sync to web, open web version and click "Refresh Data"');
      }
      
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
