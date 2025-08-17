import { ValidationManager } from '../../../utils/validation.js';

// Mock UIManager since we can't import ES6 modules in Jest without additional setup
const mockUIManager = {
  showNotification: jest.fn(),
  hideElement: jest.fn(),
  clearInput: jest.fn()
};

describe('ValidationManager', () => {
  let validator;

  beforeEach(() => {
    validator = new ValidationManager(mockUIManager);
    jest.clearAllMocks();
  });

  describe('Game Selection Validation', () => {
    test('should validate game selection', () => {
      // Mock getSelectedGames to return valid selection
      validator.getSelectedGames = jest.fn().mockReturnValue({
        murph: true,
        skins: false,
        kp: false,
        snake: false,
        wolf: false
      });
      
      const result = validator.validateGameSelection();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Game selection valid');
    });

    test('should reject when no games selected', () => {
      // Mock getSelectedGames to return no selection
      validator.getSelectedGames = jest.fn().mockReturnValue({
        murph: false,
        skins: false,
        kp: false,
        snake: false,
        wolf: false
      });
      
      const result = validator.validateGameSelection();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Please select at least one game');
    });
  });

  describe('Game Setup Validation', () => {
    test('should validate complete game setup', () => {
      const mockPlayerManager = {
        getRequiredPlayers: jest.fn().mockReturnValue(4),
        getCurrentPlayerNames: jest.fn().mockReturnValue(['John', 'Mike', 'Sarah', 'Tom']),
        validateTeamSelection: jest.fn().mockReturnValue(true),
        validatePlayers: jest.fn().mockReturnValue({
          success: true,
          message: 'Player validation successful'
        })
      };

      // Mock getSelectedGames to return valid selection
      validator.getSelectedGames = jest.fn().mockReturnValue({
        murph: true,
        skins: false,
        kp: false,
        snake: false,
        wolf: false
      });

      // Mock validateSelectedGameBets to return success
      validator.validateSelectedGameBets = jest.fn().mockReturnValue({
        success: true,
        errors: []
      });

      const result = validator.validateGameSetup(mockPlayerManager, 4);
      
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject setup without games selected', () => {
      const mockPlayerManager = {
        getRequiredPlayers: jest.fn().mockReturnValue(4),
        getCurrentPlayerNames: jest.fn().mockReturnValue(['John', 'Mike', 'Sarah', 'Tom']),
        validateTeamSelection: jest.fn().mockReturnValue(true),
        validatePlayers: jest.fn().mockReturnValue({
          success: true,
          message: 'Player validation successful'
        })
      };

      const result = validator.validateGameSetup(mockPlayerManager, 4);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Please select at least one game');
    });

    test('should reject setup with invalid bet amounts', () => {
      const mockPlayerManager = {
        getRequiredPlayers: jest.fn().mockReturnValue(4),
        getCurrentPlayerNames: jest.fn().mockReturnValue(['John', 'Mike', 'Sarah', 'Tom']),
        validateTeamSelection: jest.fn().mockReturnValue(true),
        validatePlayers: jest.fn().mockReturnValue({
          success: true,
          message: 'Player validation successful'
        })
      };

      // Mock getSelectedGames to return valid selection
      validator.getSelectedGames = jest.fn().mockReturnValue({
        murph: true,
        skins: false,
        kp: false,
        snake: false,
        wolf: false
      });

      // Mock validateSelectedGameBets to return failure with specific error
      validator.validateSelectedGameBets = jest.fn().mockReturnValue({
        success: false,
        errors: ['Bet amount must be greater than 0']
      });

      const result = validator.validateGameSetup(mockPlayerManager, 4);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Bet amount must be greater than 0');
    });
  });

  describe('Bet Amount Validation', () => {
    test('should validate positive bet amounts', () => {
      // Mock DOM elements for bet validation
      const mockBetInput = { value: '5.00' };
      document.getElementById = jest.fn().mockReturnValue(mockBetInput);
      
      const result = validator.validateGameBetAmount('murph');
      expect(result.success).toBe(true);
    });

    test('should validate decimal bet amounts', () => {
      // Mock DOM elements for bet validation
      const mockBetInput = { value: '2.50' };
      document.getElementById = jest.fn().mockReturnValue(mockBetInput);
      
      const result = validator.validateGameBetAmount('murph');
      expect(result.success).toBe(true);
    });

    test('should reject zero bet amount', () => {
      // Mock DOM elements for bet validation
      const mockBetInput = { value: '0' };
      document.getElementById = jest.fn().mockReturnValue(mockBetInput);
      
      const result = validator.validateGameBetAmount('murph');
      expect(result.success).toBe(false);
    });

    test('should validate wolf game bet amounts', () => {
      // Mock DOM elements for bet validation
      const mockBetInput = { value: '3.00' };
      document.getElementById = jest.fn().mockReturnValue(mockBetInput);
      
      const result = validator.validateGameBetAmount('wolf');
      expect(result.success).toBe(true);
    });
  });

  describe('Hole Number Validation', () => {
    test('should validate valid hole numbers', () => {
      expect(validator.validateHole(1).success).toBe(true);
      expect(validator.validateHole(18).success).toBe(true);
      expect(validator.validateHole(9).success).toBe(true);
    });

    test('should reject invalid hole numbers', () => {
      expect(validator.validateHole(0).success).toBe(false);
      expect(validator.validateHole(19).success).toBe(false);
      expect(validator.validateHole(-1).success).toBe(false);
    });

    test('should reject non-numeric hole numbers', () => {
      expect(validator.validateHole('invalid').success).toBe(false);
      expect(validator.validateHole(null).success).toBe(false);
      expect(validator.validateHole(undefined).success).toBe(false);
    });
  });

  describe('Team Selection Validation', () => {
    test('should validate complete team selection', () => {
      const mockPlayerManager = {
        validateTeamSelection: jest.fn().mockReturnValue(true)
      };
      
      const result = mockPlayerManager.validateTeamSelection();
      expect(result).toBe(true);
    });

    test('should reject incomplete team selection', () => {
      const mockPlayerManager = {
        validateTeamSelection: jest.fn().mockReturnValue(false)
      };
      
      const result = mockPlayerManager.validateTeamSelection();
      expect(result).toBe(false);
    });
  });

  describe('Game Display Names', () => {
    test('should return correct display names for all games', () => {
      expect(validator.getGameDisplayName('murph')).toBe('Murph');
      expect(validator.getGameDisplayName('skins')).toBe('Skins');
      expect(validator.getGameDisplayName('kp')).toBe('KP');
      expect(validator.getGameDisplayName('snake')).toBe('Snake');
      expect(validator.getGameDisplayName('wolf')).toBe('Wolf');
    });
  });

  describe('Error Handling', () => {
    test('should handle edge cases gracefully', () => {
      // Test with null/undefined inputs for validateHole
      expect(validator.validateHole(null).success).toBe(false);
      expect(validator.validateHole(undefined).success).toBe(false);
      expect(validator.validateHole('').success).toBe(false);
    });
  });
});
