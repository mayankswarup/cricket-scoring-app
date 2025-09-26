import { PlayerRegistration, MatchSchedule, PlayerAvailability, PlayerConflict, TimeSlot } from '../types';

export class AvailabilitySystem {
  /**
   * Check if a player is available for a specific match
   */
  static checkPlayerAvailability(
    player: PlayerRegistration,
    matchDate: string,
    matchTime: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): { isAvailable: boolean; conflicts: PlayerConflict[] } {
    const conflicts: PlayerConflict[] = [];
    
    // Check if player has marked themselves as unavailable
    const playerAvailability = player.availability.find(av => av.date === matchDate);
    if (playerAvailability && !playerAvailability.isAvailable) {
      conflicts.push({
        playerId: player.id,
        conflictingMatches: [],
        conflictReason: 'player_unavailable'
      });
      return { isAvailable: false, conflicts };
    }

    // Check for time slot conflicts
    if (playerAvailability && playerAvailability.timeSlots.length > 0) {
      const matchStartTime = matchTime;
      const matchEndTime = this.calculateEndTime(matchTime, duration);
      
      const hasTimeSlotConflict = playerAvailability.timeSlots.some(slot => {
        if (!slot.isAvailable) return false;
        
        const slotStart = slot.start;
        const slotEnd = slot.end;
        
        // Check if match time overlaps with unavailable time slots
        return this.timeOverlaps(matchStartTime, matchEndTime, slotStart, slotEnd);
      });
      
      if (hasTimeSlotConflict) {
        conflicts.push({
          playerId: player.id,
          conflictingMatches: [],
          conflictReason: 'time_overlap'
        });
        return { isAvailable: false, conflicts };
      }
    }

    // Check for existing match conflicts
    const conflictingMatches = existingMatches.filter(match => {
      if (match.date !== matchDate) return false;
      
      // Check if player is already playing in another match
      const isPlayingInMatch = match.playingXI.homeTeam.includes(player.id) || 
                              match.playingXI.awayTeam.includes(player.id);
      
      if (!isPlayingInMatch) return false;
      
      // Check time overlap
      const matchStartTime = match.time;
      const matchEndTime = this.calculateEndTime(match.time, match.duration);
      const newMatchStartTime = matchTime;
      const newMatchEndTime = this.calculateEndTime(matchTime, duration);
      
      return this.timeOverlaps(newMatchStartTime, newMatchEndTime, matchStartTime, matchEndTime);
    });

    if (conflictingMatches.length > 0) {
      conflicts.push({
        playerId: player.id,
        conflictingMatches: conflictingMatches.map(m => m.id),
        conflictReason: 'time_overlap'
      });
      return { isAvailable: false, conflicts };
    }

    return { isAvailable: true, conflicts: [] };
  }

  /**
   * Check availability for multiple players
   */
  static checkMultiplePlayersAvailability(
    players: PlayerRegistration[],
    matchDate: string,
    matchTime: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): { availablePlayers: PlayerRegistration[]; unavailablePlayers: PlayerRegistration[]; conflicts: PlayerConflict[] } {
    const availablePlayers: PlayerRegistration[] = [];
    const unavailablePlayers: PlayerRegistration[] = [];
    const allConflicts: PlayerConflict[] = [];

    players.forEach(player => {
      const { isAvailable, conflicts } = this.checkPlayerAvailability(
        player,
        matchDate,
        matchTime,
        duration,
        existingMatches
      );

      if (isAvailable) {
        availablePlayers.push(player);
      } else {
        unavailablePlayers.push(player);
        allConflicts.push(...conflicts);
      }
    });

    return {
      availablePlayers,
      unavailablePlayers,
      conflicts: allConflicts
    };
  }

  /**
   * Get player availability for a specific date
   */
  static getPlayerAvailabilityForDate(
    player: PlayerRegistration,
    date: string
  ): PlayerAvailability | null {
    return player.availability.find(av => av.date === date) || null;
  }

  /**
   * Set player availability for a specific date
   */
  static setPlayerAvailability(
    player: PlayerRegistration,
    date: string,
    timeSlots: TimeSlot[],
    isAvailable: boolean,
    reason?: string
  ): PlayerRegistration {
    const existingAvailability = player.availability.find(av => av.date === date);
    
    if (existingAvailability) {
      // Update existing availability
      existingAvailability.timeSlots = timeSlots;
      existingAvailability.isAvailable = isAvailable;
      existingAvailability.reason = reason;
    } else {
      // Add new availability
      player.availability.push({
        id: Date.now().toString(),
        playerId: player.id,
        date,
        timeSlots,
        isAvailable,
        reason
      });
    }

    return player;
  }

  /**
   * Get available time slots for a player on a specific date
   */
  static getAvailableTimeSlots(
    player: PlayerRegistration,
    date: string
  ): TimeSlot[] {
    const availability = this.getPlayerAvailabilityForDate(player, date);
    
    if (!availability) {
      // If no availability set, assume player is available all day
      return [
        { start: '06:00', end: '23:59', isAvailable: true }
      ];
    }

    return availability.timeSlots.filter(slot => slot.isAvailable);
  }

  /**
   * Check if two time periods overlap
   */
  private static timeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const time1Start = this.timeToMinutes(start1);
    const time1End = this.timeToMinutes(end1);
    const time2Start = this.timeToMinutes(start2);
    const time2End = this.timeToMinutes(end2);

    return time1Start < time2End && time2Start < time1End;
  }

  /**
   * Calculate end time given start time and duration
   */
  private static calculateEndTime(startTime: string, durationMinutes: number): string {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    return this.minutesToTime(endMinutes);
  }

  /**
   * Convert time string (HH:MM) to minutes
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string (HH:MM)
   */
  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get conflict summary for display
   */
  static getConflictSummary(conflicts: PlayerConflict[]): string {
    if (conflicts.length === 0) return 'No conflicts';

    const conflictReasons = conflicts.map(c => c.conflictReason);
    const uniqueReasons = [...new Set(conflictReasons)];

    const reasonTexts = uniqueReasons.map(reason => {
      switch (reason) {
        case 'player_unavailable':
          return 'Player marked as unavailable';
        case 'time_overlap':
          return 'Player has another match at the same time';
        case 'location_conflict':
          return 'Player has location conflict';
        default:
          return 'Unknown conflict';
      }
    });

    return reasonTexts.join(', ');
  }

  /**
   * Suggest alternative times for a match
   */
  static suggestAlternativeTimes(
    players: PlayerRegistration[],
    date: string,
    duration: number
  ): string[] {
    const suggestions: string[] = [];
    const timeSlots = [
      '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
    ];

    for (const time of timeSlots) {
      const { availablePlayers } = this.checkMultiplePlayersAvailability(
        players,
        date,
        time,
        duration,
        [] // No existing matches for suggestions
      );

      // If at least 80% of players are available, suggest this time
      if (availablePlayers.length >= players.length * 0.8) {
        suggestions.push(time);
      }
    }

    return suggestions;
  }
}

export default AvailabilitySystem;
