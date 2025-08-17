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

export class GameManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.players = [];
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT;
        this.gameConfigs = {};
        this.gameInstances = {};
        
        // Legacy game actions for backwards compatibility
        this.gameActions = {
            [GAME_TYPES.MURPH]: [],
            [GAME_TYPES.SKINS]: [],
            [GAME_TYPES.KP]: [],
            [GAME_TYPES.SNAKE]: [],
            [GAME_TYPES.WOLF]: []
        };
        
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
                
                // Clear legacy actions for fresh start
        
                this.gameActions[gameType] = [];
            }
        });
    }

    /**
     * Reset all games to initial state
     */
    resetGames() {
        this.gameInstances = {};
        this.gameActions = {
            [GAME_TYPES.MURPH]: [],
            [GAME_TYPES.SKINS]: [],
            [GAME_TYPES.KP]: [],
            [GAME_TYPES.SNAKE]: [],
            [GAME_TYPES.WOLF]: []
        };
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

            // Restore legacy game actions for backwards compatibility
            this.gameActions = savedState.gameActions || {
                [GAME_TYPES.MURPH]: [],
                [GAME_TYPES.SKINS]: [],
                [GAME_TYPES.KP]: [],
                [GAME_TYPES.SNAKE]: [],
                [GAME_TYPES.WOLF]: []
            };

            // Reinitialize game instances with restored data
            if (this.gameStarted && Object.keys(this.gameConfigs).length > 0) {
                // Store the actions before initialization (they get cleared during init)
                const actionsToRestore = { ...this.gameActions };
                
                this.initializeGames(this.gameConfigs, this.players, this.requiredPlayers);
                
                // Restore actions to game instances
                Object.entries(actionsToRestore).forEach(([gameType, actions]) => {
                    if (this.gameInstances[gameType] && Array.isArray(actions)) {
                
                        this.gameInstances[gameType].actions = [...actions];
                        // Also restore to legacy actions for backwards compatibility
                        this.gameActions[gameType] = [...actions];
                    }
                });
            }

    
        } catch (error) {
            console.error('Failed to restore game manager state:', error);
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
        // Always add to legacy system for backwards compatibility
        if (!this.gameActions[gameType]) {
            this.gameActions[gameType] = [];
        }
        
        // Add to legacy actions first
        this.gameActions[gameType].push(action);
        
        // Try to add to game instance if available
        if (this.gameInstances[gameType]) {
            try {
                console.log(`Attempting to add action to ${gameType} game instance:`, action);
                console.log(`Game instance players:`, this.gameInstances[gameType].players);
                console.log(`Game instance config:`, this.gameInstances[gameType].config);
                
                const success = this.gameInstances[gameType].addAction(action);
                if (!success) {
                    console.warn(`Failed to add action to game instance for ${gameType}`);
                    console.log(`Action validation failed. Action:`, action);
                } else {
                    console.log(`Successfully added action to ${gameType} game instance`);
                }
            } catch (error) {
                console.warn(`Error adding action to game instance for ${gameType}:`, error);
            }
        } else {
            console.warn(`Game instance not found for ${gameType}, using legacy system only`);
        }
        
        return true;
    }

    /**
     * Remove an action from a specific game
     * @param {string} gameType - Type of game
     * @param {number} actionId - ID of action to remove
     * @returns {boolean} True if action was removed successfully
     */
    removeGameAction(gameType, actionId) {
        let success = false;

        // Remove from game instance if available
        if (this.gameInstances[gameType]) {
            success = this.gameInstances[gameType].removeAction(actionId);
        }

        // Remove from legacy actions
        const initialLength = this.gameActions[gameType].length;
        this.gameActions[gameType] = this.gameActions[gameType].filter(
            action => action.id !== actionId
        );
        
        return success || this.gameActions[gameType].length < initialLength;
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
        return this.gameActions[gameType] || [];
    }

    /**
     * Get actions for a specific hole across all games
     * @param {number} hole - Hole number
     * @returns {Object} Actions by game type
     */
    getActionsForHole(hole) {
        const actions = {};
        
        Object.keys(this.gameActions).forEach(gameType => {
            actions[gameType] = this.gameActions[gameType].filter(
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
        // Use new game instance if available, fallback to legacy method
        if (this.gameInstances[gameType]) {
            return this.gameInstances[gameType].calculateSummary();
        }

        // Legacy calculation methods
        switch (gameType) {
            case GAME_TYPES.MURPH:
                return this.calculateLegacyMurphSummary();
            case GAME_TYPES.SKINS:
                return this.calculateLegacySkinsSummary();
            case GAME_TYPES.KP:
                return this.calculateLegacyKPSummary();
            case GAME_TYPES.SNAKE:
                return this.calculateLegacySnakeSummary();
            case GAME_TYPES.WOLF:
                return this.calculateLegacyWolfSummary();
            default:
                return {};
        }
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
    // LEGACY CALCULATION METHODS (for backwards compatibility)
    // =========================================================================

    /**
     * Legacy Murph calculation method
     * @returns {Object} Player balances
     */
    calculateLegacyMurphSummary() {
        console.log('calculateLegacyMurphSummary called');
        console.log('Players:', this.players);
        console.log('Murph config:', this.gameConfigs.murph);
        console.log('Murph actions:', this.gameActions.murph);
        
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.murph.forEach(call => {
            console.log('Processing Murph call:', call);
            // Handle both 'success'/'fail' and 'made'/'failed' result formats
            const isSuccess = call.result === 'success' || call.result === 'made';
            console.log(`Call result: ${call.result}, isSuccess: ${isSuccess}`);
            
            if (isSuccess) {
                // Caller gets paid by all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] -= this.gameConfigs.murph.betAmount;
                        console.log(`${player} pays ${this.gameConfigs.murph.betAmount}`);
                    }
                });
                playerBalances[call.player] += (this.players.length - 1) * this.gameConfigs.murph.betAmount;
                console.log(`${call.player} receives ${(this.players.length - 1) * this.gameConfigs.murph.betAmount}`);
            } else {
                // Caller pays all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] += this.gameConfigs.murph.betAmount;
                        console.log(`${player} receives ${this.gameConfigs.murph.betAmount}`);
                    }
                });
                playerBalances[call.player] -= (this.players.length - 1) * this.gameConfigs.murph.betAmount;
                console.log(`${call.player} pays ${(this.players.length - 1) * this.gameConfigs.murph.betAmount}`);
            }
        });
        
        console.log('Final player balances:', playerBalances);
        return playerBalances;
    }

    /**
     * Legacy Skins calculation method
     * @returns {Object} Player balances
     */
    calculateLegacySkinsSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.skins.forEach(skin => {
            if (skin.winner === 'carryover') {
                return;
            }
            
            const betAmount = this.gameConfigs.skins.betAmount;
            const skinsWon = skin.skinsWon;
            
            if (this.requiredPlayers === 4 && this.gameConfigs.skins.teams && this.gameConfigs.skins.teams.length > 0) {
                // Team-based logic
                if (skin.winner === 'team1') {
                    const team1Players = this.gameConfigs.skins.teams[0];
                    const team2Players = this.gameConfigs.skins.teams[1];
                    
                    team1Players.forEach(player => {
                        playerBalances[player] += betAmount * skinsWon;
                    });
                    
                    team2Players.forEach(player => {
                        playerBalances[player] -= betAmount * skinsWon;
                    });
                } else if (skin.winner === 'team2') {
                    const team1Players = this.gameConfigs.skins.teams[0];
                    const team2Players = this.gameConfigs.skins.teams[1];
                    
                    team1Players.forEach(player => {
                        playerBalances[player] -= betAmount * skinsWon;
                    });
                    
                    team2Players.forEach(player => {
                        playerBalances[player] += betAmount * skinsWon;
                    });
                }
            } else {
                // Individual player logic
                const winner = skin.winner;
                this.players.forEach(player => {
                    if (player === winner) {
                        playerBalances[player] += betAmount * skinsWon * (this.players.length - 1);
                    } else {
                        playerBalances[player] -= betAmount * skinsWon;
                    }
                });
            }
        });
        
        return playerBalances;
    }

    /**
     * Legacy KP calculation method
     * @returns {Object} Player balances
     */
    calculateLegacyKPSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.kp.forEach(kp => {
            const betAmount = this.gameConfigs.kp.betAmount;
            
            this.players.forEach(player => {
                if (player !== kp.winner) {
                    playerBalances[player] -= betAmount;
                }
            });
            playerBalances[kp.winner] += (this.players.length - 1) * betAmount;
        });
        
        return playerBalances;
    }

    /**
     * Legacy Snake calculation method
     * @returns {Object} Player balances
     */
    calculateLegacySnakeSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        if (this.gameActions.snake.length === 0) {
            return playerBalances;
        }
        
        const betAmount = this.gameConfigs.snake.betAmount;
        const totalSnakes = this.gameActions.snake.length;
        const snakePot = totalSnakes * betAmount;
        
        if (totalSnakes === 1) {
            const singleSnake = this.gameActions.snake[0];
            playerBalances[singleSnake.player] -= snakePot;
            
            const paymentPerPlayer = snakePot / (this.players.length - 1);
            
            this.players.forEach(player => {
                if (player !== singleSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        } else {
            const lastSnake = this.gameActions.snake[this.gameActions.snake.length - 1];
            playerBalances[lastSnake.player] -= snakePot;
            
            const paymentPerPlayer = snakePot / (this.players.length - 1);
            
            this.players.forEach(player => {
                if (player !== lastSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        }
        
        return playerBalances;
    }

    /**
     * Legacy Wolf calculation method
     * @returns {Object} Player balances
     */
    calculateLegacyWolfSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        if (this.gameActions.wolf.length === 0) {
            return playerBalances;
        }
        
        const betAmount = this.gameConfigs.wolf.betAmount;
        
        this.gameActions.wolf.forEach(action => {
            if (action.result === 'wolf_wins') {
                if (action.wolfChoice === 'lone_wolf') {
                    // Lone Wolf wins: gets 3x bet from each of the 3 other players
                    playerBalances[action.wolf] += betAmount * 3 * 3; // 9x total
                    this.players.forEach(player => {
                        if (player !== action.wolf) {
                            playerBalances[player] -= betAmount * 3; // Each pays 3x
                        }
                    });
                } else {
                    // Wolf + Partner win: each get 1x bet, others lose 1x bet each
                    playerBalances[action.wolf] += betAmount;
                    playerBalances[action.partner] += betAmount;
                    this.players.forEach(player => {
                        if (player !== action.wolf && player !== action.partner) {
                            playerBalances[player] -= betAmount;
                        }
                    });
                }
            } else {
                // Wolf loses: others get 1x bet each, Wolf loses 3x bet
                if (action.wolfChoice === 'lone_wolf') {
                    // Lone Wolf loses: pays 3x bet to each of the 3 other players
                    playerBalances[action.wolf] -= betAmount * 3 * 3; // 9x total
                    this.players.forEach(player => {
                        if (player !== action.wolf) {
                            playerBalances[player] += betAmount * 3; // Each gets 3x
                        }
                    });
                } else {
                    // Wolf + Partner lose: others get 1x bet each
                    playerBalances[action.wolf] -= betAmount * 3;
                    playerBalances[action.partner] -= betAmount * 3;
                    this.players.forEach(player => {
                        if (player !== action.wolf && player !== action.partner) {
                            playerBalances[player] += betAmount;
                        }
                    });
                }
            }
        });
        
        return playerBalances;
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
                        totalActions: this.gameActions[gameType].length,
                        betAmount: this.gameConfigs[gameType].betAmount,
                        enabled: true
                    };
                }
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
            totalActions: Object.values(this.gameActions).reduce(
                (total, actions) => total + actions.length, 0
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
        return Object.values(this.gameActions).some(actions => actions.length > 0);
    }
}
