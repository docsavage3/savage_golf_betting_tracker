/**
 * Security Utilities Test Suite
 * Tests all security functions to ensure XSS prevention and input validation
 */

import { SecurityUtils } from '../../../utils/security.js';

// Mock DOM elements for testing
const mockElement = {
    textContent: '',
    innerHTML: '',
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    getAttribute: jest.fn()
};

// Create a mock document that works with Jest
const mockDocument = {
    createElement: (tagName) => ({
        tagName: tagName.toUpperCase(),
        textContent: '',
        innerHTML: '',
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        getAttribute: jest.fn()
    })
};

// Mock localStorage for testing
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

// Mock console methods to avoid noise in tests
const originalConsole = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    log: console.log
};

describe('SecurityUtils', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        jest.clearAllMocks();
        
        // Mock console methods
        console.error = jest.fn();
        console.warn = jest.fn();
        console.info = jest.fn();
        console.log = jest.fn();
        
        // Mock localStorage methods with proper implementation
        const mockStorage = {
            data: {},
            getItem: jest.fn((key) => mockStorage.data[key] || null),
            setItem: jest.fn((key, value) => { mockStorage.data[key] = value; }),
            removeItem: jest.fn((key) => { delete mockStorage.data[key]; }),
            clear: jest.fn(() => { mockStorage.data = {}; })
        };
        
        Object.defineProperty(global, 'localStorage', {
            value: mockStorage,
            writable: true
        });
    });

    afterEach(() => {
        // Restore console methods
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.info = originalConsole.info;
        console.log = originalConsole.log;
    });

    describe('setTextContent', () => {
        test('should safely set text content', () => {
            const element = { ...mockElement };
            const text = 'Safe text content';
            
            SecurityUtils.setTextContent(element, text);
            
            expect(element.textContent).toBe(text);
        });

        test('should handle null element gracefully', () => {
            const text = 'Safe text content';
            
            expect(() => {
                SecurityUtils.setTextContent(null, text);
            }).not.toThrow();
        });

        test('should handle non-string text gracefully', () => {
            const element = { ...mockElement };
            
            SecurityUtils.setTextContent(element, 123);
            SecurityUtils.setTextContent(element, null);
            SecurityUtils.setTextContent(element, undefined);
            
            expect(element.textContent).toBe('');
        });
    });

    describe('setInnerHTML', () => {
        test('should sanitize HTML before setting', () => {
            const element = { ...mockElement };
            const maliciousHTML = '<script>alert("xss")</script><p>Safe content</p>';
            
            SecurityUtils.setInnerHTML(element, maliciousHTML);
            
            expect(element.innerHTML).not.toContain('<script>');
            expect(element.innerHTML).toContain('<p>Safe content</p>');
        });

        test('should remove event handlers', () => {
            const element = { ...mockElement };
            const htmlWithEvents = '<div onclick="alert(\'xss\')">Content</div>';
            
            SecurityUtils.setInnerHTML(element, htmlWithEvents);
            
            expect(element.innerHTML).not.toContain('onclick');
        });

        test('should handle null element gracefully', () => {
            const html = '<p>Safe content</p>';
            
            expect(() => {
                SecurityUtils.setInnerHTML(null, html);
            }).not.toThrow();
        });
    });

    describe('sanitizeHTML', () => {
        test('should remove script tags', () => {
            const maliciousHTML = '<script>alert("xss")</script><p>Safe</p>';
            const sanitized = SecurityUtils.sanitizeHTML(maliciousHTML);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('<p>Safe</p>');
        });

        test('should remove event handlers', () => {
            const htmlWithEvents = '<div onclick="alert(\'xss\')" onmouseover="alert(\'xss\')">Content</div>';
            const sanitized = SecurityUtils.sanitizeHTML(htmlWithEvents);
            
            expect(sanitized).not.toContain('onclick');
            expect(sanitized).not.toContain('onmouseover');
        });

        test('should remove javascript: protocol', () => {
            const htmlWithJS = '<a href="javascript:alert(\'xss\')">Link</a>';
            const sanitized = SecurityUtils.sanitizeHTML(htmlWithJS);
            
            expect(sanitized).not.toContain('javascript:');
        });

        test('should handle non-string input', () => {
            expect(SecurityUtils.sanitizeHTML(null)).toBe('');
            expect(SecurityUtils.sanitizeHTML(123)).toBe('');
            expect(SecurityUtils.sanitizeHTML(undefined)).toBe('');
        });
    });

    describe('sanitizeInput', () => {
        test('should remove HTML special characters', () => {
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = SecurityUtils.sanitizeInput(maliciousInput);
            
            expect(sanitized).not.toContain('<');
            expect(sanitized).not.toContain('>');
            expect(sanitized).not.toContain('"');
            expect(sanitized).not.toContain("'");
            expect(sanitized).not.toContain('&');
        });

        test('should limit input length', () => {
            const longInput = 'a'.repeat(2000);
            const sanitized = SecurityUtils.sanitizeInput(longInput);
            
            expect(sanitized.length).toBeLessThanOrEqual(1000);
        });

        test('should trim whitespace', () => {
            const input = '  test input  ';
            const sanitized = SecurityUtils.sanitizeInput(input);
            
            expect(sanitized).toBe('test input');
        });

        test('should handle non-string input', () => {
            expect(SecurityUtils.sanitizeInput(null)).toBe('');
            expect(SecurityUtils.sanitizeInput(123)).toBe('');
            expect(SecurityUtils.sanitizeInput(undefined)).toBe('');
        });
    });

    describe('validatePlayerName', () => {
        test('should accept valid player names', () => {
            const validNames = [
                'John',
                'Mary Jane',
                'O\'Connor',
                'Jean-Pierre',
                'Dr. Smith',
                'Player123'
            ];

            validNames.forEach(name => {
                expect(SecurityUtils.validatePlayerName(name)).toBe(true);
            });
        });

        test('should reject invalid player names', () => {
            const invalidNames = [
                '<script>alert("xss")</script>',
                'Player"Name',
                'Player&Name',
                'Player<Name',
                'Player>Name',
                'Player/Name',
                'a'.repeat(31) // Too long
            ];

            invalidNames.forEach(name => {
                expect(SecurityUtils.validatePlayerName(name)).toBe(false);
            });
        });

        test('should handle edge cases', () => {
            expect(SecurityUtils.validatePlayerName('')).toBe(false);
            expect(SecurityUtils.validatePlayerName(null)).toBe(false);
            expect(SecurityUtils.validatePlayerName(undefined)).toBe(false);
            expect(SecurityUtils.validatePlayerName(123)).toBe(false);
        });
    });

    describe('validateHoleNumber', () => {
        test('should accept valid hole numbers', () => {
            for (let i = 1; i <= 18; i++) {
                expect(SecurityUtils.validateHoleNumber(i)).toBe(true);
                expect(SecurityUtils.validateHoleNumber(i.toString())).toBe(true);
            }
        });

        test('should reject invalid hole numbers', () => {
            const invalidHoles = [0, 19, -1, 1.5, 'abc', '1a', null, undefined];
            
            invalidHoles.forEach(hole => {
                expect(SecurityUtils.validateHoleNumber(hole)).toBe(false);
            });
        });
    });

    describe('createSafeElement', () => {
        test('should create safe HTML elements', () => {
            const element = SecurityUtils.createSafeElement('div', 'Safe text', {
                class: 'safe-class',
                'data-test': 'safe-data'
            });
            
            expect(element.tagName).toBe('DIV');
            expect(element.textContent).toBe('Safe text');
        });

        test('should only set safe attributes', () => {
            const element = SecurityUtils.createSafeElement('div', 'Safe text', {
                class: 'safe-class',
                onclick: 'alert("xss")', // Should be ignored
                'data-test': 'safe-data'
            });
            
            expect(element.getAttribute('class')).toBe('safe-class');
            expect(element.getAttribute('data-test')).toBe('safe-data');
            expect(element.getAttribute('onclick')).toBeNull();
        });
    });

    describe('isSafeAttribute', () => {
        test('should identify safe attributes', () => {
            const safeAttributes = ['class', 'id', 'style', 'data-test'];
            
            safeAttributes.forEach(attr => {
                expect(SecurityUtils.isSafeAttribute(attr, 'value')).toBe(true);
            });
        });

        test('should identify unsafe attributes', () => {
            const unsafeAttributes = ['onclick', 'onmouseover', 'javascript:', 'vbscript:'];
            
            unsafeAttributes.forEach(attr => {
                expect(SecurityUtils.isSafeAttribute(attr, 'value')).toBe(false);
            });
        });

        test('should accept data-* attributes', () => {
            expect(SecurityUtils.isSafeAttribute('data-custom', 'value')).toBe(true);
            expect(SecurityUtils.isSafeAttribute('data-test-123', 'value')).toBe(true);
        });
    });

    describe('escapeHTML', () => {
        test('should escape HTML special characters', () => {
            const input = '<div class="test">Content & more</div>';
            const escaped = SecurityUtils.escapeHTML(input);
            
            expect(escaped).toBe('&lt;div class=&quot;test&quot;&gt;Content &amp; more&lt;&#47;div&gt;');
        });

        test('should handle non-string input', () => {
            expect(SecurityUtils.escapeHTML(null)).toBe('');
            expect(SecurityUtils.escapeHTML(123)).toBe('');
            expect(SecurityUtils.escapeHTML(undefined)).toBe('');
        });
    });

    describe('logSecurityEvent', () => {
        test('should log security events', () => {
            SecurityUtils.logSecurityEvent('test_event', 'Test details', 'low');
            
            expect(console.info).toHaveBeenCalled();
        });

        test('should store events in localStorage', () => {
            SecurityUtils.logSecurityEvent('test_event', 'Test details', 'medium');
            
            const log = SecurityUtils.getSecurityLog();
            expect(log).toHaveLength(1);
            expect(log[0].eventType).toBe('test_event');
            expect(log[0].severity).toBe('medium');
        });

        test('should limit log to 100 events', () => {
            // Add 101 events
            for (let i = 0; i < 101; i++) {
                SecurityUtils.logSecurityEvent('test_event', `Event ${i}`, 'low');
            }
            
            const log = SecurityUtils.getSecurityLog();
            expect(log).toHaveLength(100);
            expect(log[log.length - 1].details).toBe('Event 100');
        });
    });

    describe('validateFormData', () => {
        test('should validate required fields', () => {
            const formData = { name: '', email: 'test@example.com' };
            const rules = {
                name: { required: true, minLength: 2, maxLength: 50 },
                email: { required: true, minLength: 5, maxLength: 100 }
            };
            
            const result = SecurityUtils.validateFormData(formData, rules);
            
            expect(result.success).toBe(false);
            expect(result.errors).toContain('name is required');
        });

        test('should sanitize input data', () => {
            const formData = { name: '<script>alert("xss")</script>John' };
            const rules = { name: { required: true, maxLength: 50 } };
            
            const result = SecurityUtils.validateFormData(formData, rules);
            
            expect(result.success).toBe(true);
            expect(result.sanitizedData.name).not.toContain('<script>');
        });

        test('should apply length validation', () => {
            const formData = { name: 'A' }; // Too short
            const rules = { name: { required: true, minLength: 2, maxLength: 10 } };
            
            const result = SecurityUtils.validateFormData(formData, rules);
            
            expect(result.success).toBe(false);
            expect(result.errors).toContain('name must be at least 2 characters');
        });
    });

    describe('Security Log Management', () => {
        test('should get security log', () => {
            SecurityUtils.logSecurityEvent('test_event', 'Test details');
            
            const log = SecurityUtils.getSecurityLog();
            expect(Array.isArray(log)).toBe(true);
            expect(log.length).toBeGreaterThan(0);
        });

        test('should clear security log', () => {
            SecurityUtils.logSecurityEvent('test_event', 'Test details');
            SecurityUtils.clearSecurityLog();
            
            const log = SecurityUtils.getSecurityLog();
            expect(log).toHaveLength(0);
        });
    });
});
