import ErrorHandler from '../../../utils/error-handler.js';

describe('ErrorHandler', () => {
    test('handle logs error with correct severity', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        ErrorHandler.handle(new Error('Test'), {
            context: 'testContext',
            severity: ErrorHandler.SEVERITY.HIGH
        });
        expect(consoleSpy).toHaveBeenCalledWith(
            '🔴 HIGH:',
            expect.stringContaining('[err_'),
            expect.objectContaining({
                context: 'testContext',
                severity: 'high',
                message: 'Test'
            })
        );
    });

    test('_normalizeError handles Error object', () => {
        const err = new Error('Test');
        const normalized = ErrorHandler._normalizeError(err);
        expect(normalized).toHaveProperty('message', 'Test');
        expect(normalized).toHaveProperty('stack');
    });

    test('_normalizeError handles string error', () => {
        const normalized = ErrorHandler._normalizeError('String error');
        expect(normalized.message).toBe('String error');
    });

    test('_generateErrorId returns unique ID', () => {
        const id1 = ErrorHandler._generateErrorId();
        const id2 = ErrorHandler._generateErrorId();
        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^err_/);
    });

    // Test generateErrorId, getErrorType, different severities, metadata

    test('handleStorageError calls handle with correct options', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Storage error');
        const errorId = ErrorHandler.handleStorageError(error, 'saveGameState');
        
        expect(consoleSpy).toHaveBeenCalledWith(
            '🔴 HIGH:',
            expect.stringContaining('[err_'),
            expect.objectContaining({
                context: 'Storage.saveGameState',
                type: 'storage',
                severity: 'high'
            })
        );
        expect(errorId).toMatch(/^err_/);
    });

    test('handleValidationError calls handle with correct options', () => {
        const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        const error = new Error('Validation error');
        const errorId = ErrorHandler.handleValidationError(error, 'playerName');
        
        expect(consoleSpy).toHaveBeenCalledWith(
            '🔵 LOW:',
            expect.stringContaining('[err_'),
            expect.objectContaining({
                context: 'Validation.playerName',
                type: 'validation',
                severity: 'low'
            })
        );
        expect(errorId).toMatch(/^err_/);
    });

    test('handleGameError calls handle with correct options', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const error = new Error('Game error');
        const errorId = ErrorHandler.handleGameError(error, 'murph', 'scoring');
        
        expect(consoleSpy).toHaveBeenCalledWith(
            '🟡 MEDIUM:',
            expect.stringContaining('[err_'),
            expect.objectContaining({
                context: 'Game.murph.scoring',
                type: 'game_logic',
                severity: 'medium'
            })
        );
        expect(errorId).toMatch(/^err_/);
    });

    test('handleSecurityError calls handle with correct options', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Security error');
        const errorId = ErrorHandler.handleSecurityError(error, 'input');
        
        expect(consoleSpy).toHaveBeenCalledWith(
            '🚨 CRITICAL:',
            expect.stringContaining('[err_'),
            expect.objectContaining({
                context: 'Security.input',
                type: 'security',
                severity: 'critical'
            })
        );
        expect(errorId).toMatch(/^err_/);
    });

    test('safe wrapper returns operation result', () => {
        const result = ErrorHandler.safe(() => 'success');
        expect(result).toBe('success');
    });

    test('safe wrapper handles errors', () => {
        const result = ErrorHandler.safe(() => { throw new Error('Test error'); });
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('success', false);
    });

    test('safeAsync wrapper returns operation result', async () => {
        const result = await ErrorHandler.safeAsync(async () => 'success');
        expect(result).toBe('success');
    });

    test('safeAsync wrapper handles errors', async () => {
        const result = await ErrorHandler.safeAsync(async () => { throw new Error('Test error'); });
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('success', false);
    });

    test('_getUserMessage returns fallback for unknown errors', () => {
        const errorDetails = {
            type: 'unknown',
            severity: 'medium',
            id: 'test123'
        };
        const message = ErrorHandler._getUserMessage(errorDetails, 'Fallback message');
        expect(message).toBe('Fallback message');
    });

    test('_getUserMessage includes error ID for critical errors', () => {
        const errorDetails = {
            type: 'security',
            severity: 'critical',
            id: 'test123'
        };
        const message = ErrorHandler._getUserMessage(errorDetails, 'Security error');
        expect(message).toBe('Security error (Error ID: test123)');
    });

    test('_getUserMessage uses original message for validation errors', () => {
        const errorDetails = {
            type: 'validation',
            severity: 'low',
            id: 'test123',
            message: 'Invalid input'
        };
        const message = ErrorHandler._getUserMessage(errorDetails, 'Fallback message');
        expect(message).toBe('Invalid input');
    });

    test('_logError handles unknown severity', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const errorDetails = {
            severity: 'unknown',
            id: 'test123',
            context: 'test',
            message: 'test message'
        };
        
        ErrorHandler._logError(errorDetails);
        
        expect(consoleSpy).toHaveBeenCalledWith('❓ UNKNOWN:', expect.stringContaining('[test123] test: test message'), errorDetails);
    });
});
