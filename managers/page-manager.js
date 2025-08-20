/**
 * Page Manager
 * Handles page navigation and display updates
 * 
 * Copyright (c) 2025 Daniel Savage
 * Licensed under MIT License
 */

import { PAGE_NAMES } from '../constants.js';

export class PageManager {
    constructor(uiManager, gameManager) {
        this.ui = uiManager;
        this.gameManager = gameManager;
        this.currentPage = PAGE_NAMES.NAVIGATION;
        this.quickActionsCallback = null;
    }

    /**
     * Navigate to a specific page
     * @param {string} pageName - The page to display
     */
    showPage(pageName) {
        this.currentPage = pageName;
        
        // Use UIManager to handle page display
        this.ui.showPage(pageName, this.gameManager.gameConfigs);
        
        // If showing navigation page, set up quick actions
        if (pageName === 'navigation' && this.quickActionsCallback) {
            this.quickActionsCallback();
        }
    }

    /**
     * Get the current page
     * @returns {string} Current page name
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Update game navigation visibility based on enabled games
     */
    updateGameNavigationVisibility() {
        const gameConfigs = this.gameManager.gameConfigs;
        
        // Update navigation buttons visibility
        this.ui.updateNavigationVisibility({
            murph: gameConfigs.murph?.enabled || false,
            skins: gameConfigs.skins?.enabled || false,
            kp: gameConfigs.kp?.enabled || false,
            snake: gameConfigs.snake?.enabled || false,
            wolf: gameConfigs.wolf?.enabled || false
        });
    }

    /**
     * Check if a specific page is currently active
     * @param {string} pageName - Page name to check
     * @returns {boolean} True if page is active
     */
    isPageActive(pageName) {
        return this.currentPage === pageName;
    }

    /**
     * Navigate to previous page in sequence
     */
    navigateToPreviousPage() {
        // Implementation depends on your page flow logic
        // This is a placeholder for navigation flow
        // Navigate to previous page from: ${this.currentPage}
    }

    /**
     * Navigate to next page in sequence
     */
    navigateToNextPage() {
        // Implementation depends on your page flow logic
        // This is a placeholder for navigation flow
        // Navigate to next page from: ${this.currentPage}
    }

    /**
     * Set the callback for quick actions setup
     * @param {Function} callback - Function to call when setting up quick actions
     */
    setQuickActionsCallback(callback) {
        this.quickActionsCallback = callback;
    }
}
