import { liveScoringService } from '../liveScoringService';
import { collection, addDoc, getDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  },
  onSnapshot: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

describe('liveScoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBall', () => {
    it('should add a ball to Firebase', async () => {
      const mockDocRef = { id: 'ball123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const matchId = 'match123';
      const ballData = {
        over: 1,
        ball: 1,
        runs: 4,
        isWicket: false,
        isExtra: false,
        batsmanId: 'batsman1',
        bowlerId: 'bowler1',
      };

      const result = await liveScoringService.addBall(matchId, ballData);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('ball123');
    });

    it('should handle errors when adding ball', async () => {
      const error = new Error('Firebase error');
      (addDoc as jest.Mock).mockRejectedValue(error);

      const matchId = 'match123';
      const ballData = {
        over: 1,
        ball: 1,
        runs: 0,
        isWicket: false,
        isExtra: false,
        batsmanId: 'batsman1',
        bowlerId: 'bowler1',
      };

      await expect(liveScoringService.addBall(matchId, ballData)).rejects.toThrow();
    });
  });

  describe('getMatch', () => {
    it('should retrieve a match from Firebase', async () => {
      const mockMatchData = {
        id: 'match123',
        name: 'Test Match',
        team1: { id: 'team1', name: 'Team 1', players: [] },
        team2: { id: 'team2', name: 'Team 2', players: [] },
        totalOvers: 20,
        status: 'live',
      };

      const mockDocSnap = {
        exists: () => true,
        id: 'match123',
        data: () => mockMatchData,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await liveScoringService.getMatch('match123');

      expect(getDoc).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('match123');
    });

    it('should return null when match does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await liveScoringService.getMatch('nonexistent');

      expect(result).toBeNull();
    });
  });
});

