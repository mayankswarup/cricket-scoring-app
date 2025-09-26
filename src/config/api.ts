// API Configuration for Cricket App
// This file contains configuration for different API providers

export const API_CONFIG = {
  // CricketAPI.com configuration
  cricketApi: {
    baseUrl: 'https://api.cricketapi.com/v1',
    // Add your API key here or set it as an environment variable
    apiKey: process.env.EXPO_PUBLIC_CRICKET_API_KEY || 'your_api_key_here',
    // Set to true to use real data, false to use mock data
    useRealData: process.env.EXPO_PUBLIC_USE_REAL_DATA === 'true' || true, // Temporarily enabled for testing
  },
  
  // Free cricket API (no key required)
  freeCricketApi: {
    baseUrl: 'https://cricket-api.vercel.app/api',
    useRealData: true, // Always enabled for free API
  },
  
  // Other API configurations can be added here
  rapidApi: {
    baseUrl: 'https://cricketapi.com/v1',
    apiKey: process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
  }
};

// Instructions for setting up CricketAPI.com:
// 1. Go to https://rapidapi.com/cricketapi/api/cricketapi
// 2. Subscribe to get an API key
// 3. Set EXPO_PUBLIC_CRICKET_API_KEY in your .env file
// 4. Set EXPO_PUBLIC_USE_REAL_DATA=true to enable real data
