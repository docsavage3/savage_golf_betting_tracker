/**
 * KP (Closest to the Pin) Game Class
 * Handles KP game logic, calculations, and validation
 */

import { BaseGame } from './base-game.js';
import { GAME_TYPES } from '../constants.js';

export class KPGame extends BaseGame {
    constructor(players, config = {}) {
        super(GAME_TYPES.KP, players, config);
    }

    /**
     * Calculate player balances for KP game
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        const playerBalances = this.initializePlayerBalances();
        
        this.actions.forEach(kp => {
            const betAmount = this.getBetAmount();
            const numOtherPlayers = this.players.length - 1;
            
            // KP winner gets paid by all other players
            this.players.forEach(player => {
                if (player !== kp.winner) {
                    playerBalances[player] -= betAmount;
                }
            });
            playerBalances[kp.winner] += numOtherPlayers * betAmount;
        });
        
        return playerBalances;
    }

    /**
     * Validate a KP action
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid
     */
    validateAction(action) {
        // Required fields
        if (!action.winner || !action.hole) {
            return false;
        }

        // Validate player exists
        if (!this.players.includes(action.winner)) {
            return false;
        }

        // Validate hole is valid
        if (action.hole < 1 || action.hole > 18) {
            return false;
        }

        return true;
    }

    /**
     * Get KP-specific statistics
     * @returns {Object} KP game statistics
     */
    getStats() {
        const baseStats = super.getStats();
        
        // Count wins per player
        const playerWins = {};
        this.players.forEach(player => {
            playerWins[player] = this.actions.filter(action => action.winner === player).length;
        });
        
        return {
            ...baseStats,
            playerWins,
            totalKPs: this.actions.length
        };
    }

    /**
     * Get actions won by a specific player
     * @param {string} playerName - The player name
     * @returns {Array} Array of KP actions won by the player
     */
    getPlayerWins(playerName) {
        return this.actions.filter(action => action.winner === playerName);
    }

    /**
     * Get KP actions for Par 3 holes (typical KP holes)
     * Note: This assumes Par 3 holes are holes 3, 7, 12, 16 but can be customized
     * @param {Array} par3Holes - Array of hole numbers that are Par 3 (optional)
     * @returns {Array} Array of KP actions on Par 3 holes
     */
    getPar3KPs(par3Holes = [3, 7, 12, 16]) {
        return this.actions.filter(action => par3Holes.includes(action.hole));
    }

    /**
     * Check if a hole already has a KP recorded
     * @param {number} hole - The hole number
     * @returns {boolean} True if hole already has a KP
     */
    hasKPForHole(hole) {
        return this.actions.some(action => action.hole === hole);
    }

    /**
     * Get the KP winner for a specific hole
     * @param {number} hole - The hole number
     * @returns {string|null} Winner name or null if no KP for this hole
     */
    getKPWinnerForHole(hole) {
        const kpAction = this.actions.find(action => action.hole === hole);
        return kpAction ? kpAction.winner : null;
    }
}
