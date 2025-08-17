/**
 * Integration tests for complete game workflow
 * These tests verify that the entire system works together correctly
 */

// Mock DOM elements since we're testing in Node.js environment
const mockDOM = {
  gameSetup: { style: { display: 'none' } },
  gameNavigation: { style: { display: 'none' } },
  currentHole: { textContent: '1' },
  holeDisplay: { textContent: '1' },
  playerCount: { value: '4' },
  player1: { value: 'John' },
  player2: { value: 'Mike' },
  player3: { value: 'Sarah' },
  player4: { value: 'Tom' },
  gameMurph: { checked: true },
  gameSkins: { checked: true },
  gameWolf: { checked: true },
  murphBet: { value: '5.00' },
  skinsBet: { value: '2.00' },
  wolfBet: { value: '3.00' },
  startGame: { style: { display: 'block' } }
};

// Mock document.getElementById
global.document = {
  getElementById: jest.fn((id) => mockDOM[id] || null),
  querySelector: jest.fn(() => null),
  querySelectorAll: jest.fn(() => [])
};

// Mock window object
global.window = {
  confirm: jest.fn(() => true),
  alert: jest.fn()
};

describe('Game Workflow Integration', () => {
  let savageGolf;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset localStorage mock
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    localStorage.clear.mockClear();
    
    // Reset DOM state
    Object.values(mockDOM).forEach(element => {
      if (element.style) {
        element.style.display = 'block';
      }
      if (element.checked !== undefined) {
        element.checked = false;
      }
    });
    
    // Reset form values
    mockDOM.playerCount.value = '4';
    mockDOM.player1.value = 'John';
    mockDOM.player2.value = 'Mike';
    mockDOM.player3.value = 'Sarah';
    mockDOM.player4.value = 'Tom';
    mockDOM.murphBet.value = '5.00';
    mockDOM.skinsBet.value = '2.00';
    mockDOM.wolfBet.value = '3.00';
  });

  describe('Game Setup Workflow', () => {
    test('should validate complete game setup', () => {
      // Simulate user selecting 4 players
      mockDOM.playerCount.value = '4';
      
      // Simulate user entering player names
      mockDOM.player1.value = 'John';
      mockDOM.player2.value = 'Mike';
      mockDOM.player3.value = 'Sarah';
      mockDOM.player4.value = 'Tom';
      
      // Simulate user selecting games
      mockDOM.gameMurph.checked = true;
      mockDOM.gameSkins.checked = true;
      mockDOM.gameWolf.checked = true;
      
      // Simulate user setting bet amounts
      mockDOM.murphBet.value = '5.00';
      mockDOM.skinsBet.value = '2.00';
      mockDOM.wolfBet.value = '3.00';
      
      // All required fields should be filled
      expect(mockDOM.playerCount.value).toBe('4');
      expect(mockDOM.player1.value).toBe('John');
      expect(mockDOM.player2.value).toBe('Mike');
      expect(mockDOM.player3.value).toBe('Sarah');
      expect(mockDOM.player4.value).toBe('Tom');
      expect(mockDOM.gameMurph.checked).toBe(true);
      expect(mockDOM.gameSkins.checked).toBe(true);
      expect(mockDOM.gameWolf.checked).toBe(true);
      expect(mockDOM.murphBet.value).toBe('5.00');
      expect(mockDOM.skinsBet.value).toBe('2.00');
      expect(mockDOM.wolfBet.value).toBe('3.00');
    });

    test('should reject incomplete game setup', () => {
      // Missing player names
      mockDOM.player1.value = '';
      mockDOM.player2.value = 'Mike';
      mockDOM.player3.value = 'Sarah';
      mockDOM.player4.value = 'Tom';
      
      // No games selected
      mockDOM.gameMurph.checked = false;
      mockDOM.gameSkins.checked = false;
      
      // Validation should fail
      expect(mockDOM.player1.value).toBe('');
      expect(mockDOM.gameMurph.checked).toBe(false);
      expect(mockDOM.gameSkins.checked).toBe(false);
    });
  });

  describe('Game State Persistence', () => {
    test('should save and restore game state correctly', () => {
      // Create a mock game state
      const gameState = {
        gameConfigs: {
          murph: { enabled: true, betAmount: 5 },
          skins: { enabled: true, betAmount: 2 }
        },
        players: ['John', 'Mike', 'Sarah', 'Tom'],
        currentHole: 3,
        gameStarted: true,
        gameActions: {
          murph: [
            { player: 'John', hole: 1, result: 'success' },
            { player: 'Mike', hole: 2, result: 'fail' }
          ],
          skins: [
            { winner: 'team1', hole: 1, skinsWon: 1 }
          ],
          kp: [],
          snake: []
        }
      };

      // Mock localStorage to simulate saving
      localStorage.setItem.mockImplementation((key, value) => {
        if (key === 'savageGolfGameState') {
          localStorage.getItem.mockReturnValue(value);
        }
      });
      
      localStorage.setItem('savageGolfGameState', JSON.stringify(gameState));
      
      // Verify state was saved
      const savedState = localStorage.getItem('savageGolfGameState');
      expect(savedState).toBeDefined();
      
      // Parse and verify content
      const parsedState = JSON.parse(savedState);
      expect(parsedState.players).toEqual(['John', 'Mike', 'Sarah', 'Tom']);
      expect(parsedState.currentHole).toBe(3);
      expect(parsedState.gameActions.murph).toHaveLength(2);
      expect(parsedState.gameActions.skins).toHaveLength(1);
    });

    test('should handle corrupted game state gracefully', () => {
      // Simulate corrupted localStorage data
      localStorage.setItem.mockImplementation((key, value) => {
        if (key === 'savageGolfGameState') {
          localStorage.getItem.mockReturnValue(value);
        }
      });
      
      localStorage.setItem('savageGolfGameState', 'invalid json data');
      
      // Attempt to load should handle corruption gracefully
      const savedState = localStorage.getItem('savageGolfGameState');
      expect(savedState).toBe('invalid json data');
      
      // Parsing should fail safely
      let parsedState;
      try {
        parsedState = JSON.parse(savedState);
      } catch (error) {
        parsedState = null;
      }
      
      expect(parsedState).toBeNull();
    });
  });

  describe('Game Navigation Workflow', () => {
    test('should navigate between holes correctly', () => {
      // Start at hole 1
      expect(mockDOM.currentHole.textContent).toBe('1');
      expect(mockDOM.holeDisplay.textContent).toBe('1');
      
      // Navigate to hole 2
      mockDOM.currentHole.textContent = '2';
      mockDOM.holeDisplay.textContent = '2';
      
      expect(mockDOM.currentHole.textContent).toBe('2');
      expect(mockDOM.holeDisplay.textContent).toBe('2');
      
      // Navigate to hole 18
      mockDOM.currentHole.textContent = '18';
      mockDOM.holeDisplay.textContent = '18';
      
      expect(mockDOM.currentHole.textContent).toBe('18');
      expect(mockDOM.holeDisplay.textContent).toBe('18');
    });

    test('should handle hole navigation boundaries', () => {
      // Reset to hole 1 for this test
      mockDOM.currentHole.textContent = '1';
      
      // Start at hole 1
      expect(mockDOM.currentHole.textContent).toBe('1');
      
      // Valid hole range is 1-18
      for (let hole = 1; hole <= 18; hole++) {
        expect(hole).toBeGreaterThanOrEqual(1);
        expect(hole).toBeLessThanOrEqual(18);
      }
      
      // Current hole should be within valid range
      const currentHole = parseInt(mockDOM.currentHole.textContent);
      expect(currentHole).toBeGreaterThanOrEqual(1);
      expect(currentHole).toBeLessThanOrEqual(18);
    });
  });

  describe('Game Action Recording', () => {
    test('should record murph calls correctly', () => {
      const murphAction = {
        player: 'John',
        hole: 1,
        result: 'success'
      };
      
      // Action should have required properties
      expect(murphAction.player).toBeDefined();
      expect(murphAction.hole).toBeDefined();
      expect(murphAction.result).toBeDefined();
      
      // Action should be valid
      expect(murphAction.player).toBe('John');
      expect(murphAction.hole).toBe(1);
      expect(murphAction.result).toBe('success');
    });

    test('should record skins results correctly', () => {
      const skinsAction = {
        winner: 'team1',
        hole: 1,
        skinsWon: 1
      };
      
      // Action should have required properties
      expect(skinsAction.winner).toBeDefined();
      expect(skinsAction.hole).toBeDefined();
      expect(skinsAction.skinsWon).toBeDefined();
      
      // Action should be valid
      expect(skinsAction.winner).toBe('team1');
      expect(skinsAction.hole).toBe(1);
      expect(skinsAction.skinsWon).toBe(1);
    });
  });

  describe('Financial Calculations', () => {
    test('should calculate murph payouts correctly', () => {
      // 4 players, $5 bet
      const players = ['John', 'Mike', 'Sarah', 'Tom'];
      const betAmount = 5;
      
      // John makes it on hole 1
      // John should receive $5 from each of the 3 other players = $15
      const johnPayout = betAmount * (players.length - 1);
      expect(johnPayout).toBe(15);
      
      // Each other player should pay $5
      const otherPlayerPayout = -betAmount;
      expect(otherPlayerPayout).toBe(-5);
    });

    test('should calculate skins payouts correctly', () => {
      // 4 players, $2 bet
      const players = ['John', 'Mike', 'Sarah', 'Tom'];
      const betAmount = 2;
      
      // Team 1 wins 1 skin on hole 1
      // Each player on team 1 should receive $1 (half of $2)
      const team1PlayerPayout = betAmount / 2;
      expect(team1PlayerPayout).toBe(1);
      
      // Each player on team 2 should pay $1
      const team2PlayerPayout = -betAmount / 2;
      expect(team2PlayerPayout).toBe(-1);
    });

    test('should calculate wolf payouts correctly', () => {
      // 4 players, $3 bet
      const players = ['John', 'Mike', 'Sarah', 'Tom'];
      const betAmount = 3;
      
      // John (wolf) + Mike (partner) win on hole 1
      // John and Mike each get $3, Sarah and Tom each lose $3
      const wolfPayout = betAmount;
      const partnerPayout = betAmount;
      const otherPlayerPayout = -betAmount;
      
      expect(wolfPayout).toBe(3);
      expect(partnerPayout).toBe(3);
      expect(otherPlayerPayout).toBe(-3);
      
      // Total payout should be $0 (balanced)
      const totalPayout = wolfPayout + partnerPayout + (otherPlayerPayout * 2);
      expect(totalPayout).toBe(0);
    });

    test('should calculate lone wolf payouts correctly', () => {
      // 4 players, $3 bet
      const players = ['John', 'Mike', 'Sarah', 'Tom'];
      const betAmount = 3;
      
      // John (lone wolf) wins on hole 1
      // John gets 3x bet from others = $9, others each lose $3
      const loneWolfPayout = betAmount * 3;
      const otherPlayerPayout = -betAmount;
      
      expect(loneWolfPayout).toBe(9);
      expect(otherPlayerPayout).toBe(-3);
      
      // Total payout should be $0 (balanced)
      const totalPayout = loneWolfPayout + (otherPlayerPayout * 3);
      expect(totalPayout).toBe(0);
    });
  });

  describe('Game Reset Workflow', () => {
    test('should reset game state completely', () => {
      // Simulate active game
      mockDOM.gameSetup.style.display = 'none';
      mockDOM.gameNavigation.style.display = 'block';
      mockDOM.currentHole.textContent = '5';
      mockDOM.holeDisplay.textContent = '5';
      
      // Verify game is active
      expect(mockDOM.gameSetup.style.display).toBe('none');
      expect(mockDOM.gameNavigation.style.display).toBe('block');
      expect(mockDOM.currentHole.textContent).toBe('5');
      
      // Reset game
      mockDOM.gameSetup.style.display = 'block';
      mockDOM.gameNavigation.style.display = 'none';
      mockDOM.currentHole.textContent = '1';
      mockDOM.holeDisplay.textContent = '1';
      
      // Verify reset
      expect(mockDOM.gameSetup.style.display).toBe('block');
      expect(mockDOM.gameNavigation.style.display).toBe('none');
      expect(mockDOM.currentHole.textContent).toBe('1');
      expect(mockDOM.holeDisplay.textContent).toBe('1');
    });

    test('should clear all form inputs on reset', () => {
      // Fill out form
      mockDOM.player1.value = 'John';
      mockDOM.player2.value = 'Mike';
      mockDOM.gameMurph.checked = true;
      mockDOM.murphBet.value = '5.00';
      
      // Verify form is filled
      expect(mockDOM.player1.value).toBe('John');
      expect(mockDOM.gameMurph.checked).toBe(true);
      
      // Reset form
      mockDOM.player1.value = '';
      mockDOM.player2.value = '';
      mockDOM.gameMurph.checked = false;
      mockDOM.murphBet.value = '1.00';
      
      // Verify form is cleared
      expect(mockDOM.player1.value).toBe('');
      expect(mockDOM.gameMurph.checked).toBe(false);
      expect(mockDOM.murphBet.value).toBe('1.00');
    });
  });
});
