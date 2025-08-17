/**
 * Murph Game Class
 * Handles Murph game logic, calculations, and validation
 */

import { BaseGame } from './base-game.js';
import { GAME_TYPES } from '../constants.js';

export class MurphGame extends BaseGame {
    constructor(players, config = {}) {
        super(GAME_TYPES.MURPH, players, config);
    }

    /**
     * Calculate player balances for Murph game
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        const playerBalances = this.initializePlayerBalances();
        
        this.actions.forEach(call => {
            const betAmount = this.getBetAmount();
            const numOtherPlayers = this.players.length - 1;
            
            // Handle both 'success'/'fail' and 'made'/'failed' result formats
            const isSuccess = call.result === 'success' || call.result === 'made';
            
            if (isSuccess) {
                // Caller gets paid by all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] -= betAmount;
                    }
                });
                playerBalances[call.player] += numOtherPlayers * betAmount;
            } else {
                // Caller pays all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] += betAmount;
                    }
                });
                playerBalances[call.player] -= numOtherPlayers * betAmount;
            }
        });
        
        return playerBalances;
    }

    /**
     * Validate a Murph action
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid
     */
    validateAction(action) {
        console.log(`MurphGame validateAction called with:`, action);
        console.log(`MurphGame players:`, this.players);
        console.log(`MurphGame config:`, this.config);
        
        // Required fields
        if (!action.player || !action.hole || !action.result) {
            console.log(`Validation failed: Missing required fields - player: ${action.player}, hole: ${action.hole}, result: ${action.result}`);
            return false;
        }

        // Validate player exists
        if (!this.players.includes(action.player)) {
            console.log(`Validation failed: Player ${action.player} not found in players list:`, this.players);
            return false;
        }

        // Validate hole is valid
        if (action.hole < 1 || action.hole > 18) {
            console.log(`Validation failed: Invalid hole number ${action.hole}`);
            return false;
        }

        // Validate result
        if (!['success', 'fail', 'made', 'failed'].includes(action.result)) {
            console.log(`Validation failed: Invalid result ${action.result}`);
            return false;
        }

        console.log(`MurphGame validation passed for action:`, action);
        return true;
    }

    /**
     * Get Murph-specific statistics
     * @returns {Object} Murph game statistics
     */
    getStats() {
        const baseStats = super.getStats();
        const successfulCalls = this.actions.filter(action => action.result === 'success' || action.result === 'made').length;
        const failedCalls = this.actions.filter(action => action.result === 'fail' || action.result === 'failed').length;
        
        return {
            ...baseStats,
            successfulCalls,
            failedCalls,
            successRate: this.actions.length > 0 ? (successfulCalls / this.actions.length * 100).toFixed(1) : 0
        };
    }

    /**
     * Get actions by player
     * @param {string} playerName - The player name
     * @returns {Array} Array of actions for the player
     */
    getPlayerActions(playerName) {
        return this.actions.filter(action => action.player === playerName);
    }

    /**
     * Get success rate for a specific player
     * @param {string} playerName - The player name
     * @returns {number} Success rate as percentage
     */
    getPlayerSuccessRate(playerName) {
        const playerActions = this.getPlayerActions(playerName);
        if (playerActions.length === 0) return 0;
        
        const successes = playerActions.filter(action => action.result === 'success' || action.result === 'made').length;
        return (successes / playerActions.length * 100);
    }
}
