// Utility functions for Cricket App
import { Match, Player } from '../types';

// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Match utilities
export const getMatchStatus = (match: Match): string => {
  switch (match.status) {
    case 'upcoming':
      return 'Upcoming';
    case 'live':
      return 'Live';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

export const getMatchScore = (match: Match): string => {
  if (!match.score) return 'TBD';
  
  const { homeTeam, awayTeam } = match.score;
  return `${homeTeam.runs}/${homeTeam.wickets} vs ${awayTeam.runs}/${awayTeam.wickets}`;
};

// Player utilities
export const getPlayerRole = (role: Player['role']): string => {
  switch (role) {
    case 'batsman':
      return 'Batsman';
    case 'bowler':
      return 'Bowler';
    case 'all-rounder':
      return 'All-rounder';
    case 'wicket-keeper':
      return 'Wicket-keeper';
    default:
      return 'Player';
  }
};

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Number utilities
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
