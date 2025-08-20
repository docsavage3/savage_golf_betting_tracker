import { SnakeGame } from '../../../games/snake-game.js';

describe('SnakeGame', () => {
    let snakeGame;
    let players;

    beforeEach(() => {
        players = ['Player1', 'Player2', 'Player3'];
        snakeGame = new SnakeGame(players);
    });

    describe('constructor and initialization', () => {
        test('initializes with correct properties', () => {
            expect(snakeGame.players).toEqual(players);
            expect(snakeGame.actions).toEqual([]);
            expect(snakeGame.config).toEqual({
                enabled: false,
                betAmount: 2.00
            });
        });

        test('initializes with custom config', () => {
            const customConfig = {
                enabled: true,
                betAmount: 5.00
            };
            const customGame = new SnakeGame(players, customConfig);
            
            expect(customGame.config.enabled).toBe(true);
            expect(customGame.config.betAmount).toBe(5.00);
        });

        test('handles empty players array', () => {
            const emptyGame = new SnakeGame([]);
            expect(emptyGame.players).toEqual([]);
        });
    });

    describe('addAction', () => {
        test('adds snake action correctly', () => {
            const action = {
                player: 'Player1',
                hole: 1,
                score: 6
            };
            
            snakeGame.addAction(action);
            
            expect(snakeGame.actions).toHaveLength(1);
            expect(snakeGame.actions[0]).toEqual(action);
        });

        test('adds multiple snake actions correctly', () => {
            const action1 = { player: 'Player1', hole: 1, score: 6 };
            const action2 = { player: 'Player2', hole: 2, score: 7 };
            
            snakeGame.addAction(action1);
            snakeGame.addAction(action2);
            
            expect(snakeGame.actions).toHaveLength(2);
            expect(snakeGame.actions[0]).toEqual(action1);
            expect(snakeGame.actions[1]).toEqual(action2);
        });

        test('rejects invalid actions', () => {
            const invalidAction = { player: 'InvalidPlayer', hole: 1, score: 6 };
            const result = snakeGame.addAction(invalidAction);
            
            expect(result).toBe(false);
            expect(snakeGame.actions).toHaveLength(0);
        });
    });

    describe('calculateSummary', () => {
        test('returns correct player balances for single snake', () => {
            // Add single snake action
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            
            const summary = snakeGame.calculateSummary();
            
            // Player1 gets snake on hole 1 - owes 2 points to each other player
            // Player1: -2 (owes the pot)
            // Player2: +1 (gets paid from pot)
            // Player3: +1 (gets paid from pot)
            expect(summary['Player1']).toBe(-2);
            expect(summary['Player2']).toBe(1);
            expect(summary['Player3']).toBe(1);
        });

        test('returns correct player balances for multiple snakes', () => {
            // Add multiple snake actions
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 6 });
            
            const summary = snakeGame.calculateSummary();
            
            // Player1 gets snake on hole 1, Player2 gets snake on hole 2
            // Total pot = 4 points (2 snakes × 2 points each)
            // Player2 (last snake) owes the entire pot to others
            // Player1: +2 (gets paid from pot)
            // Player2: -4 (owes the entire pot)
            // Player3: +2 (gets paid from pot)
            expect(summary['Player1']).toBe(2);
            expect(summary['Player2']).toBe(-4);
            expect(summary['Player3']).toBe(2);
        });

        test('handles multiple snakes on same hole correctly', () => {
            // Multiple players get snake on hole 1
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 1, score: 6 });
            
            const summary = snakeGame.calculateSummary();
            
            // Total pot = 4 points (2 snakes × 2 points each)
            // Player2 (last snake) owes the entire pot to others
            expect(summary['Player1']).toBe(2);
            expect(summary['Player2']).toBe(-4);
            expect(summary['Player3']).toBe(2);
        });

        test('handles no snakes on hole correctly', () => {
            // No snakes, so no points awarded
            const summary = snakeGame.calculateSummary();
            
            expect(summary['Player1']).toBe(0);
            expect(summary['Player2']).toBe(0);
            expect(summary['Player3']).toBe(0);
        });

        test('handles three snakes correctly', () => {
            // Add three snake actions
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 7 });
            snakeGame.addAction({ player: 'Player3', hole: 3, score: 8 });
            
            const summary = snakeGame.calculateSummary();
            
            // Total pot = 6 points (3 snakes × 2 points each)
            // Player3 (last snake) owes the entire pot to others
            // Player1: +3 (gets paid from pot)
            // Player2: +3 (gets paid from pot)
            // Player3: -6 (owes the entire pot)
            expect(summary['Player1']).toBe(3);
            expect(summary['Player2']).toBe(3);
            expect(summary['Player3']).toBe(-6);
        });

        test('handles custom bet amounts correctly', () => {
            const customGame = new SnakeGame(players, { betAmount: 5.00 });
            customGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            
            const summary = customGame.calculateSummary();
            
            // Player1 owes 5 points to each other player
            expect(summary['Player1']).toBe(-5); // -5 (owes the pot)
            expect(summary['Player2']).toBe(2.5);   // +2.5 from pot (5/2 other players)
            expect(summary['Player3']).toBe(2.5);   // +2.5 from pot (5/2 other players)
        });

        test('handles 2-player game correctly', () => {
            const twoPlayerGame = new SnakeGame(['Player1', 'Player2']);
            twoPlayerGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            
            const summary = twoPlayerGame.calculateSummary();
            
            // Player1 owes 2 points to Player2
            expect(summary['Player1']).toBe(-2);
            expect(summary['Player2']).toBe(2);
        });

        test('handles 4-player game correctly', () => {
            const fourPlayerGame = new SnakeGame(['P1', 'P2', 'P3', 'P4']);
            fourPlayerGame.addAction({ player: 'P1', hole: 1, score: 6 });
            
            const summary = fourPlayerGame.calculateSummary();
            
            // Player1 owes 2 points to each other player (3 players)
            expect(summary['P1']).toBe(-2);  // -2 (owes the pot)
            expect(summary['P2']).toBeCloseTo(0.67, 2);   // +0.67 from pot (2/3 other players)
            expect(summary['P3']).toBeCloseTo(0.67, 2);   // +0.67 from pot (2/3 other players)
            expect(summary['P4']).toBeCloseTo(0.67, 2);   // +0.67 from pot (2/3 other players)
        });
    });

    describe('validateAction', () => {
        test('validates snake action correctly', () => {
            const validAction = {
                player: 'Player1',
                hole: 1,
                score: 6
            };
            
            expect(snakeGame.validateAction(validAction)).toBe(true);
            
            const invalidAction = {
                player: 'InvalidPlayer',
                hole: 1,
                score: 6
            };
            
            expect(snakeGame.validateAction(invalidAction)).toBe(false);
            
            const invalidHole = {
                player: 'Player1',
                hole: 20,
                score: 6
            };
            
            expect(snakeGame.validateAction(invalidHole)).toBe(false);
        });

        test('rejects actions with missing fields', () => {
            const noPlayer = { hole: 1, score: 6 };
            const noHole = { player: 'Player1', score: 6 };
            
            expect(snakeGame.validateAction(noPlayer)).toBe(false);
            expect(snakeGame.validateAction(noHole)).toBe(false);
        });

        test('rejects invalid hole numbers', () => {
            const hole0 = { player: 'Player1', hole: 0, score: 6 };
            const hole19 = { player: 'Player1', hole: 19, score: 6 };
            const holeNegative = { player: 'Player1', hole: -1, score: 6 };
            
            expect(snakeGame.validateAction(hole0)).toBe(false);
            expect(snakeGame.validateAction(hole19)).toBe(false);
            expect(snakeGame.validateAction(holeNegative)).toBe(false);
        });

        test('allows actions without score field', () => {
            const actionWithoutScore = { player: 'Player1', hole: 1 };
            expect(snakeGame.validateAction(actionWithoutScore)).toBe(true);
        });

        test('validates edge case hole numbers', () => {
            const hole1 = { player: 'Player1', hole: 1, score: 6 };
            const hole18 = { player: 'Player1', hole: 18, score: 6 };
            
            expect(snakeGame.validateAction(hole1)).toBe(true);
            expect(snakeGame.validateAction(hole18)).toBe(true);
        });
    });

    describe('getStats', () => {
        test('returns snake-specific statistics', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 6 });
            
            const stats = snakeGame.getStats();
            
            // Test that stats object exists and has expected structure
            expect(stats).toBeDefined();
            expect(typeof stats).toBe('object');
            expect(stats.playerSnakes).toBeDefined();
            expect(stats.totalSnakes).toBe(2);
            expect(stats.snakePot).toBe(4);
            expect(stats.lastSnakePlayer).toBe('Player2');
        });

        test('counts snakes per player correctly', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player1', hole: 2, score: 7 });
            snakeGame.addAction({ player: 'Player2', hole: 3, score: 8 });
            
            const stats = snakeGame.getStats();
            
            expect(stats.playerSnakes['Player1']).toBe(2);
            expect(stats.playerSnakes['Player2']).toBe(1);
            expect(stats.playerSnakes['Player3']).toBe(0);
        });

        test('calculates snake pot correctly', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 7 });
            
            const stats = snakeGame.getStats();
            
            expect(stats.snakePot).toBe(4); // 2 snakes × 2 points each
        });

        test('identifies last snake player correctly', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 7 });
            
            const stats = snakeGame.getStats();
            
            expect(stats.lastSnakePlayer).toBe('Player2');
        });

        test('handles no snakes correctly', () => {
            const stats = snakeGame.getStats();
            
            expect(stats.totalSnakes).toBe(0);
            expect(stats.snakePot).toBe(0);
            expect(stats.lastSnakePlayer).toBe(null);
            expect(stats.playerSnakes['Player1']).toBe(0);
            expect(stats.playerSnakes['Player2']).toBe(0);
            expect(stats.playerSnakes['Player3']).toBe(0);
        });

        test('includes base game statistics', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            
            const stats = snakeGame.getStats();
            
            expect(stats.totalActions).toBe(1);
            expect(stats.betAmount).toBe(2.00);
            expect(stats.enabled).toBe(false);
        });
    });

    describe('player-specific methods', () => {
        beforeEach(() => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 7 });
            snakeGame.addAction({ player: 'Player1', hole: 3, score: 8 });
        });

        test('getPlayerSnakes returns correct actions for player', () => {
            const player1Snakes = snakeGame.getPlayerSnakes('Player1');
            const player2Snakes = snakeGame.getPlayerSnakes('Player2');
            const player3Snakes = snakeGame.getPlayerSnakes('Player3');
            
            expect(player1Snakes).toHaveLength(2);
            expect(player2Snakes).toHaveLength(1);
            expect(player3Snakes).toHaveLength(0);
            
            expect(player1Snakes[0].hole).toBe(1);
            expect(player1Snakes[1].hole).toBe(3);
            expect(player2Snakes[0].hole).toBe(2);
        });

        test('getPlayerSnakes returns empty array for non-existent player', () => {
            const nonExistentSnakes = snakeGame.getPlayerSnakes('NonExistent');
            expect(nonExistentSnakes).toEqual([]);
        });

        test('getLastSnakePlayer returns correct player', () => {
            expect(snakeGame.getLastSnakePlayer()).toBe('Player1');
        });

        test('getLastSnakePlayer returns null when no snakes', () => {
            const emptyGame = new SnakeGame(players);
            expect(emptyGame.getLastSnakePlayer()).toBe(null);
        });

        test('isLastSnake identifies last snake correctly', () => {
            expect(snakeGame.isLastSnake('Player1')).toBe(true);
            expect(snakeGame.isLastSnake('Player2')).toBe(false);
            expect(snakeGame.isLastSnake('Player3')).toBe(false);
        });

        test('isLastSnake returns false for non-existent player', () => {
            expect(snakeGame.isLastSnake('NonExistent')).toBe(false);
        });
    });

    describe('pot and hole methods', () => {
        test('getCurrentPot returns correct pot value', () => {
            expect(snakeGame.getCurrentPot()).toBe(0);
            
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            expect(snakeGame.getCurrentPot()).toBe(2);
            
            snakeGame.addAction({ player: 'Player2', hole: 2, score: 7 });
            expect(snakeGame.getCurrentPot()).toBe(4);
        });

        test('getSnakesForHole returns correct actions for hole', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 1, score: 7 });
            snakeGame.addAction({ player: 'Player3', hole: 2, score: 8 });
            
            const hole1Snakes = snakeGame.getSnakesForHole(1);
            const hole2Snakes = snakeGame.getSnakesForHole(2);
            const hole3Snakes = snakeGame.getSnakesForHole(3);
            
            expect(hole1Snakes).toHaveLength(2);
            expect(hole2Snakes).toHaveLength(1);
            expect(hole3Snakes).toHaveLength(0);
        });

        test('getSnakesByHole returns count for all holes', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 1, score: 7 });
            snakeGame.addAction({ player: 'Player3', hole: 2, score: 8 });
            
            const snakesByHole = snakeGame.getSnakesByHole();
            
            expect(snakesByHole[1]).toBe(2);
            expect(snakesByHole[2]).toBe(1);
            expect(snakesByHole[3]).toBe(0);
            expect(snakesByHole[18]).toBe(0);
        });

        test('getSnakesByHole handles empty game', () => {
            const snakesByHole = snakeGame.getSnakesByHole();
            
            for (let hole = 1; hole <= 18; hole++) {
                expect(snakesByHole[hole]).toBe(0);
            }
        });
    });

    describe('edge cases and error handling', () => {
        test('handles actions with missing scores', () => {
            const actionWithoutScore = { player: 'Player1', hole: 1 };
            
            expect(snakeGame.validateAction(actionWithoutScore)).toBe(true);
            expect(snakeGame.addAction(actionWithoutScore)).toBe(true);
        });

        test('handles multiple snakes on same hole', () => {
            snakeGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            snakeGame.addAction({ player: 'Player2', hole: 1, score: 7 });
            snakeGame.addAction({ player: 'Player3', hole: 1, score: 8 });
            
            const summary = snakeGame.calculateSummary();
            
            // Total pot = 6 points (3 snakes × 2 points each)
            // Player3 (last snake) owes the entire pot to others
            expect(summary['Player1']).toBe(3);
            expect(summary['Player2']).toBe(3);
            expect(summary['Player3']).toBe(-6);
        });

        test('handles empty players array in calculations', () => {
            const emptyGame = new SnakeGame([]);
            const summary = emptyGame.calculateSummary();
            
            expect(summary).toEqual({});
        });

        test('handles single player game edge case', () => {
            const singlePlayerGame = new SnakeGame(['Player1']);
            singlePlayerGame.addAction({ player: 'Player1', hole: 1, score: 6 });
            
            const summary = singlePlayerGame.calculateSummary();
            
            // Single player gets snake - owes 2 points to 0 other players
            // This results in -2 + 0 = -2
            expect(summary['Player1']).toBe(-2);
        });
    });

    describe('inheritance from BaseGame', () => {
        test('getBetAmount returns default bet amount', () => {
            expect(snakeGame.getBetAmount()).toBe(2.00); // Default from BaseGame
        });

        test('initializePlayerBalances sets all players to 0', () => {
            const balances = snakeGame.initializePlayerBalances();
            expect(balances['Player1']).toBe(0);
            expect(balances['Player2']).toBe(0);
            expect(balances['Player3']).toBe(0);
        });

        test('inherits BaseGame methods correctly', () => {
            expect(typeof snakeGame.getActions).toBe('function');
            expect(typeof snakeGame.getActionsForHole).toBe('function');
            expect(typeof snakeGame.clearActions).toBe('function');
            expect(typeof snakeGame.getConfig).toBe('function');
            expect(typeof snakeGame.updateConfig).toBe('function');
        });
    });
});
