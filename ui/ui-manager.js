/**
 * UI Manager Class
 * Handles all DOM manipulation, page display, modals, and notifications
 * Separates UI logic from business logic
 */

import { 
    ELEMENT_IDS, 
    PAGE_NAMES, 
    DISPLAY_STYLES, 
    CSS_CLASSES, 
    MESSAGES,
    NOTIFICATION_CONFIG,
    HTML_TEMPLATES,
    SKINS_CONFIG
} from '../constants.js';

export class UIManager {
    constructor() {
        this.currentPage = PAGE_NAMES.NAVIGATION;
        this.notificationTimeout = null;
    }

    // =========================================================================
    // PAGE MANAGEMENT
    // =========================================================================

    /**
     * Show a specific page and hide all others
     * @param {string} pageName - The name of the page to show
     * @param {Object} gameConfigs - Game configurations to check enablement
     */
    showPage(pageName, gameConfigs = {}) {
        // Hide all pages
        const pages = [
            ELEMENT_IDS.GAME_SETUP,
            ELEMENT_IDS.GAME_NAVIGATION, 
            ELEMENT_IDS.MURPH_PAGE, 
            ELEMENT_IDS.SKINS_PAGE, 
            ELEMENT_IDS.KP_PAGE, 
            ELEMENT_IDS.SNAKE_PAGE, 
            ELEMENT_IDS.WOLF_PAGE, 
            ELEMENT_IDS.COMBINED_PAGE, 
            ELEMENT_IDS.FINAL_RESULTS
        ];
        
        pages.forEach(page => {
            const element = document.getElementById(page);
            if (element) {
                element.style.display = DISPLAY_STYLES.NONE;
            }
        });
        
        // Show the requested page
        switch (pageName) {
            case 'gameSetup':
            case 'setup':
                this.showElement(ELEMENT_IDS.GAME_SETUP);
                break;
            case PAGE_NAMES.NAVIGATION:
            case 'navigation':
                this.showElement(ELEMENT_IDS.GAME_NAVIGATION);
                // Scroll to top when showing navigation page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case PAGE_NAMES.MURPH:
                if (gameConfigs.murph?.enabled) {
                    this.showElement(ELEMENT_IDS.MURPH_PAGE);
                } else {
                    this.showNotification('Murph game is not enabled for this round.', NOTIFICATION_CONFIG.TYPES.ERROR);
                    return;
                }
                break;
            case PAGE_NAMES.SKINS:
                if (gameConfigs.skins?.enabled) {
                    this.showElement(ELEMENT_IDS.SKINS_PAGE);
                } else {
                    this.showNotification('Skins game is not enabled for this round.', NOTIFICATION_CONFIG.TYPES.ERROR);
                    return;
                }
                break;
            case PAGE_NAMES.KP:
                if (gameConfigs.kp?.enabled) {
                    this.showElement(ELEMENT_IDS.KP_PAGE);
                } else {
                    this.showNotification('KP game is not enabled for this round.', NOTIFICATION_CONFIG.TYPES.ERROR);
                    return;
                }
                break;
            case PAGE_NAMES.SNAKE:
                if (gameConfigs.snake?.enabled) {
                    this.showElement(ELEMENT_IDS.SNAKE_PAGE);
                } else {
                    this.showNotification('Snake game is not enabled for this round.', NOTIFICATION_CONFIG.TYPES.ERROR);
                    return;
                }
                break;
            case PAGE_NAMES.WOLF:
                if (gameConfigs.wolf?.enabled) {
                    this.showElement(ELEMENT_IDS.WOLF_PAGE);
                } else {
                    this.showNotification('Wolf game is not enabled for this round.', NOTIFICATION_CONFIG.TYPES.ERROR);
                    return;
                }
                break;
            case PAGE_NAMES.COMBINED:
                this.showElement(ELEMENT_IDS.COMBINED_PAGE);
                break;
            case PAGE_NAMES.FINAL:
                this.showElement(ELEMENT_IDS.FINAL_RESULTS);
                break;
        }
        
        this.currentPage = pageName;
    }

    /**
     * Show an element
     * @param {string} elementId - The ID of the element to show
     * @param {string} displayStyle - The display style to use (default: block)
     */
    showElement(elementId, displayStyle = DISPLAY_STYLES.BLOCK) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = displayStyle;
        }
    }

    /**
     * Hide an element
     * @param {string} elementId - The ID of the element to hide
     */
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = DISPLAY_STYLES.NONE;
        }
    }

    // =========================================================================
    // MODAL MANAGEMENT
    // =========================================================================

    /**
     * Show a modal
     * @param {string} modalId - The ID of the modal to show
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = DISPLAY_STYLES.FLEX;
        }
    }

    /**
     * Hide a modal
     * @param {string} modalId - The ID of the modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = DISPLAY_STYLES.NONE;
        }
    }

    /**
     * Show Murph modal and populate with players
     * @param {Array} players - Array of player names
     * @param {number} currentHole - Current hole number
     */
    showMurphModal(players, currentHole) {
        const playerSelect = document.getElementById(ELEMENT_IDS.MURPH_PLAYER);
        const holeInput = document.getElementById('murphHole');
        
        // Populate player select
        playerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select player...';
        playerSelect.appendChild(defaultOption);
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = currentHole;
        
        this.showModal(ELEMENT_IDS.MURPH_MODAL);
    }

    /**
     * Hide Murph modal
     */
    hideMurphModal() {
        this.hideModal(ELEMENT_IDS.MURPH_MODAL);
    }

    /**
     * Show Skins modal and populate with appropriate options
     * @param {Array} players - Array of player names
     * @param {number} currentHole - Current hole number
     * @param {number} requiredPlayers - Number of required players
     * @param {Object} teamsConfig - Teams configuration
     */
    showSkinsModal(players, currentHole, requiredPlayers, teamsConfig = {}) {
        const winnerSelect = document.getElementById(ELEMENT_IDS.SKINS_WINNER);
        const holeInput = document.getElementById('skinsHole');
        
        // Clear and populate winner select
        winnerSelect.innerHTML = '';
        
        if (requiredPlayers === 4 && teamsConfig.teamNames) {
            // 4 players: Add team options
            const team1Option = document.createElement('option');
            team1Option.value = SKINS_CONFIG.TEAM_1_VALUE;
            team1Option.textContent = teamsConfig.teamNames.team1 || 'Team 1';
            winnerSelect.appendChild(team1Option);
            
            const team2Option = document.createElement('option');
            team2Option.value = SKINS_CONFIG.TEAM_2_VALUE;
            team2Option.textContent = teamsConfig.teamNames.team2 || 'Team 2';
            winnerSelect.appendChild(team2Option);
        } else {
            // 2-3 players: Add individual player options
            players.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                winnerSelect.appendChild(option);
            });
        }
        
        // Add carryover option
        const carryoverOption = document.createElement('option');
        carryoverOption.value = SKINS_CONFIG.CARRYOVER_VALUE;
        carryoverOption.textContent = SKINS_CONFIG.CARRYOVER_TEXT;
        winnerSelect.appendChild(carryoverOption);
        
        // Set current hole
        holeInput.value = currentHole;
        
        this.showModal(ELEMENT_IDS.SKINS_MODAL);
    }

    /**
     * Hide Skins modal
     */
    hideSkinsModal() {
        this.hideModal(ELEMENT_IDS.SKINS_MODAL);
    }

    /**
     * Show KP modal and populate with players
     * @param {Array} players - Array of player names
     * @param {number} currentHole - Current hole number
     */
    showKPModal(players, currentHole) {
        const playerSelect = document.getElementById(ELEMENT_IDS.KP_WINNER);
        const holeInput = document.getElementById('kpHole');
        
        // Populate player select
        playerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select player...';
        playerSelect.appendChild(defaultOption);
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = currentHole;
        
        this.showModal(ELEMENT_IDS.KP_MODAL);
    }

    /**
     * Hide KP modal
     */
    hideKPModal() {
        this.hideModal(ELEMENT_IDS.KP_MODAL);
    }

    /**
     * Show Snake modal and populate with players
     * @param {Array} players - Array of player names
     * @param {number} currentHole - Current hole number
     */
    showSnakeModal(players, currentHole) {
        const playerSelect = document.getElementById(ELEMENT_IDS.SNAKE_PLAYER);
        const holeInput = document.getElementById('snakeHole');
        
        // Populate player select
        playerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select player...';
        playerSelect.appendChild(defaultOption);
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = currentHole;
        
        this.showModal(ELEMENT_IDS.SNAKE_MODAL);
    }

    /**
     * Hide Snake modal
     */
    hideSnakeModal() {
        this.hideModal(ELEMENT_IDS.SNAKE_MODAL);
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================

    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error, warning, info)
     */
    showNotification(message, type = NOTIFICATION_CONFIG.TYPES.INFO) {
        // Clear any existing notification timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Create or update notification element
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        // Set message and type
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        notification.style.display = DISPLAY_STYLES.BLOCK;

        // Auto-hide after configured duration
        this.notificationTimeout = setTimeout(() => {
            notification.style.display = DISPLAY_STYLES.NONE;
        }, NOTIFICATION_CONFIG.DURATION);
    }

    // =========================================================================
    // FORM AND INPUT MANAGEMENT
    // =========================================================================

    /**
     * Set the value of an input element
     * @param {string} elementId - The ID of the input element
     * @param {string|number} value - The value to set
     */
    setInputValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Get the value of an input element
     * @param {string} elementId - The ID of the input element
     * @returns {string} The value of the input
     */
    getInputValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : '';
    }

    /**
     * Clear an input element
     * @param {string} elementId - The ID of the input element
     */
    clearInput(elementId) {
        this.setInputValue(elementId, '');
    }

    /**
     * Set the innerHTML of an element
     * @param {string} elementId - The ID of the element
     * @param {string} html - The HTML content to set
     */
    setHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Set the text content of an element
     * @param {string} elementId - The ID of the element
     * @param {string} text - The text content to set
     */
    setText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // =========================================================================
    // CSS CLASS MANAGEMENT
    // =========================================================================

    /**
     * Add a CSS class to an element
     * @param {string} elementId - The ID of the element
     * @param {string} className - The CSS class to add
     */
    addClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    /**
     * Remove a CSS class from an element
     * @param {string} elementId - The ID of the element
     * @param {string} className - The CSS class to remove
     */
    removeClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle a CSS class on an element
     * @param {string} elementId - The ID of the element
     * @param {string} className - The CSS class to toggle
     */
    toggleClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Get the current page
     * @returns {string} The current page name
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Check if an element exists
     * @param {string} elementId - The ID of the element
     * @returns {boolean} True if element exists
     */
    elementExists(elementId) {
        return document.getElementById(elementId) !== null;
    }

    /**
     * Disable/enable an element
     * @param {string} elementId - The ID of the element
     * @param {boolean} disabled - Whether to disable the element
     */
    setDisabled(elementId, disabled = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = disabled;
        }
    }

    /**
     * Focus on an element
     * @param {string} elementId - The ID of the element
     */
    focusElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
        }
    }
}
