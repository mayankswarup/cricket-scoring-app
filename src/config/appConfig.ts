/**
 * App Configuration - Centralized settings for easy management
 * Change values here to reflect across the entire app
 */

export const APP_CONFIG = {
  // App Information
  APP_NAME: 'Cricket Score',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Professional Cricket Scoring App',
  
  // App Store Information
  APP_STORE: {
    IOS_APP_ID: 'your-ios-app-id',
    ANDROID_PACKAGE: 'com.cricketapp.scoring',
    PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.cricketapp.scoring',
    APP_STORE_URL: 'https://apps.apple.com/app/cricket-score/id123456789',
  },

  // Live Scoring Configuration
  LIVE_SCORING: {
    DEFAULT_OVERS: 20,
    MAX_OVERS: 50,
    MIN_OVERS: 1,
    BALLS_PER_OVER: 6,
    MAX_WICKETS: 10,
    MAX_RUNS_PER_BALL: 6,
    TIMEOUT_DURATION: 300000, // 5 minutes in milliseconds
    SCORING_OPTIONS: {
      RUNS: [0, 1, 2, 3, 4, 5, 6, 7],
      WICKETS: ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Other'],
      EXTRAS: ['Wide', 'No Ball', 'Bye', 'Leg Bye'],
      BALL_TYPES: ['Normal', 'Wide', 'No Ball', 'Free Hit'],
    },
  },

  // Match Types
  MATCH_TYPES: {
    T20: { name: 'T20', overs: 20, format: 'T20' },
    ODI: { name: 'ODI', overs: 50, format: 'One Day' },
    TEST: { name: 'Test', overs: 90, format: 'Test Match' },
    CUSTOM: { name: 'Custom', overs: 20, format: 'Custom' },
  },


  // UI Configuration
  UI: {
    PRIMARY_COLOR: '#8B4513', // Cricket brown
    SECONDARY_COLOR: '#FFD700', // Gold
    SUCCESS_COLOR: '#4CAF50',
    ERROR_COLOR: '#F44336',
    WARNING_COLOR: '#FF9800',
    BACKGROUND_COLOR: '#F5F5F5',
    TEXT_COLOR: '#333333',
    BORDER_RADIUS: 8,
    SHADOW_OPACITY: 0.1,
  },

  // Animation Settings
  ANIMATIONS: {
    SCORE_UPDATE_DURATION: 500,
    BUTTON_PRESS_DURATION: 150,
    TRANSITION_DURATION: 300,
    FLIP_ANIMATION_DURATION: 1100,
  },

  // Firebase Configuration
  FIREBASE: {
    COLLECTIONS: {
      MATCHES: 'matches',
      PLAYERS: 'players',
      TEAMS: 'teams',
      SCORES: 'scores',
    },
    CACHE_DURATION: 300000, // 5 minutes
  },

  // Performance Settings
  PERFORMANCE: {
    MAX_MATCHES_CACHE: 50,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    DEBOUNCE_DELAY: 300,
    MAX_UNDO_STEPS: 10,
  },

  // Feature Flags
  FEATURES: {
    LIVE_SCORING: true,
    MATCH_MANAGEMENT: true,
    TEAM_MANAGEMENT: true,
    PLAYER_PROFILES: true,
    STATISTICS: true,
    EXPORT_DATA: true,
    OFFLINE_MODE: true,
    REAL_TIME_SYNC: true,
  },

  // App Store Optimization
  SEO: {
    KEYWORDS: ['cricket', 'scoring', 'live score', 'cricket app', 'match tracking'],
    CATEGORIES: ['Sports', 'Games'],
    TARGET_AUDIENCE: 'Cricket enthusiasts, players, coaches, fans',
  },

  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Please check your internet connection',
    SAVE_ERROR: 'Failed to save match data',
    LOAD_ERROR: 'Failed to load match data',
    INVALID_SCORE: 'Please enter a valid score',
    MATCH_NOT_FOUND: 'Match not found',
    PERMISSION_DENIED: 'Permission denied',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    MATCH_SAVED: 'Match saved successfully',
    SCORE_UPDATED: 'Score updated',
    MATCH_CREATED: 'Match created successfully',
    DATA_EXPORTED: 'Data exported successfully',
  },

  // Validation Rules
  VALIDATION: {
    MIN_TEAM_NAME_LENGTH: 2,
    MAX_TEAM_NAME_LENGTH: 50,
    MIN_PLAYER_NAME_LENGTH: 2,
    MAX_PLAYER_NAME_LENGTH: 50,
    MAX_MATCH_NOTES_LENGTH: 500,
  },
};

// Export individual configs for easy access
export const SCORING_CONFIG = APP_CONFIG.LIVE_SCORING;
export const UI_CONFIG = APP_CONFIG.UI;
export const MATCH_CONFIG = APP_CONFIG.MATCH_TYPES;
export const FEATURE_CONFIG = APP_CONFIG.FEATURES;
export const ERROR_CONFIG = APP_CONFIG.ERROR_MESSAGES;
export const SUCCESS_CONFIG = APP_CONFIG.SUCCESS_MESSAGES;
