/**
 * Skins Game Class
 * Handles Skins game logic, calculations, and validation
 */

import { BaseGame } from './base-game.js';
import { GAME_TYPES, SKINS_CONFIG } from '../constants.js';

export class SkinsGame extends BaseGame {
    constructor(players, config = {}) {
        super(GAME_TYPES.SKINS, players, {
            carryoverCount: 1,
            teams: [],
            teamNames: [],
            ...config
        });
        this.requiredPlayers = config.requiredPlayers || 4;
    }

    /**
     * Calculate player balances for Skins game
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        const playerBalances = this.initializePlayerBalances();
        
        this.actions.forEach(skin => {
            if (skin.winner === SKINS_CONFIG.CARRYOVER_VALUE) {
                // No money changes hands on carryovers
                return;
            }
            
            const betAmount = this.getBetAmount();
            const skinsWon = skin.skinsWon || 1;
            
            if (this.requiredPlayers === 4 && this.config.teams && this.config.teams.length > 0) {
                // 4 players: Handle team-based skins
                this.handleTeamBasedSkin(playerBalances, skin, betAmount, skinsWon);
            } else {
                // 2-3 players: Handle individual player skins
                this.handleIndividualSkin(playerBalances, skin, betAmount, skinsWon);
            }
        });
        
        return playerBalances;
    }

    /**
     * Handle team-based skins calculation (4 players)
     * @param {Object} playerBalances - Player balances object
     * @param {Object} skin - Skin action
     * @param {number} betAmount - Bet amount per skin
     * @param {number} skinsWon - Number of skins won
     */
    handleTeamBasedSkin(playerBalances, skin, betAmount, skinsWon) {
        const team1Players = this.config.teams[0] || [];
        const team2Players = this.config.teams[1] || [];
        
        if (skin.winner === SKINS_CONFIG.TEAM_1_VALUE) {
            // Team 1 players get paid by Team 2 players
            team1Players.forEach(player => {
                playerBalances[player] += betAmount * skinsWon;
            });
            
            team2Players.forEach(player => {
                playerBalances[player] -= betAmount * skinsWon;
            });
        } else if (skin.winner === SKINS_CONFIG.TEAM_2_VALUE) {
            // Team 2 players get paid by Team 1 players
            team1Players.forEach(player => {
                playerBalances[player] -= betAmount * skinsWon;
            });
            
            team2Players.forEach(player => {
                playerBalances[player] += betAmount * skinsWon;
            });
        }
    }

    /**
     * Handle individual player skins calculation (2-3 players)
     * @param {Object} playerBalances - Player balances object
     * @param {Object} skin - Skin action
     * @param {number} betAmount - Bet amount per skin
     * @param {number} skinsWon - Number of skins won
     */
    handleIndividualSkin(playerBalances, skin, betAmount, skinsWon) {
        const winner = skin.winner;
        
        // Winner gets paid by all other players
        this.players.forEach(player => {
            if (player === winner) {
                playerBalances[player] += betAmount * skinsWon * (this.players.length - 1);
            } else {
                playerBalances[player] -= betAmount * skinsWon;
            }
        });
    }

    /**
     * Validate a Skins action
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid
     */
    validateAction(action) {
        // Required fields
        if (!action.winner || !action.hole) {
            return false;
        }

        // Validate hole is valid
        if (action.hole < 1 || action.hole > 18) {
            return false;
        }

        // Validate winner
        if (action.winner === SKINS_CONFIG.CARRYOVER_VALUE) {
            return true; // Carryover is always valid
        }

        // For team-based play (4 players)
        if (this.requiredPlayers === 4 && this.config.teams && this.config.teams.length > 0) {
            return [SKINS_CONFIG.TEAM_1_VALUE, SKINS_CONFIG.TEAM_2_VALUE].includes(action.winner);
        } else {
            // For individual play (2-3 players)
            return this.players.includes(action.winner);
        }
    }

    /**
     * Add a skins action and update carryover count
     * @param {Object} action - The action to add
     * @returns {boolean} True if added successfully
     */
    addAction(action) {
        if (!this.validateAction(action)) {
            return false;
        }

        // Set carryover count for this action
        action.carryoverCount = this.config.carryoverCount;
        action.skinsWon = action.winner === SKINS_CONFIG.CARRYOVER_VALUE ? 0 : this.config.carryoverCount;

        // Update carryover count based on result
        if (action.winner === SKINS_CONFIG.CARRYOVER_VALUE) {
            this.config.carryoverCount += 1;
        } else {
            // Reset carryover count when someone wins
            this.config.carryoverCount = 1;
        }

        return super.addAction(action);
    }

    /**
     * Get current carryover count
     * @returns {number} Current carryover count
     */
    getCarryoverCount() {
        return this.config.carryoverCount;
    }

    /**
     * Set team configuration
     * @param {Array} teams - Array of team arrays [[team1players], [team2players]]
     * @param {Array} teamNames - Array of team names
     */
    setTeams(teams, teamNames = []) {
        this.config.teams = teams;
        this.config.teamNames = teamNames;
    }

    /**
     * Get team configuration
     * @returns {Object} Team configuration
     */
    getTeams() {
        return {
            teams: this.config.teams,
            teamNames: this.config.teamNames
        };
    }

    /**
     * Get Skins-specific statistics
     * @returns {Object} Skins game statistics
     */
    getStats() {
        const baseStats = super.getStats();
        const carryovers = this.actions.filter(action => action.winner === SKINS_CONFIG.CARRYOVER_VALUE).length;
        const actualWins = this.actions.length - carryovers;
        
        return {
            ...baseStats,
            carryovers,
            actualWins,
            currentCarryover: this.config.carryoverCount,
            isTeamBased: this.requiredPlayers === 4 && this.config.teams.length > 0
        };
    }
}
