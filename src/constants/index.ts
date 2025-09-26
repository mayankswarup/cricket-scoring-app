// Cricket App Constants
import { API_CONFIG } from '../config/api';

export const APP_CONFIG = {
  name: 'Cricket App',
  version: '1.0.0',
  apiBaseUrl: 'https://api.cricket-app.com', // Replace with your actual API
  cricketApiBaseUrl: API_CONFIG.cricketApi.baseUrl,
  cricketApiKey: API_CONFIG.cricketApi.apiKey,
  useRealData: API_CONFIG.cricketApi.useRealData,
};

export const COLORS = {
  primary: '#800020', // Maroon
  secondary: '#059669', // Green
  accent: '#DC2626', // Red
  background: '#F8FAFC', // Light gray
  surface: '#FFFFFF',
  white: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  black: '#000000',
};

// Country-specific colors (matching their cricket identity)
export const COUNTRY_COLORS = {
  'India': '#1E40AF', // India Blue (bleeds blue!)
  'Australia': '#FFD700', // Australia Gold
  'England': '#DC2626', // England Red
  'Pakistan': '#01411C', // Pakistan Green
  'South Africa': '#007A4D', // South Africa Green
  'New Zealand': '#000000', // New Zealand Black
  'West Indies': '#FF0000', // West Indies Red
  'Sri Lanka': '#FF6600', // Sri Lanka Orange
  'Bangladesh': '#006A4E', // Bangladesh Green
  'Afghanistan': '#000000', // Afghanistan Black
};

export const SIZES = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Font sizes
  small: 12,
  font: 14,
  h3: 16,
  h2: 18,
  h1: 24,
  // Spacing
  padding: 16,
  radius: 8,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const CRICKET_TEAMS = [
  { id: '1', name: 'India', shortName: 'IND', logo: '' },
  { id: '2', name: 'Australia', shortName: 'AUS', logo: '' },
  { id: '3', name: 'England', shortName: 'ENG', logo: '' },
  { id: '4', name: 'Pakistan', shortName: 'PAK', logo: '' },
  { id: '5', name: 'South Africa', shortName: 'SA', logo: '' },
  { id: '6', name: 'New Zealand', shortName: 'NZ', logo: '' },
  { id: '7', name: 'West Indies', shortName: 'WI', logo: '' },
  { id: '8', name: 'Sri Lanka', shortName: 'SL', logo: '' },
  { id: '9', name: 'Bangladesh', shortName: 'BAN', logo: '' },
  { id: '10', name: 'Afghanistan', shortName: 'AFG', logo: '' },
];
