import { APP_CONFIG, SCORING_CONFIG, UI_CONFIG } from '../appConfig';

describe('App Configuration', () => {
  describe('APP_CONFIG', () => {
    it('should have correct app information', () => {
      expect(APP_CONFIG.APP_NAME).toBe('Cricket Score');
      expect(APP_CONFIG.APP_VERSION).toBe('1.0.0');
      expect(APP_CONFIG.APP_DESCRIPTION).toBe('Professional Cricket Scoring App');
    });

    it('should have valid scoring configuration', () => {
      expect(SCORING_CONFIG.DEFAULT_OVERS).toBe(20);
      expect(SCORING_CONFIG.BALLS_PER_OVER).toBe(6);
      expect(SCORING_CONFIG.MAX_WICKETS).toBe(10);
      expect(SCORING_CONFIG.MAX_RUNS_PER_BALL).toBe(6);
    });

    it('should have valid scoring options', () => {
      expect(SCORING_CONFIG.SCORING_OPTIONS.RUNS).toContain(0);
      expect(SCORING_CONFIG.SCORING_OPTIONS.RUNS).toContain(6);
      expect(SCORING_CONFIG.SCORING_OPTIONS.EXTRAS).toContain('Wide');
      expect(SCORING_CONFIG.SCORING_OPTIONS.EXTRAS).toContain('No Ball');
    });

    it('should have valid match types', () => {
      expect(APP_CONFIG.MATCH_TYPES.T20.overs).toBe(20);
      expect(APP_CONFIG.MATCH_TYPES.ODI.overs).toBe(50);
      expect(APP_CONFIG.MATCH_TYPES.TEST.overs).toBe(90);
    });

    it('should have valid UI colors', () => {
      expect(UI_CONFIG.PRIMARY_COLOR).toBe('#8B4513');
      expect(UI_CONFIG.SUCCESS_COLOR).toBe('#4CAF50');
      expect(UI_CONFIG.ERROR_COLOR).toBe('#F44336');
    });

    it('should have error messages defined', () => {
      expect(APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(APP_CONFIG.ERROR_MESSAGES.SAVE_ERROR).toBeDefined();
      expect(APP_CONFIG.ERROR_MESSAGES.LOAD_ERROR).toBeDefined();
    });
  });
});

