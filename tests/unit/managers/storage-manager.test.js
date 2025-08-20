import { StorageManager } from '../../../managers/storage-manager.js';

describe('StorageManager', () => {
    let storageManager;
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };

        // Replace global localStorage with mock
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        storageManager = new StorageManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('initializes with default values', () => {
            expect(storageManager.STORAGE_KEY).toBe('savageGolfGameState');
            expect(storageManager.BACKUP_KEY).toBe('savageGolfBackup');
            expect(storageManager.MAX_BACKUPS).toBe(5);
        });
    });

    describe('saveGameState', () => {
        test('saves game state successfully', () => {
            const gameState = { players: ['Player1'], gameType: 'murph' };
            
            const result = storageManager.saveGameState(gameState);
            
            expect(result).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfGameState',
                expect.stringContaining('"players":["Player1"]')
            );
        });

        test('creates backup before saving', () => {
            const gameState = { players: ['Player1'] };
            
            // Mock existing state so createBackup can work
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(gameState));
            
            storageManager.saveGameState(gameState);
            
            // Check that both the backup and the game state were saved
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfBackup',
                expect.any(String)
            );
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfGameState',
                expect.any(String)
            );
            
            // Verify the calls were made in the correct order
            const calls = mockLocalStorage.setItem.mock.calls;
            expect(calls[0][0]).toBe('savageGolfBackup');
            expect(calls[1][0]).toBe('savageGolfGameState');
        });

        test('handles save errors gracefully', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            
            const result = storageManager.saveGameState({ players: ['Player1'] });
            
            expect(result).toBe(false);
        });
    });

    describe('loadGameState', () => {
        test('loads valid game state', () => {
            const savedState = {
                gameConfigs: {},
                players: ['Player1'],
                gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] },
                currentHole: 1,
                lastSaved: '2025-01-01T00:00:00.000Z',
                version: '1.0.0'
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));
            
            const result = storageManager.loadGameState();
            
            expect(result).toEqual(savedState);
        });

        test('returns null for non-existent state', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const result = storageManager.loadGameState();
            
            expect(result).toBeNull();
        });

        test('handles invalid JSON gracefully', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');
            
            const result = storageManager.loadGameState();
            
            expect(result).toBeNull();
        });

        test('clears corrupted data', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');
            
            storageManager.loadGameState();
            
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('savageGolfGameState');
        });
    });

    describe('hasSavedGame', () => {
        test('returns true when saved game exists', () => {
            mockLocalStorage.getItem.mockReturnValue('{"players":["Player1"]}');
            
            const result = storageManager.hasSavedGame();
            
            expect(result).toBe(true);
        });

        test('returns false when no saved game', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const result = storageManager.hasSavedGame();
            
            expect(result).toBe(false);
        });
    });

    describe('clearGameState', () => {
        test('removes game state from storage', () => {
            storageManager.clearGameState();
            
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('savageGolfGameState');
        });

        test('handles clear errors gracefully', () => {
            mockLocalStorage.removeItem.mockImplementation(() => {
                throw new Error('Remove error');
            });
            
            expect(() => {
                storageManager.clearGameState();
            }).not.toThrow();
        });
    });

    describe('createBackup', () => {
        test('creates backup when game state exists', () => {
            const gameState = '{"players":["Player1"]}';
            mockLocalStorage.getItem
                .mockReturnValueOnce(gameState) // For current state
                .mockReturnValueOnce('[]'); // For existing backups
            
            storageManager.createBackup();
            
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfBackup',
                expect.any(String)
            );
            // The backup is stored as an array with the new backup at the beginning
            const backupData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(backupData).toHaveLength(1);
            expect(backupData[0].state).toBe(gameState);
        });

        test('does not create backup when no game state', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            storageManager.createBackup();
            
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('getBackups', () => {
        test('returns array of backups', () => {
            const backups = [
                { state: '{"players":["Player1"]}', timestamp: '2025-01-01T00:00:00.000Z' }
            ];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            const result = storageManager.getBackups();
            
            expect(result).toEqual(backups);
        });

        test('returns empty array when no backups', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const result = storageManager.getBackups();
            
            expect(result).toEqual([]);
        });

        test('handles invalid backup data gracefully', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');
            
            const result = storageManager.getBackups();
            
            expect(result).toEqual([]);
        });
    });

    describe('restoreFromBackup', () => {
        test('restores valid backup successfully', () => {
            const validState = {
                gameConfigs: {},
                players: ['Player1'],
                gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] },
                currentHole: 1
            };
            const backup = { state: JSON.stringify(validState) };
            const backups = [backup];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            const result = storageManager.restoreFromBackup(0);
            
            expect(result).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfGameState',
                backup.state
            );
        });

        test('returns false for invalid backup index', () => {
            const backups = [{ state: '{"players":["Player1"]}' }];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            const result = storageManager.restoreFromBackup(1);
            
            expect(result).toBe(false);
        });

        test('returns false for invalid backup data', () => {
            const backup = { state: 'invalid json' };
            const backups = [backup];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            const result = storageManager.restoreFromBackup(0);
            
            expect(result).toBe(false);
        });
    });

    describe('exportGameState', () => {
        test('exports game state as downloadable data', () => {
            const gameState = { players: ['Player1'], gameType: 'murph' };
            
            // Mock document methods
            const mockLink = { href: '', download: '', click: jest.fn() };
            const originalCreateElement = document.createElement;
            
            document.createElement = jest.fn(() => mockLink);
            URL.createObjectURL = jest.fn(() => 'mock-url');
            URL.revokeObjectURL = jest.fn();
            
            // Mock document.body methods
            const originalAppendChild = document.body.appendChild;
            const originalRemoveChild = document.body.removeChild;
            document.body.appendChild = jest.fn();
            document.body.removeChild = jest.fn();
            
            storageManager.exportGameState(gameState);
            
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockLink.download).toMatch(/savage-golf-game-.*\.json/);
            expect(mockLink.click).toHaveBeenCalled();
            
            // Restore original methods
            document.createElement = originalCreateElement;
            document.body.appendChild = originalAppendChild;
            document.body.removeChild = originalRemoveChild;
        });
    });

    describe('importGameState', () => {
        test('imports valid game state successfully', async () => {
            const gameState = {
                gameConfigs: {},
                players: ['Player1'],
                gameActions: { murph: [], skins: [], kp: [], snake: [], wolf: [] },
                currentHole: 1
            };
            
            const mockFile = new File([JSON.stringify(gameState)], 'test.json', { type: 'application/json' });
            
            // Mock FileReader to work in test environment
            const mockFileReader = {
                onload: null,
                onerror: null,
                readAsText: jest.fn(function() {
                    // Simulate successful read
                    setTimeout(() => {
                        if (this.onload) {
                            this.onload({ target: { result: JSON.stringify(gameState) } });
                        }
                    }, 0);
                })
            };
            
            global.FileReader = jest.fn(() => mockFileReader);
            
            const result = await storageManager.importGameState(mockFile);
            
            expect(result).toEqual(gameState);
        });

        test('rejects invalid game state', async () => {
            const invalidState = { players: 'not an array' };
            const mockFile = new File([JSON.stringify(invalidState)], 'test.json', { type: 'application/json' });
            
            // Mock FileReader to work in test environment
            const mockFileReader = {
                onload: null,
                onerror: null,
                readAsText: jest.fn(function() {
                    // Simulate successful read
                    setTimeout(() => {
                        if (this.onload) {
                            this.onload({ target: { result: JSON.stringify(invalidState) } });
                        }
                    }, 0);
                })
            };
            
            global.FileReader = jest.fn(() => mockFileReader);
            
            await expect(storageManager.importGameState(mockFile)).rejects.toThrow('Invalid game state format');
        });
    });

    describe('validateGameState', () => {
        test('returns true for valid game state', () => {
            const validState = {
                gameConfigs: {},
                players: ['Player1', 'Player2'],
                gameActions: {
                    murph: [],
                    skins: [],
                    kp: [],
                    snake: [],
                    wolf: []
                },
                currentHole: 1
            };
            
            const result = storageManager.validateGameState(validState);
            
            expect(result).toBe(true);
        });

        test('returns false for invalid game state', () => {
            const invalidState = {
                players: 'not an array',
                gameType: 'murph'
            };
            
            const result = storageManager.validateGameState(invalidState);
            
            expect(result).toBe(false);
        });
    });

    describe('validateGameActions', () => {
        test('returns true for valid game actions', () => {
            const validActions = {
                murph: [],
                skins: [],
                kp: [],
                snake: [],
                wolf: []
            };
            
            const result = storageManager.validateGameActions(validActions);
            
            expect(result).toBe(true);
        });

        test('returns false for invalid game actions', () => {
            const invalidActions = {
                murph: 'not an array'
            };
            
            const result = storageManager.validateGameActions(invalidActions);
            
            expect(result).toBe(false);
        });
    });

    describe('getStorageInfo', () => {
        test('returns comprehensive storage information', () => {
            const gameState = '{"players":["Player1"]}';
            const backups = '[{"state":"backup1"}]';
            
            mockLocalStorage.getItem
                .mockReturnValueOnce(gameState)
                .mockReturnValueOnce(backups);
            
            const info = storageManager.getStorageInfo();
            
            expect(info).toHaveProperty('currentStateSize');
            expect(info).toHaveProperty('backupSize');
            expect(info).toHaveProperty('totalSize');
            expect(info).toHaveProperty('totalSizeMB');
            expect(info).toHaveProperty('hasCurrentState');
            expect(info).toHaveProperty('backupCount');
        });

        test('handles empty storage', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const info = storageManager.getStorageInfo();
            
            expect(info.currentStateSize).toBe(0);
            expect(info.backupSize).toBe(0);
            expect(info.totalSize).toBe(0);
            expect(info.hasCurrentState).toBe(false);
            expect(info.backupCount).toBe(0);
        });
    });

    describe('cleanupBackups', () => {
        test('removes old backups when over limit', () => {
            const backups = [
                { state: 'backup1' },
                { state: 'backup2' },
                { state: 'backup3' },
                { state: 'backup4' }
            ];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            storageManager.cleanupBackups(2);
            
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'savageGolfBackup',
                expect.stringContaining('backup1')
            );
        });

        test('does not remove backups when under limit', () => {
            const backups = [{ state: 'backup1' }];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backups));
            
            storageManager.cleanupBackups(3);
            
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('testLocalStorage', () => {
        test('returns true when localStorage is working', () => {
            // Ensure the mock is properly set up for this test
            mockLocalStorage.setItem.mockReturnValue(undefined);
            mockLocalStorage.getItem.mockReturnValue('testValue');
            mockLocalStorage.removeItem.mockReturnValue(undefined);
            
            const result = storageManager.testLocalStorage();
            
            expect(result).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
        });

        test('returns false when localStorage fails', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            
            const result = storageManager.testLocalStorage();
            
            expect(result).toBe(false);
        });
    });
    
    afterEach(() => {
        // Reset all mocks after each test
        jest.clearAllMocks();
    });
});
