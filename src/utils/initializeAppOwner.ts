/**
 * Initialize App Owner as Pro Player
 * This utility sets up the app owner (9019078195) as a Pro Player
 */

import { userProfileService } from '../services/userProfileService';

export const initializeAppOwner = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing app owner as Pro Player...');
    await userProfileService.initializeAppOwner();
    console.log('✅ App owner successfully set as Pro Player!');
  } catch (error) {
    console.error('❌ Failed to initialize app owner:', error);
    throw error;
  }
};

// Auto-initialize when this module is imported
initializeAppOwner().catch(console.error);
