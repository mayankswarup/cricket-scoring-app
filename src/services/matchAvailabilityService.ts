/**
 * Match Availability Service
 * Handles player availability during matches
 */

import { userProfileService } from './userProfileService';

export interface MatchInfo {
  matchId: string;
  homeTeam: string[];
  awayTeam: string[];
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'live' | 'completed';
}

class MatchAvailabilityService {
  /**
   * Start a match - mark all players as unavailable
   * @param matchInfo - Match information
   */
  async startMatch(matchInfo: MatchInfo): Promise<void> {
    try {
      const allPlayers = [...matchInfo.homeTeam, ...matchInfo.awayTeam];
      
      // Mark all players as unavailable
      for (const playerPhone of allPlayers) {
        await userProfileService.setPlayerUnavailable(
          playerPhone,
          matchInfo.matchId,
          matchInfo.startTime
        );
      }
      
      console.log(`✅ Match ${matchInfo.matchId} started - ${allPlayers.length} players marked as unavailable`);
    } catch (error) {
      console.error('❌ Failed to start match:', error);
      throw error;
    }
  }

  /**
   * End a match - mark all players as available
   * @param matchInfo - Match information with end time
   */
  async endMatch(matchInfo: MatchInfo): Promise<void> {
    try {
      if (!matchInfo.endTime) {
        throw new Error('End time is required to end a match');
      }

      const allPlayers = [...matchInfo.homeTeam, ...matchInfo.awayTeam];
      
      // Mark all players as available
      for (const playerPhone of allPlayers) {
        await userProfileService.setPlayerAvailable(
          playerPhone,
          matchInfo.endTime
        );
      }
      
      console.log(`✅ Match ${matchInfo.matchId} ended - ${allPlayers.length} players marked as available`);
    } catch (error) {
      console.error('❌ Failed to end match:', error);
      throw error;
    }
  }

  /**
   * Check if any players in a team are currently unavailable
   * @param teamPlayers - Array of player phone numbers
   * @returns Array of unavailable player phone numbers
   */
  async getUnavailablePlayers(teamPlayers: string[]): Promise<string[]> {
    try {
      const unavailablePlayers: string[] = [];
      
      for (const playerPhone of teamPlayers) {
        const isAvailable = await userProfileService.isPlayerAvailable(playerPhone);
        if (!isAvailable) {
          unavailablePlayers.push(playerPhone);
        }
      }
      
      return unavailablePlayers;
    } catch (error) {
      console.error('❌ Failed to check player availability:', error);
      return teamPlayers; // Assume all unavailable on error
    }
  }

  /**
   * Get match status for a player
   * @param playerPhone - Player's phone number
   * @returns Match info if player is in a match, null if available
   */
  async getPlayerMatchStatus(playerPhone: string): Promise<MatchInfo | null> {
    try {
      const userProfile = await userProfileService.getUserProfile(playerPhone);
      
      if (!userProfile || !userProfile.isPlayingMatch || !userProfile.currentMatchId) {
        return null;
      }
      
      return {
        matchId: userProfile.currentMatchId,
        homeTeam: [], // Would need to fetch from match data
        awayTeam: [], // Would need to fetch from match data
        startTime: userProfile.matchStartTime || '',
        endTime: userProfile.matchEndTime || undefined,
        status: 'live'
      };
    } catch (error) {
      console.error('❌ Failed to get player match status:', error);
      return null;
    }
  }
}

export const matchAvailabilityService = new MatchAvailabilityService();
