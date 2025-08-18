/**
 * Savage Golf Betting Tracker
 * Main application logic and game management
 * 
 * Copyright (c) 2025 Daniel Savage
 * Licensed under MIT License
 * 
 * This software tracks golf side games including Murph, Skins, KP, and Snake.
 * All rights reserved.
 */

import { 
    ELEMENT_IDS, 
    GAME_TYPES, 
    GAME_NAMES, 
    PAGE_NAMES, 
    DEFAULTS, 
    CSS_CLASSES, 
    DISPLAY_STYLES, 
    MESSAGES, 
    TEAM_CONFIG, 
    NOTIFICATION_CONFIG, 
    SKINS_CONFIG, 
    HTML_TEMPLATES, 
    VALIDATION_RULES 
} from './constants.js';

import { createGame, MurphGame, SkinsGame, KPGame, SnakeGame } from './games/index.js';
import { UIManager } from './ui/ui-manager.js';
import { PlayerManager } from './managers/player-manager.js';
import { ValidationManager } from './utils/validation.js';
import { GameManager } from './managers/game-manager.js';
import { StorageManager } from './managers/storage-manager.js';
import { SecurityUtils } from './utils/security.js';
import { AnalyticsUtils } from './utils/analytics.js';

class SavageGolf {
    constructor() {
        this.currentHole = DEFAULTS.STARTING_HOLE;
        
        // Initialize UI Manager
        this.ui = new UIManager();
        
        // Initialize Player Manager
        this.playerManager = new PlayerManager(this.ui);
        
        // Initialize Validation Manager
        this.validator = new ValidationManager(this.ui);
        
        // Initialize Game Manager
        this.gameManager = new GameManager(this.ui);
        
        // Initialize Storage Manager
        this.storage = new StorageManager();
        
        // Legacy properties for backwards compatibility
        this.gameConfigs = this.gameManager.gameConfigs;
        this.gameActions = this.gameManager.gameActions;
        this.gameInstances = this.gameManager.gameInstances;
        this.gameStarted = this.gameManager.gameStarted;
        this.players = this.gameManager.players;
        this.requiredPlayers = this.gameManager.requiredPlayers;
        this.currentPage = PAGE_NAMES.NAVIGATION;
        
        this.initializeEventListeners();
        this.setupGameCheckboxes();
        
        // Test localStorage functionality
        this.storage.testLocalStorage();
        
        // Try to load saved game state
        const savedState = this.loadSavedGame();
        
        // Auto-navigate based on saved game state
        if (savedState) {
            // Auto-resume saved game and go directly to navigation
    
            this.autoResumeGame(savedState);
        } else {
            // No saved game, stay on setup page
            this.showPage('setup');
        }
    }

    initializeEventListeners() {
        // Game setup
        document.getElementById(ELEMENT_IDS.START_GAME).addEventListener('click', () => this.startGame());
        
        // Game play
        document.getElementById(ELEMENT_IDS.PREVIOUS_HOLE).addEventListener('click', () => this.previousHole());
        document.getElementById(ELEMENT_IDS.NEXT_HOLE).addEventListener('click', () => this.nextHole());
        
        // Complete Game button (appears on hole 18)
        const completeBtn = document.getElementById(ELEMENT_IDS.COMPLETE_GAME);
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeGameFlow());
        }
        
        // Navigation buttons
        document.getElementById(ELEMENT_IDS.NAV_MURPH).addEventListener('click', () => this.showPage(PAGE_NAMES.MURPH));
        document.getElementById(ELEMENT_IDS.NAV_SKINS).addEventListener('click', () => this.showPage(PAGE_NAMES.SKINS));
        document.getElementById(ELEMENT_IDS.NAV_KP).addEventListener('click', () => this.showPage(PAGE_NAMES.KP));
        document.getElementById(ELEMENT_IDS.NAV_SNAKE).addEventListener('click', () => this.showPage(PAGE_NAMES.SNAKE));
        document.getElementById(ELEMENT_IDS.NAV_WOLF).addEventListener('click', () => this.showPage(PAGE_NAMES.WOLF));
        document.getElementById(ELEMENT_IDS.NAV_COMBINED).addEventListener('click', () => this.showPage(PAGE_NAMES.COMBINED));
        
        // Back to navigation buttons
        document.getElementById('backToNav').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav2').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNavKP').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNavSnake').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNavWolf').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav3').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav4').addEventListener('click', () => this.showPage('navigation'));
        
        // New game from final results
        document.getElementById('newGameFromFinal').addEventListener('click', () => this.resetGame());
        

        
        // Game navigation controls
        // Removed startNewGameFromNav event listener - using bottom New Game button instead
        

        
        // Murph game
        document.getElementById('callMurph').addEventListener('click', () => this.showMurphModal());
        document.getElementById('saveMurph').addEventListener('click', () => this.saveMurphCall());
        document.getElementById('cancelMurph').addEventListener('click', () => this.hideMurphModal());
        
        // Skins game
        document.getElementById('recordSkins').addEventListener('click', () => this.showSkinsModal());
        document.getElementById('saveSkins').addEventListener('click', () => this.saveSkinsAction());
        document.getElementById('cancelSkins').addEventListener('click', () => this.hideSkinsModal());
        
        // KP game
        document.getElementById('recordKP').addEventListener('click', () => this.showKPModal());
        document.getElementById('saveKP').addEventListener('click', () => this.saveKPAction());
        document.getElementById('cancelKP').addEventListener('click', () => this.hideKPModal());
        
        // Snake game
        document.getElementById('recordSnake').addEventListener('click', () => this.showSnakeModal());
        document.getElementById('saveSnake').addEventListener('click', () => this.saveSnakeAction());
        document.getElementById('cancelSnake').addEventListener('click', () => this.hideSnakeModal());
        
        // Wolf game
        document.getElementById('recordWolf').addEventListener('click', () => this.showWolfModal());
        document.getElementById('saveWolf').addEventListener('click', () => this.saveWolfAction());
        document.getElementById('cancelWolf').addEventListener('click', () => this.hideWolfModal());

        
        // New game
        document.getElementById('newGame').addEventListener('click', () => this.resetGame());
        
        // Close modals when clicking outside
        document.getElementById('murphModal').addEventListener('click', (e) => {
            if (e.target.id === 'murphModal') {
                this.hideMurphModal();
            }
        });
        
        document.getElementById('skinsModal').addEventListener('click', (e) => {
            if (e.target.id === 'skinsModal') {
                this.hideSkinsModal();
            }
        });
        
        document.getElementById('kpModal').addEventListener('click', (e) => {
            if (e.target.id === 'kpModal') {
                this.hideKPModal();
            }
        });
        
        document.getElementById('snakeModal').addEventListener('click', (e) => {
            if (e.target.id === 'snakeModal') {
                this.hideSnakeModal();
            }
        });
        
        document.getElementById('wolfModal').addEventListener('click', (e) => {
            if (e.target.id === 'wolfModal') {
                this.hideWolfModal();
            }
        });
    }

    showPage(pageName) {
        // Track page navigation analytics
        if (this.currentPage && this.currentPage !== pageName) {
            AnalyticsUtils.trackNavigation(this.currentPage, pageName);
        }
        
        // Track page view
        AnalyticsUtils.trackPageView(pageName, `Savage Golf - ${pageName}`);
        
        // Use UIManager to handle page display
        this.ui.showPage(pageName, this.gameConfigs);
        this.currentPage = pageName;
        
        // Update the specific page content
        if (pageName === 'murph') {
            this.updateMurphPage();
        } else if (pageName === 'skins') {
            this.updateSkinsPage();
        } else if (pageName === 'kp') {
            this.updateKPPage();
        } else if (pageName === 'snake') {
            this.updateSnakePage();
        } else if (pageName === 'wolf') {
            this.updateWolfPage();
        } else if (pageName === 'combined') {
            this.updateCombinedPage();
        } else if (pageName === 'finalResults') {
            this.updateFinalResults();
        }
    }

    updateMurphPage() {
        this.updateMurphActionsList();
        this.updateMurphSummary();
    }

    updateSkinsPage() {
        this.updateSkinsActionsList();
        this.updateSkinsSummary();
    }

    updateKPPage() {
        this.updateKPActionsList();
        this.updateKPSummary();
    }

    updateSnakePage() {
        this.updateSnakeActionsList();
        this.updateSnakeSummary();
    }

    updateWolfPage() {
        this.updateWolfActionsList();
        this.updateWolfSummary();
    }

    updateCombinedPage() {
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        const target = document.getElementById('paymentInstructionsCombined');
        if (target) {
            SecurityUtils.setInnerHTML(target, this.generatePaymentInstructions());
        }
    }

    setupGameCheckboxes() {
        // Set up game selection checkboxes
        const murphCheckbox = document.getElementById('gameMurph');
        const skinsCheckbox = document.getElementById('gameSkins');
        const kpCheckbox = document.getElementById('gameKP');
        const snakeCheckbox = document.getElementById('gameSnake');
        const wolfCheckbox = document.getElementById('gameWolf');
        
        murphCheckbox.addEventListener('change', () => this.toggleGameSection('murph'));
        skinsCheckbox.addEventListener('change', () => this.toggleGameSection('skins'));
        kpCheckbox.addEventListener('change', () => this.toggleGameSection('kp'));
        snakeCheckbox.addEventListener('change', () => this.toggleGameSection('snake'));
        wolfCheckbox.addEventListener('change', () => this.toggleGameSection('wolf'));
        
        // Set up player count change listener to update team selection visibility
        const playerCountSelect = document.getElementById('playerCount');
        if (playerCountSelect) {
            playerCountSelect.addEventListener('change', () => this.updateTeamSelectionVisibility());
        }
        
        // Set initial navigation button visibility
        this.updateGameNavigationVisibility();
        
        // Don't call toggleGameSection initially since no games are checked
        // The bet amount fields will be shown/hidden when checkboxes are changed
    }
    
    updateTeamSelectionVisibility() {
        // Update team selection visibility when player count changes
        const skinsCheckbox = document.getElementById('gameSkins');
        if (skinsCheckbox && skinsCheckbox.checked) {
            const currentPlayerCount = this.playerManager.getRequiredPlayers();
            const teamSelection = document.getElementById('skinsTeamSelection');
            if (teamSelection) {
                if (currentPlayerCount === 4) {
                    teamSelection.style.display = 'block';
                    this.playerManager.updateTeamSelections();
                } else {
                    teamSelection.style.display = 'none';
                    this.playerManager.clearTeamSelections();
                }
            }
        }
    }

    // =========================================================================
    // STORAGE OPERATIONS
    // =========================================================================

    /**
     * Load saved game state on app startup
     */
    loadSavedGame() {
        const savedState = this.storage.loadGameState();
        // Note: We no longer automatically show the resume section here
        // It's now handled by the calling code (auto-resume or manual resume)
        return savedState;
    }

    /**
     * Show resume game section with saved game details
     * @param {Object} savedState - Saved game state
     */




    /**
     * Auto-resume a saved game (called on app startup)
     * @param {Object} savedState - Saved game state
     */
    autoResumeGame(savedState) {

        
        // Restore the game state
        this.restoreGameState(savedState);
        
        // Track game resume analytics
        const resumedGames = Object.keys(this.gameConfigs || {});
        AnalyticsUtils.trackGameResume(resumedGames, this.currentHole);
        
        // Navigate directly to the game navigation page
        this.showPage('navigation');
        
        // Update the current hole display
        const holeDisplayElement = document.getElementById('holeDisplay');
        
        if (holeDisplayElement) {
            holeDisplayElement.textContent = this.currentHole;
        } else {
            console.warn('Auto-resume: holeDisplay element not found!');
        }
        
        // Update all UI elements to reflect the restored state
        this.updateGameDisplay();
        this.updatePreviousHoleButton();
        this.updateGameNavigationVisibility();
        this.updateGameBreakdowns();
        
        // Setup quick actions dashboard
        this.setupQuickActions();
        
        // Update individual game pages if enabled
        if (this.gameConfigs.murph?.enabled) {
            this.updateMurphPage();
        }
        if (this.gameConfigs.skins?.enabled) {
            this.updateSkinsPage();
        }
        if (this.gameConfigs.kp?.enabled) {
            this.updateKPPage();
        }
        if (this.gameConfigs.snake?.enabled) {
            this.updateSnakePage();
        }
        if (this.gameConfigs.wolf?.enabled) {
            this.updateWolfPage();
        }
        
        // Show success notification
        this.ui.showNotification(`Game auto-resumed! You're on hole ${this.currentHole}`, 'success');
    }

    /**
     * Resume a saved game (manual resume)
     */
    resumeSavedGame() {

        const savedState = this.storage.loadGameState();

        
        if (savedState) {

            this.restoreGameState(savedState);
            
            // Track game resume analytics
            const resumedGames = Object.keys(this.gameConfigs || {});
            AnalyticsUtils.trackGameResume(resumedGames, this.currentHole);
            
            // Navigate to the game navigation page to continue playing
            this.showPage('navigation');
            
            // Update the current hole display
            const holeDisplayElement = document.getElementById('holeDisplay');
            
            if (holeDisplayElement) {
                holeDisplayElement.textContent = this.currentHole;
            } else {
                console.warn('holeDisplay element not found!');
            }
            
            
            
            // Update the game display to show current state
            this.updateGameDisplay();
            
            // Update hole navigation button states
            this.updatePreviousHoleButton();
            
            // Update game navigation visibility
            this.updateGameNavigationVisibility();
            
            // Update game breakdowns
            this.updateGameBreakdowns();
            
            // Setup quick actions dashboard
            this.setupQuickActions();
            
            // Update all game pages to show restored data
            if (this.gameConfigs.murph?.enabled) {
                this.updateMurphPage();
            }
            if (this.gameConfigs.skins?.enabled) {
                this.updateSkinsPage();
            }
            if (this.gameConfigs.kp?.enabled) {
                this.updateKPPage();
            }
            if (this.gameConfigs.snake?.enabled) {
                this.updateSnakePage();
            }
            
            this.ui.showNotification(`Game resumed! You're back on hole ${this.currentHole}`, 'success');
        } else {
            this.ui.showNotification('No saved game found to resume', 'error');
        }
    }



    /**
     * Start a new game (clear saved state)
     */
    startNewGame() {
        const confirmed = window.confirm('This will start a fresh game and clear any saved progress. Are you sure?');
        if (!confirmed) return;
        
        this.storage.clearGameState();
        this.resetGame();
        this.hideResumeGameSection();
        this.ui.showNotification('Starting new game...', 'info');
    }



    /**
     * Save current game state
     */
    saveGameState() {
        if (!this.gameStarted) return;

        const gameState = {
            gameConfigs: this.gameConfigs,
            players: this.players,
            requiredPlayers: this.requiredPlayers,
            currentHole: this.currentHole,
            gameStarted: this.gameStarted,
            gameCompleted: this.gameManager.gameCompleted,
            gameActions: this.gameActions,
            currentPage: this.currentPage
        };



        const success = this.storage.saveGameState(gameState);
        if (success) {
            this.ui.showNotification('Game progress saved!', 'success');
            
        } else {
            this.ui.showNotification('Failed to save game progress', 'error');
        }
    }

    /**
     * Restore game state from saved data
     * @param {Object} savedState - Saved game state
     */
    restoreGameState(savedState) {
        try {
            
            // Restore basic game configuration
            this.gameConfigs = savedState.gameConfigs || {};
            this.players = savedState.players || [];
            this.requiredPlayers = savedState.requiredPlayers || DEFAULTS.PLAYER_COUNT;
            this.currentHole = savedState.currentHole || DEFAULTS.STARTING_HOLE;
            this.gameStarted = savedState.gameStarted || false;
            this.currentPage = savedState.currentPage || PAGE_NAMES.NAVIGATION;

            

            // Restore game manager state
            this.gameManager.restoreGameState(savedState);
            
            // Update legacy properties for backwards compatibility
            this.gameConfigs = this.gameManager.gameConfigs;
            this.gameActions = this.gameManager.gameActions;
            this.gameInstances = this.gameManager.gameInstances;
            this.gameStarted = this.gameManager.gameStarted;
            this.players = this.gameManager.players;
            this.requiredPlayers = this.gameManager.requiredPlayers;

    

            // Restore UI state
            this.restoreUIState(savedState);

            // Show resume notification
            if (this.gameStarted && !this.gameManager.gameCompleted) {
                this.ui.showNotification('Previous game loaded! You can resume from where you left off.', 'info');
            }

    
        } catch (error) {
            console.error('Failed to restore game state:', error);
            this.ui.showNotification('Failed to restore previous game', 'error');
        }
    }

    /**
     * Restore UI state from saved data
     * @param {Object} savedState - Saved game state
     */
    restoreUIState(savedState) {
        // Restore game checkboxes
        Object.entries(savedState.gameConfigs).forEach(([gameType, config]) => {
            let checkboxId;
            if (gameType === 'kp') {
                checkboxId = 'gameKP';
            } else {
                checkboxId = `game${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`;
            }
            
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = config.enabled;
                this.toggleGameSection(gameType, config.enabled);
            }
        });

        // Restore player inputs
        if (savedState.players.length > 0) {
            this.playerManager.restorePlayerInputs(savedState.players);
        }

        // Restore bet amounts
        this.restoreBetAmounts(savedState.gameConfigs);

        // Don't automatically show a page here - let the resume method handle navigation
        // The resume method will navigate to the game navigation page
    }

    /**
     * Restore bet amounts from saved configuration
     * @param {Object} gameConfigs - Game configurations
     */
    restoreBetAmounts(gameConfigs) {
        Object.entries(gameConfigs).forEach(([gameType, config]) => {
            if (config.enabled && config.betAmount) {
                let betInputId;
                if (gameType === 'kp') {
                    betInputId = 'kpBet';
                } else {
                    betInputId = `${gameType}Bet`;
                }
                
                const betInput = document.getElementById(betInputId);
                if (betInput) {
                    betInput.value = config.betAmount;
                }
            }
        });
    }

    /**
     * Export current game state to file
     */
    exportGameState() {
        if (!this.gameStarted) {
            this.ui.showNotification('No active game to export', 'error');
            return;
        }

        const gameState = {
            gameConfigs: this.gameConfigs,
            players: this.players,
            requiredPlayers: this.requiredPlayers,
            currentHole: this.currentHole,
            gameStarted: this.gameStarted,
            gameCompleted: this.gameManager.gameCompleted,
            gameActions: this.gameActions,
            currentPage: this.currentPage
        };

        this.storage.exportGameState(gameState);
        this.ui.showNotification('Game exported successfully!', 'success');
    }

    /**
     * Import game state from file
     */
    importGameState() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const importedState = await this.storage.importGameState(file);
                this.restoreGameState(importedState);
                this.ui.showNotification('Game imported successfully!', 'success');
            } catch (error) {
                this.ui.showNotification(`Import failed: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    /**
     * Clear current game state
     */
    clearGameState() {
        const confirmed = window.confirm('⚠️ WARNING: This will permanently delete the current game state and cannot be undone.\n\nAre you sure you want to clear the game?');
        if (!confirmed) return;

        this.storage.clearGameState();
        this.resetGame();
        this.ui.showNotification('Game state cleared successfully', 'success');
    }



    /**
     * Update storage info display
     */








    toggleGameSection(gameType) {
        // Handle special case for KP (since it's already uppercase in HTML)
        let checkboxId;
        if (gameType === 'kp') {
            checkboxId = 'gameKP';
        } else {
            checkboxId = `game${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`;
        }
        
        const checkbox = document.getElementById(checkboxId);
        const betAmount = document.getElementById(`${gameType}BetAmount`);
        
        if (!checkbox) {
            return;
        }
        
        if (!betAmount) {
            return;
        }
        
        if (gameType === 'skins') {
            const teamSelection = document.getElementById('skinsTeamSelection');
            if (checkbox.checked) {
                betAmount.style.display = 'block';
                // Get current player count from PlayerManager to determine if we should show team selection
                const currentPlayerCount = this.playerManager.getRequiredPlayers();
                // Only show team selection for 4 players
                if (currentPlayerCount === 4) {
                    teamSelection.style.display = 'block';
                    // Populate team selects if we have 4 players
                    this.playerManager.updateTeamSelections();
                } else {
                    teamSelection.style.display = 'none';
                }
            } else {
                betAmount.style.display = 'none';
                teamSelection.style.display = 'none';
                // Clear team selections when unchecking
                this.playerManager.clearTeamSelections();
            }
        } else {
            if (checkbox.checked) {
                betAmount.style.display = 'block';
            } else {
                betAmount.style.display = 'none';
            }
        }
        
        // Update the game navigation buttons based on what's selected
        this.updateGameNavigationVisibility();
    }

    updateGameNavigationVisibility() {
        // Only show navigation buttons for games that are selected
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        const wolfChecked = document.getElementById('gameWolf').checked;
        
        // Show/hide Murph button
        const navMurph = document.getElementById('navMurph');
        if (navMurph) {
            navMurph.style.display = murphChecked ? 'flex' : 'none';
        }
        
        // Show/hide Skins button
        const navSkins = document.getElementById('navSkins');
        if (navSkins) {
            navSkins.style.display = skinsChecked ? 'flex' : 'none';
        }
        
        // Show/hide KP button
        const navKP = document.getElementById('navKP');
        if (navKP) {
            navKP.style.display = kpChecked ? 'flex' : 'none';
        }
        
        // Show/hide Snake button
        const navSnake = document.getElementById('navSnake');
        if (navSnake) {
            navSnake.style.display = snakeChecked ? 'flex' : 'none';
        }
        
        // Show/hide Wolf button
        const navWolf = document.getElementById('navWolf');
        if (navWolf) {
            navWolf.style.display = wolfChecked ? 'flex' : 'none';
        }
    }

    startGame() {
        // Validate inputs
        if (!this.validateGameSetup()) return;
        
        // Get player information from PlayerManager
        this.requiredPlayers = this.playerManager.getRequiredPlayers();
        this.players = this.playerManager.getCurrentPlayerNames().slice(0, this.requiredPlayers);
        this.playerManager.setPlayers(this.players);
        
        // Get game configurations
        this.gameConfigs = {};
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        const wolfChecked = document.getElementById('gameWolf').checked;
        
        if (murphChecked) {
            this.gameConfigs.murph = {
                betAmount: parseFloat(document.getElementById('murphBet').value),
                enabled: true
            };
        }
        
        if (skinsChecked) {
            this.gameConfigs.skins = {
                betAmount: parseFloat(document.getElementById('skinsBet').value),
                enabled: true,
                teams: [],
                carryoverCount: 1 // Start with 1 skin
            };
            
            // Only set up teams if we have 4 players
            if (this.requiredPlayers === 4) {
                // Validate team selection
                if (!this.playerManager.validateTeamSelection()) {
                    this.ui.showNotification('Please select 4 different players for the two teams.', 'error');
                    return;
                }
                
                // Get team configuration from PlayerManager
                const teamConfig = this.playerManager.getTeamConfiguration();
                this.gameConfigs.skins.teams = teamConfig.teams;
                this.gameConfigs.skins.teamNames = teamConfig.teamNames;
            }
        }
        
        if (kpChecked) {
            this.gameConfigs.kp = {
                betAmount: parseFloat(document.getElementById('kpBet').value),
                enabled: true
            };
        }
        
        if (snakeChecked) {
            this.gameConfigs.snake = {
                betAmount: parseFloat(document.getElementById('snakeBet').value),
                enabled: true
            };
        }
        
        if (wolfChecked) {
            this.gameConfigs.wolf = {
                betAmount: parseFloat(document.getElementById('wolfBet').value),
                enabled: true
            };
        }
        
        // Initialize games using GameManager
        this.gameManager.initializeGames(this.gameConfigs, this.players, this.requiredPlayers);
        
        // Update legacy references
        this.gameActions = this.gameManager.gameActions;
        this.gameInstances = this.gameManager.gameInstances;
        this.gameStarted = this.gameManager.gameStarted;
        
        // Hide setup, show navigation
        document.getElementById('gameSetup').style.display = 'none';
        this.showPage('navigation');
        
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize hole navigation button states
        this.updatePreviousHoleButton();
        
        // Initialize game state
        this.updateGameDisplay();
        
        // Setup quick actions dashboard
        this.setupQuickActions();
        
        // Update navigation button visibility for selected games
        this.updateGameNavigationVisibility();
        

        
                // Auto-save game state
        this.saveGameState();

        // Track game start in analytics
        const selectedGames = Object.keys(this.gameConfigs);
        AnalyticsUtils.trackGameStart(selectedGames, this.requiredPlayers, this.gameConfigs);
        
        // Show success message
        this.ui.showNotification('Game started! Good luck!', 'success');
    }



    validateGameSetup() {
        // Use ValidationManager for comprehensive validation
        const validationResult = this.validator.validateGameSetup(this.playerManager, this.requiredPlayers);
        
        if (!validationResult.success) {
            // Show the first error message
            this.ui.showNotification(validationResult.errors[0], 'error');
            return false;
        }
        
        return true;
    }

    previousHole() {
        if (this.currentHole > 1) {
            this.currentHole--;
            
                    // Update hole display element
            const holeDisplayElement = document.getElementById('holeDisplay');
            
            if (holeDisplayElement) {
                holeDisplayElement.textContent = this.currentHole;
            } else {
                console.warn('holeDisplay element not found in previousHole');
            }
            
            // Update quick actions hole display
            const quickHoleDisplay = document.getElementById('quickHoleDisplay');
            if (quickHoleDisplay) {
                quickHoleDisplay.textContent = this.currentHole;
            }
            
            this.updatePreviousHoleButton();
            this.updateGameDisplay();
            
            // Auto-save game state
            this.saveGameState();
            
            this.ui.showNotification(`Moved back to hole ${this.currentHole}`, 'info');
        }
    }

    nextHole() {
        if (this.currentHole >= 18) {
            this.ui.showNotification('Maximum 18 holes reached. Game complete!', 'success');
            this.endGame();
            return;
        }
        
        this.currentHole++;
        
        // Update hole display element
        const holeDisplayElement = document.getElementById('holeDisplay');
        
        if (holeDisplayElement) {
            holeDisplayElement.textContent = this.currentHole;
        } else {
            console.warn('holeDisplay element not found in nextHole');
        }
        
        // Update quick actions hole display
        const quickHoleDisplay = document.getElementById('quickHoleDisplay');
        if (quickHoleDisplay) {
            quickHoleDisplay.textContent = this.currentHole;
        }
        
        this.updatePreviousHoleButton();
        this.updateGameDisplay();
        
        // Auto-save game state
        this.saveGameState();
        
        this.ui.showNotification(`Moving to hole ${this.currentHole}`, 'info');
    }

    updatePreviousHoleButton() {
        const previousButton = document.getElementById('previousHole');
        const nextButton = document.getElementById('nextHole');
        const completeBtn = document.getElementById('completeGame');
        
        previousButton.disabled = this.currentHole <= 1;
        
        if (this.currentHole >= 18) {
            // On hole 18: hide Next Hole, show Complete Game
            if (nextButton) {
                nextButton.style.display = 'none';
            }
            if (completeBtn) {
                completeBtn.style.display = 'inline-block';
            }
        } else {
            // On holes 1-17: show Next Hole, hide Complete Game
            if (nextButton) {
                nextButton.style.display = 'inline-block';
                nextButton.disabled = false;
                nextButton.style.opacity = '1';
            }
            if (completeBtn) {
                completeBtn.style.display = 'none';
            }
        }
    }

    endGame() {
        // Show final results page
        this.showPage('finalResults');
        
        // Update final results content
        this.updateFinalResults();
    }

    // Complete game flow from navigation at hole 18
    completeGameFlow() {
        // Show warning and get confirmation
        const confirmed = window.confirm('⚠️ WARNING: Completing the game will lock all results and prevent further edits.\n\nAre you sure you want to complete the game and view the final financial summary?');
        if (!confirmed) return;
        
        // Lock: disable all record buttons and navigation except Combined
        this.lockEdits();
        
        // Navigate to Combined page and render summary + payment instructions
        this.showPage('combined');
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        const target = document.getElementById('paymentInstructionsCombined');
        if (target) {
            SecurityUtils.setInnerHTML(target, this.generatePaymentInstructions());
        }
        
        // Show notification that game is complete
        this.ui.showNotification('Game complete! Results are locked. View Combined Total for payment instructions.', 'success');
    }

    lockEdits() {
        // disable game record buttons
        const ids = ['recordSkins', 'recordKP', 'recordSnake', 'callMurph'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.classList.add('disabled');
            }
        });
        // prevent opening modals
        // No-op since buttons are disabled; could also remove listeners if needed
    }

    updateFinalResults() {
        const container = document.getElementById('finalResultsContent');
        
        if (!container) return;
        
        let finalResultsHTML = '';
        
        // Game Summary Header
        finalResultsHTML += `
            <div class="final-header">
                <h2>🏆 Game Complete!</h2>
                <p class="final-subtitle">Final results for all games played</p>
            </div>
        `;
        
        // Individual Game Results
        if (this.gameConfigs.murph?.enabled && this.gameActions.murph.length > 0) {
            finalResultsHTML += this.generateMurphFinalSummary();
        }
        
        if (this.gameConfigs.skins?.enabled && this.gameActions.skins.length > 0) {
            finalResultsHTML += this.generateSkinsFinalSummary();
        }
        
        if (this.gameConfigs.kp?.enabled && this.gameActions.kp.length > 0) {
            finalResultsHTML += this.generateKPFinalSummary();
        }
        
        if (this.gameConfigs.snake?.enabled && this.gameActions.snake.length > 0) {
            finalResultsHTML += this.generateSnakeFinalSummary();
        }
        
        // Combined Final Summary
        finalResultsHTML += this.generateCombinedFinalSummary();
        
        // Payment Instructions
        finalResultsHTML += this.generatePaymentInstructions();
        
        SecurityUtils.setInnerHTML(container, finalResultsHTML);
    }

    generateMurphFinalSummary() {
        const murphSummary = this.calculateMurphSummary();
        let html = `
            <div class="final-game-section">
                <h3>🎯 Murph Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Calls:</span>
                        <span class="stat-value">${this.gameActions.murph.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.murph.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(murphSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateSkinsFinalSummary() {
        const skinsSummary = this.calculateSkinsSummary();
        const totalSkins = this.gameActions.skins.filter(skin => skin.winner !== 'carryover').length;
        const carryoverSkins = this.gameActions.skins.filter(skin => skin.winner === 'carryover').length;
        
        let html = `
            <div class="final-game-section">
                <h3>🏆 Skins Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Skins Won:</span>
                        <span class="stat-value">${totalSkins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Carryover Skins:</span>
                        <span class="stat-value">${carryoverSkins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.skins.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(skinsSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateKPFinalSummary() {
        const kpSummary = this.calculateKPSummary();
        const totalKPs = this.gameActions.kp.length;
        
        let html = `
            <div class="final-game-section">
                <h3>🎯 KP Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total KPs:</span>
                        <span class="stat-value">${totalKPs}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.kp.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(kpSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateSnakeFinalSummary() {
        const snakeSummary = this.calculateSnakeSummary();
        const totalSnakes = this.gameActions.snake.length;
        
        let html = `
            <div class="final-game-section">
                <h3>🐍 Snake Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Snakes:</span>
                        <span class="stat-value">${totalSnakes}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.snake.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(snakeSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateCombinedFinalSummary() {
        const gameSummaries = {};
        
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        if (this.gameConfigs.kp?.enabled) {
            gameSummaries.kp = this.calculateKPSummary();
        }
        
        if (this.gameConfigs.snake?.enabled) {
            gameSummaries.snake = this.calculateSnakeSummary();
        }
        
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        
        let html = `
            <div class="final-game-section final-combined">
                <h3>💰 Combined Final Results</h3>
                <div class="final-game-summary">
        `;
        
        Object.entries(combinedSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generatePaymentInstructions() {
        // Use GameManager to generate payment instructions
        return this.gameManager.generatePaymentInstructions();
    }

    // Murph Game Methods
    showMurphModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('murph', 'open');
        
        // Use UIManager to show modal
        this.ui.showMurphModal(this.players, this.currentHole);
        
        // Reset form
        this.ui.clearInput('murphResult');
    }

    hideMurphModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('murph', 'close');
        
        this.ui.hideMurphModal();
    }

    saveMurphCall() {
        const player = this.ui.getInputValue('murphPlayer');
        const hole = parseInt(this.ui.getInputValue('murphHole'));
        const result = this.ui.getInputValue('murphResult');
        
        // Use ValidationManager for input validation
        const validation = this.validator.validateMurphInput(player, hole, result);
        if (!validation.success) {
            this.ui.showNotification(validation.message, 'error');
            return;
        }
        
        // Create murph call
        const murphCall = {
            id: Date.now(),
            player: player,
            hole: hole,
            result: result,
            timestamp: new Date()
        };
        
        // Use game instance if available, fallback to legacy
        if (this.gameInstances.murph) {
            this.gameInstances.murph.addAction(murphCall);
        }
        
        // Also add to legacy for backwards compatibility
        this.gameActions.murph.push(murphCall);
        
        // Track modal save analytics
        AnalyticsUtils.trackGameAction('murph', 'modal_action', hole, {
            player: player,
            result: result
        });
        AnalyticsUtils.trackModalInteraction('murph', 'save');
        
        // Hide modal and update display
        this.hideMurphModal();
        this.updateGameDisplay();
        
        // Auto-save game state
        this.saveGameState();
        
        // Show result message
        const resultText = result === 'success' ? 'made it!' : 'error';
        this.ui.showNotification(`${player} called Murph on hole ${hole} and ${resultText}`, result === 'success' ? 'success' : 'error');
    }

    // Skins Game Methods
    showSkinsModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('skins', 'open');
        
        const modal = document.getElementById('skinsModal');
        const holeInput = document.getElementById('skinsHole');
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        // Handle different player counts

        
        if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames) {
            // 4 players: Show team options

            const winnerSelect = document.getElementById('skinsWinner');
            winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select result...';
        winnerSelect.appendChild(defaultOption);
            
            // Add team options
            const team1Option = document.createElement('option');
            team1Option.value = 'team1';
            team1Option.textContent = this.gameConfigs.skins.teamNames.team1;
            winnerSelect.appendChild(team1Option);
            
            const team2Option = document.createElement('option');
            team2Option.value = 'team2';
            team2Option.textContent = this.gameConfigs.skins.teamNames.team2;
            winnerSelect.appendChild(team2Option);
            
            // Add carryover option
            const carryoverOption = document.createElement('option');
            carryoverOption.value = 'carryover';
            carryoverOption.textContent = 'Carryover (No Winner)';
            winnerSelect.appendChild(carryoverOption);
        } else {

            // 2-3 players: Show individual player options
            const winnerSelect = document.getElementById('skinsWinner');
            winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select winner...';
        winnerSelect.appendChild(defaultOption);
            
            this.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                winnerSelect.appendChild(option);
            });
            
            // Add carryover option
            const carryoverOption = document.createElement('option');
            carryoverOption.value = 'carryover';
            carryoverOption.textContent = 'No Winner (Carryover)';
            winnerSelect.appendChild(carryoverOption);
        }
        
        // Update carryover count
        if (this.gameConfigs.skins?.carryoverCount) {
            document.getElementById('skinsCarryoverCount').value = this.gameConfigs.skins.carryoverCount;
        }
        
        // Reset form
        document.getElementById('skinsWinner').value = '';
        
        modal.style.display = 'flex';
    }

    hideSkinsModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('skins', 'close');
        
        document.getElementById('skinsModal').style.display = 'none';
    }

    saveSkinsAction() {
        const hole = parseInt(document.getElementById('skinsHole').value);
        const winner = document.getElementById('skinsWinner').value;
        
        // Use ValidationManager for input validation
        const validation = this.validator.validateSkinsInput(winner, hole);
        if (!validation.success) {
            this.ui.showNotification(validation.message, 'error');
            return;
        }
        
        // Get current carryover count
        const currentCarryover = this.gameConfigs.skins.carryoverCount;
        
        // Create skins action
        const skinsAction = {
            id: Date.now(),
            hole: hole,
            winner: winner,
            skinsWon: winner === 'carryover' ? 0 : currentCarryover,
            carryoverCount: currentCarryover,
            timestamp: new Date()
        };
        
        this.gameActions.skins.push(skinsAction);
        
        // Also add to game instance if it exists
        if (this.gameInstances && this.gameInstances.skins) {
            this.gameInstances.skins.addAction(skinsAction);
        }
        
        // Update carryover count based on result
        if (winner === 'carryover') {
            this.gameConfigs.skins.carryoverCount += 1;
        } else {
            // Reset carryover count when someone wins
            this.gameConfigs.skins.carryoverCount = 1;
        }
        
        // Track modal save analytics
        AnalyticsUtils.trackGameAction('skins', 'modal_action', hole, {
            winner: winner,
            carryoverCount: currentCarryover
        });
        AnalyticsUtils.trackModalInteraction('skins', 'save');
        
        // Auto-save game state
        this.saveGameState();
        
        // Hide modal and update display
        this.hideSkinsModal();
        this.updateGameDisplay();
        
        // Show result message
        if (winner === 'carryover') {
            this.ui.showNotification(`Hole ${hole}: No winner - ${this.gameConfigs.skins.carryoverCount} skins now carrying over`, 'info');
        } else {
            if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames && (winner === 'team1' || winner === 'team2')) {
                // 4 players: Show team names
                const winningTeam = winner === 'team1' ? this.gameConfigs.skins.teamNames.team1 : this.gameConfigs.skins.teamNames.team2;
                this.ui.showNotification(`${winningTeam} won ${currentCarryover} skin${currentCarryover > 1 ? 's' : ''} on hole ${hole}`, 'success');
            } else {
                // 2-3 players: Show individual player name
                this.ui.showNotification(`${winner} won ${currentCarryover} skin${currentCarryover > 1 ? 's' : ''} on hole ${hole}`, 'success');
            }
        }
    }

    // KP Game Methods
    showKPModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('kp', 'open');
        
        const modal = document.getElementById('kpModal');
        const playerSelect = document.getElementById('kpWinner');
        const holeInput = document.getElementById('kpHole');
        
        // Populate player select
        playerSelect.innerHTML = '<option value="">Select player...</option>';
        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        modal.style.display = 'flex';
    }

    hideKPModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('kp', 'close');
        
        document.getElementById('kpModal').style.display = 'none';
    }

    saveKPAction() {
        const hole = parseInt(document.getElementById('kpHole').value);
        const winner = document.getElementById('kpWinner').value;
        
        // Use ValidationManager for input validation
        const validation = this.validator.validateKPInput(winner, hole);
        if (!validation.success) {
            this.ui.showNotification(validation.message, 'error');
            return;
        }
        
        // Create KP action
        const kpAction = {
            id: Date.now(),
            hole: hole,
            winner: winner,
            timestamp: new Date()
        };
        
        this.gameActions.kp.push(kpAction);
        
        // Also add to game instance if it exists
        if (this.gameInstances && this.gameInstances.kp) {
            this.gameInstances.kp.addAction(kpAction);
        }
        
        // Track modal save analytics
        AnalyticsUtils.trackGameAction('kp', 'modal_action', hole, {
            winner: winner
        });
        AnalyticsUtils.trackModalInteraction('kp', 'save');
        
        // Auto-save game state
        this.saveGameState();
        
        // Hide modal and update display
        this.hideKPModal();
        this.updateGameDisplay();
        
        // Show result message
        this.ui.showNotification(`${winner} got closest to the pin on hole ${hole}!`, 'success');
    }

    // Snake Game Methods
    showSnakeModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('snake', 'open');
        
        const modal = document.getElementById('snakeModal');
        const playerSelect = document.getElementById('snakePlayer');
        const holeInput = document.getElementById('snakeHole');
        
        // Populate player select
        playerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select player...';
        playerSelect.appendChild(defaultOption);
        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        modal.style.display = 'flex';
    }

    hideSnakeModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('snake', 'close');
        
        document.getElementById('snakeModal').style.display = 'none';
    }

    saveSnakeAction() {
        const hole = parseInt(document.getElementById('snakeHole').value);
        const player = document.getElementById('snakePlayer').value;
        
        // Use ValidationManager for input validation
        const validation = this.validator.validateSnakeInput(player, hole);
        if (!validation.success) {
            this.ui.showNotification(validation.message, 'error');
            return;
        }
        
        // Create snake action
        const snakeAction = {
            id: Date.now(),
            hole: hole,
            player: player,
            timestamp: new Date()
        };
        
        this.gameActions.snake.push(snakeAction);
        
        // Also add to game instance if it exists
        if (this.gameInstances && this.gameInstances.snake) {
            this.gameInstances.snake.addAction(snakeAction);
        }
        
        // Track modal save analytics
        AnalyticsUtils.trackGameAction('snake', 'modal_action', hole, {
            player: player
        });
        AnalyticsUtils.trackModalInteraction('snake', 'save');
        
        // Auto-save game state
        this.saveGameState();
        
        // Hide modal and update display
        this.hideSnakeModal();
        this.updateGameDisplay();
        
        // Show result message
        this.ui.showNotification(`${player} got a snake on hole ${hole}!`, 'success');
    }

    // Wolf Game Methods
    showWolfModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('wolf', 'open');
        
        const modal = document.getElementById('wolfModal');
        const holeInput = document.getElementById('wolfHole');
        const wolfPlayerSelect = document.getElementById('wolfPlayer');
        const wolfChoiceSelect = document.getElementById('wolfChoice');
        const partnerSelect = document.getElementById('wolfPartner');
        const resultSelect = document.getElementById('wolfResult');
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        // Populate wolf player options (should be the current wolf for this hole)
        wolfPlayerSelect.innerHTML = '';
        const defaultWolfOption = document.createElement('option');
        defaultWolfOption.value = '';
        defaultWolfOption.textContent = 'Select Wolf...';
        wolfPlayerSelect.appendChild(defaultWolfOption);
        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            wolfPlayerSelect.appendChild(option);
        });
        
        // Set default wolf based on rotation
        if (this.gameInstances.wolf) {
            const currentWolf = this.gameInstances.wolf.getCurrentWolf(this.currentHole);
            if (currentWolf) {
                wolfPlayerSelect.value = currentWolf.player;
            }
        }
        
        // Initially hide partner field and make it not required
        const partnerGroup = document.getElementById('wolfPartnerGroup');
        partnerGroup.style.display = 'none';
        partnerSelect.required = false;
        
        // Populate partner options
        partnerSelect.innerHTML = '';
        const defaultPartnerOption = document.createElement('option');
        defaultPartnerOption.value = '';
        defaultPartnerOption.textContent = 'Select Partner...';
        partnerSelect.appendChild(defaultPartnerOption);
        this.players.forEach(player => {
            if (player !== wolfPlayerSelect.value) {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                partnerSelect.appendChild(option);
            }
        });
        
        // Add event listener for wolf choice change
        wolfChoiceSelect.addEventListener('change', () => {
            const partnerGroup = document.getElementById('wolfPartnerGroup');
            if (wolfChoiceSelect.value === 'partner') {
                partnerGroup.style.display = 'block';
                partnerSelect.required = true;
                // Repopulate partner options when switching to partner mode
                partnerSelect.innerHTML = '';
                const defaultPartnerOption = document.createElement('option');
                defaultPartnerOption.value = '';
                defaultPartnerOption.textContent = 'Select Partner...';
                partnerSelect.appendChild(defaultPartnerOption);
                this.players.forEach(player => {
                    if (player !== wolfPlayerSelect.value) {
                        const option = document.createElement('option');
                        option.value = player;
                        option.textContent = player;
                        partnerSelect.appendChild(option);
                    }
                });
            } else {
                partnerGroup.style.display = 'none';
                partnerSelect.required = false;
                partnerSelect.value = '';
            }
        });
        
        // Add event listener for wolf player change to update partner options
        wolfPlayerSelect.addEventListener('change', () => {
            // Repopulate partner options excluding the selected wolf
            partnerSelect.innerHTML = '';
            const defaultPartnerOption = document.createElement('option');
            defaultPartnerOption.value = '';
            defaultPartnerOption.textContent = 'Select Partner...';
            partnerSelect.appendChild(defaultPartnerOption);
            this.players.forEach(player => {
                if (player !== wolfPlayerSelect.value) {
                    const option = document.createElement('option');
                    option.value = player;
                    option.textContent = player;
                    partnerSelect.appendChild(option);
                }
            });
        });
        
        // Show modal
        modal.style.display = 'block';
    }

    hideWolfModal() {
        // Track modal interaction
        AnalyticsUtils.trackModalInteraction('wolf', 'close');
        
        const modal = document.getElementById('wolfModal');
        modal.style.display = 'none';
        
        // Clear form
        document.getElementById('wolfHole').value = '';
        document.getElementById('wolfPlayer').selectedIndex = 0;
        document.getElementById('wolfChoice').selectedIndex = 0;
        document.getElementById('wolfPartner').selectedIndex = 0;
        document.getElementById('wolfResult').selectedIndex = 0;
    }

    saveWolfAction() {
        const hole = parseInt(document.getElementById('wolfHole').value);
        const wolf = document.getElementById('wolfPlayer').value;
        const wolfChoice = document.getElementById('wolfChoice').value;
        const partner = document.getElementById('wolfPartner').value;
        const result = document.getElementById('wolfResult').value;
        
        // Form values captured
        
        // Basic validation
        if (!hole || !wolf || !wolfChoice || !result) {
            this.ui.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate partner is selected if not lone wolf
        if (wolfChoice === 'partner' && !partner) {
            this.ui.showNotification('Please select a partner.', 'error');
            return;
        }
        
        // Create wolf action
        const wolfAction = {
            id: Date.now(),
            hole: hole,
            wolf: wolf,
            wolfChoice: wolfChoice,
            partner: wolfChoice === 'partner' ? partner : null,
            result: result,
            timestamp: new Date()
        };
        
        // Add to game instance if it exists
        if (this.gameInstances && this.gameInstances.wolf) {
            this.gameInstances.wolf.addAction(wolfAction);
        }
        
        // Also add to legacy for backwards compatibility
        this.gameActions.wolf.push(wolfAction);
        // Wolf action added to legacy system
        
        // Track modal save analytics
        AnalyticsUtils.trackGameAction('wolf', 'modal_action', hole, {
            wolf: wolf,
            wolfChoice: wolfChoice,
            partner: partner,
            result: result
        });
        AnalyticsUtils.trackModalInteraction('wolf', 'save');
        
        // Auto-save game state
        this.saveGameState();
        
        // Hide modal and update display
        this.hideWolfModal();
        this.updateGameDisplay();
        
        // Show result message
        const resultText = result === 'wolf_wins' ? 'won' : 'lost';
        const choiceText = wolfChoice === 'lone_wolf' ? 'Lone Wolf' : `Wolf + ${wolfAction.partner}`;
        this.ui.showNotification(`${choiceText} ${resultText} on hole ${hole}!`, 'success');
    }

    updateGameDisplay() {

        
        // Update navigation status
        this.updateNavigationStatus();
        
        // Update quick actions status
        this.updateQuickActionsStatus();
        
        // Update current page if it's visible and the game is enabled
        if (this.currentPage === 'murph' && this.gameConfigs.murph?.enabled) {
            this.updateMurphPage();
        } else if (this.currentPage === 'skins' && this.gameConfigs.skins?.enabled) {
            this.updateSkinsPage();
        } else if (this.currentPage === 'kp' && this.gameConfigs.kp?.enabled) {
            this.updateKPPage();
        } else if (this.currentPage === 'snake' && this.gameConfigs.snake?.enabled) {
            this.updateSnakePage();
        } else if (this.currentPage === 'wolf' && this.gameConfigs.wolf?.enabled) {
            this.updateWolfPage();
        } else if (this.currentPage === 'combined') {
            this.updateCombinedPage();
        }
    }

    updateNavigationStatus() {

        
        // Update Murph status and styling
        if (this.gameConfigs.murph?.enabled) {
            const murphCount = this.gameActions.murph.length;
    
            const murphStatus = document.getElementById('murphStatus');
            if (murphStatus) {
                murphStatus.textContent = `${murphCount} call${murphCount !== 1 ? 's' : ''}`;
        
            } else {
                console.warn('Murph status element not found');
            }
            // Add selected class to Murph button
            const murphBtn = document.getElementById('navMurph');
            if (murphBtn) {
                murphBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Murph button
            const murphBtn = document.getElementById('navMurph');
            if (murphBtn) {
                murphBtn.classList.remove('selected');
            }
        }
        
        // Update Skins status and styling
        if (this.gameConfigs.skins?.enabled) {
            const skinsCount = this.gameActions.skins.length;
            const skinsStatus = document.getElementById('skinsStatus');
            if (skinsStatus) {
                skinsStatus.textContent = `${skinsCount} skin${skinsCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Skins button
            const skinsBtn = document.getElementById('navSkins');
            if (skinsBtn) {
                skinsBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Skins button
            const skinsBtn = document.getElementById('navSkins');
            if (skinsBtn) {
                skinsBtn.classList.remove('selected');
            }
        }
        
        // Update KP status and styling
        if (this.gameConfigs.kp?.enabled) {
            const kpCount = this.gameActions.kp.length;
            const kpStatus = document.getElementById('kpStatus');
            if (kpStatus) {
                kpStatus.textContent = `${kpCount} KP${kpCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to KP button
            const kpBtn = document.getElementById('navKP');
            if (kpBtn) {
                kpBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from KP button
            const kpBtn = document.getElementById('navKP');
            if (kpBtn) {
                kpBtn.classList.remove('selected');
            }
        }
        
        // Update Snake status and styling
        if (this.gameConfigs.snake?.enabled) {
            const snakeCount = this.gameActions.snake.length;
            const snakeStatus = document.getElementById('snakeStatus');
            if (snakeStatus) {
                snakeStatus.textContent = `${snakeCount} snake${snakeCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Snake button
            const snakeBtn = document.getElementById('navSnake');
            if (snakeBtn) {
                snakeBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Snake button
            const snakeBtn = document.getElementById('navSnake');
            if (snakeBtn) {
                snakeBtn.classList.remove('selected');
            }
        }
        
        // Update Wolf status and styling
        if (this.gameConfigs.wolf?.enabled) {
            const wolfCount = this.gameActions.wolf.length;
            const wolfStatus = document.getElementById('wolfStatus');
            if (wolfStatus) {
                wolfStatus.textContent = `${wolfCount} hole${wolfCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Wolf button
            const wolfBtn = document.getElementById('navWolf');
            if (wolfBtn) {
                wolfBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Wolf button
            const wolfBtn = document.getElementById('navWolf');
            if (wolfBtn) {
                wolfBtn.classList.remove('selected');
            }
        }
    }

    updateMurphActionsList() {
        const container = document.getElementById('murphActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.murph.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.style.textAlign = 'center';
            noDataP.style.color = '#7f8c8d';
            noDataP.style.fontStyle = 'italic';
            noDataP.textContent = 'No Murph calls yet';
            container.appendChild(noDataP);
            return;
        }
        
        // Group by hole
        const callsByHole = {};
        this.gameActions.murph.forEach(call => {
            if (!callsByHole[call.hole]) {
                callsByHole[call.hole] = [];
            }
            callsByHole[call.hole].push(call);
        });
        
        // Display by hole
        Object.keys(callsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            
            const holeH5 = document.createElement('h5');
            holeH5.style.margin = '16px 0 8px 0';
            holeH5.style.color = '#2c3e50';
            holeH5.textContent = `Hole ${hole}`;
            holeDiv.appendChild(holeH5);
            
            callsByHole[hole].forEach(call => {
                const callDiv = document.createElement('div');
                callDiv.className = `game-action-item ${call.result}`;
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'game-action-header';
                
                const playerSpan = document.createElement('span');
                playerSpan.className = 'game-action-player';
                playerSpan.textContent = SecurityUtils.sanitizeInput(call.player);
                
                const holeSpan = document.createElement('span');
                holeSpan.className = 'game-action-hole';
                holeSpan.textContent = `Hole ${SecurityUtils.sanitizeInput(call.hole)}`;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete this Murph call';
                deleteBtn.onclick = () => this.deleteMurphCall(call.id);
                
                headerDiv.appendChild(playerSpan);
                headerDiv.appendChild(holeSpan);
                headerDiv.appendChild(deleteBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = `game-action-result ${call.result}`;
                resultDiv.textContent = call.result === 'success' ? '✅ Made it!' : '❌ Failed';
                
                callDiv.appendChild(headerDiv);
                callDiv.appendChild(resultDiv);
                holeDiv.appendChild(callDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateSkinsActionsList() {
        const container = document.getElementById('skinsActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.skins.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.style.textAlign = 'center';
            noDataP.style.color = '#7f8c8d';
            noDataP.style.fontStyle = 'italic';
            noDataP.textContent = 'No Skins recorded yet';
            container.appendChild(noDataP);
            return;
        }
        
        // Group by hole
        const skinsByHole = {};
        this.gameActions.skins.forEach(skin => {
            if (!skinsByHole[skin.hole]) {
                skinsByHole[skin.hole] = [];
            }
            skinsByHole[skin.hole].push(skin);
        });
        
        // Display by hole
        Object.keys(skinsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            
            const holeH5 = document.createElement('h5');
            holeH5.style.margin = '16px 0 8px 0';
            holeH5.style.color = '#2c3e50';
            holeH5.textContent = `Hole ${hole}`;
            holeDiv.appendChild(holeH5);
            
            skinsByHole[hole].forEach(skin => {
                const skinDiv = document.createElement('div');
                skinDiv.className = `game-action-item ${skin.winner === 'carryover' ? 'neutral' : 'success'}`;
                
                let resultText = '';
                if (skin.winner === 'carryover') {
                    resultText = `Carryover - ${skin.carryoverCount} skin${skin.carryoverCount > 1 ? 's' : ''} at stake`;
                } else if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames && (skin.winner === 'team1' || skin.winner === 'team2')) {
                    // 4 players: Show team names
                    if (skin.winner === 'team1') {
                        resultText = `${SecurityUtils.sanitizeInput(this.gameConfigs.skins.teamNames.team1)} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                    } else {
                        resultText = `${SecurityUtils.sanitizeInput(this.gameConfigs.skins.teamNames.team2)} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                    }
                } else {
                    // 2-3 players: Show individual player name
                    resultText = `${SecurityUtils.sanitizeInput(skin.winner)} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                }
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'game-action-header';
                
                const playerSpan = document.createElement('span');
                playerSpan.className = 'game-action-player';
                playerSpan.textContent = `Hole ${SecurityUtils.sanitizeInput(skin.hole)}`;
                
                const holeSpan = document.createElement('span');
                holeSpan.className = 'game-action-hole';
                holeSpan.textContent = 'Skins';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete this Skins action';
                deleteBtn.onclick = () => this.deleteSkinsAction(skin.id);
                
                headerDiv.appendChild(playerSpan);
                headerDiv.appendChild(holeSpan);
                headerDiv.appendChild(deleteBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = `game-action-result ${skin.winner === 'carryover' ? 'neutral' : 'success'}`;
                resultDiv.textContent = resultText;
                
                skinDiv.appendChild(headerDiv);
                skinDiv.appendChild(resultDiv);
                holeDiv.appendChild(skinDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateKPActionsList() {
        const container = document.getElementById('kpActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.kp.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.style.textAlign = 'center';
            noDataP.style.color = '#7f8c8d';
            noDataP.style.fontStyle = 'italic';
            noDataP.textContent = 'No KPs recorded yet';
            container.appendChild(noDataP);
            return;
        }
        
        // Group by hole
        const kpsByHole = {};
        this.gameActions.kp.forEach(kp => {
            if (!kpsByHole[kp.hole]) {
                kpsByHole[kp.hole] = [];
            }
            kpsByHole[kp.hole].push(kp);
        });
        
        // Display by hole
        Object.keys(kpsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            
            const holeH5 = document.createElement('h5');
            holeH5.style.margin = '16px 0 8px 0';
            holeH5.style.color = '#2c3e50';
            holeH5.textContent = `Hole ${hole}`;
            holeDiv.appendChild(holeH5);
            
            kpsByHole[hole].forEach(kp => {
                const kpDiv = document.createElement('div');
                kpDiv.className = 'game-action-item success';
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'game-action-header';
                
                const playerSpan = document.createElement('span');
                playerSpan.className = 'game-action-player';
                playerSpan.textContent = SecurityUtils.sanitizeInput(kp.winner);
                
                const holeSpan = document.createElement('span');
                holeSpan.className = 'game-action-hole';
                holeSpan.textContent = `Hole ${SecurityUtils.sanitizeInput(kp.hole)}`;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete this KP action';
                deleteBtn.onclick = () => this.deleteKPAction(kp.id);
                
                headerDiv.appendChild(playerSpan);
                headerDiv.appendChild(holeSpan);
                headerDiv.appendChild(deleteBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'game-action-result success';
                resultDiv.textContent = '🎯 Closest to the Pin';
                
                kpDiv.appendChild(headerDiv);
                kpDiv.appendChild(resultDiv);
                holeDiv.appendChild(kpDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateSnakeActionsList() {
        const container = document.getElementById('snakeActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.snake.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.style.textAlign = 'center';
            noDataP.style.color = '#7f8c8d';
            noDataP.style.fontStyle = 'italic';
            noDataP.textContent = 'No snakes recorded yet';
            container.appendChild(noDataP);
            return;
        }
        
        // Group by hole
        const snakesByHole = {};
        this.gameActions.snake.forEach(snake => {
            if (!snakesByHole[snake.hole]) {
                snakesByHole[snake.hole] = [];
            }
            snakesByHole[snake.hole].push(snake);
        });
        
        // Display by hole
        Object.keys(snakesByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            
            const holeH5 = document.createElement('h5');
            holeH5.style.margin = '16px 0 8px 0';
            holeH5.style.color = '#2c3e50';
            holeH5.textContent = `Hole ${hole}`;
            holeDiv.appendChild(holeH5);
            
            snakesByHole[hole].forEach(snake => {
                const snakeDiv = document.createElement('div');
                snakeDiv.className = 'game-action-item error';
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'game-action-header';
                
                const playerSpan = document.createElement('span');
                playerSpan.className = 'game-action-player';
                playerSpan.textContent = SecurityUtils.sanitizeInput(snake.player);
                
                const holeSpan = document.createElement('span');
                holeSpan.className = 'game-action-hole';
                holeSpan.textContent = `Hole ${SecurityUtils.sanitizeInput(snake.hole)}`;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete this Snake action';
                deleteBtn.onclick = () => this.deleteSnakeAction(snake.id);
                
                headerDiv.appendChild(playerSpan);
                headerDiv.appendChild(holeSpan);
                headerDiv.appendChild(deleteBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'game-action-result error';
                resultDiv.textContent = '🐍 Snake';
                
                snakeDiv.appendChild(headerDiv);
                snakeDiv.appendChild(resultDiv);
                holeDiv.appendChild(snakeDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateWolfActionsList() {
        const container = document.getElementById('wolfActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.wolf.length === 0) {
            const noDataP = document.createElement('p');
            noDataP.style.textAlign = 'center';
            noDataP.style.color = '#7f8c8d';
            noDataP.style.fontStyle = 'italic';
            noDataP.textContent = 'No Wolf holes recorded yet';
            container.appendChild(noDataP);
            return;
        }
        
        // Group by hole
        const wolfByHole = {};
        this.gameActions.wolf.forEach(wolf => {
            if (!wolfByHole[wolf.hole]) {
                wolfByHole[wolf.hole] = [];
            }
            wolfByHole[wolf.hole].push(wolf);
        });
        
        // Display by hole
        Object.keys(wolfByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            
            const holeH5 = document.createElement('h5');
            holeH5.style.margin = '16px 0 8px 0';
            holeH5.style.color = '#2c3e50';
            holeH5.textContent = `Hole ${hole}`;
            holeDiv.appendChild(holeH5);
            
            wolfByHole[hole].forEach(wolf => {
                const wolfDiv = document.createElement('div');
                wolfDiv.className = `game-action-item ${wolf.result === 'wolf_wins' ? 'success' : 'error'}`;
                
                let resultText = '';
                if (wolf.wolfChoice === 'lone_wolf') {
                    if (wolf.result === 'wolf_wins') {
                        resultText = '🐺 Lone Wolf Wins!';
                    } else {
                        resultText = '🐺 Lone Wolf Loses';
                    }
                } else {
                    if (wolf.result === 'wolf_wins') {
                        resultText = `🐺 Wolf + ${SecurityUtils.sanitizeInput(wolf.partner)} Win!`;
                    } else {
                        resultText = `🐺 Wolf + ${SecurityUtils.sanitizeInput(wolf.partner)} Lose`;
                    }
                }
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'game-action-header';
                
                const playerSpan = document.createElement('span');
                playerSpan.className = 'game-action-player';
                playerSpan.textContent = SecurityUtils.sanitizeInput(wolf.wolf);
                
                const holeSpan = document.createElement('span');
                holeSpan.className = 'game-action-hole';
                holeSpan.textContent = `Hole ${SecurityUtils.sanitizeInput(wolf.hole)}`;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Delete this Wolf action';
                deleteBtn.onclick = () => this.deleteWolfAction(wolf.id);
                
                headerDiv.appendChild(playerSpan);
                headerDiv.appendChild(holeSpan);
                headerDiv.appendChild(deleteBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = `game-action-result ${wolf.result === 'wolf_wins' ? 'success' : 'error'}`;
                resultDiv.textContent = resultText;
                
                wolfDiv.appendChild(headerDiv);
                wolfDiv.appendChild(resultDiv);
                holeDiv.appendChild(wolfDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateMurphSummary() {
        const container = document.getElementById('murphSummary');
        
        if (this.gameActions.murph.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Murph calls yet</p>';
            return;
        }
        
        const summary = this.calculateMurphSummary();
        this.displaySummary(container, summary);
    }

    updateSkinsSummary() {
        const container = document.getElementById('skinsSummary');
        
        if (this.gameActions.skins.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Skins recorded yet</p>';
            return;
        }
        
        const summary = this.calculateSkinsSummary();
        this.displaySummary(container, summary);
    }

    updateKPSummary() {
        const container = document.getElementById('kpSummary');
        
        if (this.gameActions.kp.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No KPs recorded yet</p>';
            return;
        }
        
        const summary = this.calculateKPSummary();
        this.displaySummary(container, summary);
    }

    updateSnakeSummary() {
        const container = document.getElementById('snakeSummary');
        
        if (this.gameActions.snake.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No snakes recorded yet</p>';
            return;
        }
        
        const summary = this.calculateSnakeSummary();
        this.displaySummary(container, summary);
    }

    updateWolfSummary() {
        const container = document.getElementById('wolfSummary');
        
        if (this.gameActions.wolf.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Wolf holes recorded yet</p>';
            return;
        }
        
        const summary = this.calculateWolfSummary();
        this.displaySummary(container, summary);
    }

    displaySummary(container, summary) {
        container.innerHTML = '';
        
        Object.entries(summary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            
            const playerSpan = document.createElement('span');
            playerSpan.className = 'summary-player';
            playerSpan.textContent = SecurityUtils.sanitizeInput(player);
            
            const amountSpan = document.createElement('span');
            amountSpan.className = `summary-amount ${balanceClass}`;
            amountSpan.textContent = balanceText;
            
            summaryItem.appendChild(playerSpan);
            summaryItem.appendChild(amountSpan);
            container.appendChild(summaryItem);
        });
    }

    updateCombinedSummary() {
        const container = document.getElementById('combinedSummary');
        
        if (this.gameActions.murph.length === 0 && this.gameActions.skins.length === 0 && this.gameActions.kp.length === 0 && this.gameActions.snake.length === 0 && this.gameActions.wolf.length === 0) {
            const noActivityP = document.createElement('p');
            noActivityP.style.textAlign = 'center';
            noActivityP.style.color = '#7f8c8d';
            noActivityP.style.fontStyle = 'italic';
            noActivityP.textContent = 'No activity yet';
            container.appendChild(noActivityP);
            return;
        }
        
        // Calculate combined summary
        const gameSummaries = {};
        
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        if (this.gameConfigs.kp?.enabled) {
            gameSummaries.kp = this.calculateKPSummary();
        }
        
        if (this.gameConfigs.snake?.enabled) {
            gameSummaries.snake = this.calculateSnakeSummary();
        }
        
        if (this.gameConfigs.wolf?.enabled) {
            gameSummaries.wolf = this.calculateWolfSummary();
        }
        
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        this.displaySummary(container, combinedSummary);
    }

    updateGameBreakdowns() {
        // Update Murph breakdown
        const murphBreakdownSection = document.getElementById('murphBreakdownSection');
        if (this.gameConfigs.murph?.enabled) {
            if (murphBreakdownSection) {
                murphBreakdownSection.style.display = 'block';
            }
            const murphBreakdown = document.getElementById('murphBreakdown');
            if (murphBreakdown) {
                const summary = this.calculateMurphSummary();
                this.displaySummary(murphBreakdown, summary);
            }
        } else {
            if (murphBreakdownSection) {
                murphBreakdownSection.style.display = 'none';
            }
        }
        
        // Update Skins breakdown
        const skinsBreakdownSection = document.getElementById('skinsBreakdownSection');
        if (this.gameConfigs.skins?.enabled) {
            if (skinsBreakdownSection) {
                skinsBreakdownSection.style.display = 'block';
            }
            const skinsBreakdown = document.getElementById('skinsBreakdown');
            if (skinsBreakdown) {
                const summary = this.calculateSkinsSummary();
                this.displaySummary(skinsBreakdown, summary);
            }
        } else {
            if (skinsBreakdownSection) {
                skinsBreakdownSection.style.display = 'none';
            }
        }
        
        // Update KP breakdown
        const kpBreakdownSection = document.getElementById('kpBreakdownSection');
        if (this.gameConfigs.kp?.enabled) {
            if (kpBreakdownSection) {
                kpBreakdownSection.style.display = 'block';
            }
            const kpBreakdown = document.getElementById('kpBreakdown');
            if (kpBreakdown) {
                const summary = this.calculateKPSummary();
                this.displaySummary(kpBreakdown, summary);
            }
        } else {
            if (kpBreakdownSection) {
                kpBreakdownSection.style.display = 'none';
            }
        }
        
        // Update Snake breakdown
        const snakeBreakdownSection = document.getElementById('snakeBreakdownSection');
        if (this.gameConfigs.snake?.enabled) {
            if (snakeBreakdownSection) {
                snakeBreakdownSection.style.display = 'block';
            }
            const snakeBreakdown = document.getElementById('snakeBreakdown');
            if (snakeBreakdown) {
                const summary = this.calculateSnakeSummary();
                this.displaySummary(snakeBreakdown, summary);
            }
        } else {
            if (snakeBreakdownSection) {
                snakeBreakdownSection.style.display = 'none';
            }
        }
        
        // Update Wolf breakdown
        const wolfBreakdownSection = document.getElementById('wolfBreakdownSection');
        if (this.gameConfigs.wolf?.enabled) {
            if (wolfBreakdownSection) {
                wolfBreakdownSection.style.display = 'block';
            }
            const wolfBreakdown = document.getElementById('wolfBreakdown');
            if (wolfBreakdown) {
                const summary = this.calculateWolfSummary();
                this.displaySummary(wolfBreakdown, summary);
            }
        } else {
            if (wolfBreakdownSection) {
                wolfBreakdownSection.style.display = 'none';
            }
        }
    }

    displaySummary(container, summary) {
        let summaryHTML = '';
        
        Object.entries(summary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            summaryHTML += `
                <div class="summary-item">
                    <span class="summary-player">${player}</span>
                    <span class="summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        container.innerHTML = summaryHTML;
    }

    calculateMurphSummary() {
        return this.gameManager.calculateGameSummary(GAME_TYPES.MURPH);
    }

    calculateSkinsSummary() {
        return this.gameManager.calculateGameSummary(GAME_TYPES.SKINS);
    }

    calculateKPSummary() {
        return this.gameManager.calculateGameSummary(GAME_TYPES.KP);
    }

    calculateSnakeSummary() {
        return this.gameManager.calculateGameSummary(GAME_TYPES.SNAKE);
    }

    calculateWolfSummary() {
        // Use legacy system since the game instance has action persistence issues
        return this.gameManager.calculateLegacyWolfSummary();
    }



    calculateCombinedSummary(gameSummaries) {
        // If no gameSummaries provided, use GameManager to calculate
        if (!gameSummaries) {
            return this.gameManager.calculateCombinedSummary();
        }
        
        // Legacy method for backwards compatibility
        const combinedBalances = {};
        this.players.forEach(player => {
            combinedBalances[player] = 0;
        });
        
        Object.values(gameSummaries).forEach(summary => {
            Object.entries(summary).forEach(([player, balance]) => {
                combinedBalances[player] += balance;
            });
        });
        
        return combinedBalances;
    }



    resetGame() {
        // Show confirmation dialog before clearing saved game
        const confirmed = window.confirm('This will start a fresh game and clear any saved progress. Are you sure?');
        if (!confirmed) return;
        
        // Clear saved game state from localStorage
        this.storage.clearGameState();
        
        // Reset using managers
        this.gameManager.resetGames();
        this.playerManager.reset();
        
        // Update legacy references
        this.players = [];
        this.gameConfigs = {};
        this.gameActions = this.gameManager.gameActions;
        this.gameStarted = this.gameManager.gameStarted;
        this.currentHole = 1;
        this.currentPage = 'navigation';
        this.requiredPlayers = DEFAULTS.PLAYER_COUNT; // Reset to default 4 players
        

        
        // Reset form inputs (with null checks)
        const betInputs = [
            { id: 'murphBet', value: '1.00' },
            { id: 'skinsBet', value: '1.00' },
            { id: 'kpBet', value: '1.00' },
            { id: 'snakeBet', value: '1.00' },
            { id: 'wolfBet', value: '1.00' }
        ];
        
        betInputs.forEach(({ id, value }) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        });
        
        const gameCheckboxes = [
            'gameMurph', 'gameSkins', 'gameKP', 'gameSnake'
        ];
        
        gameCheckboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        
        // Reset player inputs
        const playerInputs = document.querySelectorAll('.player-input input');
        if (playerInputs.length > 0) {
            playerInputs.forEach(input => input.value = '');
        }
        
        // PlayerManager.reset() already handles player-related cleanup
        
        // PlayerManager.reset() already handles team selection cleanup
        
        // Reset display (with null checks)
        const holeDisplayElement = document.getElementById('holeDisplay');
        
        if (holeDisplayElement) {
            holeDisplayElement.textContent = '1';
        }
        
        // Reset action lists (with null checks)
        const actionListElements = [
            'murphActionsList', 'skinsActionsList', 'kpActionsList', 'snakeActionsList'
        ];
        actionListElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        // Reset summary elements (with null checks)
        const summaryElements = [
            'murphSummary', 'skinsSummary', 'kpSummary', 'snakeSummary', 'combinedSummary'
        ];
        summaryElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        // Reset breakdown elements (with null checks)
        const breakdownElements = [
            'murphBreakdown', 'skinsBreakdown', 'kpBreakdown', 'snakeBreakdown'
        ];
        breakdownElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        // Reset breakdown section visibility
        const breakdownSections = ['murphBreakdownSection', 'skinsBreakdownSection', 'kpBreakdownSection', 'snakeBreakdownSection'];
        breakdownSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Show setup, hide all game pages (with null checks)
        const gameSetupElement = document.getElementById('gameSetup');
        const gameNavigationElement = document.getElementById('gameNavigation');
        const gamePageElements = [
            'murphPage', 'skinsPage', 'kpPage', 'snakePage', 'combinedPage', 'finalResults'
        ];
        
        if (gameSetupElement) {
            gameSetupElement.style.display = 'block';
        }
        if (gameNavigationElement) {
            gameNavigationElement.style.display = 'none';
        }
        
        gamePageElements.forEach(pageId => {
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.style.display = 'none';
            }
        });
        
        // Reset game sections
        this.toggleGameSection('murph');
        this.toggleGameSection('skins');
        this.toggleGameSection('kp');
        this.toggleGameSection('snake');
        
        // Set initial navigation button visibility
        this.updateGameNavigationVisibility();
        
        // Reset previous hole button state
        this.updatePreviousHoleButton();
        

        
        this.ui.showNotification('Game reset! Ready for a new round.', 'info');
    }

    deleteMurphCall(callId) {
        // Find the call to delete
        const callIndex = this.gameActions.murph.findIndex(call => call.id === callId);
        if (callIndex === -1) {
            this.ui.showNotification('Murph call not found.', 'error');
            return;
        }
        
        const call = this.gameActions.murph[callIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this Murph call?\n\n${call.player} on Hole ${call.hole} - ${call.result === 'success' ? 'Made it' : 'Failed'}`)) {
            // Remove the call
            this.gameActions.murph.splice(callIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.ui.showNotification(`Deleted Murph call for ${call.player} on Hole ${call.hole}`, 'success');
        }
    }

    deleteSkinsAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.skins.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.ui.showNotification('Skins action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.skins[actionIndex];
        
        // Show confirmation dialog
        let actionDescription = '';
        if (action.winner === 'team1') {
            actionDescription = `${this.gameConfigs.skins.teamNames.team1} won ${action.skinsWon} skin${action.skinsWon > 1 ? 's' : ''}`;
        } else if (action.winner === 'team2') {
            actionDescription = `${this.gameConfigs.skins.teamNames.team2} won ${action.skinsWon} skin${action.skinsWon > 1 ? 's' : ''}`;
        } else {
            actionDescription = `Carryover - ${action.carryoverCount} skin${action.carryoverCount > 1 ? 's' : ''} at stake`;
        }
        
        if (confirm(`Are you sure you want to delete this Skins action?\n\nHole ${action.hole}: ${actionDescription}`)) {
            // Remove the action
            this.gameActions.skins.splice(actionIndex, 1);
            
            // Recalculate carryover count if this was a carryover action
            if (action.winner === 'carryover') {
                this.recalculateCarryoverCount();
            }
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.ui.showNotification(`Deleted Skins action for Hole ${action.hole}`, 'success');
        }
    }

    deleteKPAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.kp.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.ui.showNotification('KP action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.kp[actionIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this KP action?\n\n${action.winner} got closest to the pin on Hole ${action.hole}`)) {
            // Remove the action
            this.gameActions.kp.splice(actionIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.ui.showNotification(`Deleted KP action for ${action.winner} on Hole ${action.hole}`, 'success');
        }
    }

    deleteSnakeAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.snake.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.ui.showNotification('Snake action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.snake[actionIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this Snake action?\n\n${action.player} got a snake on Hole ${action.hole}`)) {
            // Remove the action
            this.gameActions.snake.splice(actionIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.ui.showNotification(`Deleted Snake action for ${action.player} on Hole ${action.hole}`, 'success');
        }
    }

    deleteWolfAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.wolf.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.ui.showNotification('Wolf action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.wolf[actionIndex];
        
        // Show confirmation dialog
        let actionDescription = '';
        if (action.wolfChoice === 'lone_wolf') {
            actionDescription = `${action.wolf} (Lone Wolf) ${action.result === 'wolf_wins' ? 'won' : 'lost'}`;
        } else {
            actionDescription = `${action.wolf} + ${action.partner} ${action.result === 'wolf_wins' ? 'won' : 'lost'}`;
        }
        
        if (confirm(`Are you sure you want to delete this Wolf action?\n\nHole ${action.hole}: ${actionDescription}`)) {
            // Remove the action
            this.gameActions.wolf.splice(actionIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.ui.showNotification(`Deleted Wolf action for Hole ${action.hole}`, 'success');
        }
    }

    recalculateCarryoverCount() {
        // Find the most recent carryover action to determine current carryover count
        const carryoverActions = this.gameActions.skins
            .filter(action => action.winner === 'carryover')
            .sort((a, b) => b.hole - a.hole); // Sort by hole descending
        
        if (carryoverActions.length > 0) {
            // Get the carryover count from the most recent carryover
            this.gameConfigs.skins.carryoverCount = carryoverActions[0].carryoverCount;
        } else {
            // No carryovers, reset to 1
            this.gameConfigs.skins.carryoverCount = 1;
        }
    }

    // Quick Actions Dashboard functionality
    setupQuickActions() {
        // Update quick hole display
        const quickHoleDisplay = document.getElementById('quickHoleDisplay');
        if (quickHoleDisplay) {
            quickHoleDisplay.textContent = this.currentHole;
        }
        
        // Show/hide quick action cards based on enabled games
        this.updateQuickActionsVisibility();
        
        // Setup quick action event handlers
        this.setupQuickActionHandlers();
    }
    
    updateQuickActionsVisibility() {
        const quickCards = {
            murph: document.getElementById('quickMurphCard'),
            skins: document.getElementById('quickSkinsCard'),
            kp: document.getElementById('quickKPCard'),
            snake: document.getElementById('quickSnakeCard'),
            wolf: document.getElementById('quickWolfCard')
        };
        
        Object.entries(quickCards).forEach(([gameType, card]) => {
            if (card && this.gameConfigs[gameType]?.enabled) {
                card.style.display = 'block';
                this.populateQuickActionDropdowns(gameType);
            } else if (card) {
                card.style.display = 'none';
            }
        });
    }
    
    populateQuickActionDropdowns(gameType) {
        if (gameType === 'murph') {
            this.populateDropdown('quickMurphPlayer', this.players);
        } else if (gameType === 'skins') {
            // For Skins, show team options only for 4 players, individual players for 2-3 players
            if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames) {
                this.populateSkinsTeamDropdown();
            } else {
                this.populateDropdown('quickSkinsWinner', this.players);
            }
        } else if (gameType === 'kp') {
            this.populateDropdown('quickKPPlayer', this.players);
        } else if (gameType === 'snake') {
            this.populateDropdown('quickSnakePlayer', this.players);
        } else if (gameType === 'wolf') {
            this.populateDropdown('quickWolfPlayer', this.players);
            this.populateDropdown('quickWolfPartner', this.players);
        }
    }
    
    populateSkinsTeamDropdown() {
        const select = document.getElementById('quickSkinsWinner');
        if (!select) return;
        
        // Clear existing options
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Winner...';
        select.appendChild(defaultOption);
        
        // Add team options for 4-player games
        if (this.gameConfigs.skins?.teamNames?.team1) {
            const team1Option = document.createElement('option');
            team1Option.value = 'team1';
            team1Option.textContent = this.gameConfigs.skins.teamNames.team1;
            select.appendChild(team1Option);
        }
        
        if (this.gameConfigs.skins?.teamNames?.team2) {
            const team2Option = document.createElement('option');
            team2Option.value = 'team2';
            team2Option.textContent = this.gameConfigs.skins.teamNames.team2;
            select.appendChild(team2Option);
        }
        
        // Add carryover option
        const carryoverOption = document.createElement('option');
        carryoverOption.value = 'carryover';
        carryoverOption.textContent = '🔄 Carryover';
        select.appendChild(carryoverOption);
    }
    
    populateDropdown(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Clear existing options except the first placeholder
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select...';
        select.appendChild(defaultOption);
        
        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
    
    setupQuickActionHandlers() {
        // Quick Murph
        const quickMurphSave = document.getElementById('quickMurphSave');
        if (quickMurphSave) {
            quickMurphSave.addEventListener('click', () => this.handleQuickMurph());
        }
        
        // Quick Skins
        const quickSkinsSave = document.getElementById('quickSkinsSave');
        if (quickSkinsSave) {
            quickSkinsSave.addEventListener('click', () => this.handleQuickSkins());
        }
        
        // Quick KP
        const quickKPSave = document.getElementById('quickKPSave');
        if (quickKPSave) {
            quickKPSave.addEventListener('click', () => this.handleQuickKP());
        }
        
        // Quick Snake
        const quickSnakeSave = document.getElementById('quickSnakeSave');
        if (quickSnakeSave) {
            quickSnakeSave.addEventListener('click', () => this.handleQuickSnake());
        }
        
        // Quick Wolf
        const quickWolfSave = document.getElementById('quickWolfSave');
        if (quickWolfSave) {
            quickWolfSave.addEventListener('click', () => this.handleQuickWolf());
        }
        
        // Wolf partner selection logic
        const quickWolfChoice = document.getElementById('quickWolfChoice');
        const quickWolfPartner = document.getElementById('quickWolfPartner');
        if (quickWolfChoice && quickWolfPartner) {
            quickWolfChoice.addEventListener('change', () => {
                if (quickWolfChoice.value === 'partner') {
                    quickWolfPartner.style.display = 'block';
                    quickWolfPartner.required = true;
                } else {
                    quickWolfPartner.style.display = 'none';
                    quickWolfPartner.required = false;
                }
            });
        }
    }
    
    handleQuickMurph() {
        const player = document.getElementById('quickMurphPlayer').value;
        const result = document.getElementById('quickMurphResult').value;
        
        if (!player || !result) {
            alert('Please select both player and result');
            return;
        }
        
        const action = {
            hole: this.currentHole,
            player: player,
            result: result === 'made' ? 'made' : 'failed'
        };
        
        this.gameManager.addGameAction('murph', action);
        
        // Track quick action analytics
        AnalyticsUtils.trackGameAction('murph', 'quick_action', this.currentHole, {
            player: player,
            result: result
        });
        
        // Update local gameActions reference
        this.gameActions = this.gameManager.gameActions;
        
        this.updateGameDisplay();
        this.updateQuickActionsStatus();
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        
        // Clear form
        document.getElementById('quickMurphPlayer').value = '';
        document.getElementById('quickMurphResult').value = '';
    }
    
    handleQuickSkins() {
        const winner = document.getElementById('quickSkinsWinner').value;
        
        if (!winner) {
            alert('Please select a winner');
            return;
        }
        
        const action = {
            hole: this.currentHole,
            winner: winner
        };
        
        this.gameManager.addGameAction('skins', action);
        
        // Track quick action analytics
        AnalyticsUtils.trackGameAction('skins', 'quick_action', this.currentHole, {
            winner: winner
        });
        
        // Update local gameActions reference
        this.gameActions = this.gameManager.gameActions;
        
        this.updateGameDisplay();
        this.updateQuickActionsStatus();
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        
        // Clear form
        document.getElementById('quickSkinsWinner').value = '';
    }
    
    handleQuickKP() {
        const player = document.getElementById('quickKPPlayer').value;
        
        if (!player) {
            alert('Please select a player');
            return;
        }
        
        const action = {
            hole: this.currentHole,
            player: player
        };
        
        this.gameManager.addGameAction('kp', action);
        
        // Track quick action analytics
        AnalyticsUtils.trackGameAction('kp', 'quick_action', this.currentHole, {
            player: player
        });
        
        // Update local gameActions reference
        this.gameActions = this.gameManager.gameActions;
        
        this.updateGameDisplay();
        this.updateQuickActionsStatus();
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        
        // Clear form
        document.getElementById('quickKPPlayer').value = '';
    }
    
    handleQuickSnake() {
        const player = document.getElementById('quickSnakePlayer').value;
        
        if (!player) {
            alert('Please select a player');
            return;
        }
        
        const action = {
            hole: this.currentHole,
            player: player
        };
        
        this.gameManager.addGameAction('snake', action);
        
        // Track quick action analytics
        AnalyticsUtils.trackGameAction('snake', 'quick_action', this.currentHole, {
            player: player
        });
        
        // Update local gameActions reference
        this.gameActions = this.gameManager.gameActions;
        
        this.updateGameDisplay();
        this.updateQuickActionsStatus();
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        
        // Clear form
        document.getElementById('quickSnakePlayer').value = '';
    }
    
    handleQuickWolf() {
        const wolf = document.getElementById('quickWolfPlayer').value;
        const choice = document.getElementById('quickWolfChoice').value;
        const partner = document.getElementById('quickWolfPartner').value;
        const result = document.getElementById('quickWolfResult').value;
        
        if (!wolf || !choice || !result) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (choice === 'partner' && !partner) {
            alert('Please select a partner');
            return;
        }
        
        const action = {
            hole: this.currentHole,
            wolf: wolf,
            wolfChoice: choice,
            partner: choice === 'partner' ? partner : null,
            result: result
        };
        
        this.gameManager.addGameAction('wolf', action);
        
        // Track quick action analytics
        AnalyticsUtils.trackGameAction('wolf', 'quick_action', this.currentHole, {
            wolf: wolf,
            choice: choice,
            partner: partner,
            result: result
        });
        
        // Update local gameActions reference
        this.gameActions = this.gameManager.gameActions;
        
        this.updateGameDisplay();
        this.updateQuickActionsStatus();
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
        
        // Clear form
        document.getElementById('quickWolfPlayer').value = '';
        document.getElementById('quickWolfChoice').value = '';
        document.getElementById('quickWolfPartner').value = '';
        document.getElementById('quickWolfResult').value = '';
        document.getElementById('quickWolfPartner').style.display = 'none';
    }
    
    updateQuickActionsStatus() {
        // Update status displays for quick actions
        const quickStatuses = {
            murph: 'quickMurphStatus',
            skins: 'quickSkinsStatus',
            kp: 'quickKPStatus',
            snake: 'quickSnakeStatus',
            wolf: 'quickWolfStatus'
        };
        
        Object.entries(quickStatuses).forEach(([gameType, statusId]) => {
            const statusElement = document.getElementById(statusId);
            if (statusElement && this.gameConfigs[gameType]?.enabled) {
                const actions = this.gameManager.getGameActions(gameType);
                const count = actions.length;
                
                if (gameType === 'murph') {
                    statusElement.textContent = `${count} calls`;
                } else if (gameType === 'skins') {
                    statusElement.textContent = `${count} skins`;
                } else if (gameType === 'kp') {
                    statusElement.textContent = `${count} KPs`;
                } else if (gameType === 'snake') {
                    statusElement.textContent = `${count} snakes`;
                } else if (gameType === 'wolf') {
                    statusElement.textContent = `${count} holes`;
                }
            }
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.savageGolf = new SavageGolf();
});
