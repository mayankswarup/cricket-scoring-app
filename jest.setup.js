import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'test',
  modelName: 'test',
  osName: 'ios',
  osVersion: '1.0.0',
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock Firebase
jest.mock('./src/config/firebase', () => ({
  db: {},
  auth: {
    currentUser: null,
    signInWithPhoneNumber: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Mock React Native components that might cause issues
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Silence console warnings/errors in tests unless needed
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

