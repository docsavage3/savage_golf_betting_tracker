/**
 * Security Utilities Class
 * Provides safe DOM manipulation and input sanitization methods
 * Prevents XSS attacks and ensures secure data handling
 */

export class SecurityUtils {
    /**
     * Safely set text content (prevents XSS)
     * @param {HTMLElement} element - Target DOM element
     * @param {string} text - Text content to set
     */
    static setTextContent(element, text) {
        if (element && typeof text === 'string') {
            element.textContent = text;
        }
    }

    /**
     * Safely set HTML content with sanitization (use sparingly)
     * @param {HTMLElement} element - Target DOM element
     * @param {string} html - HTML content to set
     */
    static setInnerHTML(element, html) {
        if (element && typeof html === 'string') {
            // Only allow safe HTML tags and attributes
            const sanitized = this.sanitizeHTML(html);
            element.innerHTML = sanitized;
        }
    }

    /**
     * Sanitize HTML input to prevent XSS
     * @param {string} html - Raw HTML input
     * @returns {string} Sanitized HTML
     */
    static sanitizeHTML(html) {
        if (typeof html !== 'string') return '';
        
        // Remove all script tags and event handlers
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, '');
    }

    /**
     * Sanitize user input for safe display
     * @param {string} input - User input string
     * @returns {string} Sanitized string
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/[<>\"'&]/g, '')
            .trim()
            .substring(0, 1000); // Limit length
    }

    /**
     * Validate player name for security
     * @param {string} name - Player name to validate
     * @returns {boolean} True if valid
     */
    static validatePlayerName(name) {
        if (typeof name !== 'string') return false;
        
        // Only allow alphanumeric characters, spaces, and common punctuation
        const validPattern = /^[a-zA-Z0-9\s\-'\.]{1,30}$/;
        return validPattern.test(name.trim());
    }

    /**
     * Validate hole number for security
     * @param {number|string} hole - Hole number to validate
     * @returns {boolean} True if valid
     */
    static validateHoleNumber(hole) {
        // Convert to number first to check for decimals
        const holeNum = Number(hole);
        // Reject decimals and ensure it's a whole number
        return !isNaN(holeNum) && holeNum >= 1 && holeNum <= 18 && Number.isInteger(holeNum);
    }

    /**
     * Create safe HTML element with text content
     * @param {string} tagName - HTML tag name
     * @param {string} text - Text content
     * @param {Object} attributes - HTML attributes
     * @returns {HTMLElement} Safe HTML element
     */
    static createSafeElement(tagName, text, attributes = {}) {
        const element = document.createElement(tagName);
        
        // Set text content safely
        this.setTextContent(element, text);
        
        // Set safe attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (this.isSafeAttribute(key, value)) {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }

    /**
     * Check if attribute is safe to set
     * @param {string} key - Attribute name
     * @param {string} value - Attribute value
     * @returns {boolean} True if safe
     */
    static isSafeAttribute(key, value) {
        const safeAttributes = ['class', 'id', 'style', 'data-*'];
        const safePrefixes = ['data-'];
        
        // Check if attribute is in safe list
        if (safeAttributes.includes(key)) return true;
        
        // Check if attribute has safe prefix
        return safePrefixes.some(prefix => key.startsWith(prefix));
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHTML(text) {
        if (typeof text !== 'string') return '';
        
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#47;'
        };
        
        return text.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
    }

    /**
     * Log security events for monitoring
     * @param {string} eventType - Type of security event
     * @param {string} details - Details about the event
     * @param {string} severity - Severity level (low, medium, high, critical)
     */
    static logSecurityEvent(eventType, details, severity = 'low') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            eventType,
            details,
            severity,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log to console with appropriate level
        switch (severity) {
            case 'critical':
                console.error('🚨 SECURITY CRITICAL:', logEntry);
                break;
            case 'high':
                console.warn('⚠️ SECURITY HIGH:', logEntry);
                break;
            case 'medium':
                console.warn('⚠️ SECURITY MEDIUM:', logEntry);
                break;
            case 'low':
                console.info('ℹ️ SECURITY LOW:', logEntry);
                break;
            default:
                console.log('ℹ️ SECURITY EVENT:', logEntry);
        }

        // Store in localStorage for security monitoring (limited to last 100 events)
        try {
            const securityLog = JSON.parse(localStorage.getItem('securityLog') || '[]');
            securityLog.push(logEntry);
            
            // Keep only last 100 events
            if (securityLog.length > 100) {
                securityLog.splice(0, securityLog.length - 100);
            }
            
            localStorage.setItem('securityLog', JSON.stringify(securityLog));
        } catch (error) {
            console.warn('Failed to store security log:', error);
        }
    }

    /**
     * Validate and sanitize form data
     * @param {Object} formData - Form data object
     * @param {Object} validationRules - Validation rules for each field
     * @returns {Object} Validation result with sanitized data
     */
    static validateFormData(formData, validationRules) {
        const result = {
            success: true,
            errors: [],
            sanitizedData: {}
        };

        Object.entries(validationRules).forEach(([fieldName, rules]) => {
            const value = formData[fieldName];
            
            // Check required fields
            if (rules.required && (!value || value.trim().length === 0)) {
                result.success = false;
                result.errors.push(`${fieldName} is required`);
                return;
            }

            // Skip validation for empty optional fields
            if (!value || value.trim().length === 0) {
                result.sanitizedData[fieldName] = '';
                return;
            }

            // Sanitize input
            let sanitizedValue = this.sanitizeInput(value);

            // Apply length validation
            if (rules.minLength && sanitizedValue.length < rules.minLength) {
                result.success = false;
                result.errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
            }

            if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
                result.success = false;
                result.errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`);
            }

            // Apply pattern validation
            if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
                result.success = false;
                result.errors.push(`${fieldName} contains invalid characters`);
            }

            // Store sanitized value
            result.sanitizedData[fieldName] = sanitizedValue;
        });

        // Log security events for validation failures
        if (!result.success) {
            this.logSecurityEvent('validation_failure', {
                errors: result.errors,
                formData: Object.keys(formData)
            }, 'medium');
        }

        return result;
    }

    /**
     * Get security log for monitoring
     * @returns {Array} Array of security events
     */
    static getSecurityLog() {
        try {
            return JSON.parse(localStorage.getItem('securityLog') || '[]');
        } catch (error) {
            console.warn('Failed to retrieve security log:', error);
            return [];
        }
    }

    /**
     * Clear security log
     */
    static clearSecurityLog() {
        try {
            localStorage.removeItem('securityLog');
        } catch (error) {
            console.warn('Failed to clear security log:', error);
        }
    }
}
