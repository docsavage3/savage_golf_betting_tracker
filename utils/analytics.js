/**
 * Analytics Utility Module
 * Centralized Google Analytics 4 event tracking for Savage Golf Betting Tracker
 * 
 * @author Daniel Savage
 * @version 1.0.0
 */

export class AnalyticsUtils {
    /**
     * Check if Google Analytics is available
     * @returns {boolean} True if gtag is available
     */
    static isAvailable() {
        return typeof gtag !== 'undefined';
    }

    /**
     * Track page views
     * @param {string} pageName - Name of the page being viewed
     * @param {string} pageTitle - Title of the page
     */
    static trackPageView(pageName, pageTitle = '') {
        if (!this.isAvailable()) return;
        
        gtag('event', 'page_view', {
            page_title: pageTitle || pageName,
            page_location: window.location.href,
            page_name: pageName
        });
    }

    /**
     * Track game start events
     * @param {Array} selectedGames - Array of selected game types
     * @param {number} playerCount - Number of players
     * @param {Object} gameConfigs - Game configuration object
     */
    static trackGameStart(selectedGames, playerCount, gameConfigs) {
        if (!this.isAvailable()) return;

        // Track overall game session start
        gtag('event', 'game_session_start', {
            event_category: 'game_flow',
            player_count: playerCount,
            games_selected: selectedGames.join(','),
            total_games: selectedGames.length
        });

        // Track individual game starts
        selectedGames.forEach(gameType => {
            const config = gameConfigs[gameType];
            if (config && config.enabled) {
                gtag('event', 'game_start', {
                    event_category: 'game_types',
                    game_type: gameType,
                    bet_amount: config.betAmount || 0,
                    player_count: playerCount,
                    required_players: config.requiredPlayers || playerCount
                });
            }
        });
    }

    /**
     * Track game actions (hole recordings)
     * @param {string} gameType - Type of game (murph, wolf, etc.)
     * @param {string} actionType - Type of action (quick_action, modal_action)
     * @param {number} hole - Hole number
     * @param {Object} actionData - Additional action data
     */
    static trackGameAction(gameType, actionType, hole, actionData = {}) {
        if (!this.isAvailable()) return;

        gtag('event', 'game_action', {
            event_category: 'gameplay',
            game_type: gameType,
            action_type: actionType,
            hole_number: hole,
            ...actionData
        });

        // Track quick action usage specifically
        if (actionType === 'quick_action') {
            gtag('event', 'quick_action_used', {
                event_category: 'ui_interaction',
                game_type: gameType,
                hole_number: hole
            });
        }
    }

    /**
     * Track game completion
     * @param {string} gameType - Type of game completed
     * @param {number} holesPlayed - Number of holes played
     * @param {Object} finalSummary - Final game summary
     */
    static trackGameComplete(gameType, holesPlayed, finalSummary = {}) {
        if (!this.isAvailable()) return;

        gtag('event', 'game_complete', {
            event_category: 'game_flow',
            game_type: gameType,
            holes_played: holesPlayed,
            completion_rate: (holesPlayed / 18) * 100
        });

        // Track financial data (anonymized)
        if (finalSummary && Object.keys(finalSummary).length > 0) {
            const totalPayouts = Object.values(finalSummary).reduce((sum, amount) => sum + Math.abs(amount), 0);
            gtag('event', 'game_financial_summary', {
                event_category: 'game_metrics',
                game_type: gameType,
                total_money_flow: totalPayouts,
                player_count: Object.keys(finalSummary).length
            });
        }
    }

    /**
     * Track session completion (when all games finish)
     * @param {Array} completedGames - Array of completed game types
     * @param {number} totalHoles - Total holes played across all games
     * @param {number} sessionDuration - Session duration in minutes
     */
    static trackSessionComplete(completedGames, totalHoles, sessionDuration) {
        if (!this.isAvailable()) return;

        gtag('event', 'session_complete', {
            event_category: 'game_flow',
            completed_games: completedGames.join(','),
            total_games_completed: completedGames.length,
            total_holes_played: totalHoles,
            session_duration_minutes: sessionDuration
        });
    }

    /**
     * Track navigation events
     * @param {string} fromPage - Page navigating from
     * @param {string} toPage - Page navigating to
     * @param {string} navigationMethod - How navigation occurred (button, menu, etc.)
     */
    static trackNavigation(fromPage, toPage, navigationMethod = 'button') {
        if (!this.isAvailable()) return;

        gtag('event', 'page_navigation', {
            event_category: 'navigation',
            from_page: fromPage,
            to_page: toPage,
            navigation_method: navigationMethod
        });
    }

    /**
     * Track modal interactions
     * @param {string} modalType - Type of modal (wolf, murph, etc.)
     * @param {string} action - Action taken (open, close, save, cancel)
     */
    static trackModalInteraction(modalType, action) {
        if (!this.isAvailable()) return;

        gtag('event', 'modal_interaction', {
            event_category: 'ui_interaction',
            modal_type: modalType,
            modal_action: action
        });
    }

    /**
     * Track game resume events
     * @param {Array} resumedGames - Array of game types being resumed
     * @param {number} currentHole - Current hole being resumed at
     */
    static trackGameResume(resumedGames, currentHole) {
        if (!this.isAvailable()) return;

        gtag('event', 'game_resume', {
            event_category: 'game_flow',
            resumed_games: resumedGames.join(','),
            resume_hole: currentHole,
            total_resumed_games: resumedGames.length
        });
    }

    /**
     * Track user engagement metrics
     * @param {string} feature - Feature being used
     * @param {Object} metadata - Additional metadata
     */
    static trackFeatureUsage(feature, metadata = {}) {
        if (!this.isAvailable()) return;

        gtag('event', 'feature_usage', {
            event_category: 'engagement',
            feature_name: feature,
            ...metadata
        });
    }

    /**
     * Track errors for debugging
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {string} location - Where the error occurred
     */
    static trackError(errorType, errorMessage, location) {
        if (!this.isAvailable()) return;

        gtag('event', 'exception', {
            description: `${errorType}: ${errorMessage}`,
            fatal: false,
            error_location: location
        });
    }

    /**
     * Track performance metrics
     * @param {string} metricName - Name of the performance metric
     * @param {number} value - Metric value
     * @param {string} unit - Unit of measurement
     */
    static trackPerformance(metricName, value, unit = 'ms') {
        if (!this.isAvailable()) return;

        gtag('event', 'timing_complete', {
            name: metricName,
            value: value,
            event_category: 'performance',
            metric_unit: unit
        });
    }
}

// Export for ES modules
export default AnalyticsUtils;
