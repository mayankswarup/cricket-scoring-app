/**
 * Script to add 22 dummy players to Firebase
 * Run this once to populate the database with test players
 */

import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DummyPlayer {
  phoneNumber: string;
  name: string;
  email?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  playingRole: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingHand: 'left' | 'right';
  bowlingStyle?: 'fast' | 'medium' | 'spin';
  jerseyNumber?: number;
  teamIds?: string[];
  isPro: boolean;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  hasCompletedProfile: boolean;
  // Match availability fields - all set to available
  isPlayingMatch: false;
  currentMatchId: null;
  matchStartTime: null;
  matchEndTime: null;
}

const dummyPlayers: Omit<DummyPlayer, 'createdAt' | 'updatedAt' | 'lastLoginAt'>[] = [
  {
    phoneNumber: '+919876543210',
    name: 'Rohit Sharma',
    email: 'rohit@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 45,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543211',
    name: 'Virat Kohli',
    email: 'virat@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 18,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543212',
    name: 'MS Dhoni',
    email: 'dhoni@example.com',
    playingRole: 'wicket-keeper',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 7,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543213',
    name: 'Jasprit Bumrah',
    email: 'bumrah@example.com',
    playingRole: 'bowler',
    battingHand: 'right',
    bowlingStyle: 'fast',
    jerseyNumber: 93,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543214',
    name: 'Ravindra Jadeja',
    email: 'jadeja@example.com',
    playingRole: 'all-rounder',
    battingHand: 'left',
    bowlingStyle: 'spin',
    jerseyNumber: 8,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543215',
    name: 'KL Rahul',
    email: 'rahul@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 1,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543216',
    name: 'Hardik Pandya',
    email: 'pandya@example.com',
    playingRole: 'all-rounder',
    battingHand: 'right',
    bowlingStyle: 'fast',
    jerseyNumber: 33,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543217',
    name: 'Rishabh Pant',
    email: 'pant@example.com',
    playingRole: 'wicket-keeper',
    battingHand: 'left',
    bowlingStyle: 'medium',
    jerseyNumber: 17,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543218',
    name: 'Shubman Gill',
    email: 'gill@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 77,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543219',
    name: 'Mohammed Shami',
    email: 'shami@example.com',
    playingRole: 'bowler',
    battingHand: 'right',
    bowlingStyle: 'fast',
    jerseyNumber: 11,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543220',
    name: 'Yuzvendra Chahal',
    email: 'chahal@example.com',
    playingRole: 'bowler',
    battingHand: 'right',
    bowlingStyle: 'spin',
    jerseyNumber: 3,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543221',
    name: 'Ishan Kishan',
    email: 'kishan@example.com',
    playingRole: 'wicket-keeper',
    battingHand: 'left',
    bowlingStyle: 'medium',
    jerseyNumber: 32,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543222',
    name: 'Suryakumar Yadav',
    email: 'surya@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 63,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543223',
    name: 'Axar Patel',
    email: 'axar@example.com',
    playingRole: 'all-rounder',
    battingHand: 'left',
    bowlingStyle: 'spin',
    jerseyNumber: 20,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543224',
    name: 'Arshdeep Singh',
    email: 'arshdeep@example.com',
    playingRole: 'bowler',
    battingHand: 'left',
    bowlingStyle: 'fast',
    jerseyNumber: 2,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543225',
    name: 'Ruturaj Gaikwad',
    email: 'ruturaj@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 31,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543226',
    name: 'Deepak Chahar',
    email: 'chahar@example.com',
    playingRole: 'bowler',
    battingHand: 'right',
    bowlingStyle: 'fast',
    jerseyNumber: 14,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543227',
    name: 'Sanju Samson',
    email: 'samson@example.com',
    playingRole: 'wicket-keeper',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 9,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543228',
    name: 'Kuldeep Yadav',
    email: 'kuldeep@example.com',
    playingRole: 'bowler',
    battingHand: 'left',
    bowlingStyle: 'spin',
    jerseyNumber: 23,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543229',
    name: 'Shreyas Iyer',
    email: 'iyer@example.com',
    playingRole: 'batsman',
    battingHand: 'right',
    bowlingStyle: 'medium',
    jerseyNumber: 41,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543230',
    name: 'Washington Sundar',
    email: 'sundar@example.com',
    playingRole: 'all-rounder',
    battingHand: 'left',
    bowlingStyle: 'spin',
    jerseyNumber: 5,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  },
  {
    phoneNumber: '+919876543231',
    name: 'Tilak Varma',
    email: 'tilak@example.com',
    playingRole: 'batsman',
    battingHand: 'left',
    bowlingStyle: 'medium',
    jerseyNumber: 56,
    teamIds: [],
    isPro: true,
    hasCompletedProfile: true,
    isPlayingMatch: false,
    currentMatchId: null,
    matchStartTime: null,
    matchEndTime: null,
  }
];

export const addDummyPlayers = async (): Promise<void> => {
  try {
    console.log('🚀 Starting to add 22 dummy players to Firebase...');
    
    const usersRef = collection(db, 'users');
    
    for (const player of dummyPlayers) {
      try {
        // Check if player already exists
        const playerRef = doc(db, 'users', player.phoneNumber);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          console.log(`⚠️ Player ${player.name} already exists, skipping...`);
          continue;
        }
        
        await setDoc(playerRef, {
          ...player,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
        console.log(`✅ Added player: ${player.name} (${player.phoneNumber})`);
      } catch (error) {
        console.error(`❌ Failed to add player ${player.name}:`, error);
      }
    }
    
    console.log('🎉 Successfully added all dummy players to Firebase!');
  } catch (error) {
    console.error('❌ Error adding dummy players:', error);
    throw error;
  }
};

// Function to remove duplicate players
export const removeDuplicatePlayers = async (): Promise<void> => {
  try {
    console.log('🧹 Starting to remove duplicate players from Firebase...');
    
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const phoneNumberMap = new Map<string, any>();
    const duplicatesToDelete: string[] = [];
    
    // Group players by phone number
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const phoneNumber = userData.phoneNumber;
      
      console.log(`🔍 Checking player: ${userData.name} (${phoneNumber}) - Doc ID: ${doc.id}`);
      
      if (phoneNumberMap.has(phoneNumber)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(doc.id);
        console.log(`🗑️ Found duplicate: ${userData.name} (${phoneNumber}) - Will delete doc: ${doc.id}`);
      } else {
        phoneNumberMap.set(phoneNumber, { id: doc.id, data: userData });
        console.log(`✅ First occurrence: ${userData.name} (${phoneNumber}) - Keeping doc: ${doc.id}`);
      }
    });
    
    // Delete duplicates
    for (const docId of duplicatesToDelete) {
      try {
        await deleteDoc(doc(db, 'users', docId));
        console.log(`✅ Deleted duplicate player with ID: ${docId}`);
      } catch (error) {
        console.error(`❌ Failed to delete duplicate ${docId}:`, error);
      }
    }
    
    console.log(`🎉 Cleanup completed! Removed ${duplicatesToDelete.length} duplicate players.`);
    console.log(`📊 Total players before cleanup: ${usersSnapshot.size}`);
    console.log(`📊 Total players after cleanup: ${usersSnapshot.size - duplicatesToDelete.length}`);
  } catch (error) {
    console.error('❌ Error removing duplicate players:', error);
    throw error;
  }
};

// Function to run the script
export const runDummyPlayerScript = async () => {
  try {
    await addDummyPlayers();
    console.log('✅ Dummy players script completed successfully!');
  } catch (error) {
    console.error('❌ Dummy players script failed:', error);
  }
};
