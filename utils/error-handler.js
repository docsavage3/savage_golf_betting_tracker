/**
 * Error Handler Utility
 * Provides centralized error handling, logging, and user notification
 */

class ErrorHandler {
    /**
     * Error severity levels
     */
    static SEVERITY = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    };

    /**
     * Error types for categorization
     */
    static ERROR_TYPES = {
        VALIDATION: 'validation',
        STORAGE: 'storage',
        NETWORK: 'network',
        GAME_LOGIC: 'game_logic',
        UI: 'ui',
        SECURITY: 'security',
        UNKNOWN: 'unknown'
    };

    /**
     * Handle an error with consistent logging and user notification
     * @param {Error|string} error - The error to handle
     * @param {Object} options - Error handling options
     * @param {string} options.context - Context where error occurred
     * @param {string} options.type - Error type from ERROR_TYPES
     * @param {string} options.severity - Error severity from SEVERITY
     * @param {boolean} options.notify - Whether to show user notification
     * @param {string} options.fallbackMessage - User-friendly message for notifications
     * @param {Object} options.metadata - Additional metadata for logging
     * @returns {string} Error ID for tracking
     */
    static handle(error, options = {}) {
        const {
            context = 'Unknown',
            type = this.ERROR_TYPES.UNKNOWN,
            severity = this.SEVERITY.MEDIUM,
            notify = true,
            fallbackMessage = 'An unexpected error occurred',
            metadata = {}
        } = options;

        // Generate unique error ID
        const errorId = this._generateErrorId();
        
        // Normalize error object
        const normalizedError = this._normalizeError(error);
        
        // Create error details
        const errorDetails = {
            id: errorId,
            timestamp: new Date().toISOString(),
            context,
            type,
            severity,
            message: normalizedError.message,
            stack: normalizedError.stack,
            metadata
        };

        // Log error based on severity
        this._logError(errorDetails);

        // Track error for analytics if available
        if (window.AnalyticsUtils) {
            try {
                window.AnalyticsUtils.trackError(errorDetails);
            } catch (analyticsError) {
                console.warn('Failed to track error analytics:', analyticsError);
            }
        }

        // Show user notification if requested
        if (notify && window.ui) {
            const userMessage = this._getUserMessage(errorDetails, fallbackMessage);
            window.ui.showNotification(userMessage, 'error');
        }

        return errorId;
    }

    /**
     * Handle storage errors specifically
     * @param {Error} error - Storage error
     * @param {string} operation - Storage operation that failed
     * @returns {string} Error ID
     */
    static handleStorageError(error, operation) {
        return this.handle(error, {
            context: `Storage.${operation}`,
            type: this.ERROR_TYPES.STORAGE,
            severity: this.SEVERITY.HIGH,
            fallbackMessage: 'Failed to save or load game data',
            metadata: { operation }
        });
    }

    /**
     * Handle validation errors
     * @param {Error} error - Validation error
     * @param {string} field - Field that failed validation
     * @returns {string} Error ID
     */
    static handleValidationError(error, field) {
        return this.handle(error, {
            context: `Validation.${field}`,
            type: this.ERROR_TYPES.VALIDATION,
            severity: this.SEVERITY.LOW,
            fallbackMessage: 'Please check your input and try again',
            metadata: { field }
        });
    }

    /**
     * Handle game logic errors
     * @param {Error} error - Game logic error
     * @param {string} game - Game type
     * @param {string} operation - Game operation
     * @returns {string} Error ID
     */
    static handleGameError(error, game, operation) {
        return this.handle(error, {
            context: `Game.${game}.${operation}`,
            type: this.ERROR_TYPES.GAME_LOGIC,
            severity: this.SEVERITY.MEDIUM,
            fallbackMessage: 'An error occurred while processing the game',
            metadata: { game, operation }
        });
    }

    /**
     * Handle security errors
     * @param {Error} error - Security error
     * @param {string} context - Security context
     * @returns {string} Error ID
     */
    static handleSecurityError(error, context) {
        return this.handle(error, {
            context: `Security.${context}`,
            type: this.ERROR_TYPES.SECURITY,
            severity: this.SEVERITY.CRITICAL,
            fallbackMessage: 'A security error occurred',
            metadata: { securityContext: context }
        });
    }

    /**
     * Create a safe error wrapper for async operations
     * @param {Function} operation - Async operation to wrap
     * @param {Object} errorOptions - Error handling options
     * @returns {Promise} Promise that won't reject
     */
    static async safeAsync(operation, errorOptions = {}) {
        try {
            return await operation();
        } catch (error) {
            const errorId = this.handle(error, errorOptions);
            return { error: errorId, success: false };
        }
    }

    /**
     * Create a safe wrapper for sync operations
     * @param {Function} operation - Sync operation to wrap
     * @param {Object} errorOptions - Error handling options
     * @returns {*} Operation result or error object
     */
    static safe(operation, errorOptions = {}) {
        try {
            return operation();
        } catch (error) {
            const errorId = this.handle(error, errorOptions);
            return { error: errorId, success: false };
        }
    }

    /**
     * Normalize error to consistent format
     * @param {Error|string} error - Error to normalize
     * @returns {Object} Normalized error
     * @private
     */
    static _normalizeError(error) {
        if (error instanceof Error) {
            return {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
        }
        
        if (typeof error === 'string') {
            return {
                message: error,
                stack: new Error().stack,
                name: 'StringError'
            };
        }

        return {
            message: 'Unknown error',
            stack: new Error().stack,
            name: 'UnknownError'
        };
    }

    /**
     * Log error based on severity
     * @param {Object} errorDetails - Error details
     * @private
     */
    static _logError(errorDetails) {
        const { severity, id, context, message } = errorDetails;
        const logMessage = `[${id}] ${context}: ${message}`;

        switch (severity) {
            case this.SEVERITY.CRITICAL:
                console.error('🚨 CRITICAL:', logMessage, errorDetails);
                break;
            case this.SEVERITY.HIGH:
                console.error('🔴 HIGH:', logMessage, errorDetails);
                break;
            case this.SEVERITY.MEDIUM:
                console.warn('🟡 MEDIUM:', logMessage, errorDetails);
                break;
            case this.SEVERITY.LOW:
                console.info('🔵 LOW:', logMessage, errorDetails);
                break;
            default:
                console.error('❓ UNKNOWN:', logMessage, errorDetails);
        }
    }

    /**
     * Generate unique error ID
     * @returns {string} Error ID
     * @private
     */
    static _generateErrorId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `err_${timestamp}_${random}`;
    }

    /**
     * Get user-friendly error message
     * @param {Object} errorDetails - Error details
     * @param {string} fallbackMessage - Fallback message
     * @returns {string} User message
     * @private
     */
    static _getUserMessage(errorDetails, fallbackMessage) {
        const { type, severity, id } = errorDetails;
        
        // For critical errors, include error ID for support
        if (severity === this.SEVERITY.CRITICAL) {
            return `${fallbackMessage} (Error ID: ${id})`;
        }

        // For validation errors, use original message if it's user-friendly
        if (type === this.ERROR_TYPES.VALIDATION) {
            return errorDetails.message || fallbackMessage;
        }

        return fallbackMessage;
    }
}

// Export for ES6 modules
export default ErrorHandler;

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}
