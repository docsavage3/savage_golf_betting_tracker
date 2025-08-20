/**
 * Game Manager Class
 * Orchestrates all game instances, handles lifecycle management, and coordinates cross-game operations
 * Centralizes game calculations, summaries, and state management
 */

import { 
    GAME_TYPES,
    DEFAULTS
} from '../constants.js';
import { createGame } from '../games/index.js';
import ErrorHandler from '../utils/error-handler.js';

export class GameManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.players = [];
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT;
        this.gameConfigs = {};
        this.gameInstances = {};
        
        this.gameStarted = false;
        this.gameCompleted = false;
    }

    // =========================================================================
    // GAME LIFECYCLE MANAGEMENT
    // =========================================================================

    /**
     * Initialize games based on configuration
     * @param {Object} gameConfigs - Game configurations
     * @param {Array} players - Player list
     * @param {number} requiredPlayers - Number of required players
     */
    initializeGames(gameConfigs, players, requiredPlayers) {
        this.gameConfigs = { ...gameConfigs };
        this.players = [...players];
        this.requiredPlayers = requiredPlayers;
        this.gameStarted = true;
        this.gameCompleted = false;

        // Initialize game instances based on enabled games
        Object.keys(this.gameConfigs).forEach(gameType => {
            const config = this.gameConfigs[gameType];
            if (config.enabled) {
                // Add requiredPlayers to config for games that need it
                const gameConfig = { 
                    ...config, 
                    requiredPlayers: this.requiredPlayers 
                };
                
                this.gameInstances[gameType] = createGame(gameType, this.players, gameConfig);
            }
        });
    }

    /**
     * Reset all games to initial state
     */
    resetGames() {
        this.gameInstances = {};
        this.gameConfigs = {};
        this.players = [];
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT;
        this.gameStarted = false;
        this.gameCompleted = false;
    }

    /**
     * Restore game state from saved data
     * @param {Object} savedState - Saved game state
     */
    restoreGameState(savedState) {
        try {
            // Restore basic properties
            this.gameConfigs = savedState.gameConfigs || {};
            this.players = savedState.players || [];
            this.requiredPlayers = savedState.requiredPlayers || DEFAULTS.PLAYER_COUNT;
            this.gameStarted = savedState.gameStarted || false;
            this.gameCompleted = savedState.gameCompleted || false;

            // Reinitialize game instances with restored data
            if (this.gameStarted && Object.keys(this.gameConfigs).length > 0) {
                this.initializeGames(this.gameConfigs, this.players, this.requiredPlayers);
                
                // Restore actions to game instances if they exist in saved state
                if (savedState.gameActions) {
                    Object.entries(savedState.gameActions).forEach(([gameType, actions]) => {
                        if (this.gameInstances[gameType] && Array.isArray(actions)) {
                            this.gameInstances[gameType].actions = [...actions];
                        }
                    });
                }
            }
        } catch (error) {
            ErrorHandler.handleGameError(error, 'GameManager', 'restoreGameState');
        }
    }

    /**
     * Complete the game and lock it
     */
    completeGame() {
        this.gameCompleted = true;
    }

    /**
     * Check if any games are enabled
     * @returns {boolean} True if at least one game is enabled
     */
    hasEnabledGames() {
        return Object.values(this.gameConfigs).some(config => config.enabled);
    }

    /**
     * Get list of enabled game types
     * @returns {Array} Array of enabled game type strings
     */
    getEnabledGameTypes() {
        return Object.keys(this.gameConfigs).filter(gameType => 
            this.gameConfigs[gameType]?.enabled
        );
    }

    // =========================================================================
    // GAME ACTION MANAGEMENT
    // =========================================================================

    /**
     * Add an action to a specific game
     * @param {string} gameType - Type of game
     * @param {Object} action - Action object
     * @returns {boolean} True if action was added successfully
     */
    addGameAction(gameType, action) {
        // Try to add to game instance if available
        if (this.gameInstances[gameType]) {
            try {
                const success = this.gameInstances[gameType].addAction(action);
                
                if (!success) {
                    ErrorHandler.handleGameError(new Error(`Failed to add action to game instance for ${gameType}`), gameType, 'addAction');
                }
                return success;
            } catch (error) {
                ErrorHandler.handleGameError(error, gameType, 'addAction');
                return false;
            }
        }
        
        return false;
    }

    /**
     * Remove an action from a specific game
     * @param {string} gameType - Type of game
     * @param {number} actionId - ID of action to remove
     * @returns {boolean} True if action was removed successfully
     */
    removeGameAction(gameType, actionId) {
        // Remove from game instance if available
        if (this.gameInstances[gameType]) {
            return this.gameInstances[gameType].removeAction(actionId);
        }
        
        return false;
    }

    /**
     * Get all actions for a specific game
     * @param {string} gameType - Type of game
     * @returns {Array} Array of actions
     */
    getGameActions(gameType) {
        if (this.gameInstances[gameType]) {
            return this.gameInstances[gameType].getActions();
        }
        return [];
    }

    /**
     * Get actions for a specific hole across all games
     * @param {number} hole - Hole number
     * @returns {Object} Actions by game type
     */
    getActionsForHole(hole) {
        const actions = {};
        
        Object.keys(this.gameInstances).forEach(gameType => {
            actions[gameType] = this.gameInstances[gameType].getActions().filter(
                action => action.hole === hole
            );
        });
        
        return actions;
    }

    // =========================================================================
    // GAME CALCULATIONS AND SUMMARIES
    // =========================================================================

    /**
     * Calculate summary for a specific game
     * @param {string} gameType - Type of game
     * @returns {Object} Player balances for the game
     */
    calculateGameSummary(gameType) {
        // Use game instance if available
        if (this.gameInstances[gameType]) {
            return this.gameInstances[gameType].calculateSummary();
        }

        // Return empty balances if no game instance
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        return playerBalances;
    }

    /**
     * Calculate combined summary across all enabled games
     * @returns {Object} Combined player balances
     */
    calculateCombinedSummary() {
        const gameSummaries = {};
        
        // Calculate summaries for enabled games
        Object.keys(this.gameConfigs).forEach(gameType => {
            if (this.gameConfigs[gameType]?.enabled) {
                gameSummaries[gameType] = this.calculateGameSummary(gameType);
            }
        });

        // Combine all game summaries
        const combinedSummary = {};
        this.players.forEach(player => {
            combinedSummary[player] = 0;
        });

        Object.values(gameSummaries).forEach(gameSummary => {
            Object.entries(gameSummary).forEach(([player, balance]) => {
                if (combinedSummary.hasOwnProperty(player)) {
                    combinedSummary[player] += balance;
                }
            });
        });

        return {
            combinedSummary,
            gameSummaries
        };
    }

    /**
     * Generate payment instructions based on combined balances
     * @returns {string} HTML string with payment instructions
     */
    generatePaymentInstructions() {
        const { combinedSummary } = this.calculateCombinedSummary();
        
        // Separate winners (positive) and losers (negative)
        const winners = [];
        const losers = [];
        
        Object.entries(combinedSummary).forEach(([player, balance]) => {
            if (balance > 0.01) { // Small threshold to handle floating point precision
                winners.push({ player, amount: balance });
            } else if (balance < -0.01) {
                losers.push({ player, amount: Math.abs(balance) });
            }
        });
        
        // Sort by amount for optimal matching
        winners.sort((a, b) => b.amount - a.amount);
        losers.sort((a, b) => b.amount - a.amount);
        
        if (winners.length === 0 && losers.length === 0) {
            return '<div class="payment-instructions"><h4>💰 Payment Instructions</h4><p style="text-align: center; color: #7f8c8d; font-style: italic;">No payments needed - everyone is even!</p></div>';
        }
        
        const payments = [];
        const winnersCopy = [...winners];
        const losersCopy = [...losers];
        
        // Greedy matching algorithm for optimal payment flow
        while (winnersCopy.length > 0 && losersCopy.length > 0) {
            const winner = winnersCopy[0];
            const loser = losersCopy[0];
            
            const paymentAmount = Math.min(winner.amount, loser.amount);
            
            payments.push({
                from: loser.player,
                to: winner.player,
                amount: paymentAmount
            });
            
            // Update remaining amounts
            winner.amount -= paymentAmount;
            loser.amount -= paymentAmount;
            
            // Remove if fully settled
            if (winner.amount < 0.01) {
                winnersCopy.shift();
            }
            if (loser.amount < 0.01) {
                losersCopy.shift();
            }
        }
        
        // Generate HTML for payment instructions
        let html = '<div class="payment-instructions"><h4>💰 Payment Instructions</h4>';
        
        if (payments.length === 0) {
            html += '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No payments needed - everyone is even!</p>';
        } else {
            html += '<div class="payment-list">';
            payments.forEach(payment => {
                html += `
                    <div class="payment-item">
                        <span class="payment-from">${payment.from}</span>
                        <span class="payment-arrow">→</span>
                        <span class="payment-to">${payment.to}</span>
                        <span class="payment-amount">$${payment.amount.toFixed(2)}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    // =========================================================================
    // GAME STATISTICS AND INFORMATION
    // =========================================================================

    /**
     * Get statistics for all games
     * @returns {Object} Game statistics
     */
    getGameStatistics() {
        const stats = {};
        
        Object.keys(this.gameConfigs).forEach(gameType => {
            if (this.gameConfigs[gameType]?.enabled) {
                if (this.gameInstances[gameType]) {
                    stats[gameType] = this.gameInstances[gameType].getStats();
                } else {
                    stats[gameType] = {
                        totalActions: 0,
                        betAmount: this.gameConfigs[gameType].betAmount,
                        enabled: true
                    };
                }
            } else {
                // Return stats for disabled games
                stats[gameType] = {
                    totalActions: 0,
                    betAmount: this.gameConfigs[gameType].betAmount,
                    enabled: false
                };
            }
        });
        
        return stats;
    }

    /**
     * Get current game state summary
     * @returns {Object} Game state information
     */
    getGameState() {
        return {
            gameStarted: this.gameStarted,
            gameCompleted: this.gameCompleted,
            players: [...this.players],
            requiredPlayers: this.requiredPlayers,
            enabledGames: this.getEnabledGameTypes(),
            totalActions: Object.values(this.gameInstances).reduce(
                (total, instance) => total + instance.getActions().length, 0
            ),
            gameConfigs: { ...this.gameConfigs }
        };
    }

    /**
     * Check if game is ready to be completed
     * @returns {boolean} True if game can be completed
     */
    canCompleteGame() {
        return this.gameStarted && !this.gameCompleted;
    }

    /**
     * Check if any game has actions
     * @returns {boolean} True if any game has recorded actions
     */
    hasAnyActions() {
        return Object.values(this.gameInstances).some(instance => instance.getActions().length > 0);
    }
}
