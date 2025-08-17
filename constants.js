/**
 * Constants and Configuration for Savage Golf Betting Tracker
 * Extracted to improve maintainability and reduce magic numbers/strings
 * 
 * Copyright (c) 2025 Daniel Savage
 * Licensed under MIT License
 * 
 * This software tracks golf side games including Murph, Skins, KP, and Snake.
 * All rights reserved.
 */

// =============================================================================
// DOM ELEMENT IDS
// =============================================================================

export const ELEMENT_IDS = {
    // Main navigation and setup
    START_GAME: 'startGame',
    PREVIOUS_HOLE: 'previousHole',
    NEXT_HOLE: 'nextHole',
    COMPLETE_GAME: 'completeGame',
    CURRENT_HOLE: 'currentHole',
    NEW_GAME: 'newGame',
    NEW_GAME_FROM_FINAL: 'newGameFromFinal',
    
    // Player setup
    PLAYER_COUNT: 'playerCount',
    PLAYER_INPUTS: 'playerInputs',
    PLAYER_1: 'player1',
    PLAYER_2: 'player2',
    PLAYER_3: 'player3',
    PLAYER_4: 'player4',
    
    // Player input containers
    PLAYER_1_INPUT: 'player1Input',
    PLAYER_2_INPUT: 'player2Input',
    PLAYER_3_INPUT: 'player3Input',
    PLAYER_4_INPUT: 'player4Input',
    
    // Team selection
    TEAM_1_PLAYER_1: 'team1Player1',
    TEAM_1_PLAYER_2: 'team1Player2',
    TEAM_2_PLAYER_1: 'team2Player1',
    TEAM_2_PLAYER_2: 'team2Player2',
    
    // Pages
    GAME_SETUP: 'gameSetup',
    GAME_NAVIGATION: 'gameNavigation',
    MURPH_PAGE: 'murphPage',
    SKINS_PAGE: 'skinsPage',
    KP_PAGE: 'kpPage',
    SNAKE_PAGE: 'snakePage',
    WOLF_PAGE: 'wolfPage',
    COMBINED_PAGE: 'combinedPage',
    FINAL_RESULTS: 'finalResults',
    
    // Navigation buttons
    NAV_MURPH: 'navMurph',
    NAV_SKINS: 'navSkins',
    NAV_KP: 'navKP',
    NAV_SNAKE: 'navSnake',
    NAV_WOLF: 'navWolf',
    NAV_COMBINED: 'navCombined',
    
    // Back navigation
    BACK_TO_NAV: 'backToNav',
    BACK_TO_NAV_2: 'backToNav2',
    BACK_TO_NAV_KP: 'backToNavKP',
    BACK_TO_NAV_SNAKE: 'backToNavSnake',
    BACK_TO_NAV_WOLF: 'backToNavWolf',
    BACK_TO_NAV_3: 'backToNav3',
    BACK_TO_NAV_4: 'backToNav4',
    
    // Game checkboxes
    GAME_MURPH: 'gameMurph',
    GAME_SKINS: 'gameSkins',
    GAME_KP: 'gameKP',
    GAME_SNAKE: 'gameSnake',
    GAME_WOLF: 'gameWolf',
    
    // Bet amounts
    MURPH_BET_AMOUNT: 'murphBetAmount',
    SKINS_BET_AMOUNT: 'skinsBetAmount',
    KP_BET_AMOUNT: 'kpBetAmount',
    SNAKE_BET_AMOUNT: 'snakeBetAmount',
    WOLF_BET_AMOUNT: 'wolfBetAmount',
    
    // Game action buttons
    CALL_MURPH: 'callMurph',
    RECORD_SKINS: 'recordSkins',
    RECORD_KP: 'recordKP',
    RECORD_SNAKE: 'recordSnake',
    RECORD_WOLF: 'recordWolf',
    
    // Modals
    MURPH_MODAL: 'murphModal',
    SKINS_MODAL: 'skinsModal',
    KP_MODAL: 'kpModal',
    SNAKE_MODAL: 'snakeModal',
    WOLF_MODAL: 'wolfModal',
    
    // Modal actions
    SAVE_MURPH: 'saveMurph',
    CANCEL_MURPH: 'cancelMurph',
    SAVE_SKINS: 'saveSkins',
    CANCEL_SKINS: 'cancelSkins',
    SAVE_KP: 'saveKP',
    CANCEL_KP: 'cancelKP',
    SAVE_SNAKE: 'saveSnake',
    CANCEL_SNAKE: 'cancelSnake',
    SAVE_WOLF: 'saveWolf',
    CANCEL_WOLF: 'cancelWolf',
    
    // Game selectors in modals
    MURPH_PLAYER: 'murphPlayer',
    SKINS_WINNER: 'skinsWinner',
    KP_WINNER: 'kpWinner',
    SNAKE_PLAYER: 'snakePlayer',
    WOLF_PLAYER: 'wolfPlayer',
    WOLF_CHOICE: 'wolfChoice',
    WOLF_PARTNER: 'wolfPartner',
    WOLF_RESULT: 'wolfResult',
    
    // Display areas
    PAYMENT_INSTRUCTIONS_COMBINED: 'paymentInstructionsCombined'
};

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

export const GAME_TYPES = {
    MURPH: 'murph',
    SKINS: 'skins',
    KP: 'kp',
    SNAKE: 'snake',
    WOLF: 'wolf'
};

export const GAME_NAMES = {
    [GAME_TYPES.MURPH]: 'Murph',
    [GAME_TYPES.SKINS]: 'Skins',
    [GAME_TYPES.KP]: 'KP',
    [GAME_TYPES.SNAKE]: 'Snake',
    [GAME_TYPES.WOLF]: 'Wolf'
};

export const PAGE_NAMES = {
    SETUP: 'setup',
    NAVIGATION: 'navigation',
    MURPH: 'murph',
    SKINS: 'skins',
    KP: 'kp',
    SNAKE: 'snake',
    WOLF: 'wolf',
    COMBINED: 'combined',
    FINAL: 'final'
};

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULTS = {
    PLAYER_COUNT: 4,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 4,
    STARTING_HOLE: 1,
    MAX_HOLES: 18,
    BET_AMOUNT: 2.00
};

// =============================================================================
// CSS CLASSES
// =============================================================================

export const CSS_CLASSES = {
    HIDDEN: 'hidden',
    SELECTED: 'selected',
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    DISABLED: 'disabled'
};

// =============================================================================
// DISPLAY STYLES
// =============================================================================

export const DISPLAY_STYLES = {
    BLOCK: 'block',
    NONE: 'none',
    FLEX: 'flex',
    INLINE_BLOCK: 'inline-block'
};

// =============================================================================
// UI MESSAGES
// =============================================================================

export const MESSAGES = {
    ERRORS: {
        PLAYER_NAMES_REQUIRED: 'Please enter all player names',
        UNIQUE_NAMES_REQUIRED: 'All player names must be unique',
        GAME_SELECTION_REQUIRED: 'Please select at least one game',
        BET_AMOUNT_REQUIRED: 'Please enter a bet amount for',
        TEAM_SELECTION_REQUIRED: 'Please select team members for Skins game',
        INVALID_BET_AMOUNT: 'Bet amount must be greater than 0'
    },
    SUCCESS: {
        GAME_STARTED: 'Game started successfully!',
        MURPH_RECORDED: 'Murph call recorded!',
        SKINS_RECORDED: 'Skins result recorded!',
        KP_RECORDED: 'KP result recorded!',
        SNAKE_RECORDED: 'Snake recorded!',
        WOLF_RECORDED: 'Wolf hole recorded!',
        GAME_COMPLETED: 'Game completed! Results are now locked.',
        GAME_RESET: 'New game started!'
    },
    WARNINGS: {
        COMPLETE_GAME: 'Are you sure you want to complete the game? No further edits can be made to the results.',
        DELETE_ACTION: 'Are you sure you want to delete this action?'
    }
};

// =============================================================================
// TEAM CONFIGURATION
// =============================================================================

export const TEAM_CONFIG = {
    TEAM_1_NAME: 'Team 1',
    TEAM_2_NAME: 'Team 2',
    TEAM_IDS: ['team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'],
    SELECT_PLACEHOLDER: 'Select player...'
};

// =============================================================================
// NOTIFICATION CONFIGURATION
// =============================================================================

export const NOTIFICATION_CONFIG = {
    DURATION: 3000, // 3 seconds
    TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }
};

// =============================================================================
// SKINS GAME CONFIGURATION
// =============================================================================

export const SKINS_CONFIG = {
    TEAM_1_VALUE: 'team1',
    TEAM_2_VALUE: 'team2',
    CARRYOVER_VALUE: 'carryover',
    CARRYOVER_TEXT: 'Carryover (No Winner)'
};

// =============================================================================
// WOLF GAME CONFIGURATION
// =============================================================================

export const WOLF_CONFIG = {
    LONE_WOLF_VALUE: 'lone_wolf',
    LONE_WOLF_TEXT: 'Lone Wolf',
    PARTNER_VALUE: 'partner',
    PARTNER_TEXT: 'Partner',
    WOLF_WINS: 'wolf_wins',
    PARTNERS_WIN: 'partners_win',
    WOLF_ROTATION: [1, 2, 3, 4], // Which player is wolf on holes 1-4, 5-8, 9-12, 13-16
    HOLES_PER_WOLF: 4
};

// =============================================================================
// HTML TEMPLATES
// =============================================================================

export const HTML_TEMPLATES = {
    SELECT_OPTION: '<option value="">Select player...</option>',
    TEAM_OPTION: (value, text) => `<option value="${value}">${text}</option>`,
    CARRYOVER_OPTION: `<option value="${SKINS_CONFIG.CARRYOVER_VALUE}">${SKINS_CONFIG.CARRYOVER_TEXT}</option>`
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
    MIN_BET_AMOUNT: 0.01,
    MAX_BET_AMOUNT: 999.99,
    PLAYER_NAME_MIN_LENGTH: 1,
    PLAYER_NAME_MAX_LENGTH: 20,
    REQUIRED_TEAM_PLAYERS: 4
};
