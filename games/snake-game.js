/**
 * Snake Game Class
 * Handles Snake game logic, calculations, and validation
 */

import { BaseGame } from './base-game.js';
import { GAME_TYPES } from '../constants.js';

export class SnakeGame extends BaseGame {
    constructor(players, config = {}) {
        super(GAME_TYPES.SNAKE, players, config);
    }

    /**
     * Calculate player balances for Snake game
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        const playerBalances = this.initializePlayerBalances();
        
        if (this.actions.length === 0) {
            return playerBalances;
        }
        
        const betAmount = this.getBetAmount();
        const totalSnakes = this.actions.length;
        const snakePot = totalSnakes * betAmount;
        
        // Each snake increases the pot (no individual penalties)
        // The last snake player owes the entire accumulated pot to the other 3 players
        
        if (totalSnakes === 1) {
            // Special case: Only 1 snake - that player owes the pot to the other players
            const singleSnake = this.actions[0];
            playerBalances[singleSnake.player] -= snakePot;
            
            // The other players each get paid the pot amount divided by (num players - 1)
            const numOtherPlayers = this.players.length - 1;
            const paymentPerPlayer = snakePot / numOtherPlayers;
            
            this.players.forEach(player => {
                if (player !== singleSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        } else {
            // Multiple snakes: Each increases pot, last snake owes entire pot
            // Each snake player does NOT pay individually - they just increase the pot
            
            // The last player to get a snake owes the entire pot to the other players
            const lastSnake = this.actions[this.actions.length - 1];
            playerBalances[lastSnake.player] -= snakePot;
            
            // The other players each get paid the pot amount divided by (num players - 1)
            const numOtherPlayers = this.players.length - 1;
            const paymentPerPlayer = snakePot / numOtherPlayers;
            
            this.players.forEach(player => {
                if (player !== lastSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        }
        
        return playerBalances;
    }

    /**
     * Validate a Snake action
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid
     */
    validateAction(action) {
        // Required fields
        if (!action.player || !action.hole) {
            return false;
        }

        // Validate player exists
        if (!this.players.includes(action.player)) {
            return false;
        }

        // Validate hole is valid
        if (action.hole < 1 || action.hole > 18) {
            return false;
        }

        return true;
    }

    /**
     * Get Snake-specific statistics
     * @returns {Object} Snake game statistics
     */
    getStats() {
        const baseStats = super.getStats();
        
        // Count snakes per player
        const playerSnakes = {};
        this.players.forEach(player => {
            playerSnakes[player] = this.actions.filter(action => action.player === player).length;
        });
        
        const totalSnakes = this.actions.length;
        const snakePot = totalSnakes * this.getBetAmount();
        const lastSnakePlayer = totalSnakes > 0 ? this.actions[totalSnakes - 1].player : null;
        
        return {
            ...baseStats,
            playerSnakes,
            totalSnakes,
            snakePot,
            lastSnakePlayer
        };
    }

    /**
     * Get actions by player
     * @param {string} playerName - The player name
     * @returns {Array} Array of snake actions for the player
     */
    getPlayerSnakes(playerName) {
        return this.actions.filter(action => action.player === playerName);
    }

    /**
     * Get the current snake pot value
     * @returns {number} Current snake pot value
     */
    getCurrentPot() {
        return this.actions.length * this.getBetAmount();
    }

    /**
     * Get the last snake player
     * @returns {string|null} Last snake player name or null if no snakes
     */
    getLastSnakePlayer() {
        if (this.actions.length === 0) return null;
        return this.actions[this.actions.length - 1].player;
    }

    /**
     * Check if a player is currently the last snake
     * @param {string} playerName - The player name
     * @returns {boolean} True if player is the last snake
     */
    isLastSnake(playerName) {
        return this.getLastSnakePlayer() === playerName;
    }

    /**
     * Get snakes for a specific hole
     * @param {number} hole - The hole number
     * @returns {Array} Array of snake actions for the hole
     */
    getSnakesForHole(hole) {
        return this.actions.filter(action => action.hole === hole);
    }

    /**
     * Get snake count by hole
     * @returns {Object} Snake count per hole { hole: count }
     */
    getSnakesByHole() {
        const snakesByHole = {};
        for (let hole = 1; hole <= 18; hole++) {
            snakesByHole[hole] = this.getSnakesForHole(hole).length;
        }
        return snakesByHole;
    }
}
