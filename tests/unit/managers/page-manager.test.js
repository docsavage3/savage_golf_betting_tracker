import { PageManager } from '../../../managers/page-manager.js';

describe('PageManager', () => {
    let pageManager;
    let mockUI;
    let mockGameManager;

    beforeEach(() => {
        mockUI = {
            showPage: jest.fn(),
            updateNavigationVisibility: jest.fn()
        };

        mockGameManager = {
            gameConfigs: {
                murph: { enabled: true },
                skins: { enabled: false },
                kp: { enabled: true },
                snake: { enabled: false },
                wolf: { enabled: true }
            }
        };

        pageManager = new PageManager(mockUI, mockGameManager);
    });

    describe('constructor', () => {
        test('initializes with default values', () => {
            expect(pageManager.ui).toBe(mockUI);
            expect(pageManager.gameManager).toBe(mockGameManager);
            expect(pageManager.currentPage).toBe('navigation');
            expect(pageManager.quickActionsCallback).toBeNull();
        });
    });

    describe('showPage', () => {
        test('updates current page and calls UI showPage', () => {
            pageManager.showPage('game');
            
            expect(pageManager.currentPage).toBe('game');
            expect(mockUI.showPage).toHaveBeenCalledWith('game', mockGameManager.gameConfigs);
        });

        test('calls quick actions callback when showing navigation page', () => {
            const mockCallback = jest.fn();
            pageManager.setQuickActionsCallback(mockCallback);
            
            pageManager.showPage('navigation');
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('does not call quick actions callback for non-navigation pages', () => {
            const mockCallback = jest.fn();
            pageManager.setQuickActionsCallback(mockCallback);
            
            pageManager.showPage('game');
            
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('getCurrentPage', () => {
        test('returns current page', () => {
            pageManager.currentPage = 'setup';
            expect(pageManager.getCurrentPage()).toBe('setup');
        });
    });

    describe('updateGameNavigationVisibility', () => {
        test('calls UI updateNavigationVisibility with correct config', () => {
            pageManager.updateGameNavigationVisibility();
            
            expect(mockUI.updateNavigationVisibility).toHaveBeenCalledWith({
                murph: true,
                skins: false,
                kp: true,
                snake: false,
                wolf: true
            });
        });
    });

    describe('isPageActive', () => {
        test('returns true for current page', () => {
            pageManager.currentPage = 'setup';
            expect(pageManager.isPageActive('setup')).toBe(true);
        });

        test('returns false for non-current page', () => {
            pageManager.currentPage = 'setup';
            expect(pageManager.isPageActive('game')).toBe(false);
        });
    });

    describe('navigateToPreviousPage', () => {
        test('executes without errors', () => {
            expect(() => {
                pageManager.navigateToPreviousPage();
            }).not.toThrow();
        });
    });

    describe('navigateToNextPage', () => {
        test('executes without errors', () => {
            expect(() => {
                pageManager.navigateToNextPage();
            }).not.toThrow();
        });
    });

    describe('setQuickActionsCallback', () => {
        test('sets quick actions callback', () => {
            const mockCallback = jest.fn();
            
            pageManager.setQuickActionsCallback(mockCallback);
            
            expect(pageManager.quickActionsCallback).toBe(mockCallback);
        });
    });
});
