/**
 * Image Upload Service
 * Handles uploading profile pictures to Firebase Storage
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

class ImageUploadService {
  private storage = getStorage();

  /**
   * Upload profile picture to Firebase Storage
   * @param phoneNumber - User's phone number (used as unique identifier)
   * @param imageUri - Local image URI from image picker
   * @returns Promise<string> - Download URL of uploaded image
   */
  async uploadProfilePicture(phoneNumber: string, imageUri: string): Promise<string> {
    try {
      console.log('📤 Uploading profile picture for user:', phoneNumber);
      
      // For development, we'll use a fallback approach
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.log('🔧 Development mode: Using base64 encoding for image storage');
        
        // Convert image to base64 for local storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await this.blobToBase64(blob);
        
        // Store as data URL in Firestore instead of Firebase Storage
        const dataURL = `data:image/jpeg;base64,${base64}`;
        console.log('✅ Image converted to base64 for development storage');
        return dataURL;
      }
      
      // Production: Use Firebase Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const imageRef = ref(this.storage, `profile-pictures/${phoneNumber}.jpg`);
      
      // Upload the image
      const snapshot = await uploadBytes(imageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          phoneNumber,
          uploadedAt: new Date().toISOString(),
        }
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Profile picture uploaded successfully:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Failed to upload profile picture:', error);
      throw new Error('Failed to upload profile picture. Please try again.');
    }
  }

  /**
   * Convert blob to base64 string
   * @param blob - Blob object
   * @returns Promise<string> - Base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Delete profile picture from Firebase Storage
   * @param phoneNumber - User's phone number
   */
  async deleteProfilePicture(phoneNumber: string): Promise<void> {
    try {
      console.log('🗑️ Deleting profile picture for user:', phoneNumber);
      
      const imageRef = ref(this.storage, `profile-pictures/${phoneNumber}.jpg`);
      await deleteObject(imageRef);
      
      console.log('✅ Profile picture deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete profile picture:', error);
      // Don't throw error - image might not exist
    }
  }

  /**
   * Get profile picture URL
   * @param phoneNumber - User's phone number
   * @returns Promise<string | null> - Download URL or null if not found
   */
  async getProfilePictureURL(phoneNumber: string): Promise<string | null> {
    try {
      // For development, we don't need to check Firebase Storage
      // as images are stored as base64 in Firestore
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.log('🔧 Development mode: Profile pictures stored in Firestore as base64');
        return null; // Will be loaded from Firestore profile data
      }
      
      // Production: Check Firebase Storage
      const imageRef = ref(this.storage, `profile-pictures/${phoneNumber}.jpg`);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.log('📷 No profile picture found for user:', phoneNumber);
      return null;
    }
  }
}

export const imageUploadService = new ImageUploadService();
