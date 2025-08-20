import { GameManager } from '../../../managers/game-manager.js';
import { GAME_TYPES, DEFAULTS } from '../../../constants.js';

// Mock the createGame function
jest.mock('../../../games/index.js', () => ({
    createGame: jest.fn()
}));

describe('GameManager', () => {
    let gameManager;
    let mockUI;
    let mockGameInstance;
    let createGame;

    beforeEach(() => {
        mockUI = {
            showElement: jest.fn(),
            hideElement: jest.fn(),
            updateDisplay: jest.fn()
        };

        mockGameInstance = {
            addAction: jest.fn().mockReturnValue(true),
            removeAction: jest.fn().mockReturnValue(true),
            getActions: jest.fn().mockReturnValue([]),
            calculateSummary: jest.fn().mockReturnValue({}),
            getStats: jest.fn().mockReturnValue({ totalActions: 0 }),
            actions: []
        };

        createGame = require('../../../games/index.js').createGame;
        createGame.mockReturnValue(mockGameInstance);

        gameManager = new GameManager(mockUI);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('initializes with default values', () => {
            expect(gameManager.ui).toBe(mockUI);
            expect(gameManager.players).toEqual([]);
            expect(gameManager.requiredPlayers).toBe(DEFAULTS.PLAYER_COUNT);
            expect(gameManager.gameConfigs).toEqual({});
            expect(gameManager.gameInstances).toEqual({});
            expect(gameManager.gameStarted).toBe(false);
            expect(gameManager.gameCompleted).toBe(false);
        });
    });

    describe('initializeGames', () => {
        const gameConfigs = {
            murph: { enabled: true, betAmount: 5 },
            skins: { enabled: false, betAmount: 2 }
        };
        const players = ['Player1', 'Player2'];

        test('initializes games based on configuration', () => {
            gameManager.initializeGames(gameConfigs, players, 2);

            expect(gameManager.gameConfigs).toEqual(gameConfigs);
            expect(gameManager.players).toEqual(players);
            expect(gameManager.requiredPlayers).toBe(2);
            expect(gameManager.gameStarted).toBe(true);
            expect(gameManager.gameCompleted).toBe(false);
        });

        test('creates game instances for enabled games', () => {
            gameManager.initializeGames(gameConfigs, players, 2);

            expect(createGame).toHaveBeenCalledWith('murph', players, {
                ...gameConfigs.murph,
                requiredPlayers: 2
            });
            expect(createGame).not.toHaveBeenCalledWith('skins', players, expect.any(Object));
        });

        test('stores game instances correctly', () => {
            gameManager.initializeGames(gameConfigs, players, 2);

            expect(gameManager.gameInstances.murph).toBe(mockGameInstance);
            expect(gameManager.gameInstances.skins).toBeUndefined();
        });
    });

    describe('resetGames', () => {
        test('resets all games to initial state', () => {
            // Set up some state
            gameManager.gameInstances.murph = mockGameInstance;
            gameManager.gameConfigs.murph = { enabled: true };
            gameManager.players = ['Player1', 'Player2'];
            gameManager.gameStarted = true;
            gameManager.gameCompleted = true;

            gameManager.resetGames();

            expect(gameManager.gameInstances).toEqual({});
            expect(gameManager.gameConfigs).toEqual({});
            expect(gameManager.players).toEqual([]);
            expect(gameManager.requiredPlayers).toBe(DEFAULTS.PLAYER_COUNT);
            expect(gameManager.gameStarted).toBe(false);
            expect(gameManager.gameCompleted).toBe(false);
        });
    });

    describe('restoreGameState', () => {
        const savedState = {
            gameConfigs: { murph: { enabled: true, betAmount: 5 } },
            players: ['Player1', 'Player2'],
            requiredPlayers: 2,
            gameStarted: true,
            gameCompleted: false,
            gameActions: {
                murph: [{ id: 1, player: 'Player1', hole: 1 }]
            }
        };

        test('restores game state from saved data', () => {
            gameManager.restoreGameState(savedState);

            expect(gameManager.gameConfigs).toEqual(savedState.gameConfigs);
            expect(gameManager.players).toEqual(savedState.players);
            expect(gameManager.requiredPlayers).toBe(savedState.requiredPlayers);
            expect(gameManager.gameStarted).toBe(savedState.gameStarted);
            expect(gameManager.gameCompleted).toBe(savedState.gameCompleted);
        });

        test('reinitializes game instances when games were started', () => {
            gameManager.restoreGameState(savedState);

            expect(createGame).toHaveBeenCalledWith('murph', savedState.players, {
                ...savedState.gameConfigs.murph,
                requiredPlayers: savedState.requiredPlayers
            });
        });

        test('restores actions to game instances after initialization', () => {
            gameManager.restoreGameState(savedState);

            expect(mockGameInstance.actions).toEqual([{ id: 1, player: 'Player1', hole: 1 }]);
        });

        test('handles missing properties gracefully', () => {
            const minimalState = { gameStarted: false };
            
            expect(() => {
                gameManager.restoreGameState(minimalState);
            }).not.toThrow();

            expect(gameManager.gameConfigs).toEqual({});
            expect(gameManager.players).toEqual([]);
        });

        test('handles errors gracefully', () => {
            createGame.mockImplementation(() => {
                throw new Error('Game creation failed');
            });

            expect(() => {
                gameManager.restoreGameState(savedState);
            }).not.toThrow();
        });
    });

    describe('completeGame', () => {
        test('marks game as completed', () => {
            gameManager.gameStarted = true;
            gameManager.gameCompleted = false;

            gameManager.completeGame();

            expect(gameManager.gameCompleted).toBe(true);
        });
    });

    describe('hasEnabledGames', () => {
        test('returns true when games are enabled', () => {
            gameManager.gameConfigs = {
                murph: { enabled: true },
                skins: { enabled: false }
            };

            expect(gameManager.hasEnabledGames()).toBe(true);
        });

        test('returns false when no games are enabled', () => {
            gameManager.gameConfigs = {
                murph: { enabled: false },
                skins: { enabled: false }
            };

            expect(gameManager.hasEnabledGames()).toBe(false);
        });

        test('handles missing game configs gracefully', () => {
            delete gameManager.gameConfigs;

            expect(() => {
                gameManager.hasEnabledGames();
            }).toThrow();
        });
    });

    describe('getEnabledGameTypes', () => {
        test('returns list of enabled game types', () => {
            gameManager.gameConfigs = {
                murph: { enabled: true },
                skins: { enabled: false },
                kp: { enabled: true }
            };

            const enabledGames = gameManager.getEnabledGameTypes();

            expect(enabledGames).toContain('murph');
            expect(enabledGames).toContain('kp');
            expect(enabledGames).not.toContain('skins');
        });

        test('handles missing game configs gracefully', () => {
            delete gameManager.gameConfigs;

            expect(() => {
                gameManager.getEnabledGameTypes();
            }).toThrow();
        });
    });

    describe('addGameAction', () => {
        const action = { id: 1, player: 'Player1', hole: 1 };

        test('adds action to game instance when available', () => {
            gameManager.gameInstances.murph = mockGameInstance;

            const result = gameManager.addGameAction('murph', action);

            expect(result).toBe(true);
            expect(mockGameInstance.addAction).toHaveBeenCalledWith(action);
        });

        test('returns false when game instance not available', () => {
            const result = gameManager.addGameAction('murph', action);

            expect(result).toBe(false);
        });

        test('handles game instance errors gracefully', () => {
            gameManager.gameInstances.murph = mockGameInstance;
            mockGameInstance.addAction.mockImplementation(() => {
                throw new Error('Add action failed');
            });

            expect(() => {
                gameManager.addGameAction('murph', action);
            }).not.toThrow();

            expect(mockGameInstance.addAction).toHaveBeenCalledWith(action);
        });

        test('handles missing game instance gracefully', () => {
            const result = gameManager.addGameAction('murph', action);

            expect(result).toBe(false);
        });
    });

    describe('removeGameAction', () => {
        test('removes action from game instance when available', () => {
            gameManager.gameInstances.murph = mockGameInstance;

            const result = gameManager.removeGameAction('murph', 1);

            expect(result).toBe(true);
            expect(mockGameInstance.removeAction).toHaveBeenCalledWith(1);
        });

        test('returns false when game instance not available', () => {
            const result = gameManager.removeGameAction('murph', 1);

            expect(result).toBe(false);
        });
    });

    describe('getGameActions', () => {
        test('returns actions for specific game type', () => {
            const actions = [{ id: 1, player: 'Player1' }];
            mockGameInstance.getActions.mockReturnValue(actions);
            gameManager.gameInstances.murph = mockGameInstance;

            const result = gameManager.getGameActions('murph');

            expect(result).toEqual(actions);
            expect(mockGameInstance.getActions).toHaveBeenCalled();
        });

        test('returns empty array when game instance not available', () => {
            const result = gameManager.getGameActions('murph');

            expect(result).toEqual([]);
        });
    });

    describe('getActionsForHole', () => {
        test('returns actions for specific hole across all games', () => {
            const murphActions = [{ id: 1, player: 'Player1', hole: 1 }];
            const skinsActions = [{ id: 2, player: 'Player2', hole: 1 }];
            const kpActions = [{ id: 3, player: 'Player1', hole: 2 }];

            mockGameInstance.getActions
                .mockReturnValueOnce(murphActions)
                .mockReturnValueOnce(skinsActions)
                .mockReturnValueOnce(kpActions);

            gameManager.gameInstances.murph = mockGameInstance;
            gameManager.gameInstances.skins = mockGameInstance;
            gameManager.gameInstances.kp = mockGameInstance;

            const result = gameManager.getActionsForHole(1);

            expect(result.murph).toEqual(murphActions);
            expect(result.skins).toEqual(skinsActions);
            expect(result.kp).toEqual([]); // No actions for hole 2
        });
    });

    describe('calculateGameSummary', () => {
        test('calculates summary using game instance when available', () => {
            const summary = { Player1: 10, Player2: -10 };
            mockGameInstance.calculateSummary.mockReturnValue(summary);
            gameManager.gameInstances.murph = mockGameInstance;

            const result = gameManager.calculateGameSummary('murph');

            expect(result).toEqual(summary);
            expect(mockGameInstance.calculateSummary).toHaveBeenCalled();
        });

        test('returns empty balances when game instance not available', () => {
            gameManager.players = ['Player1', 'Player2'];

            const result = gameManager.calculateGameSummary('murph');

            expect(result).toEqual({ Player1: 0, Player2: 0 });
        });

        test('handles game instance errors gracefully', () => {
            gameManager.gameInstances.murph = mockGameInstance;
            mockGameInstance.calculateSummary.mockImplementation(() => {
                throw new Error('Calculate summary failed');
            });

            expect(() => {
                gameManager.calculateGameSummary('murph');
            }).toThrow('Calculate summary failed');
        });
    });

    describe('calculateCombinedSummary', () => {
        test('combines summaries from all enabled games', () => {
            gameManager.players = ['Player1', 'Player2'];
            gameManager.gameConfigs = {
                murph: { enabled: true },
                skins: { enabled: true }
            };

            const murphSummary = { Player1: 10, Player2: -10 };
            const skinsSummary = { Player1: 5, Player2: -5 };

            mockGameInstance.calculateSummary
                .mockReturnValueOnce(murphSummary)
                .mockReturnValueOnce(skinsSummary);

            gameManager.gameInstances.murph = mockGameInstance;
            gameManager.gameInstances.skins = mockGameInstance;

            const result = gameManager.calculateCombinedSummary();

            expect(result.combinedSummary.Player1).toBe(15);
            expect(result.combinedSummary.Player2).toBe(-15);
            expect(result.gameSummaries.murph).toEqual(murphSummary);
            expect(result.gameSummaries.skins).toEqual(skinsSummary);
        });
    });

    describe('generatePaymentInstructions', () => {
        test('generates payment instructions for uneven balances', () => {
            gameManager.players = ['Player1', 'Player2', 'Player3'];
            
            // Mock the calculateCombinedSummary method
            gameManager.calculateCombinedSummary = jest.fn().mockReturnValue({
                combinedSummary: { Player1: 15, Player2: -10, Player3: -5 }
            });

            const result = gameManager.generatePaymentInstructions();

            expect(result).toContain('Payment Instructions');
            expect(result).toContain('Player2');
            expect(result).toContain('Player1');
            expect(result).toContain('$10.00');
        });

        test('shows no payments needed message for even balances', () => {
            gameManager.players = ['Player1', 'Player2'];
            
            gameManager.calculateCombinedSummary = jest.fn().mockReturnValue({
                combinedSummary: { Player1: 0, Player2: 0 }
            });

            const result = gameManager.generatePaymentInstructions();

            expect(result).toContain('No payments needed - everyone is even!');
        });
    });

    describe('getGameStatistics', () => {
        test('returns statistics for enabled games', () => {
            gameManager.gameConfigs = {
                murph: { enabled: true, betAmount: 5 },
                skins: { enabled: false, betAmount: 2 }
            };

            const stats = { totalActions: 3, betAmount: 5 };
            mockGameInstance.getStats.mockReturnValue(stats);
            gameManager.gameInstances.murph = mockGameInstance;

            const result = gameManager.getGameStatistics();

            expect(result.murph).toEqual(stats);
            expect(result.skins).toEqual({
                totalActions: 0,
                betAmount: 2,
                enabled: false
            });
        });
    });

    describe('getGameState', () => {
        test('returns current game state information', () => {
            gameManager.gameStarted = true;
            gameManager.gameCompleted = false;
            gameManager.players = ['Player1', 'Player2'];
            gameManager.requiredPlayers = 2;
            gameManager.gameConfigs = { murph: { enabled: true } };

            const result = gameManager.getGameState();

            expect(result.gameStarted).toBe(true);
            expect(result.gameCompleted).toBe(false);
            expect(result.players).toEqual(['Player1', 'Player2']);
            expect(result.requiredPlayers).toBe(2);
            expect(result.enabledGames).toEqual(['murph']);
            expect(result.totalActions).toBe(0);
            expect(result.gameConfigs).toEqual({ murph: { enabled: true } });
        });
    });

    describe('canCompleteGame', () => {
        test('returns true when game can be completed', () => {
            gameManager.gameStarted = true;
            gameManager.gameCompleted = false;

            expect(gameManager.canCompleteGame()).toBe(true);
        });

        test('returns false when game not started', () => {
            gameManager.gameStarted = false;
            gameManager.gameCompleted = false;

            expect(gameManager.canCompleteGame()).toBe(false);
        });

        test('returns false when game already completed', () => {
            gameManager.gameStarted = true;
            gameManager.gameCompleted = true;

            expect(gameManager.canCompleteGame()).toBe(false);
        });
    });

    describe('hasAnyActions', () => {
        test('returns true when any game has actions', () => {
            mockGameInstance.getActions.mockReturnValue([{ id: 1, player: 'Player1' }]);
            gameManager.gameInstances.murph = mockGameInstance;

            expect(gameManager.hasAnyActions()).toBe(true);
        });

        test('returns false when no games have actions', () => {
            mockGameInstance.getActions.mockReturnValue([]);
            gameManager.gameInstances.murph = mockGameInstance;

            expect(gameManager.hasAnyActions()).toBe(false);
        });

        test('returns false when no game instances exist', () => {
            expect(gameManager.hasAnyActions()).toBe(false);
        });
    });
});

