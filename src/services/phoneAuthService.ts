/**
 * Firebase Phone Authentication Service
 * Handles real SMS OTP authentication with Firebase
 */

import { 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Initialize invisible reCAPTCHA
   * Required by Firebase for bot protection
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container'): void {
    if (this.recaptchaVerifier) {
      return; // Already initialized
    }

    try {
      // For web, create the container element if it doesn't exist
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.style.display = 'none';
          container.style.position = 'absolute';
          container.style.top = '-9999px';
          document.body.appendChild(container);
          console.log('✅ Created reCAPTCHA container:', containerId);
        }
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response: string) => {
          console.log('✅ reCAPTCHA verified with response:', response);
        },
        'expired-callback': () => {
          console.log('⚠️ reCAPTCHA expired, please try again');
          this.recaptchaVerifier = null; // Reset for retry
        },
        'error-callback': (error: any) => {
          console.error('❌ reCAPTCHA error:', error);
          this.recaptchaVerifier = null; // Reset for retry
        }
      });

      console.log('✅ reCAPTCHA initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize reCAPTCHA:', error);
      this.recaptchaVerifier = null;
      throw new Error('Failed to initialize reCAPTCHA. Please check Firebase configuration.');
    }
  }

  /**
   * Send OTP to phone number
   * @param phoneNumber - 10 digit phone number (e.g., "9019078195")
   * @returns Promise<boolean> - true if OTP sent successfully
   */
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      // Format phone number with country code (+91 for India)
      const formattedPhone = `+91${phoneNumber}`;
      console.log('📱 Sending OTP to:', formattedPhone);

      // Firebase phone authentication is now properly configured

      // Initialize reCAPTCHA if not already done
      if (!this.recaptchaVerifier) {
        try {
          this.initializeRecaptcha();
        } catch (error) {
          console.error('❌ reCAPTCHA initialization failed:', error);
          throw new Error('reCAPTCHA initialization failed. Please check authorized domains in Firebase Console.');
        }
      }

      // Send OTP via Firebase
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier!
      );

      console.log('✅ OTP sent successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send OTP:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('SMS quota exceeded. Please try again tomorrow.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Phone authentication is not enabled. Please contact support.');
      } else {
        throw new Error(`Failed to send OTP: ${error.message}`);
      }
    }
  }

  /**
   * Verify OTP and sign in user
   * @param otp - 6 digit OTP code
   * @returns Promise<User> - Firebase user object
   */
  async verifyOTP(otp: string): Promise<User> {
    try {
      // Validate OTP
      if (!otp || otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      if (!this.confirmationResult) {
        throw new Error('Please request OTP first');
      }

      console.log('🔐 Verifying OTP...');

      // Verify OTP with Firebase
      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;

      console.log('✅ OTP verified successfully');
      console.log('👤 User:', user.phoneNumber);

      // Create/update user in Firestore
      await this.createOrUpdateUser(user);

      return user;
    } catch (error: any) {
      console.error('❌ Failed to verify OTP:', error);

      // User-friendly error messages
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('OTP expired. Please request a new one.');
      } else {
        throw new Error('Failed to verify OTP. Please try again.');
      }
    }
  }

  /**
   * Create or update user in Firestore
   * @param user - Firebase user object
   */
  private async createOrUpdateUser(user: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.phoneNumber!);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user - create profile
        await setDoc(userRef, {
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPro: false,
          teams: [],
          hasCompletedProfile: false, // User needs to complete player profile
        });
        console.log('✅ New user created in Firestore');
      } else {
        // Existing user - update last login
        await setDoc(userRef, {
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('✅ User updated in Firestore');
      }
    } catch (error) {
      console.error('❌ Failed to create/update user in Firestore:', error);
      // Don't throw - user is still authenticated
    }
  }

  /**
   * Check if user is currently logged in
   * @returns Promise<User | null>
   */
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Listen for auth state changes
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('❌ Failed to sign out:', error);
      throw error;
    }
  }

  /**
   * Reset reCAPTCHA (for resending OTP)
   */
  resetRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

export const phoneAuthService = new PhoneAuthService();

