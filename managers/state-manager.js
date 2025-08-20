/**
 * State Manager
 * Handles game state persistence, loading, and restoration
 * 
 * Copyright (c) 2025 Daniel Savage
 * Licensed under MIT License
 */

import { DEFAULTS, PAGE_NAMES, MESSAGES } from '../constants.js';
import { AnalyticsUtils } from '../utils/analytics.js';
import ErrorHandler from '../utils/error-handler.js';

export class StateManager {
    constructor(storageManager, gameManager, playerManager, uiManager) {
        this.storage = storageManager;
        this.gameManager = gameManager;
        this.playerManager = playerManager;
        this.ui = uiManager;
    }

    /**
     * Save current game state to storage
     */
    saveGameState() {
        try {
            const gameState = {
                gameConfigs: this.gameManager.gameConfigs,
                gameActions: this.gameManager.gameActions,
                players: this.gameManager.players,
                requiredPlayers: this.gameManager.requiredPlayers,
                gameStarted: this.gameManager.gameStarted,
                currentHole: this.gameManager.currentHole,
                gameInstances: this.gameManager.gameInstances,
                timestamp: new Date().toISOString()
            };

            const success = this.storage.saveGameState(gameState);
            if (success) {
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.saveGameState',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.HIGH
            });
            return false;
        }
    }

    /**
     * Load saved game from storage
     */
    loadSavedGame() {
        try {
            const savedState = this.storage.loadGameState();
            if (savedState) {
                this.restoreGameState(savedState);
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.loadSavedGame',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.MEDIUM
            });
            return false;
        }
    }

    /**
     * Restore game state from saved data
     * @param {Object} savedState - Previously saved game state
     */
    restoreGameState(savedState) {
        try {
            if (!savedState || typeof savedState !== 'object') {
                throw new Error('Invalid saved state');
            }

            // Restore basic game configuration (will be done by game manager)

            // Restore game state through managers
            this.gameManager.restoreState(savedState);
            this.playerManager.restoreState(savedState);

            // Track game resume analytics
            const resumedGames = Object.keys(this.gameManager.gameConfigs || {});
            AnalyticsUtils.trackGameResume(resumedGames, savedState.currentHole);

        } catch (error) {
            ErrorHandler.handleStorageError(error, 'restoreGameState');
        }
    }

    /**
     * Auto-resume game if saved state exists
     * @param {Object} savedState - Saved game state
     */
    autoResumeGame(savedState) {
        if (!savedState || !this.gameManager.gameStarted) {
            return false;
        }

        try {
            // Show resume prompt to user
            const shouldResume = confirm(MESSAGES.RESUME_GAME_PROMPT);
            
            if (shouldResume) {
                this.resumeSavedGame();
                return true;
            } else {
                // User chose not to resume, clear the saved state
                this.clearGameState();
                return false;
            }
        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.autoResumeGame',
                type: ErrorHandler.ERROR_TYPES.GAME_LOGIC,
                severity: ErrorHandler.SEVERITY.MEDIUM
            });
            return false;
        }
    }

    /**
     * Resume a previously saved game
     */
    resumeSavedGame() {
        try {
            const savedState = this.storage.loadGameState();
            if (!savedState) {
                this.ui.showNotification('No saved game found', 'error');
                return false;
            }

            // Restore the complete game state
            this.restoreGameState(savedState);
            this.restoreUIState(savedState);

            // Navigate to appropriate page
            if (savedState.gameStarted) {
                this.ui.showPage(PAGE_NAMES.NAVIGATION, this.gameManager.gameConfigs);
            }

            this.ui.showNotification('Game resumed successfully!', 'success');
            return true;

        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.resumeSavedGame',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.HIGH
            });
            this.ui.showNotification('Failed to resume game', 'error');
            return false;
        }
    }

    /**
     * Restore UI state from saved data
     * @param {Object} savedState - Saved game state containing UI info
     */
    restoreUIState(savedState) {
        try {
            // Restore bet amounts if available
            if (savedState.gameConfigs) {
                this.restoreBetAmounts(savedState.gameConfigs);
            }

            // Update UI displays
            this.ui.updateAllDisplays();

        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.restoreUIState',
                type: ErrorHandler.ERROR_TYPES.UI,
                severity: ErrorHandler.SEVERITY.MEDIUM
            });
        }
    }

    /**
     * Restore bet amounts from saved configuration
     * @param {Object} gameConfigs - Game configurations with bet amounts
     */
    restoreBetAmounts(gameConfigs) {
        try {
            Object.keys(gameConfigs).forEach(gameType => {
                const config = gameConfigs[gameType];
                if (config && config.betAmount) {
                    // Restore bet amount in UI
                    this.ui.setBetAmount(gameType, config.betAmount);
                }
            });
        } catch (error) {
            console.warn('Failed to restore bet amounts:', error);
        }
    }

    /**
     * Export game state for backup or sharing
     */
    exportGameState() {
        try {
            const gameState = {
                gameConfigs: this.gameManager.gameConfigs,
                gameActions: this.gameManager.gameActions,
                players: this.gameManager.players,
                currentHole: this.gameManager.currentHole,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            // Use storage manager's export functionality
            this.storage.exportGameState(gameState);

        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.exportGameState',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.MEDIUM
            });
        }
    }

    /**
     * Import game state from file
     */
    importGameState() {
        try {
            // Use storage manager's import functionality
            this.storage.importGameState((importedState) => {
                if (importedState) {
                    this.restoreGameState(importedState);
                    this.ui.showNotification('Game state imported successfully!', 'success');
                } else {
                    this.ui.showNotification('Failed to import game state', 'error');
                }
            });

        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.importGameState',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.MEDIUM
            });
        }
    }

    /**
     * Clear all saved game state
     */
    clearGameState() {
        try {
            this.storage.clearGameState();
        } catch (error) {
            ErrorHandler.handle(error, {
                context: 'StateManager.clearGameState',
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.LOW
            });
        }
    }

    /**
     * Check if there is a saved game available
     * @returns {boolean} True if saved game exists
     */
    hasSavedGame() {
        try {
            const savedState = this.storage.loadGameState();
            return savedState && savedState.gameStarted;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get saved game summary for display
     * @returns {Object|null} Game summary or null if no saved game
     */
    getSavedGameSummary() {
        try {
            const savedState = this.storage.loadGameState();
            if (!savedState) return null;

            return {
                timestamp: savedState.timestamp,
                playerCount: savedState.players?.length || 0,
                currentHole: savedState.currentHole || DEFAULTS.STARTING_HOLE,
                enabledGames: Object.keys(savedState.gameConfigs || {})
                    .filter(game => savedState.gameConfigs[game]?.enabled)
            };
        } catch (error) {
            return null;
        }
    }
}
