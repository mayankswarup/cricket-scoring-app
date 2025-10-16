import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/contexts/UserContext';
import HomeScreen from './src/screens/HomeScreen';
import PhoneLoginScreen from './src/screens/PhoneLoginScreen';
import { phoneAuthService } from './src/services/phoneAuthService';
import { COLORS } from './src/constants';
import './src/utils/initializeAppOwner'; // Auto-initialize app owner as Pro

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA when app loads
    try {
      phoneAuthService.initializeRecaptcha();
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA:', error);
    }

    // Check if user is already logged in
    const unsubscribe = phoneAuthService.onAuthStateChanged((user) => {
      console.log('🔐 Auth state changed:', user?.phoneNumber || 'Not logged in');
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <UserProvider>
      {isAuthenticated ? (
        <HomeScreen />
      ) : (
        <PhoneLoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      <StatusBar style="auto" />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
