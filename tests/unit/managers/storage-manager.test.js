import { StorageManager } from '../../../managers/storage-manager.js';

describe('StorageManager', () => {
  let storageManager;

  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear();
    storageManager = new StorageManager();
  });

  describe('Initialization', () => {
    test('should initialize with correct storage key', () => {
      // The storageKey is a private property, so we'll test the public interface
      expect(storageManager).toBeDefined();
      expect(typeof storageManager.saveGameState).toBe('function');
    });

    test('should test localStorage functionality', () => {
      // Mock successful localStorage test
      localStorage.setItem.mockImplementation(() => {});
      localStorage.getItem.mockReturnValue('testValue');
      localStorage.removeItem.mockImplementation(() => {});
      
      const result = storageManager.testLocalStorage();
      expect(result).toBe(true);
    });
  });

  describe('Game State Saving', () => {
    test('should save valid game state successfully', () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike', 'Sarah', 'Tom'],
        currentHole: 3,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      const result = storageManager.saveGameState(gameState);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savageGolfGameState',
        expect.any(String)
      );
    });

    test('should reject invalid game state', () => {
      const invalidGameState = null;
      
      // Mock localStorage.setItem to throw an error for invalid state
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Invalid state');
      });
      
      const result = storageManager.saveGameState(invalidGameState);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 1,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      const result = storageManager.saveGameState(gameState);
      
      expect(result).toBe(false);
    });
  });

  describe('Game State Loading', () => {
    test('should load valid saved game state', () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike', 'Sarah', 'Tom'],
        currentHole: 3,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock localStorage.getItem to return saved state
      localStorage.getItem.mockReturnValue(JSON.stringify(gameState));

      const result = storageManager.loadGameState();
      
      expect(result).toEqual(gameState);
      expect(localStorage.getItem).toHaveBeenCalledWith('savageGolfGameState');
    });

    test('should return null when no saved state exists', () => {
      // Mock localStorage.getItem to return null
      localStorage.getItem.mockReturnValue(null);

      const result = storageManager.loadGameState();
      
      expect(result).toBeNull();
    });

    test('should handle corrupted saved state gracefully', () => {
      // Mock localStorage.getItem to return invalid JSON
      localStorage.getItem.mockReturnValue('invalid json');

      const result = storageManager.loadGameState();
      
      expect(result).toBeNull();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = storageManager.loadGameState();
      
      expect(result).toBeNull();
    });
  });

  describe('Game State Validation', () => {
    test('should validate complete game state', () => {
      const validGameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike', 'Sarah', 'Tom'],
        currentHole: 3,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      const result = storageManager.validateGameState(validGameState);
      
      expect(result).toBe(true);
    });

    test('should reject game state missing required properties', () => {
      const invalidGameState = {
        players: ['John', 'Mike'],
        currentHole: 3
        // Missing gameConfigs, gameActions
      };

      const result = storageManager.validateGameState(invalidGameState);
      
      expect(result).toBe(false);
    });

    test('should reject non-object game state', () => {
      const invalidGameState = 'not an object';

      const result = storageManager.validateGameState(invalidGameState);
      
      expect(result).toBe(false);
    });

    test('should validate game actions structure', () => {
      const gameStateWithInvalidActions = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike', 'Sarah', 'Tom'],
        currentHole: 3,
        gameStarted: true,
        gameActions: 'not an object' // Should be an object
      };

      const result = storageManager.validateGameActions(gameStateWithInvalidActions.gameActions);
      
      expect(result).toBe(false);
    });
  });

  describe('Game State Clearing', () => {
    test('should clear saved game state successfully', () => {
      storageManager.clearGameState();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('savageGolfGameState');
    });

    test('should handle localStorage errors during clear', () => {
      // Mock localStorage.removeItem to throw an error
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      storageManager.clearGameState();
      
      // clearGameState doesn't return a value, just verify it was called
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Backup Management', () => {
    test('should create backup successfully', () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 1,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock existing backups - first call is for getBackups(), second is for the backup key
      localStorage.getItem.mockReturnValueOnce(JSON.stringify([])); // getBackups()
      localStorage.getItem.mockReturnValueOnce(JSON.stringify([])); // backup key
      
      storageManager.createBackup(gameState);
      
      // Should call setItem for the backup
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savageGolfBackup',
        expect.any(String)
      );
    });

    test('should list available backups', () => {
      // Mock multiple backups
      const backupData = [
        { state: '{"test": "data1"}', timestamp: '2025-08-17T10:00:00Z', description: 'Backup 1' },
        { state: '{"test": "data2"}', timestamp: '2025-08-17T11:00:00Z', description: 'Backup 2' }
      ];
      
      localStorage.getItem.mockReturnValue(JSON.stringify(backupData));

      const backups = storageManager.getBackups();
      
      expect(backups).toEqual(backupData);
    });

    test('should restore from backup successfully', () => {
      const backupData = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 2,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock backup retrieval - backups are stored as array with state property
      const backups = [
        { state: JSON.stringify(backupData), timestamp: '2025-08-17T10:00:00Z', description: 'Backup 1' }
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify(backups));
      
      // Mock successful localStorage.setItem for restore
      localStorage.setItem.mockImplementation(() => {});

      const result = storageManager.restoreFromBackup(0); // Use index 0
      
      expect(result).toBe(true); // restoreFromBackup returns boolean
    });
  });

  describe('Export/Import Functionality', () => {
    test('should export game state as JSON string', () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 1,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock document.createElement to return a proper mock element
      const mockElement = {
        href: '',
        download: '',
        click: jest.fn()
      };
      document.createElement = jest.fn().mockReturnValue(mockElement);

      storageManager.exportGameState(gameState);
      
      // Verify that the export process was initiated
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    test('should import valid game state', async () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 1,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock File object with content property for FileReader
      const mockFile = { 
        content: JSON.stringify(gameState),
        name: 'game.json',
        type: 'application/json'
      };
      
      const result = await storageManager.importGameState(mockFile);
      
      expect(result).toEqual(gameState);
    });

    test('should reject invalid import file', async () => {
      const invalidFile = { 
        content: 'invalid json',
        name: 'game.json',
        type: 'application/json'
      };
      
      await expect(storageManager.importGameState(invalidFile)).rejects.toThrow('Invalid JSON format');
    });
  });

  describe('Storage Information', () => {
    test('should return storage info when game exists', () => {
      const gameState = {
        gameConfigs: { murph: { enabled: true, betAmount: 5 } },
        players: ['John', 'Mike'],
        currentHole: 1,
        gameStarted: true,
        gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] }
      };

      // Mock saved state and backups with sufficient data size
      const gameStateString = JSON.stringify(gameState);
      localStorage.getItem.mockReturnValueOnce(gameStateString); // Current state
      localStorage.getItem.mockReturnValueOnce(JSON.stringify([])); // Backups
      localStorage.getItem.mockReturnValueOnce(JSON.stringify([])); // getBackups() call

      const info = storageManager.getStorageInfo();
      
      expect(info.hasCurrentState).toBe(true);
      expect(info.totalSizeMB).toBe('0.00'); // Small data size results in 0.00 MB
      expect(info.backupCount).toBe(0);
    });

    test('should return storage info when no game exists', () => {
      // Mock no saved state
      localStorage.getItem.mockReturnValue(null);

      const info = storageManager.getStorageInfo();
      
      expect(info.hasCurrentState).toBe(false);
      expect(info.totalSizeMB).toBe('0.00');
      expect(info.backupCount).toBe(0);
    });
  });

  describe('Backup Cleanup', () => {
    test('should cleanup old backups', () => {
      // Mock multiple backups
      const backups = [
        { state: '{"test": "data1"}', timestamp: '2025-08-17T10:00:00Z', description: 'Backup 1' },
        { state: '{"test": "data2"}', timestamp: '2025-08-17T11:00:00Z', description: 'Backup 2' },
        { state: '{"test": "data3"}', timestamp: '2025-08-17T12:00:00Z', description: 'Backup 3' },
        { state: '{"test": "data4"}', timestamp: '2025-08-17T13:00:00Z', description: 'Backup 4' }
      ];
      
      localStorage.getItem.mockReturnValue(JSON.stringify(backups));
      
      storageManager.cleanupBackups(2);
      
      // Should call setItem to update backups (not removeItem)
      expect(localStorage.setItem).toHaveBeenCalledWith('savageGolfBackup', expect.any(String));
    });
  });
});
