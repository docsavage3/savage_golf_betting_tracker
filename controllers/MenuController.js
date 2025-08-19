/**
 * Menu Controller Class
 * Handles burger menu operations and navigation
 * Extracted from main SavageGolf class for better separation of concerns
 */

import { AnalyticsUtils } from '../utils/analytics.js';

export class MenuController {
    constructor(uiManager, gameController) {
        this.ui = uiManager;
        this.gameController = gameController;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize menu-related event listeners
     */
    initializeEventListeners() {
        // Burger menu toggle
        document.getElementById('burgerBtn').addEventListener('click', () => this.toggleBurgerMenu());
        
        // Burger menu options
        document.getElementById('cancelGame').addEventListener('click', () => this.cancelGame());
        document.getElementById('sideGamesInfo').addEventListener('click', () => this.showSideGamesInfo());
        document.getElementById('aboutApp').addEventListener('click', () => this.showAbout());
        
        // Side Games modal
        document.getElementById('closeSideGames').addEventListener('click', () => this.hideSideGamesModal());
        
        // About modal
        document.getElementById('closeAbout').addEventListener('click', () => this.hideAbout());
        
        // Close burger menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // About modal - close when clicking outside
        document.getElementById('aboutModal').addEventListener('click', (e) => {
            if (e.target.id === 'aboutModal') {
                this.hideAbout();
            }
        });
        
        // Side Games modal - close when clicking outside
        document.getElementById('sideGamesModal').addEventListener('click', (e) => {
            if (e.target.id === 'sideGamesModal') {
                this.hideSideGamesModal();
            }
        });
    }

    // =========================================================================
    // BURGER MENU OPERATIONS
    // =========================================================================

    /**
     * Toggle burger menu open/closed state
     */
    toggleBurgerMenu() {
        const burgerBtn = document.getElementById('burgerBtn');
        const dropdown = document.getElementById('burgerDropdown');
        
        if (dropdown.classList.contains('show')) {
            this.closeBurgerMenu();
        } else {
            this.openBurgerMenu();
        }
    }

    /**
     * Open burger menu dropdown
     */
    openBurgerMenu() {
        const burgerBtn = document.getElementById('burgerBtn');
        const dropdown = document.getElementById('burgerDropdown');
        
        // Calculate position based on burger button location
        const btnRect = burgerBtn.getBoundingClientRect();
        const dropdownHeight = 200; // Approximate dropdown height
        const viewportHeight = window.innerHeight;
        
        // Position dropdown below button, but if it would go off-screen, position above
        let top = btnRect.bottom + 8;
        if (top + dropdownHeight > viewportHeight) {
            top = btnRect.top - dropdownHeight - 8;
        }
        
        // Position dropdown aligned to right edge of button
        const right = window.innerWidth - btnRect.right;
        
        dropdown.style.top = `${top}px`;
        dropdown.style.right = `${right}px`;
        
        burgerBtn.classList.add('active');
        dropdown.classList.add('show');
        
        // Track analytics
        AnalyticsUtils.trackFeatureUsage('burger_menu_opened');
    }

    /**
     * Close burger menu dropdown
     */
    closeBurgerMenu() {
        const burgerBtn = document.getElementById('burgerBtn');
        const dropdown = document.getElementById('burgerDropdown');
        
        burgerBtn.classList.remove('active');
        dropdown.classList.remove('show');
    }

    /**
     * Handle clicks outside the burger menu to close it
     * @param {Event} e - Click event
     */
    handleOutsideClick(e) {
        const burgerMenu = document.querySelector('.burger-menu');
        const dropdown = document.getElementById('burgerDropdown');
        
        if (dropdown && dropdown.classList.contains('show')) {
            if (!burgerMenu.contains(e.target)) {
                this.closeBurgerMenu();
            }
        }
    }

    // =========================================================================
    // MENU ACTIONS
    // =========================================================================

    /**
     * Handle cancel game action
     */
    cancelGame() {
        this.closeBurgerMenu();
        AnalyticsUtils.trackFeatureUsage('cancel_game_clicked');
        
        if (this.onGetCurrentPage && this.onGetCurrentPage() === 'setup') {
            this.ui.showNotification('Already on setup page!', 'info');
            return;
        }
        
        this.gameController.resetGame();
    }

    /**
     * Show side games information modal
     */
    showSideGamesInfo() {
        this.closeBurgerMenu();
        AnalyticsUtils.trackFeatureUsage('side_games_modal_opened');
        const modal = document.getElementById('sideGamesModal');
        modal.style.display = 'flex';
    }

    /**
     * Hide side games information modal
     */
    hideSideGamesModal() {
        const modal = document.getElementById('sideGamesModal');
        modal.style.display = 'none';
        AnalyticsUtils.trackFeatureUsage('side_games_modal_closed');
    }

    /**
     * Show about application modal
     */
    showAbout() {
        this.closeBurgerMenu();
        AnalyticsUtils.trackFeatureUsage('about_modal_opened');
        const modal = document.getElementById('aboutModal');
        modal.style.display = 'flex';
    }

    /**
     * Hide about application modal
     */
    hideAbout() {
        const modal = document.getElementById('aboutModal');
        modal.style.display = 'none';
        AnalyticsUtils.trackFeatureUsage('about_modal_closed');
    }

    // =========================================================================
    // CALLBACK SETTERS (FOR DEPENDENCY INJECTION)
    // =========================================================================

    /**
     * Set callback functions for dependency injection
     * @param {Object} callbacks - Object containing callback functions
     */
    setCallbacks(callbacks) {
        this.onGetCurrentPage = callbacks.getCurrentPage;
    }

    // =========================================================================
    // MENU VISIBILITY MANAGEMENT
    // =========================================================================

    /**
     * Update burger menu visibility based on current page
     * @param {string} pageName - Current page name
     */
    updateBurgerMenuVisibility(pageName) {
        const burgerMenu = document.querySelector('.burger-menu');
        // Show burger menu on all pages now - users expect navigation everywhere
        burgerMenu.style.display = 'block';
    }
}
