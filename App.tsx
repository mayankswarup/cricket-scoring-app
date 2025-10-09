import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/contexts/UserContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <UserProvider>
      <HomeScreen />
      <StatusBar style="auto" />
    </UserProvider>
  );
}
