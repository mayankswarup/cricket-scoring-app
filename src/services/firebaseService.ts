// Firebase Service for User Data Management
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerRegistration } from '../types';

class FirebaseService {
  private usersCollection = 'users';
  private tokensCollection = 'tokens';

  // 🔥 Save User Data to Firebase
  async saveUser(userId: string, userData: PlayerRegistration): Promise<void> {
    try {
      console.log('🔥 Saving user to Firebase:', { userId, name: userData.name });
      
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!userData) {
        throw new Error('User data is required');
      }
      
      // Clean data - remove undefined values
      const cleanUserData = { ...userData };
      
      // Remove undefined fields
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === undefined) {
          delete cleanUserData[key];
        }
      });
      
      // Ensure profileImage is either a string or omitted
      if (cleanUserData.profileImage === undefined || cleanUserData.profileImage === null) {
        delete cleanUserData.profileImage;
      }
      
      console.log('🔥 Cleaned user data:', { 
        name: cleanUserData.name, 
        hasProfileImage: !!cleanUserData.profileImage,
        profileImageType: typeof cleanUserData.profileImage
      });
      
      const userRef = doc(db, this.usersCollection, userId);
      await setDoc(userRef, {
        ...cleanUserData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ User saved to Firebase successfully');
    } catch (error) {
      console.error('❌ Failed to save user to Firebase:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  // 🔥 Get User Data from Firebase
  async getUser(userId: string): Promise<PlayerRegistration | null> {
    try {
      console.log('🔥 Getting user from Firebase:', userId);
      
      const userRef = doc(db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as PlayerRegistration;
        console.log('✅ User found in Firebase:', { name: userData.name, hasProfileImage: !!userData.profileImage });
        return userData;
      } else {
        console.log('❌ User not found in Firebase');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get user from Firebase:', error);
      return null;
    }
  }

  // 🔥 Update User Data in Firebase
  async updateUser(userId: string, userData: Partial<PlayerRegistration>): Promise<void> {
    try {
      console.log('🔥 Updating user in Firebase:', { userId, updates: Object.keys(userData) });
      
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ User updated in Firebase successfully');
    } catch (error) {
      console.error('❌ Failed to update user in Firebase:', error);
      throw error;
    }
  }

  // 🔥 Save Token to Firebase
  async saveToken(userId: string, token: string): Promise<void> {
    try {
      console.log('🔥 Saving token to Firebase:', userId);
      
      const tokenRef = doc(db, this.tokensCollection, userId);
      await setDoc(tokenRef, {
        token,
        userId,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Token saved to Firebase successfully');
    } catch (error) {
      console.error('❌ Failed to save token to Firebase:', error);
      throw error;
    }
  }

  // 🔥 Get Token from Firebase
  async getToken(userId: string): Promise<string | null> {
    try {
      console.log('🔥 Getting token from Firebase:', userId);
      
      const tokenRef = doc(db, this.tokensCollection, userId);
      const tokenSnap = await getDoc(tokenRef);
      
      if (tokenSnap.exists()) {
        const tokenData = tokenSnap.data();
        console.log('✅ Token found in Firebase');
        return tokenData.token;
      } else {
        console.log('❌ Token not found in Firebase');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get token from Firebase:', error);
      return null;
    }
  }

  // 🔥 Delete User from Firebase
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log('🔥 Deleting user from Firebase:', userId);
      
      const userRef = doc(db, this.usersCollection, userId);
      const tokenRef = doc(db, this.tokensCollection, userId);
      
      await deleteDoc(userRef);
      await deleteDoc(tokenRef);
      
      console.log('✅ User deleted from Firebase successfully');
    } catch (error) {
      console.error('❌ Failed to delete user from Firebase:', error);
      throw error;
    }
  }

  // 🔥 Test Firebase Connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Simple connection test without Firestore operations
      console.log('🔥 Firebase app initialized successfully');
      console.log('🔥 Database instance created');
      
      // Try a simple read operation instead of write
      const testRef = doc(db, 'test', 'connection');
      const testSnap = await getDoc(testRef);
      
      console.log('✅ Firebase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Check if it's a configuration error
      if (error instanceof Error && error.message.includes('CONFIGURATION_NOT_FOUND')) {
        console.error('❌ Firebase project configuration not found. Please check:');
        console.error('1. Firebase project exists and is active');
        console.error('2. API key is correct');
        console.error('3. Firestore is enabled');
        console.error('4. Security rules are set to test mode');
      }
      
      return false;
    }
  }

  // 🔥 Check Firebase Project Status
  async checkProjectStatus(): Promise<void> {
    try {
      console.log('🔥 Checking Firebase project status...');
      
      // Try to access the project configuration
      const testRef = doc(db, 'test', 'status');
      await getDoc(testRef);
      
      console.log('✅ Firebase project is accessible');
    } catch (error) {
      console.error('❌ Firebase project check failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('CONFIGURATION_NOT_FOUND')) {
          console.error('❌ Firebase project configuration not found!');
          console.error('🔧 Solutions:');
          console.error('1. Go to Firebase Console: https://console.firebase.google.com/');
          console.error('2. Check if project "cricket-app-7d4b5" exists');
          console.error('3. If not, create a new project');
          console.error('4. Get new config from Project Settings > General > Your apps');
        } else if (error.message.includes('PERMISSION_DENIED')) {
          console.error('❌ Firebase permissions denied!');
          console.error('🔧 Solutions:');
          console.error('1. Enable Firestore Database in Firebase Console');
          console.error('2. Set security rules to test mode: allow read, write: if true;');
        } else {
          console.error('❌ Unknown Firebase error:', error.message);
        }
      }
    }
  }

  // 🔍 Find Users by Phone Number
  async findUsersByPhone(phone: string): Promise<PlayerRegistration[]> {
    try {
      console.log('🔍 Searching Firebase for users with phone:', phone);
      
      const usersRef = collection(db, this.usersCollection);
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      const users: PlayerRegistration[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as PlayerRegistration);
      });
      
      console.log('✅ Found users in Firebase by phone:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Failed to search users by phone:', error);
      return [];
    }
  }

  // 🔍 Find Users by Email
  async findUsersByEmail(email: string): Promise<PlayerRegistration[]> {
    try {
      console.log('🔍 Searching Firebase for users with email:', email);
      
      const usersRef = collection(db, this.usersCollection);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      const users: PlayerRegistration[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as PlayerRegistration);
      });
      
      console.log('✅ Found users in Firebase by email:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Failed to search users by email:', error);
      return [];
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
