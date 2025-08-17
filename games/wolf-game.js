/**
 * Wolf Game Class
 * Handles Wolf game logic, calculations, and validation
 * Wolf is a 4-player team-based betting game where players rotate being the "Wolf"
 */

import { BaseGame } from './base-game.js';
import { GAME_TYPES, WOLF_CONFIG } from '../constants.js';

export class WolfGame extends BaseGame {
    constructor(players, config = {}) {
        super(GAME_TYPES.WOLF, players, {
            wolfRotation: WOLF_CONFIG.WOLF_ROTATION,
            holesPerWolf: WOLF_CONFIG.HOLES_PER_WOLF,
            ...config
        });
        this.requiredPlayers = 4; // Wolf game requires exactly 4 players
    }

    /**
     * Calculate player balances for Wolf game
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        const playerBalances = this.initializePlayerBalances();
        
        this.actions.forEach(action => {
            const betAmount = this.getBetAmount();
            
            if (action.result === WOLF_CONFIG.WOLF_WINS) {
                if (action.wolfChoice === WOLF_CONFIG.LONE_WOLF_VALUE) {
                    // Lone Wolf wins: gets 4 points, others lose 1 each
                    playerBalances[action.wolf] += betAmount * 4;
                    this.players.forEach(player => {
                        if (player !== action.wolf) {
                            playerBalances[player] -= betAmount;
                        }
                    });
                } else {
                    // Wolf + Partner win: each get 2 points, others lose 1 each
                    playerBalances[action.wolf] += betAmount * 2;
                    playerBalances[action.partner] += betAmount * 2;
                    this.players.forEach(player => {
                        if (player !== action.wolf && player !== action.partner) {
                            playerBalances[player] -= betAmount;
                        }
                    });
                }
            } else {
                // Partners win: each get 1 point, Wolf loses 3
                if (action.wolfChoice === WOLF_CONFIG.LONE_WOLF_VALUE) {
                    // Lone Wolf loses: others get 1 point each
                    playerBalances[action.wolf] -= betAmount * 3;
                    this.players.forEach(player => {
                        if (player !== action.wolf) {
                            playerBalances[player] += betAmount;
                        }
                    });
                } else {
                    // Wolf + Partner lose: others get 1 point each
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

    /**
     * Validate a Wolf action
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid
     */
    validateAction(action) {
        // Required fields
        if (!action.hole || !action.wolf || !action.wolfChoice || !action.result) {
            return false;
        }

        // Validate hole is valid
        if (action.hole < 1 || action.hole > 18) {
            return false;
        }

        // Validate wolf is a valid player
        if (!this.players.includes(action.wolf)) {
            return false;
        }

        // Validate wolf choice
        if (![WOLF_CONFIG.LONE_WOLF_VALUE, WOLF_CONFIG.PARTNER_VALUE].includes(action.wolfChoice)) {
            return false;
        }

        // Validate result
        if (![WOLF_CONFIG.WOLF_WINS, WOLF_CONFIG.PARTNERS_WIN].includes(action.result)) {
            return false;
        }

        // If partner choice, validate partner
        if (action.wolfChoice === WOLF_CONFIG.PARTNER_VALUE) {
            if (!action.partner || !this.players.includes(action.partner)) {
                return false;
            }
            if (action.partner === action.wolf) {
                return false; // Wolf can't pick themselves as partner
            }
        }

        // Validate that the wolf for this hole matches the rotation
        const expectedWolf = this.getWolfForHole(action.hole);
        if (action.wolf !== expectedWolf) {
            return false;
        }

        return true;
    }

    /**
     * Get which player should be the Wolf for a given hole
     * @param {number} hole - The hole number
     * @returns {string} Player name who should be Wolf
     */
    getWolfForHole(hole) {
        const wolfIndex = Math.floor((hole - 1) / this.config.holesPerWolf);
        const playerIndex = this.config.wolfRotation[wolfIndex] - 1;
        return this.players[playerIndex];
    }

    /**
     * Get the current Wolf for the given hole
     * @param {number} hole - The hole number
     * @returns {Object} Wolf information { player, startHole, endHole }
     */
    getCurrentWolf(hole) {
        const wolfIndex = Math.floor((hole - 1) / this.config.holesPerWolf);
        const playerIndex = this.config.wolfRotation[wolfIndex] - 1;
        const startHole = wolfIndex * this.config.holesPerWolf + 1;
        const endHole = Math.min(startHole + this.config.holesPerWolf - 1, 18);
        
        return {
            player: this.players[playerIndex],
            startHole,
            endHole,
            playerIndex: playerIndex + 1
        };
    }

    /**
     * Get available partner options for a given hole
     * @param {number} hole - The hole number
     * @returns {Array} Array of available partner names
     */
    getAvailablePartners(hole) {
        const currentWolf = this.getCurrentWolf(hole);
        return this.players.filter(player => player !== currentWolf.player);
    }

    /**
     * Check if a hole has already been played
     * @param {number} hole - The hole number
     * @returns {boolean} True if hole has actions
     */
    isHolePlayed(hole) {
        return this.getActionsForHole(hole).length > 0;
    }

    /**
     * Get Wolf-specific statistics
     * @returns {Object} Wolf game statistics
     */
    getStats() {
        const baseStats = super.getStats();
        const wolfWins = this.actions.filter(action => action.result === WOLF_CONFIG.WOLF_WINS).length;
        const partnerWins = this.actions.filter(action => action.result === WOLF_CONFIG.PARTNERS_WIN).length;
        const loneWolfActions = this.actions.filter(action => action.wolfChoice === WOLF_CONFIG.LONE_WOLF_VALUE).length;
        const partnerActions = this.actions.filter(action => action.wolfChoice === WOLF_CONFIG.PARTNER_VALUE).length;
        
        // Calculate wolf performance by player
        const wolfPerformance = {};
        this.players.forEach(player => {
            const playerWolfActions = this.actions.filter(action => action.wolf === player);
            const wins = playerWolfActions.filter(action => action.result === WOLF_CONFIG.WOLF_WINS).length;
            wolfPerformance[player] = {
                totalHoles: playerWolfActions.length,
                wins,
                losses: playerWolfActions.length - wins,
                winRate: playerWolfActions.length > 0 ? (wins / playerWolfActions.length * 100).toFixed(1) : 0
            };
        });
        
        return {
            ...baseStats,
            totalHoles: this.actions.length,
            wolfWins,
            partnerWins,
            loneWolfActions,
            partnerActions,
            wolfPerformance,
            requiredPlayers: this.requiredPlayers
        };
    }

    /**
     * Get the next hole where a player will be Wolf
     * @param {string} playerName - The player name
     * @returns {number|null} Next hole number or null if not found
     */
    getNextWolfHole(playerName) {
        const playerIndex = this.players.indexOf(playerName);
        if (playerIndex === -1) return null;
        
        const wolfIndex = this.config.wolfRotation.indexOf(playerIndex + 1);
        if (wolfIndex === -1) return null;
        
        const startHole = wolfIndex * this.config.holesPerWolf + 1;
        
        // Find the first hole in this wolf's rotation that hasn't been played
        for (let hole = startHole; hole < startHole + this.config.holesPerWolf && hole <= 18; hole++) {
            if (!this.isHolePlayed(hole)) {
                return hole;
            }
        }
        
        return null; // All holes for this wolf have been played
    }

    /**
     * Get wolf rotation schedule
     * @returns {Array} Array of wolf assignments by hole ranges
     */
    getWolfSchedule() {
        const schedule = [];
        for (let i = 0; i < this.config.wolfRotation.length; i++) {
            const startHole = i * this.config.holesPerWolf + 1;
            const endHole = Math.min(startHole + this.config.holesPerWolf - 1, 18);
            const playerIndex = this.config.wolfRotation[i] - 1;
            
            schedule.push({
                holes: `${startHole}-${endHole}`,
                player: this.players[playerIndex],
                playerIndex: this.config.wolfRotation[i]
            });
        }
        return schedule;
    }
}
