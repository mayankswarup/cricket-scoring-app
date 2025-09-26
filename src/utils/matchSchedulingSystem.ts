import { MatchSchedule, TeamCreation, PlayerRegistration, PlayerConflict } from '../types';
import AvailabilitySystem from './availabilitySystem';

export class MatchSchedulingSystem {
  /**
   * Schedule a new match with conflict checking
   */
  static scheduleMatch(
    homeTeam: TeamCreation,
    awayTeam: TeamCreation,
    venue: string,
    date: string,
    time: string,
    duration: number,
    existingMatches: MatchSchedule[],
    allPlayers: PlayerRegistration[]
  ): { success: boolean; match?: MatchSchedule; conflicts: PlayerConflict[]; suggestions: string[] } {
    
    // Check for team conflicts
    const teamConflicts = this.checkTeamConflicts(homeTeam, awayTeam, date, time, duration, existingMatches);
    if (teamConflicts.length > 0) {
      return {
        success: false,
        conflicts: teamConflicts,
        suggestions: this.suggestAlternativeTimes(date, duration, existingMatches)
      };
    }

    // Check player availability
    const homeTeamPlayers = allPlayers.filter(p => 
      homeTeam.members.some(m => m.playerId === p.id && m.isActive)
    );
    const awayTeamPlayers = allPlayers.filter(p => 
      awayTeam.members.some(m => m.playerId === p.id && m.isActive)
    );

    const homeTeamAvailability = AvailabilitySystem.checkMultiplePlayersAvailability(
      homeTeamPlayers,
      date,
      time,
      duration,
      existingMatches
    );

    const awayTeamAvailability = AvailabilitySystem.checkMultiplePlayersAvailability(
      awayTeamPlayers,
      date,
      time,
      duration,
      existingMatches
    );

    const allConflicts = [...homeTeamAvailability.conflicts, ...awayTeamAvailability.conflicts];

    if (allConflicts.length > 0) {
      return {
        success: false,
        conflicts: allConflicts,
        suggestions: this.suggestAlternativeTimes(date, duration, existingMatches)
      };
    }

    // Create the match
    const newMatch: MatchSchedule = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      venue,
      date,
      time,
      duration,
      status: 'scheduled',
      playingXI: {
        homeTeam: [], // Will be filled when teams select their XI
        awayTeam: []
      }
    };

    return {
      success: true,
      match: newMatch,
      conflicts: [],
      suggestions: []
    };
  }

  /**
   * Check for team-level conflicts
   */
  private static checkTeamConflicts(
    homeTeam: TeamCreation,
    awayTeam: TeamCreation,
    date: string,
    time: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): PlayerConflict[] {
    const conflicts: PlayerConflict[] = [];

    // Check if teams are the same
    if (homeTeam.id === awayTeam.id) {
      conflicts.push({
        playerId: 'team_conflict',
        conflictingMatches: [],
        conflictReason: 'time_overlap' // Reuse existing reason type
      });
    }

    // Check if teams already have matches on the same date/time
    const homeTeamMatches = existingMatches.filter(match => 
      (match.homeTeam.id === homeTeam.id || match.awayTeam.id === homeTeam.id) &&
      match.date === date &&
      this.timeOverlaps(match.time, this.calculateEndTime(match.time, match.duration), time, this.calculateEndTime(time, duration))
    );

    const awayTeamMatches = existingMatches.filter(match => 
      (match.homeTeam.id === awayTeam.id || match.awayTeam.id === awayTeam.id) &&
      match.date === date &&
      this.timeOverlaps(match.time, this.calculateEndTime(match.time, match.duration), time, this.calculateEndTime(time, duration))
    );

    if (homeTeamMatches.length > 0) {
      conflicts.push({
        playerId: homeTeam.id,
        conflictingMatches: homeTeamMatches.map(m => m.id),
        conflictReason: 'time_overlap'
      });
    }

    if (awayTeamMatches.length > 0) {
      conflicts.push({
        playerId: awayTeam.id,
        conflictingMatches: awayTeamMatches.map(m => m.id),
        conflictReason: 'time_overlap'
      });
    }

    return conflicts;
  }

  /**
   * Suggest alternative times for a match
   */
  static suggestAlternativeTimes(
    date: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): string[] {
    const suggestions: string[] = [];
    const timeSlots = [
      '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
    ];

    for (const time of timeSlots) {
      const conflicts = existingMatches.filter(match => 
        match.date === date &&
        this.timeOverlaps(match.time, this.calculateEndTime(match.time, match.duration), time, this.calculateEndTime(time, duration))
      );

      if (conflicts.length === 0) {
        suggestions.push(time);
      }
    }

    return suggestions;
  }

  /**
   * Get match schedule for a specific date
   */
  static getMatchesForDate(
    date: string,
    allMatches: MatchSchedule[]
  ): MatchSchedule[] {
    return allMatches.filter(match => match.date === date);
  }

  /**
   * Get match schedule for a specific team
   */
  static getMatchesForTeam(
    teamId: string,
    allMatches: MatchSchedule[]
  ): MatchSchedule[] {
    return allMatches.filter(match => 
      match.homeTeam.id === teamId || match.awayTeam.id === teamId
    );
  }

  /**
   * Get upcoming matches for a team
   */
  static getUpcomingMatchesForTeam(
    teamId: string,
    allMatches: MatchSchedule[]
  ): MatchSchedule[] {
    const now = new Date();
    return this.getMatchesForTeam(teamId, allMatches)
      .filter(match => {
        const matchDateTime = new Date(`${match.date}T${match.time}`);
        return matchDateTime > now && match.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  /**
   * Check if a time slot is available
   */
  static isTimeSlotAvailable(
    date: string,
    time: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): boolean {
    const conflicts = existingMatches.filter(match => 
      match.date === date &&
      this.timeOverlaps(match.time, this.calculateEndTime(match.time, match.duration), time, this.calculateEndTime(time, duration))
    );

    return conflicts.length === 0;
  }

  /**
   * Get available time slots for a specific date
   */
  static getAvailableTimeSlots(
    date: string,
    duration: number,
    existingMatches: MatchSchedule[]
  ): string[] {
    const allTimeSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    return allTimeSlots.filter(time => 
      this.isTimeSlotAvailable(date, time, duration, existingMatches)
    );
  }

  /**
   * Reschedule a match
   */
  static rescheduleMatch(
    matchId: string,
    newDate: string,
    newTime: string,
    allMatches: MatchSchedule[],
    allPlayers: PlayerRegistration[]
  ): { success: boolean; match?: MatchSchedule; conflicts: PlayerConflict[] } {
    const matchIndex = allMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) {
      return { success: false, conflicts: [] };
    }

    const match = allMatches[matchIndex];
    const otherMatches = allMatches.filter(m => m.id !== matchId);

    // Check availability for new time
    const homeTeamPlayers = allPlayers.filter(p => 
      match.homeTeam.members.some(m => m.playerId === p.id && m.isActive)
    );
    const awayTeamPlayers = allPlayers.filter(p => 
      match.awayTeam.members.some(m => m.playerId === p.id && m.isActive)
    );

    const homeTeamAvailability = AvailabilitySystem.checkMultiplePlayersAvailability(
      homeTeamPlayers,
      newDate,
      newTime,
      match.duration,
      otherMatches
    );

    const awayTeamAvailability = AvailabilitySystem.checkMultiplePlayersAvailability(
      awayTeamPlayers,
      newDate,
      newTime,
      match.duration,
      otherMatches
    );

    const allConflicts = [...homeTeamAvailability.conflicts, ...awayTeamAvailability.conflicts];

    if (allConflicts.length > 0) {
      return { success: false, conflicts: allConflicts };
    }

    // Update the match
    const updatedMatch: MatchSchedule = {
      ...match,
      date: newDate,
      time: newTime
    };

    return { success: true, match: updatedMatch, conflicts: [] };
  }

  /**
   * Cancel a match
   */
  static cancelMatch(
    matchId: string,
    allMatches: MatchSchedule[]
  ): MatchSchedule[] {
    return allMatches.map(match => 
      match.id === matchId 
        ? { ...match, status: 'cancelled' as const }
        : match
    );
  }

  /**
   * Get match statistics
   */
  static getMatchStatistics(
    allMatches: MatchSchedule[]
  ): {
    totalMatches: number;
    scheduledMatches: number;
    liveMatches: number;
    completedMatches: number;
    cancelledMatches: number;
  } {
    return {
      totalMatches: allMatches.length,
      scheduledMatches: allMatches.filter(m => m.status === 'scheduled').length,
      liveMatches: allMatches.filter(m => m.status === 'live').length,
      completedMatches: allMatches.filter(m => m.status === 'completed').length,
      cancelledMatches: allMatches.filter(m => m.status === 'cancelled').length,
    };
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
}

export default MatchSchedulingSystem;
