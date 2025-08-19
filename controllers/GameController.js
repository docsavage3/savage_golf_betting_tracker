/**
 * Game Controller Class
 * Handles all game lifecycle operations, setup, and game action management
 * Extracted from main SavageGolf class for better separation of concerns
 */

import { 
    ELEMENT_IDS, 
    GAME_TYPES, 
    DEFAULTS, 
    PAGE_NAMES 
} from '../constants.js';
import { AnalyticsUtils } from '../utils/analytics.js';

export class GameController {
    constructor(gameManager, playerManager, uiManager, storageManager, validator) {
        this.gameManager = gameManager;
        this.playerManager = playerManager;
        this.ui = uiManager;
        this.storage = storageManager;
        this.validator = validator;
        
        // Game state properties
        this.currentHole = DEFAULTS.STARTING_HOLE;
        this.gameStarted = false;
        this.gameCompleted = false;
        
        // Legacy properties for backwards compatibility
        this.gameConfigs = this.gameManager.gameConfigs;
        this.gameActions = this.gameManager.gameActions;
        this.gameInstances = this.gameManager.gameInstances;
        this.players = this.gameManager.players;
        this.requiredPlayers = this.gameManager.requiredPlayers;
    }

    // =========================================================================
    // GAME LIFECYCLE MANAGEMENT
    // =========================================================================

    /**
     * Start a new game with current configuration
     */
    startGame() {
        // Validate inputs
        if (!this.validateGameSetup()) return;
        
        // Get player information from PlayerManager
        this.requiredPlayers = this.playerManager.getRequiredPlayers();
        this.players = this.playerManager.getCurrentPlayerNames().slice(0, this.requiredPlayers);
        this.playerManager.setPlayers(this.players);
        
        // Get game configurations
        this.gameConfigs = {};
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        const wolfChecked = document.getElementById('gameWolf').checked;
        
        if (murphChecked) {
            this.gameConfigs.murph = {
                betAmount: parseFloat(document.getElementById('murphBet').value),
                enabled: true
            };
        }
        
        if (skinsChecked) {
            this.gameConfigs.skins = {
                betAmount: parseFloat(document.getElementById('skinsBet').value),
                enabled: true,
                teams: [],
                carryoverCount: 1 // Start with 1 skin
            };
            
            // Only set up teams if we have 4 players
            if (this.requiredPlayers === 4) {
                // Validate team selection
                if (!this.playerManager.validateTeamSelection()) {
                    this.ui.showNotification('Please select 4 different players for the two teams.', 'error');
                    return;
                }
                
                // Get team configuration from PlayerManager
                const teamConfig = this.playerManager.getTeamConfiguration();
                this.gameConfigs.skins.teams = teamConfig.teams;
                this.gameConfigs.skins.teamNames = teamConfig.teamNames;
            }
        }
        
        if (kpChecked) {
            this.gameConfigs.kp = {
                betAmount: parseFloat(document.getElementById('kpBet').value),
                enabled: true
            };
        }
        
        if (snakeChecked) {
            this.gameConfigs.snake = {
                betAmount: parseFloat(document.getElementById('snakeBet').value),
                enabled: true
            };
        }
        
        if (wolfChecked) {
            this.gameConfigs.wolf = {
                betAmount: parseFloat(document.getElementById('wolfBet').value),
                enabled: true
            };
        }
        
        // Initialize games using GameManager
        this.gameManager.initializeGames(this.gameConfigs, this.players, this.requiredPlayers);
        
        // Update legacy references
        this.gameActions = this.gameManager.gameActions;
        this.gameInstances = this.gameManager.gameInstances;
        this.gameStarted = this.gameManager.gameStarted;
        
        // Hide setup, show navigation
        document.getElementById('gameSetup').style.display = 'none';
        this.showPage('navigation');
        
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize hole navigation button states
        this.updatePreviousHoleButton();
        
        // Initialize game state
        this.updateGameDisplay();
        
        // Update navigation button visibility for selected games
        this.updateGameNavigationVisibility();
        
        // Auto-save game state
        this.saveGameState();
        
        // Track analytics
        const selectedGames = Object.keys(this.gameConfigs).filter(game => this.gameConfigs[game].enabled);
        AnalyticsUtils.trackGameStart(selectedGames, this.players.length, this.gameConfigs);
        
        this.ui.showNotification(`Game started with ${this.players.length} players!`, 'success');
    }

    /**
     * Complete the current game
     */
    completeGameFlow() {
        if (!this.gameStarted || this.gameCompleted) {
            this.ui.showNotification('No active game to complete', 'error');
            return;
        }
        
        // Mark game as completed
        this.gameCompleted = true;
        this.gameManager.gameCompleted = true;
        
        // Show final results
        this.showFinalResults();
        
        // Track analytics
        AnalyticsUtils.trackGameComplete({
            playerCount: this.players.length,
            totalHoles: this.currentHole,
            gamesPlayed: Object.keys(this.gameConfigs).filter(game => this.gameConfigs[game].enabled)
        });
        
        this.ui.showNotification('Game completed! Check out the final results.', 'success');
    }

    /**
     * Save current game state to storage
     */
    saveGameState() {
        if (!this.gameStarted) return;
        
        const gameState = {
            currentHole: this.currentHole,
            gameStarted: this.gameStarted,
            gameCompleted: this.gameCompleted,
            gameConfigs: this.gameConfigs,
            gameActions: this.gameActions,
            players: this.players,
            requiredPlayers: this.requiredPlayers,
            gameManagerState: this.gameManager.getGameState()
        };
        
        const saved = this.storage.saveGameState(gameState);
        if (!saved) {
            console.warn('Failed to save game state');
        }
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        // Reset game manager
        this.gameManager.resetGames();
        
        // Reset controller state
        this.currentHole = DEFAULTS.STARTING_HOLE;
        this.gameStarted = false;
        this.gameCompleted = false;
        
        // Update legacy references
        this.gameConfigs = this.gameManager.gameConfigs;
        this.gameActions = this.gameManager.gameActions;
        this.gameInstances = this.gameManager.gameInstances;
        this.players = this.gameManager.players;
        this.requiredPlayers = this.gameManager.requiredPlayers;
        
        // Clear storage
        this.storage.clearGameState();
        
        // Return to setup page
        this.showPage('setup');
        
        // Reset UI state
        document.getElementById('gameSetup').style.display = 'block';
        
        this.ui.showNotification('Game reset successfully', 'info');
    }

    // =========================================================================
    // GAME VALIDATION
    // =========================================================================

    /**
     * Validate game setup before starting
     * @returns {boolean} True if setup is valid
     */
    validateGameSetup() {
        // Use ValidationManager for comprehensive validation
        const validationResult = this.validator.validateGameSetup(this.playerManager, this.requiredPlayers);
        
        if (!validationResult.success) {
            // Show the first error message
            this.ui.showNotification(validationResult.errors[0], 'error');
            return false;
        }
        
        return true;
    }

    // =========================================================================
    // PLACEHOLDER METHODS (TO BE IMPLEMENTED BY NAVIGATION/UI CONTROLLERS)
    // =========================================================================

    /**
     * Show a specific page - placeholder for NavigationController
     * @param {string} pageName - Name of page to show
     */
    showPage(pageName) {
        // This method will be handled by NavigationController
        // For now, emit an event or call parent method
        if (this.onShowPage) {
            this.onShowPage(pageName);
        }
    }

    /**
     * Update previous hole button state - placeholder for NavigationController
     */
    updatePreviousHoleButton() {
        if (this.onUpdatePreviousHoleButton) {
            this.onUpdatePreviousHoleButton();
        }
    }

    /**
     * Update game display - placeholder for UIController
     */
    updateGameDisplay() {
        if (this.onUpdateGameDisplay) {
            this.onUpdateGameDisplay();
        }
    }

    /**
     * Setup quick actions dashboard - placeholder for UIController
     */
    setupQuickActions() {
        if (this.onSetupQuickActions) {
            this.onSetupQuickActions();
        }
    }

    /**
     * Update game navigation visibility - placeholder for UIController
     */
    updateGameNavigationVisibility() {
        if (this.onUpdateGameNavigationVisibility) {
            this.onUpdateGameNavigationVisibility();
        }
    }

    /**
     * Show final results - placeholder for UIController
     */
    showFinalResults() {
        if (this.onShowFinalResults) {
            this.onShowFinalResults();
        }
    }

    // =========================================================================
    // CALLBACK SETTERS (FOR DEPENDENCY INJECTION)
    // =========================================================================

    /**
     * Set callback functions for UI operations
     * @param {Object} callbacks - Object containing callback functions
     */
    setCallbacks(callbacks) {
        this.onShowPage = callbacks.showPage;
        this.onUpdatePreviousHoleButton = callbacks.updatePreviousHoleButton;
        this.onUpdateGameDisplay = callbacks.updateGameDisplay;
        this.onSetupQuickActions = callbacks.setupQuickActions;
        this.onUpdateGameNavigationVisibility = callbacks.updateGameNavigationVisibility;
        this.onShowFinalResults = callbacks.showFinalResults;
    }

    // =========================================================================
    // GETTERS
    // =========================================================================

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            currentHole: this.currentHole,
            gameStarted: this.gameStarted,
            gameCompleted: this.gameCompleted,
            gameConfigs: this.gameConfigs,
            gameActions: this.gameActions,
            players: this.players,
            requiredPlayers: this.requiredPlayers
        };
    }

    /**
     * Check if game is currently active
     * @returns {boolean} True if game is active
     */
    isGameActive() {
        return this.gameStarted && !this.gameCompleted;
    }

    /**
     * Get current hole number
     * @returns {number} Current hole number
     */
    getCurrentHole() {
        return this.currentHole;
    }

    /**
     * Set current hole number
     * @param {number} hole - Hole number to set
     */
    setCurrentHole(hole) {
        this.currentHole = hole;
        this.saveGameState();
    }
}
