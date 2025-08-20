/**
 * Player Manager Class
 * Handles all player-related operations including validation, team management, and configuration
 * Separates player logic from the main application class
 */

import { 
    ELEMENT_IDS, 
    DEFAULTS, 
    TEAM_CONFIG, 
    HTML_TEMPLATES,
    VALIDATION_RULES
} from '../constants.js';
import { SecurityUtils } from '../utils/security.js';

export class PlayerManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.players = [];
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT;
        this.teams = [];
        this.teamNames = {};
        
        this.initializeEventListeners();
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize player-related event listeners
     */
    initializeEventListeners() {
        // Use DOMContentLoaded to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupPlayerCountSelector();
                this.setupPlayerInputListeners();
            });
        } else {
            // DOM is already ready
            this.setupPlayerCountSelector();
            this.setupPlayerInputListeners();
        }
    }

    /**
     * Set up player count selector event listener
     */
    setupPlayerCountSelector() {
        const playerCountSelect = document.getElementById(ELEMENT_IDS.PLAYER_COUNT);
        if (playerCountSelect) {
            playerCountSelect.addEventListener('change', (e) => {
                const playerCount = parseInt(e.target.value);
                
                if (playerCount >= DEFAULTS.MIN_PLAYERS && playerCount <= DEFAULTS.MAX_PLAYERS) {
                    this.updatePlayerInputs(playerCount);
                    this.updateTeamSelections();
                    
                    // Show player input fields when a count is selected
                    this.ui.showElement(ELEMENT_IDS.PLAYER_INPUTS);
                    
                    // Hide help message when a count is selected
                    const helpMessage = document.querySelector('.player-count-help');
                    if (helpMessage) {
                        helpMessage.style.display = 'none';
                    }
                }
            });
        }
    }

    /**
     * Set up player input field event listeners
     */
    setupPlayerInputListeners() {
        // Listen for changes in player name inputs to populate team selects
        const playerInputs = document.querySelectorAll('.player-input input');
        playerInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateTeamSelections();
            });
        });
    }

    // =========================================================================
    // PLAYER INPUT MANAGEMENT
    // =========================================================================

    /**
     * Update player input fields based on player count
     * @param {number} playerCount - Number of players
     */
    updatePlayerInputs(playerCount) {
        this.requiredPlayers = playerCount;
        
        // Show/hide player inputs based on count
        const playerInputIds = [
            ELEMENT_IDS.PLAYER_1_INPUT,
            ELEMENT_IDS.PLAYER_2_INPUT,
            ELEMENT_IDS.PLAYER_3_INPUT,
            ELEMENT_IDS.PLAYER_4_INPUT
        ];
        
        playerInputIds.forEach((inputId, index) => {
            const inputDiv = document.getElementById(inputId);
            if (inputDiv) {
                if (index < playerCount) {
                    this.ui.removeClass(inputId, 'hidden');
                    // Set required attribute on input
                    const input = inputDiv.querySelector('input');
                    if (input) {
                        input.required = true;
                    }
                } else {
                    this.ui.addClass(inputId, 'hidden');
                    // Remove required attribute and clear value
                    const input = inputDiv.querySelector('input');
                    if (input) {
                        input.required = false;
                        input.value = '';
                    }
                }
            }
        });

        // Update team selections for the new player count
        this.updateTeamSelections();
    }

    /**
     * Get current player names from input fields
     * @returns {Array} Array of player names
     */
    getCurrentPlayerNames() {
        const names = [];
        for (let i = 1; i <= this.requiredPlayers; i++) {
            const name = this.ui.getInputValue(`player${i}`).trim();
            if (name.length > 0) {
                names.push(name);
            }
        }
        return names;
    }

    /**
     * Get the required number of players
     * @returns {number} Required player count
     */
    getRequiredPlayers() {
        return this.requiredPlayers;
    }

    /**
     * Set the player list
     * @param {Array} players - Array of player names
     */
    setPlayers(players) {
        this.players = [...players];
    }

    /**
     * Get the current player list
     * @returns {Array} Array of player names
     */
    getPlayers() {
        return [...this.players];
    }

    // =========================================================================
    // TEAM MANAGEMENT
    // =========================================================================

    /**
     * Update team selections based on current player inputs
     */
    updateTeamSelections() {
        const playerNames = this.getCurrentPlayerNames();
        
        // Only populate team selects if we have exactly 4 players
        if (playerNames.length === 4) {
            this.populateTeamSelects();
        } else {
            // Clear team selections if we don't have 4 players
            this.clearTeamSelections();
        }
    }

    /**
     * Populate team selection dropdowns with current players
     */
    populateTeamSelects() {
        const playerNames = this.getCurrentPlayerNames();
        
        // Only proceed if we have exactly 4 players
        if (playerNames.length !== VALIDATION_RULES.REQUIRED_TEAM_PLAYERS) {
            this.clearTeamSelections();
            return;
        }
        
        // Populate all team selection dropdowns
        TEAM_CONFIG.TEAM_IDS.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select player...';
                select.appendChild(defaultOption);
                
                playerNames.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player;
                    option.textContent = player;
                    select.appendChild(option);
                });
            }
        });

        // Set up team select listeners if not already done
        this.setupTeamSelectListeners();
    }

    /**
     * Set up event listeners for team selection dropdowns
     */
    setupTeamSelectListeners() {
        TEAM_CONFIG.TEAM_IDS.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select && !select.dataset.listenerAdded) {
                select.addEventListener('change', () => {
                    this.updateOtherDropdowns(selectId);
                });
                select.dataset.listenerAdded = 'true';
            }
        });
    }

    /**
     * Update other dropdowns when one team selection changes
     * @param {string} changedSelectId - ID of the changed select element
     */
    updateOtherDropdowns(changedSelectId) {
        // Get all current selections
        const selectedValues = TEAM_CONFIG.TEAM_IDS.map(selectId => {
            const select = document.getElementById(selectId);
            return select ? select.value : '';
        });

        // Update each dropdown except the one that changed
        TEAM_CONFIG.TEAM_IDS
            .filter(selectId => selectId !== changedSelectId)
            .forEach(selectId => {
                const select = document.getElementById(selectId);
                const currentValue = select ? select.value : '';
                
                // Store current selection
                const wasSelected = currentValue;
                
                // Clear and repopulate
                if (select) {
                    select.innerHTML = '';
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Select player...';
                    select.appendChild(defaultOption);
                    
                    // Get all player names
                    const playerNames = this.getCurrentPlayerNames();
                    
                    // Add options for available players
                    playerNames.forEach(player => {
                        // Check if this player is already selected in another dropdown
                        const isSelectedElsewhere = selectedValues.some((value, index) => 
                            value === player && TEAM_CONFIG.TEAM_IDS[index] !== selectId
                        );
                        
                        // Only add if not selected elsewhere, or if this is the current selection
                        if (!isSelectedElsewhere || player === wasSelected) {
                            const option = document.createElement('option');
                            option.value = player;
                            option.textContent = player;
                            select.appendChild(option);
                        }
                    });
                    
                    // Restore selection if it was valid
                    if (wasSelected && wasSelected !== '') {
                        select.value = wasSelected;
                    }
                }
            });
    }

    /**
     * Clear all team selection dropdowns
     */
    clearTeamSelections() {
        TEAM_CONFIG.TEAM_IDS.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.value = '';
                select.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select player...';
                select.appendChild(defaultOption);
            }
        });
    }

    /**
     * Get current team configuration
     * @returns {Object} Team configuration with teams and team names
     */
    getTeamConfiguration() {
        if (this.requiredPlayers !== 4) {
            return {
                teams: [],
                teamNames: {}
            };
        }

        const team1Player1 = this.ui.getInputValue(ELEMENT_IDS.TEAM_1_PLAYER_1);
        const team1Player2 = this.ui.getInputValue(ELEMENT_IDS.TEAM_1_PLAYER_2);
        const team2Player1 = this.ui.getInputValue(ELEMENT_IDS.TEAM_2_PLAYER_1);
        const team2Player2 = this.ui.getInputValue(ELEMENT_IDS.TEAM_2_PLAYER_2);

        return {
            teams: [
                [team1Player1, team1Player2],
                [team2Player1, team2Player2]
            ],
            teamNames: {
                team1: `${team1Player1} & ${team1Player2}`,
                team2: `${team2Player1} & ${team2Player2}`
            }
        };
    }

    /**
     * Set team configuration
     * @param {Array} teams - Array of team arrays
     * @param {Object} teamNames - Team names object
     */
    setTeamConfiguration(teams, teamNames) {
        this.teams = teams;
        this.teamNames = teamNames;
    }

    // =========================================================================
    // VALIDATION
    // =========================================================================

    /**
     * Validate player names
     * @returns {Object} Validation result with success flag and message
     */
    validatePlayers() {
        const playerNames = this.getCurrentPlayerNames();

        // Check if we have the required number of players
        if (playerNames.length !== this.requiredPlayers) {
            return {
                success: false,
                message: `Exactly ${this.requiredPlayers} players are required.`
            };
        }

        // Check if all players have names
        const hasEmptyNames = playerNames.some(name => 
            name.length < VALIDATION_RULES.PLAYER_NAME_MIN_LENGTH
        );
        if (hasEmptyNames) {
            return {
                success: false,
                message: 'Please enter all player names'
            };
        }

        // Enhanced security validation using SecurityUtils
        const invalidNames = playerNames.filter(name => !SecurityUtils.validatePlayerName(name));
        if (invalidNames.length > 0) {
            return {
                success: false,
                message: 'Player names contain invalid characters. Only letters, numbers, spaces, hyphens, apostrophes, and periods are allowed.'
            };
        }

        // Check if all player names are unique
        const uniqueNames = new Set(playerNames);
        if (uniqueNames.size !== playerNames.length) {
            return {
                success: false,
                message: 'All player names must be unique'
            };
        }

        // Check name length limits
        const tooLongNames = playerNames.some(name => 
            name.length > VALIDATION_RULES.PLAYER_NAME_MAX_LENGTH
        );
        if (tooLongNames) {
            return {
                success: false,
                message: `Player names must be ${VALIDATION_RULES.PLAYER_NAME_MAX_LENGTH} characters or less`
            };
        }

        return {
            success: true,
            message: 'Player validation successful'
        };
    }

    /**
     * Validate team selection (for 4-player games)
     * @returns {boolean} True if team selection is valid
     */
    validateTeamSelection() {
        if (this.requiredPlayers !== 4) {
            return true; // No team validation needed for 2-3 players
        }

        const team1Player1 = this.ui.getInputValue(ELEMENT_IDS.TEAM_1_PLAYER_1);
        const team1Player2 = this.ui.getInputValue(ELEMENT_IDS.TEAM_1_PLAYER_2);
        const team2Player1 = this.ui.getInputValue(ELEMENT_IDS.TEAM_2_PLAYER_1);
        const team2Player2 = this.ui.getInputValue(ELEMENT_IDS.TEAM_2_PLAYER_2);
        
        // Check if all players are selected
        if (!team1Player1 || !team1Player2 || !team2Player1 || !team2Player2) {
            return false;
        }
        
        // Check for duplicate players
        const selectedPlayers = [team1Player1, team1Player2, team2Player1, team2Player2];
        const uniquePlayers = new Set(selectedPlayers);
        
        return uniquePlayers.size === 4;
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Reset player manager to initial state
     */
    reset() {
        this.players = [];
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT;
        this.teams = [];
        this.teamNames = {};
        
        // Reset player count selector to default (4 players)
        const playerCountSelect = document.getElementById(ELEMENT_IDS.PLAYER_COUNT);
        if (playerCountSelect) {
    
            playerCountSelect.value = DEFAULTS.PLAYER_COUNT.toString();
        } else {
            console.warn('PlayerManager.reset: playerCountSelect element not found');
        }
        
        // Update player count display to show 4 player inputs

        this.updatePlayerCountDisplay(DEFAULTS.PLAYER_COUNT);
        
        // Clear all player inputs
        const playerInputIds = [
            ELEMENT_IDS.PLAYER_1,
            ELEMENT_IDS.PLAYER_2,
            ELEMENT_IDS.PLAYER_3,
            ELEMENT_IDS.PLAYER_4
        ];
        
        playerInputIds.forEach(inputId => {
            this.ui.clearInput(inputId);
        });
        
        // Clear team selections
        this.clearTeamSelections();
    }

    /**
     * Check if team-based games are needed (4 players)
     * @returns {boolean} True if team-based games are needed
     */
    needsTeamBasedGames() {
        return this.requiredPlayers === 4;
    }

    /**
     * Get player statistics
     * @returns {Object} Player statistics
     */
    getStats() {
        return {
            totalPlayers: this.players.length,
            requiredPlayers: this.requiredPlayers,
            hasTeams: this.teams.length > 0,
            teamCount: this.teams.length
        };
    }

    /**
     * Update player count display and show/hide player inputs
     * @param {number} playerCount - Number of players
     */
    updatePlayerCountDisplay(playerCount = null) {
        const count = playerCount || this.requiredPlayers;
        const playerInputs = document.getElementById(ELEMENT_IDS.PLAYER_INPUTS);
        const helpMessage = document.querySelector('.player-count-help');
        
        if (!playerInputs) return;
        
        if (count >= 2 && count <= 4) {
            // Show player inputs
            playerInputs.style.display = 'block';
            
            // Hide help message
            if (helpMessage) {
                helpMessage.style.display = 'none';
            }
            
            // Show/hide individual player inputs based on count
            for (let i = 1; i <= 4; i++) {
                const input = document.getElementById(`player${i}`);
                if (input) {
                    input.style.display = i <= count ? 'block' : 'none';
                }
            }
        } else {
            // Hide player inputs
            playerInputs.style.display = 'none';
            
            // Show help message
            if (helpMessage) {
                helpMessage.style.display = 'block';
            }
        }
    }

    /**
     * Restore player inputs from saved data
     * @param {Array} players - Array of player names
     */
    restorePlayerInputs(players) {

        
        if (!Array.isArray(players) || players.length === 0) {
    
            return;
        }

        // Update player count
        this.requiredPlayers = players.length;

        
        // Update player count selector
        const playerCountSelect = document.getElementById(ELEMENT_IDS.PLAYER_COUNT);
        if (playerCountSelect) {
            playerCountSelect.value = players.length.toString();
    
        } else {
            console.warn('Player count selector not found');
        }
        
        // Update display

        this.updatePlayerCountDisplay(players.length);

        // Restore player names
        players.forEach((playerName, index) => {
            const playerInput = document.getElementById(`player${index + 1}`);
            if (playerInput) {
                playerInput.value = playerName;
        
            } else {
                console.warn(`Player input ${index + 1} not found`);
            }
        });

        // Update team selections if needed
        if (this.requiredPlayers === 4) {
    
            this.updateTeamSelections();
        }
        

    }
}
