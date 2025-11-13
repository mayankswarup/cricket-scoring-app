import { AvailabilitySystem } from '../availabilitySystem';
import { PlayerRegistration, MatchSchedule } from '../../types';

describe('AvailabilitySystem', () => {
  const mockPlayer: PlayerRegistration = {
    id: 'player1',
    name: 'Test Player',
    phoneNumber: '1234567890',
    availability: [],
  };

  const mockMatchDate = '2024-01-15';
  const mockMatchTime = '10:00';
  const mockDuration = 180; // 3 hours

  describe('checkPlayerAvailability', () => {
    it('should return available when player has no availability restrictions', () => {
      const result = AvailabilitySystem.checkPlayerAvailability(
        mockPlayer,
        mockMatchDate,
        mockMatchTime,
        mockDuration,
        []
      );

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should return unavailable when player marked themselves as unavailable', () => {
      const playerWithUnavailability: PlayerRegistration = {
        ...mockPlayer,
        availability: [
          {
            date: mockMatchDate,
            isAvailable: false,
            timeSlots: [],
          },
        ],
      };

      const result = AvailabilitySystem.checkPlayerAvailability(
        playerWithUnavailability,
        mockMatchDate,
        mockMatchTime,
        mockDuration,
        []
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictReason).toBe('player_unavailable');
    });

    it('should return available when player marked themselves as available', () => {
      const playerWithAvailability: PlayerRegistration = {
        ...mockPlayer,
        availability: [
          {
            date: mockMatchDate,
            isAvailable: true,
            timeSlots: [],
          },
        ],
      };

      const result = AvailabilitySystem.checkPlayerAvailability(
        playerWithAvailability,
        mockMatchDate,
        mockMatchTime,
        mockDuration,
        []
      );

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('checkMultiplePlayersAvailability', () => {
    it('should correctly categorize available and unavailable players', () => {
      const availablePlayer: PlayerRegistration = {
        ...mockPlayer,
        id: 'player1',
        availability: [],
      };

      const unavailablePlayer: PlayerRegistration = {
        ...mockPlayer,
        id: 'player2',
        availability: [
          {
            date: mockMatchDate,
            isAvailable: false,
            timeSlots: [],
          },
        ],
      };

      const result = AvailabilitySystem.checkMultiplePlayersAvailability(
        [availablePlayer, unavailablePlayer],
        mockMatchDate,
        mockMatchTime,
        mockDuration,
        []
      );

      expect(result.availablePlayers).toHaveLength(1);
      expect(result.availablePlayers[0].id).toBe('player1');
      expect(result.unavailablePlayers).toHaveLength(1);
      expect(result.unavailablePlayers[0].id).toBe('player2');
    });
  });
});

