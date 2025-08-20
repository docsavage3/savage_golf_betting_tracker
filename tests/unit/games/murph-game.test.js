import { MurphGame } from '../../../games/murph-game.js';

// Mock the constants since we can't import ES6 modules in Jest without additional setup
const GAME_TYPES = {
  MURPH: 'murph'
};

const DEFAULTS = {
  STARTING_HOLE: 1,
  MAX_HOLES: 18
};

describe('MurphGame', () => {
  let game;
  const players = ['John', 'Mike', 'Sarah', 'Tom'];
  const gameConfig = { betAmount: 5 };

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorage.clear();
    game = new MurphGame(players, gameConfig);
  });

  describe('Initialization', () => {
    test('should initialize with correct players and config', () => {
      expect(game.players).toEqual(players);
      expect(game.config.betAmount).toBe(5);
      expect(game.actions).toEqual([]);
    });

    test('should have correct game type', () => {
      expect(game.gameType).toBe('murph');
    });
  });

  describe('Action Validation', () => {
    test('should validate successful murph call', () => {
      const action = {
        player: 'John',
        hole: 1,
        result: 'success'
      };
      
      const result = game.validateAction(action);
      expect(result).toBe(true);
    });

    test('should validate failed murph call', () => {
      const action = {
        player: 'John',
        hole: 1,
        result: 'fail'
      };
      
      const result = game.validateAction(action);
      expect(result).toBe(true);
    });

    test('should reject invalid result', () => {
      const action = {
        player: 'John',
        hole: 1,
        result: 'invalid'
      };
      
      const result = game.validateAction(action);
      expect(result).toBe(false);
    });

    test('should reject invalid player', () => {
      const action = {
        player: 'InvalidPlayer',
        hole: 1,
        result: 'success'
      };
      
      const result = game.validateAction(action);
      expect(result).toBe(false);
    });

    test('should reject invalid hole number', () => {
      const action = {
        player: 'John',
        hole: 0,
        result: 'success'
      };
      
      const result = game.validateAction(action);
      expect(result).toBe(false);
    });
  });

  describe('Adding Actions', () => {
    test('should add valid action successfully', () => {
      const action = {
        player: 'John',
        hole: 1,
        result: 'success'
      };
      
      const result = game.addAction(action);
      expect(result).toBe(true);
      expect(game.actions).toHaveLength(1);
      expect(game.actions[0]).toEqual(action);
    });

    test('should reject invalid action', () => {
      const action = {
        player: 'John',
        hole: 1,
        result: 'invalid'
      };
      
      const result = game.addAction(action);
      expect(result).toBe(false);
      expect(game.actions).toHaveLength(0);
    });
  });

  describe('Financial Calculations', () => {
    test('should calculate correct payouts for successful call', () => {
      // John makes it on hole 1
      game.addAction({
        player: 'John',
        hole: 1,
        result: 'success'
      });
      
      const summary = game.calculateSummary();
      
      // John should receive $5 from each of the 3 other players
      expect(summary['John']).toBe(15);
      // Each other player should pay $5
      expect(summary['Mike']).toBe(-5);
      expect(summary['Sarah']).toBe(-5);
      expect(summary['Tom']).toBe(-5);
    });

    test('should calculate correct payouts for failed call', () => {
      // John fails on hole 1
      game.addAction({
        player: 'John',
        hole: 1,
        result: 'fail'
      });
      
      const summary = game.calculateSummary();
      
      // John should pay $5 to each of the 3 other players
      expect(summary['John']).toBe(-15);
      // Each other player should receive $5
      expect(summary['Mike']).toBe(5);
      expect(summary['Sarah']).toBe(5);
      expect(summary['Tom']).toBe(5);
    });

    test('should handle multiple actions correctly', () => {
      // John makes it on hole 1
      game.addAction({
        player: 'John',
        hole: 1,
        result: 'success'
      });
      
      // Mike fails on hole 2
      game.addAction({
        player: 'Mike',
        hole: 2,
        result: 'fail'
      });
      
      const summary = game.calculateSummary();
      
      // John: +$15 from hole 1, +$5 from hole 2 = +$20
      expect(summary['John']).toBe(20);
      // Mike: -$5 from hole 1, -$15 from hole 2 = -$20
      expect(summary['Mike']).toBe(-20);
      // Sarah: -$5 from hole 1, +$5 from hole 2 = $0
      expect(summary['Sarah']).toBe(0);
      // Tom: -$5 from hole 1, +$5 from hole 2 = $0
      expect(summary['Tom']).toBe(0);
    });
  });

  describe('Game Statistics', () => {
    test('should return correct stats', () => {
      game.addAction({
        player: 'John',
        hole: 1,
        result: 'success'
      });
      
      game.addAction({
        player: 'Mike',
        hole: 2,
        result: 'fail'
      });
      
      const stats = game.getStats();
      
      expect(stats.totalActions).toBe(2);
      expect(stats.successfulCalls).toBe(1);
      expect(stats.failedCalls).toBe(1);
      expect(stats.betAmount).toBe(5);
      expect(stats.enabled).toBe(false);
    });

    test('should handle empty game', () => {
      const stats = game.getStats();
      
      expect(stats.totalActions).toBe(0);
      expect(stats.successfulCalls).toBe(0);
      expect(stats.failedCalls).toBe(0);
      expect(stats.betAmount).toBe(5);
      expect(stats.enabled).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle 2 players correctly', () => {
      const twoPlayerGame = new MurphGame(['John', 'Mike'], { betAmount: 3 });
      
      twoPlayerGame.addAction({
        player: 'John',
        hole: 1,
        result: 'success'
      });
      
      const summary = twoPlayerGame.calculateSummary();
      
      // John should receive $3 from Mike
      expect(summary['John']).toBe(3);
      // Mike should pay $3
      expect(summary['Mike']).toBe(-3);
    });

    test('should handle 3 players correctly', () => {
      const threePlayerGame = new MurphGame(['John', 'Mike', 'Sarah'], { betAmount: 4 });
      
      threePlayerGame.addAction({
        player: 'John',
        hole: 1,
        result: 'success'
      });
      
      const summary = threePlayerGame.calculateSummary();
      
      // John should receive $4 from each of the 2 other players
      expect(summary['John']).toBe(8);
      // Each other player should pay $4
      expect(summary['Mike']).toBe(-4);
      expect(summary['Sarah']).toBe(-4);
    });
  });
});
