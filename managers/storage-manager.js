/**
 * Storage Manager Class
 * Handles all localStorage operations for game state persistence
 * Provides save, load, export, import, and cleanup functionality
 */

import { 
    GAME_TYPES,
    DEFAULTS,
    PAGE_NAMES
} from '../constants.js';
import ErrorHandler from '../utils/error-handler.js';

export class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'savageGolfGameState';
        this.BACKUP_KEY = 'savageGolfBackup';
        this.MAX_BACKUPS = 5;
    }

    // =========================================================================
    // CORE STORAGE OPERATIONS
    // =========================================================================

    /**
     * Save complete game state to localStorage
     * @param {Object} gameState - Complete game state object
     * @returns {boolean} Success status
     */
    saveGameState(gameState) {
        try {
    
            
            const stateToSave = {
                ...gameState,
                lastSaved: new Date().toISOString(),
                version: '1.0.0'
            };

    

            // Create backup before saving
            this.createBackup();

            // Save current state
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
            
            
            
            // Verify save by reading it back
            const savedData = localStorage.getItem(this.STORAGE_KEY);
    
            
            return true;
        } catch (error) {
            ErrorHandler.handleStorageError(error, 'saveGameState');
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} Game state object or null if not found
     */
    loadGameState() {
        try {
            
            
            const savedState = localStorage.getItem(this.STORAGE_KEY);
    
            
            if (!savedState) {
        
                return null;
            }

            const gameState = JSON.parse(savedState);
    
            
            // Validate state structure
            if (this.validateGameState(gameState)) {
        
                return gameState;
            } else {
                console.warn('Invalid game state found, clearing corrupted data');
                this.clearGameState();
                return null;
            }
        } catch (error) {
            ErrorHandler.handleStorageError(error, 'loadGameState');
            this.clearGameState();
            return null;
        }
    }

    /**
     * Check if a saved game exists
     * @returns {boolean} True if saved game exists
     */
    hasSavedGame() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    /**
     * Clear current game state from localStorage
     */
    clearGameState() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
    
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    }

    // =========================================================================
    // BACKUP AND RECOVERY
    // =========================================================================

    /**
     * Create a backup of current game state
     */
    createBackup() {
        try {
            const currentState = localStorage.getItem(this.STORAGE_KEY);
            if (!currentState) return;

            const backup = {
                state: currentState,
                timestamp: new Date().toISOString(),
                description: 'Auto-backup before save'
            };

            // Get existing backups
            const backups = this.getBackups();
            
            // Add new backup
            backups.unshift(backup);
            
            // Keep only the most recent backups
            if (backups.length > this.MAX_BACKUPS) {
                backups.splice(this.MAX_BACKUPS);
            }

            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }

    /**
     * Get list of available backups
     * @returns {Array} Array of backup objects
     */
    getBackups() {
        try {
            const backups = localStorage.getItem(this.BACKUP_KEY);
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('Failed to get backups:', error);
            return [];
        }
    }

    /**
     * Restore game state from a specific backup
     * @param {number} backupIndex - Index of backup to restore
     * @returns {boolean} Success status
     */
    restoreFromBackup(backupIndex) {
        try {
            const backups = this.getBackups();
            if (backupIndex < 0 || backupIndex >= backups.length) {
                console.error('Invalid backup index');
                return false;
            }

            const backup = backups[backupIndex];
            const gameState = JSON.parse(backup.state);
            
            if (this.validateGameState(gameState)) {
                localStorage.setItem(this.STORAGE_KEY, backup.state);
        
                return true;
            } else {
                console.error('Invalid backup data');
                return false;
            }
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }

    // =========================================================================
    // EXPORT AND IMPORT
    // =========================================================================

    /**
     * Export game state as downloadable file
     * @param {Object} gameState - Game state to export
     */
    exportGameState(gameState) {
        try {
            const exportData = {
                ...gameState,
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `savage-golf-game-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
    
        } catch (error) {
            console.error('Failed to export game state:', error);
        }
    }

    /**
     * Import game state from file
     * @param {File} file - JSON file to import
     * @returns {Promise<Object>} Promise resolving to imported game state
     */
    async importGameState(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const importedState = JSON.parse(event.target.result);
                        
                        if (this.validateGameState(importedState)) {
                    
                            resolve(importedState);
                        } else {
                            reject(new Error('Invalid game state format'));
                        }
                    } catch (error) {
                        reject(new Error('Invalid JSON format'));
                    }
                };
                
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            } catch (error) {
                reject(error);
            }
        });
    }

    // =========================================================================
    // VALIDATION AND UTILITIES
    // =========================================================================

    /**
     * Validate game state structure
     * @param {Object} gameState - Game state to validate
     * @returns {boolean} True if valid
     */
    validateGameState(gameState) {

        
        if (!gameState || typeof gameState !== 'object') {
            console.warn('Game state is not an object');
            return false;
        }

        // Check required top-level properties
        const requiredProps = ['gameConfigs', 'players', 'gameActions', 'currentHole'];
        for (const prop of requiredProps) {
            if (!(prop in gameState)) {
                console.warn(`Missing required property: ${prop}`);
                return false;
            }
        }



        // Validate game actions structure
        if (!this.validateGameActions(gameState.gameActions)) {
            console.warn('Game actions validation failed');
            return false;
        }

        // Validate players array
        if (!Array.isArray(gameState.players) || gameState.players.length === 0) {
            console.warn('Invalid players array');
            return false;
        }


        return true;
    }

    /**
     * Validate game actions structure
     * @param {Object} gameActions - Game actions to validate
     * @returns {boolean} True if valid
     */
    validateGameActions(gameActions) {

        
        if (!gameActions || typeof gameActions !== 'object') {
            console.warn('Game actions is not an object');
            return false;
        }

        // Check that all game types are present
        for (const gameType of Object.values(GAME_TYPES)) {
            if (!(gameType in gameActions)) {
                console.warn(`Missing game actions for: ${gameType}`);
                return false;
            }
            
            if (!Array.isArray(gameActions[gameType])) {
                console.warn(`Invalid game actions array for: ${gameType}`);
                return false;
            }
        }


        return true;
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            
            
            const currentState = localStorage.getItem(this.STORAGE_KEY);
            const backups = localStorage.getItem(this.BACKUP_KEY);
            
            
            
            const currentSize = currentState ? new Blob([currentState]).size : 0;
            const backupSize = backups ? new Blob([backups]).size : 0;
            const totalSize = currentSize + backupSize;
            
            const info = {
                currentStateSize: currentSize,
                backupSize: backupSize,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                hasCurrentState: !!currentState,
                backupCount: this.getBackups().length
            };
            
    
            return info;
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    /**
     * Clean up old backups to free space
     * @param {number} keepCount - Number of backups to keep
     */
    cleanupBackups(keepCount = 3) {
        try {
            const backups = this.getBackups();
            if (backups.length <= keepCount) return;

            const backupsToKeep = backups.slice(0, keepCount);
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupsToKeep));
            
    
        } catch (error) {
            console.error('Failed to cleanup backups:', error);
        }
    }

    /**
     * Test localStorage functionality
     * @returns {boolean} True if localStorage is working
     */
    testLocalStorage() {
        try {
            const testKey = 'testKey';
            const testValue = 'testValue';
            
            localStorage.setItem(testKey, testValue);
            const retrievedValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const isWorking = retrievedValue === testValue;
    
            return isWorking;
        } catch (error) {
            console.error('localStorage test failed:', error);
            return false;
        }
    }
}
