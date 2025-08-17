/**
 * Base Game class - Abstract base for all golf betting games
 * Provides common structure and interface for game implementations
 */

import { GAME_TYPES, DEFAULTS } from '../constants.js';

export class BaseGame {
    constructor(gameType, players, config = {}) {
        this.gameType = gameType;
        this.players = players || [];
        this.config = {
            enabled: false,
            betAmount: DEFAULTS.BET_AMOUNT,
            ...config
        };
        this.actions = [];
    }

    /**
     * Abstract method: Calculate player balances based on game actions
     * Must be implemented by subclasses
     * @returns {Object} Player balances { playerName: balance }
     */
    calculateSummary() {
        throw new Error('calculateSummary() must be implemented by subclass');
    }

    /**
     * Abstract method: Validate a game action before saving
     * Must be implemented by subclasses
     * @param {Object} action - The action to validate
     * @returns {boolean} True if valid, false otherwise
     */
    validateAction(action) {
        throw new Error('validateAction() must be implemented by subclass');
    }

    /**
     * Add an action to this game
     * @param {Object} action - The action to add
     * @returns {boolean} True if added successfully
     */
    addAction(action) {
        if (!this.validateAction(action)) {
            return false;
        }

        action.id = action.id || Date.now();
        action.timestamp = action.timestamp || new Date();
        this.actions.push(action);
        return true;
    }

    /**
     * Remove an action by ID
     * @param {number} actionId - The ID of the action to remove
     * @returns {boolean} True if removed successfully
     */
    removeAction(actionId) {
        const initialLength = this.actions.length;
        this.actions = this.actions.filter(action => action.id !== actionId);
        return this.actions.length < initialLength;
    }

    /**
     * Get all actions for this game
     * @returns {Array} Array of game actions
     */
    getActions() {
        return [...this.actions];
    }

    /**
     * Get actions for a specific hole
     * @param {number} hole - The hole number
     * @returns {Array} Array of actions for the hole
     */
    getActionsForHole(hole) {
        return this.actions.filter(action => action.hole === hole);
    }

    /**
     * Clear all actions
     */
    clearActions() {
        this.actions = [];
    }

    /**
     * Get game configuration
     * @returns {Object} Game configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update game configuration
     * @param {Object} newConfig - New configuration values
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Initialize player balances object
     * @returns {Object} Player balances initialized to 0
     */
    initializePlayerBalances() {
        const balances = {};
        this.players.forEach(player => {
            balances[player] = 0;
        });
        return balances;
    }

    /**
     * Check if the game is enabled
     * @returns {boolean} True if enabled
     */
    isEnabled() {
        return this.config.enabled;
    }

    /**
     * Get the bet amount for this game
     * @returns {number} The bet amount
     */
    getBetAmount() {
        return this.config.betAmount;
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getStats() {
        return {
            totalActions: this.actions.length,
            betAmount: this.getBetAmount(),
            enabled: this.isEnabled()
        };
    }
}
