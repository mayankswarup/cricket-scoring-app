// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config - Your actual config
const firebaseConfig = {
  apiKey: "AIzaSyC7tD1DO6GnqZOkBmqC15Jo4G_Ta_YG8NY",
  authDomain: "cricket-app-7d4b5.firebaseapp.com",
  projectId: "cricket-app-7d4b5",
  storageBucket: "cricket-app-7d4b5.firebasestorage.app",
  messagingSenderId: "485455094442",
  appId: "1:485455094442:web:1fbe251ed871531fd026d3",
  measurementId: "G-ZH58CWQQPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Force refresh auth state (helps with billing changes)
console.log('🔥 Firebase initialized for project:', firebaseConfig.projectId);

export default app;
