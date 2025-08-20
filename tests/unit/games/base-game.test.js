import { BaseGame } from '../../../games/base-game.js';
import { GAME_TYPES, DEFAULTS } from '../../../constants.js';

describe('BaseGame', () => {
    let baseGame;
    let mockPlayers;
    let mockConfig;

    beforeEach(() => {
        mockPlayers = ['Alice', 'Bob', 'Charlie'];
        mockConfig = {
            enabled: true,
            betAmount: 5.00
        };
        baseGame = new BaseGame(GAME_TYPES.MURPH, mockPlayers, mockConfig);
    });

    describe('constructor', () => {
        test('initializes with correct properties', () => {
            expect(baseGame.gameType).toBe(GAME_TYPES.MURPH);
            expect(baseGame.players).toEqual(mockPlayers);
            expect(baseGame.config).toEqual({
                enabled: true,
                betAmount: 5.00
            });
            expect(baseGame.actions).toEqual([]);
        });

        test('uses default config when none provided', () => {
            const defaultGame = new BaseGame(GAME_TYPES.SKINS, mockPlayers);
            expect(defaultGame.config).toEqual({
                enabled: false,
                betAmount: DEFAULTS.BET_AMOUNT
            });
        });

        test('handles empty players array', () => {
            const emptyGame = new BaseGame(GAME_TYPES.KP, []);
            expect(emptyGame.players).toEqual([]);
        });
    });

    describe('addAction', () => {
        beforeEach(() => {
            // Mock validateAction to return true for most tests
            baseGame.validateAction = jest.fn().mockReturnValue(true);
        });

        test('adds valid action successfully', () => {
            const action = { hole: 1, player: 'Alice', result: 'made' };
            const result = baseGame.addAction(action);
            
            expect(result).toBe(true);
            expect(baseGame.actions).toHaveLength(1);
            expect(baseGame.actions[0]).toMatchObject(action);
            expect(baseGame.actions[0].id).toBeDefined();
            expect(baseGame.actions[0].timestamp).toBeDefined();
        });

        test('generates ID and timestamp when not provided', () => {
            const action = { hole: 1, player: 'Alice', result: 'made' };
            const beforeTime = Date.now();
            
            baseGame.addAction(action);
            
            const addedAction = baseGame.actions[0];
            expect(addedAction.id).toBeGreaterThanOrEqual(beforeTime);
            expect(addedAction.timestamp).toBeInstanceOf(Date);
        });

        test('preserves existing ID and timestamp', () => {
            const customId = 12345;
            const customTimestamp = new Date('2023-01-01');
            const action = { 
                id: customId, 
                timestamp: customTimestamp,
                hole: 1, 
                player: 'Alice', 
                result: 'made' 
            };
            
            baseGame.addAction(action);
            
            const addedAction = baseGame.actions[0];
            expect(addedAction.id).toBe(customId);
            expect(addedAction.timestamp).toBe(customTimestamp);
        });

        test('calls validateAction before adding', () => {
            // Mock validateAction to return false
            baseGame.validateAction = jest.fn().mockReturnValue(false);
            
            const action = { hole: 1, player: 'Alice', result: 'made' };
            const result = baseGame.addAction(action);
            
            expect(baseGame.validateAction).toHaveBeenCalledWith(action);
            expect(result).toBe(false);
            expect(baseGame.actions).toHaveLength(0);
        });
    });

    describe('removeAction', () => {
        beforeEach(() => {
            baseGame.actions = [
                { id: 1, hole: 1, player: 'Alice' },
                { id: 2, hole: 2, player: 'Bob' },
                { id: 3, hole: 3, player: 'Charlie' }
            ];
        });

        test('removes action by ID successfully', () => {
            const result = baseGame.removeAction(2);
            
            expect(result).toBe(true);
            expect(baseGame.actions).toHaveLength(2);
            expect(baseGame.actions.find(a => a.id === 2)).toBeUndefined();
        });

        test('returns false when action not found', () => {
            const result = baseGame.removeAction(999);
            
            expect(result).toBe(false);
            expect(baseGame.actions).toHaveLength(3);
        });

        test('handles multiple actions with same ID', () => {
            // Add duplicate ID
            baseGame.actions.push({ id: 1, hole: 4, player: 'David' });
            
            const result = baseGame.removeAction(1);
            
            expect(result).toBe(true);
            // Should remove all actions with ID 1
            expect(baseGame.actions.find(a => a.id === 1)).toBeUndefined();
        });
    });

    describe('getActions', () => {
        test('returns copy of actions array', () => {
            const action = { hole: 1, player: 'Alice' };
            baseGame.actions = [action];
            
            const result = baseGame.getActions();
            
            expect(result).toEqual([action]);
            expect(result).not.toBe(baseGame.actions); // Should be a copy
        });

        test('returns empty array when no actions', () => {
            const result = baseGame.getActions();
            expect(result).toEqual([]);
        });
    });

    describe('getActionsForHole', () => {
        beforeEach(() => {
            baseGame.actions = [
                { id: 1, hole: 1, player: 'Alice' },
                { id: 2, hole: 1, player: 'Bob' },
                { id: 3, hole: 2, player: 'Charlie' },
                { id: 4, hole: 1, player: 'David' }
            ];
        });

        test('returns actions for specific hole', () => {
            const hole1Actions = baseGame.getActionsForHole(1);
            
            expect(hole1Actions).toHaveLength(3);
            expect(hole1Actions.every(a => a.hole === 1)).toBe(true);
        });

        test('returns empty array for hole with no actions', () => {
            const hole5Actions = baseGame.getActionsForHole(5);
            expect(hole5Actions).toEqual([]);
        });

        test('returns empty array for non-existent hole', () => {
            const hole0Actions = baseGame.getActionsForHole(0);
            expect(hole0Actions).toEqual([]);
        });
    });

    describe('clearActions', () => {
        test('removes all actions', () => {
            baseGame.actions = [
                { id: 1, hole: 1, player: 'Alice' },
                { id: 2, hole: 2, player: 'Bob' }
            ];
            
            baseGame.clearActions();
            
            expect(baseGame.actions).toEqual([]);
        });

        test('works when no actions exist', () => {
            baseGame.clearActions();
            expect(baseGame.actions).toEqual([]);
        });
    });

    describe('getConfig', () => {
        test('returns copy of config object', () => {
            const result = baseGame.getConfig();
            
            expect(result).toEqual(mockConfig);
            expect(result).not.toBe(baseGame.config); // Should be a copy
        });
    });

    describe('updateConfig', () => {
        test('updates existing config values', () => {
            const updates = { betAmount: 10.00, enabled: false };
            
            baseGame.updateConfig(updates);
            
            expect(baseGame.config.betAmount).toBe(10.00);
            expect(baseGame.config.enabled).toBe(false);
        });

        test('adds new config values', () => {
            const updates = { maxHoles: 18, timeLimit: 60 };
            
            baseGame.updateConfig(updates);
            
            expect(baseGame.config.maxHoles).toBe(18);
            expect(baseGame.config.timeLimit).toBe(60);
        });

        test('preserves existing config values not in update', () => {
            const originalConfig = { ...baseGame.config };
            const updates = { betAmount: 15.00 };
            
            baseGame.updateConfig(updates);
            
            expect(baseGame.config.enabled).toBe(originalConfig.enabled);
            expect(baseGame.config.betAmount).toBe(15.00);
        });
    });

    describe('initializePlayerBalances', () => {
        test('creates balance object with all players set to 0', () => {
            const balances = baseGame.initializePlayerBalances();
            
            expect(balances).toEqual({
                'Alice': 0,
                'Bob': 0,
                'Charlie': 0
            });
        });

        test('handles empty players array', () => {
            const emptyGame = new BaseGame(GAME_TYPES.SKINS, []);
            const balances = emptyGame.initializePlayerBalances();
            
            expect(balances).toEqual({});
        });
    });

    describe('isEnabled', () => {
        test('returns config enabled status', () => {
            expect(baseGame.isEnabled()).toBe(true);
            
            baseGame.config.enabled = false;
            expect(baseGame.isEnabled()).toBe(false);
        });
    });

    describe('getBetAmount', () => {
        test('returns config bet amount', () => {
            expect(baseGame.getBetAmount()).toBe(5.00);
            
            baseGame.config.betAmount = 20.00;
            expect(baseGame.getBetAmount()).toBe(20.00);
        });
    });

    describe('getStats', () => {
        test('returns correct statistics', () => {
            baseGame.actions = [
                { id: 1, hole: 1, player: 'Alice' },
                { id: 2, hole: 2, player: 'Bob' }
            ];
            
            const stats = baseGame.getStats();
            
            expect(stats).toEqual({
                totalActions: 2,
                betAmount: 5.00,
                enabled: true
            });
        });

        test('returns correct stats when no actions', () => {
            const stats = baseGame.getStats();
            
            expect(stats).toEqual({
                totalActions: 0,
                betAmount: 5.00,
                enabled: true
            });
        });
    });

    describe('abstract methods', () => {
        test('calculateSummary throws error', () => {
            expect(() => {
                baseGame.calculateSummary();
            }).toThrow('calculateSummary() must be implemented by subclass');
        });

        test('validateAction throws error', () => {
            const action = { hole: 1, player: 'Alice' };
            expect(() => {
                baseGame.validateAction(action);
            }).toThrow('validateAction() must be implemented by subclass');
        });
    });

    describe('edge cases', () => {
        test('handles null/undefined players gracefully', () => {
            const nullGame = new BaseGame(GAME_TYPES.KP, null);
            expect(nullGame.players).toEqual([]);
            
            const undefinedGame = new BaseGame(GAME_TYPES.SNAKE, undefined);
            expect(undefinedGame.players).toEqual([]);
        });

        test('handles null/undefined config gracefully', () => {
            const nullConfigGame = new BaseGame(GAME_TYPES.WOLF, mockPlayers, null);
            expect(nullConfigGame.config).toEqual({
                enabled: false,
                betAmount: DEFAULTS.BET_AMOUNT
            });
            
            const undefinedConfigGame = new BaseGame(GAME_TYPES.MURPH, mockPlayers, undefined);
            expect(undefinedConfigGame.config).toEqual({
                enabled: false,
                betAmount: DEFAULTS.BET_AMOUNT
            });
        });

        test('handles action with missing properties', () => {
            const incompleteAction = { hole: 1 }; // Missing player and result
            
            // Should still add the action since validateAction is abstract
            // and will throw error, but addAction handles it gracefully
            expect(() => {
                baseGame.addAction(incompleteAction);
            }).toThrow('validateAction() must be implemented by subclass');
        });
    });
});
