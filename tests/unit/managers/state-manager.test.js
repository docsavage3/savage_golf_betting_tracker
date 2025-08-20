import { StateManager } from '../../../managers/state-manager.js';

describe('StateManager', () => {
    let stateManager;
    let mockStorageManager;
    let mockGameManager;
    let mockPlayerManager;
    let mockUI;

    beforeEach(() => {
        mockStorageManager = {
            saveGameState: jest.fn(),
            loadGameState: jest.fn(),
            clearGameState: jest.fn(),
            exportGameState: jest.fn(),
            importGameState: jest.fn()
        };
        
        mockGameManager = {
            gameConfigs: { murph: { enabled: true, betAmount: 5 } },
            gameActions: { murph: [] },
            players: ['Player1', 'Player2'],
            requiredPlayers: 2,
            gameStarted: true,
            currentHole: 3,
            gameInstances: {},
            restoreState: jest.fn()
        };
        
        mockPlayerManager = {
            restoreState: jest.fn()
        };
        
        mockUI = {
            showNotification: jest.fn(),
            showPage: jest.fn(),
            updateAllDisplays: jest.fn(),
            setBetAmount: jest.fn()
        };
        
        stateManager = new StateManager(mockStorageManager, mockGameManager, mockPlayerManager, mockUI);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('saveGameState saves state to storage', () => {
        mockStorageManager.saveGameState.mockReturnValue(true);

        const result = stateManager.saveGameState();

        expect(mockStorageManager.saveGameState).toHaveBeenCalledWith(expect.objectContaining({
            gameConfigs: mockGameManager.gameConfigs,
            gameActions: mockGameManager.gameActions,
            players: mockGameManager.players,
            requiredPlayers: mockGameManager.requiredPlayers,
            gameStarted: mockGameManager.gameStarted,
            currentHole: mockGameManager.currentHole,
            gameInstances: mockGameManager.gameInstances,
            timestamp: expect.any(String)
        }));
        expect(result).toBe(true);
    });

    test('saveGameState handles storage errors', () => {
        mockStorageManager.saveGameState.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const result = stateManager.saveGameState();

        expect(result).toBe(false);
    });

    test('loadSavedGame loads and restores game state', () => {
        const savedState = {
            gameConfigs: { murph: { enabled: true } },
            players: ['Player1', 'Player2'],
            currentHole: 3
        };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const result = stateManager.loadSavedGame();

        expect(mockStorageManager.loadGameState).toHaveBeenCalled();
        expect(mockGameManager.restoreState).toHaveBeenCalledWith(savedState);
        expect(mockPlayerManager.restoreState).toHaveBeenCalledWith(savedState);
        expect(result).toBe(true);
    });

    test('loadSavedGame returns false when no saved state', () => {
        mockStorageManager.loadGameState.mockReturnValue(null);

        const result = stateManager.loadSavedGame();

        expect(result).toBe(false);
    });

    test('loadSavedGame handles errors gracefully', () => {
        mockStorageManager.loadGameState.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const result = stateManager.loadSavedGame();

        expect(result).toBe(false);
    });

    test('restoreGameState restores state through managers', () => {
        const savedState = {
            gameConfigs: { murph: { enabled: true } },
            players: ['Player1', 'Player2'],
            currentHole: 3
        };

        stateManager.restoreGameState(savedState);

        expect(mockGameManager.restoreState).toHaveBeenCalledWith(savedState);
        expect(mockPlayerManager.restoreState).toHaveBeenCalledWith(savedState);
    });

    test('restoreGameState handles invalid state', () => {
        expect(() => stateManager.restoreGameState(null)).not.toThrow();
        expect(() => stateManager.restoreGameState('invalid')).not.toThrow();
    });

    test('autoResumeGame prompts user and resumes if confirmed', () => {
        // Mock confirm to return true
        global.confirm = jest.fn().mockReturnValue(true);
        
        const savedState = { gameStarted: true };
        const result = stateManager.autoResumeGame(savedState);

        expect(global.confirm).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    test('autoResumeGame clears state if user declines', () => {
        // Mock confirm to return false
        global.confirm = jest.fn().mockReturnValue(false);
        
        const savedState = { gameStarted: true };
        const result = stateManager.autoResumeGame(savedState);

        expect(global.confirm).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    test('autoResumeGame returns false when no saved state', () => {
        const result = stateManager.autoResumeGame(null);

        expect(result).toBe(false);
    });

    test('autoResumeGame returns false when game not started', () => {
        mockGameManager.gameStarted = false;
        
        const savedState = { gameStarted: false };
        const result = stateManager.autoResumeGame(savedState);

        expect(result).toBe(false);
    });

    test('resumeSavedGame loads and restores complete state', () => {
        const savedState = {
            gameConfigs: { murph: { enabled: true } },
            players: ['Player1', 'Player2'],
            currentHole: 3,
            gameStarted: true
        };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const result = stateManager.resumeSavedGame();

        expect(mockStorageManager.loadGameState).toHaveBeenCalled();
        expect(mockGameManager.restoreState).toHaveBeenCalledWith(savedState);
        expect(mockPlayerManager.restoreState).toHaveBeenCalledWith(savedState);
        expect(mockUI.showPage).toHaveBeenCalled();
        expect(mockUI.showNotification).toHaveBeenCalledWith('Game resumed successfully!', 'success');
        expect(result).toBe(true);
    });

    test('resumeSavedGame handles no saved state', () => {
        mockStorageManager.loadGameState.mockReturnValue(null);

        const result = stateManager.resumeSavedGame();

        expect(mockUI.showNotification).toHaveBeenCalledWith('No saved game found', 'error');
        expect(result).toBe(false);
    });

    test('resumeSavedGame handles errors gracefully', () => {
        mockStorageManager.loadGameState.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const result = stateManager.resumeSavedGame();

        expect(mockUI.showNotification).toHaveBeenCalledWith('Failed to resume game', 'error');
        expect(result).toBe(false);
    });

    test('restoreUIState restores bet amounts and updates displays', () => {
        const savedState = {
            gameConfigs: {
                murph: { enabled: true, betAmount: 5 },
                skins: { enabled: false, betAmount: 2 }
            }
        };

        stateManager.restoreUIState(savedState);

        expect(mockUI.setBetAmount).toHaveBeenCalledWith('murph', 5);
        expect(mockUI.setBetAmount).toHaveBeenCalledWith('skins', 2);
        expect(mockUI.updateAllDisplays).toHaveBeenCalled();
    });

    test('restoreUIState handles missing game configs', () => {
        const savedState = {};

        expect(() => stateManager.restoreUIState(savedState)).not.toThrow();
        expect(mockUI.updateAllDisplays).toHaveBeenCalled();
    });

    test('restoreUIState handles errors gracefully', () => {
        mockUI.setBetAmount.mockImplementation(() => {
            throw new Error('UI error');
        });

        const savedState = {
            gameConfigs: { murph: { enabled: true, betAmount: 5 } }
        };

        expect(() => stateManager.restoreUIState(savedState)).not.toThrow();
    });

    test('restoreBetAmounts sets bet amounts for enabled games', () => {
        const gameConfigs = {
            murph: { enabled: true, betAmount: 5 },
            skins: { enabled: false, betAmount: 2 },
            kp: { enabled: true, betAmount: 3 }
        };

        stateManager.restoreBetAmounts(gameConfigs);

        expect(mockUI.setBetAmount).toHaveBeenCalledWith('murph', 5);
        expect(mockUI.setBetAmount).toHaveBeenCalledWith('skins', 2);
        expect(mockUI.setBetAmount).toHaveBeenCalledWith('kp', 3);
    });

    test('restoreBetAmounts handles missing bet amounts', () => {
        const gameConfigs = {
            murph: { enabled: true },
            skins: { enabled: true, betAmount: 2 }
        };

        expect(() => stateManager.restoreBetAmounts(gameConfigs)).not.toThrow();
        expect(mockUI.setBetAmount).toHaveBeenCalledWith('skins', 2);
        expect(mockUI.setBetAmount).not.toHaveBeenCalledWith('murph', expect.anything());
    });

    test('restoreBetAmounts handles errors gracefully', () => {
        mockUI.setBetAmount.mockImplementation(() => {
            throw new Error('UI error');
        });

        const gameConfigs = {
            murph: { enabled: true, betAmount: 5 }
        };

        expect(() => stateManager.restoreBetAmounts(gameConfigs)).not.toThrow();
    });

    test('exportGameState exports state through storage manager', () => {
        stateManager.exportGameState();

        expect(mockStorageManager.exportGameState).toHaveBeenCalledWith(expect.objectContaining({
            gameConfigs: mockGameManager.gameConfigs,
            gameActions: mockGameManager.gameActions,
            players: mockGameManager.players,
            currentHole: mockGameManager.currentHole,
            exportDate: expect.any(String),
            version: '1.0'
        }));
    });

    test('exportGameState handles errors gracefully', () => {
        mockStorageManager.exportGameState.mockImplementation(() => {
            throw new Error('Export error');
        });

        expect(() => stateManager.exportGameState()).not.toThrow();
    });

    test('importGameState imports state through storage manager', () => {
        const mockCallback = jest.fn();
        mockStorageManager.importGameState.mockImplementation((callback) => {
            callback({ gameConfigs: { murph: { enabled: true } } });
        });

        stateManager.importGameState();

        expect(mockStorageManager.importGameState).toHaveBeenCalled();
        expect(mockUI.showNotification).toHaveBeenCalledWith('Game state imported successfully!', 'success');
    });

    test('importGameState handles failed import', () => {
        const mockCallback = jest.fn();
        mockStorageManager.importGameState.mockImplementation((callback) => {
            callback(null);
        });

        stateManager.importGameState();

        expect(mockUI.showNotification).toHaveBeenCalledWith('Failed to import game state', 'error');
    });

    test('importGameState handles errors gracefully', () => {
        mockStorageManager.importGameState.mockImplementation(() => {
            throw new Error('Import error');
        });

        expect(() => stateManager.importGameState()).not.toThrow();
    });

    test('clearGameState clears state through storage manager', () => {
        stateManager.clearGameState();

        expect(mockStorageManager.clearGameState).toHaveBeenCalled();
    });

    test('clearGameState handles errors gracefully', () => {
        mockStorageManager.clearGameState.mockImplementation(() => {
            throw new Error('Clear error');
        });

        expect(() => stateManager.clearGameState()).not.toThrow();
    });

    test('hasSavedGame returns true when saved state exists', () => {
        const savedState = { gameStarted: true };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const result = stateManager.hasSavedGame();

        expect(result).toBe(true);
    });

    test('hasSavedGame returns false when no saved state', () => {
        mockStorageManager.loadGameState.mockReturnValue(null);

        const result = stateManager.hasSavedGame();

        expect(result).toBe(null);
    });

    test('hasSavedGame returns false when game not started', () => {
        const savedState = { gameStarted: false };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const result = stateManager.hasSavedGame();

        expect(result).toBe(false);
    });

    test('hasSavedGame handles errors gracefully', () => {
        mockStorageManager.loadGameState.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const result = stateManager.hasSavedGame();

        expect(result).toBe(false);
    });

    test('getSavedGameSummary returns summary when saved state exists', () => {
        const savedState = {
            timestamp: '2025-01-01T00:00:00Z',
            players: ['Player1', 'Player2'],
            currentHole: 3,
            gameConfigs: {
                murph: { enabled: true },
                skins: { enabled: false }
            }
        };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const summary = stateManager.getSavedGameSummary();

        expect(summary).toEqual({
            timestamp: '2025-01-01T00:00:00Z',
            playerCount: 2,
            currentHole: 3,
            enabledGames: ['murph']
        });
    });

    test('getSavedGameSummary returns null when no saved state', () => {
        mockStorageManager.loadGameState.mockReturnValue(null);

        const summary = stateManager.getSavedGameSummary();

        expect(summary).toBeNull();
    });

    test('getSavedGameSummary handles missing properties gracefully', () => {
        const savedState = {
            timestamp: '2025-01-01T00:00:00Z'
            // Missing players, currentHole, gameConfigs
        };
        mockStorageManager.loadGameState.mockReturnValue(savedState);

        const summary = stateManager.getSavedGameSummary();

        expect(summary).toEqual({
            timestamp: '2025-01-01T00:00:00Z',
            playerCount: 0,
            currentHole: 1, // Default value
            enabledGames: []
        });
    });

    test('getSavedGameSummary handles errors gracefully', () => {
        mockStorageManager.loadGameState.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const summary = stateManager.getSavedGameSummary();

        expect(summary).toBeNull();
    });
});
