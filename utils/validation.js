/**
 * Validation Manager Class
 * Centralizes all validation logic for the golf betting application
 * Handles game selection, bet amounts, input validation, and business rules
 */

import { 
    GAME_TYPES,
    VALIDATION_RULES,
    MESSAGES,
    DEFAULTS
} from '../constants.js';
import { SecurityUtils } from './security.js';

export class ValidationManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    // =========================================================================
    // GAME SETUP VALIDATION
    // =========================================================================

    /**
     * Validate complete game setup
     * @param {Object} playerManager - PlayerManager instance
     * @param {number} requiredPlayers - Number of required players
     * @returns {Object} Validation result with success flag and detailed messages
     */
    validateGameSetup(playerManager, requiredPlayers) {
        const results = {
            success: false,
            errors: [],
            gameSelection: false,
            playerValidation: false,
            betAmounts: false,
            teamValidation: false
        };

        // 1. Validate game selection
        const gameSelectionResult = this.validateGameSelection();
        results.gameSelection = gameSelectionResult.success;
        if (!gameSelectionResult.success) {
            results.errors.push(gameSelectionResult.message);
        }

        // 2. Validate players
        const playerValidation = playerManager.validatePlayers();
        results.playerValidation = playerValidation.success;
        if (!playerValidation.success) {
            results.errors.push(playerValidation.message);
        }

        // 3. Validate bet amounts for selected games
        const betValidationResult = this.validateSelectedGameBets();
        results.betAmounts = betValidationResult.success;
        if (!betValidationResult.success) {
            results.errors.push(...betValidationResult.errors);
        }

        // 4. Validate team selection if needed
        const selectedGames = this.getSelectedGames();
        if (selectedGames.skins && requiredPlayers === 4) {
            const teamValidation = playerManager.validateTeamSelection();
            results.teamValidation = teamValidation;
            if (!teamValidation) {
                results.errors.push('Please select 4 different players for the two teams.');
            }
        } else {
            results.teamValidation = true; // Not needed for 2-3 players
        }

        // Overall success
        results.success = results.gameSelection && 
                         results.playerValidation && 
                         results.betAmounts && 
                         results.teamValidation;

        return results;
    }

    /**
     * Validate that at least one game is selected
     * @returns {Object} Validation result
     */
    validateGameSelection() {
        const selectedGames = this.getSelectedGames();
        const hasSelection = Object.values(selectedGames).some(selected => selected);

        return {
            success: hasSelection,
            message: hasSelection ? 'Game selection valid' : MESSAGES.ERRORS.GAME_SELECTION_REQUIRED,
            selectedGames
        };
    }

    /**
     * Get which games are currently selected
     * @returns {Object} Object with game selection status
     */
    getSelectedGames() {
        return {
            murph: document.getElementById('gameMurph')?.checked || false,
            skins: document.getElementById('gameSkins')?.checked || false,
            kp: document.getElementById('gameKP')?.checked || false,
            snake: document.getElementById('gameSnake')?.checked || false,
            wolf: document.getElementById('gameWolf')?.checked || false
        };
    }

    // =========================================================================
    // BET AMOUNT VALIDATION
    // =========================================================================

    /**
     * Validate bet amounts for all selected games
     * @returns {Object} Validation result with detailed errors
     */
    validateSelectedGameBets() {
        const selectedGames = this.getSelectedGames();
        const results = {
            success: true,
            errors: []
        };

        // Check each selected game
        Object.entries(selectedGames).forEach(([gameType, isSelected]) => {
            if (isSelected) {
                const betValidation = this.validateGameBetAmount(gameType);
                if (!betValidation.success) {
                    results.success = false;
                    results.errors.push(betValidation.message);
                }
            }
        });

        return results;
    }

    /**
     * Validate bet amount for a specific game
     * @param {string} gameType - Type of game (murph, skins, kp, snake)
     * @returns {Object} Validation result
     */
    validateGameBetAmount(gameType) {
        const betInputId = `${gameType}Bet`;
        const betInput = document.getElementById(betInputId);
        
        if (!betInput) {
            return {
                success: false,
                message: `Bet input not found for ${gameType}`
            };
        }

        const betValue = parseFloat(betInput.value);
        const gameName = this.getGameDisplayName(gameType);

        // Check if value is a valid number
        if (isNaN(betValue)) {
            return {
                success: false,
                message: `Please enter a valid bet amount for ${gameName}.`
            };
        }

        // Check if value is within acceptable range
        if (betValue < VALIDATION_RULES.MIN_BET_AMOUNT) {
            return {
                success: false,
                message: `${gameName} bet amount must be at least $${VALIDATION_RULES.MIN_BET_AMOUNT.toFixed(2)}.`
            };
        }

        if (betValue > VALIDATION_RULES.MAX_BET_AMOUNT) {
            return {
                success: false,
                message: `${gameName} bet amount cannot exceed $${VALIDATION_RULES.MAX_BET_AMOUNT.toFixed(2)}.`
            };
        }

        return {
            success: true,
            message: `${gameName} bet amount is valid`,
            amount: betValue
        };
    }

    /**
     * Get display name for a game type
     * @param {string} gameType - Game type key
     * @returns {string} Display name
     */
    getGameDisplayName(gameType) {
        const displayNames = {
            murph: 'Murph',
            skins: 'Skins',
            kp: 'KP',
            snake: 'Snake',
            wolf: 'Wolf'
        };
        return displayNames[gameType] || gameType;
    }

    // =========================================================================
    // MODAL INPUT VALIDATION
    // =========================================================================

    /**
     * Validate Murph modal inputs
     * @param {string} player - Selected player
     * @param {number} hole - Hole number
     * @param {string} result - Result (success/failure)
     * @returns {Object} Validation result
     */
    validateMurphInput(player, hole, result) {
        const errors = [];

        if (!player || player.trim().length === 0) {
            errors.push('Please select a player.');
        }

        if (!hole || isNaN(hole) || hole < 1 || hole > 18) {
            errors.push('Please enter a valid hole number (1-18).');
        }

        if (!result || !['success', 'fail'].includes(result)) {
            errors.push('Please select a result (success or fail).');
        }

        return {
            success: errors.length === 0,
            errors,
            message: errors.length === 0 ? 'Murph input is valid' : errors.join(' ')
        };
    }

    /**
     * Validate Skins modal inputs
     * @param {string} winner - Winner selection
     * @param {number} hole - Hole number
     * @returns {Object} Validation result
     */
    validateSkinsInput(winner, hole) {
        const errors = [];

        if (!winner || winner.trim().length === 0) {
            errors.push('Please select a winner or carryover.');
        }

        if (!hole || isNaN(hole) || hole < 1 || hole > 18) {
            errors.push('Please enter a valid hole number (1-18).');
        }

        return {
            success: errors.length === 0,
            errors,
            message: errors.length === 0 ? 'Skins input is valid' : errors.join(' ')
        };
    }

    /**
     * Validate KP modal inputs
     * @param {string} winner - KP winner
     * @param {number} hole - Hole number
     * @returns {Object} Validation result
     */
    validateKPInput(winner, hole) {
        const errors = [];

        if (!winner || winner.trim().length === 0) {
            errors.push('Please select a KP winner.');
        }

        if (!hole || isNaN(hole) || hole < 1 || hole > 18) {
            errors.push('Please enter a valid hole number (1-18).');
        }

        return {
            success: errors.length === 0,
            errors,
            message: errors.length === 0 ? 'KP input is valid' : errors.join(' ')
        };
    }

    /**
     * Validate Snake modal inputs
     * @param {string} player - Snake player
     * @param {number} hole - Hole number
     * @returns {Object} Validation result
     */
    validateSnakeInput(player, hole) {
        const errors = [];

        if (!player || player.trim().length === 0) {
            errors.push('Please select a player.');
        }

        if (!hole || isNaN(hole) || hole < 1 || hole > 18) {
            errors.push('Please enter a valid hole number (1-18).');
        }

        return {
            success: errors.length === 0,
            errors,
            message: errors.length === 0 ? 'Snake input is valid' : errors.join(' ')
        };
    }

    // =========================================================================
    // GENERAL INPUT VALIDATION
    // =========================================================================

    /**
     * Validate that all required fields are filled
     * @param {Object} fields - Object with field names and values
     * @returns {Object} Validation result
     */
    validateRequiredFields(fields) {
        const errors = [];
        
        Object.entries(fields).forEach(([fieldName, value]) => {
            if (!this.isFieldValid(value)) {
                errors.push(`${fieldName} is required.`);
            }
        });

        return {
            success: errors.length === 0,
            errors,
            message: errors.length === 0 ? 'All required fields are valid' : errors.join(' ')
        };
    }

    /**
     * Check if a field value is valid (not empty, null, or undefined)
     * @param {any} value - Value to check
     * @returns {boolean} True if valid
     */
    isFieldValid(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !isNaN(value);
        return Boolean(value);
    }

    /**
     * Validate numeric input within range
     * @param {number} value - Numeric value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} fieldName - Name of the field for error messages
     * @returns {Object} Validation result
     */
    validateNumericRange(value, min, max, fieldName = 'Value') {
        if (isNaN(value)) {
            return {
                success: false,
                message: `${fieldName} must be a valid number.`
            };
        }

        if (value < min) {
            return {
                success: false,
                message: `${fieldName} must be at least ${min}.`
            };
        }

        if (value > max) {
            return {
                success: false,
                message: `${fieldName} cannot exceed ${max}.`
            };
        }

        return {
            success: true,
            message: `${fieldName} is valid.`,
            value
        };
    }

    // =========================================================================
    // BUSINESS RULE VALIDATION
    // =========================================================================

    /**
     * Validate hole number
     * @param {number} hole - Hole number
     * @returns {Object} Validation result
     */
    validateHole(hole) {
        return this.validateNumericRange(hole, 1, 18, 'Hole number');
    }

    /**
     * Validate that a player exists in the player list
     * @param {string} player - Player name
     * @param {Array} playerList - List of valid players
     * @returns {Object} Validation result
     */
    validatePlayerExists(player, playerList) {
        if (!player || player.trim().length === 0) {
            return {
                success: false,
                message: 'Player name is required.'
            };
        }

        if (!playerList.includes(player)) {
            return {
                success: false,
                message: `Player "${player}" is not in the game.`
            };
        }

        return {
            success: true,
            message: 'Player is valid.'
        };
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Show validation error using UI manager
     * @param {string|Array} errors - Error message(s)
     */
    showValidationError(errors) {
        const message = Array.isArray(errors) ? errors.join(' ') : errors;
        this.ui.showNotification(message, 'error');
    }

    /**
     * Show validation success using UI manager
     * @param {string} message - Success message
     */
    showValidationSuccess(message) {
        this.ui.showNotification(message, 'success');
    }

    /**
     * Get comprehensive validation summary
     * @param {Object} playerManager - PlayerManager instance
     * @param {number} requiredPlayers - Number of required players
     * @returns {Object} Comprehensive validation summary
     */
    getValidationSummary(playerManager, requiredPlayers) {
        const gameSetup = this.validateGameSetup(playerManager, requiredPlayers);
        const selectedGames = this.getSelectedGames();
        const betAmounts = this.validateSelectedGameBets();

        return {
            overall: gameSetup.success,
            gameSelection: gameSetup.gameSelection,
            playerValidation: gameSetup.playerValidation,
            betAmounts: gameSetup.betAmounts,
            teamValidation: gameSetup.teamValidation,
            selectedGames,
            errors: gameSetup.errors,
            details: {
                gameSetup,
                betAmounts
            }
        };
    }
}
