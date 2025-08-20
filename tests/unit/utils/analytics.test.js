import { AnalyticsUtils } from '../../../utils/analytics.js';

describe('AnalyticsUtils', () => {
    let originalGtag;

    beforeEach(() => {
        originalGtag = global.gtag;
        global.gtag = jest.fn();
    });

    afterEach(() => {
        global.gtag = originalGtag;
    });

    test('isAvailable returns true when gtag is defined', () => {
        expect(AnalyticsUtils.isAvailable()).toBe(true);
    });

    test('isAvailable returns false when gtag is undefined', () => {
        delete global.gtag;
        expect(AnalyticsUtils.isAvailable()).toBe(false);
    });

    test('trackPageView calls gtag with correct params', () => {
        AnalyticsUtils.trackPageView('test-page', 'Test Title');
        expect(global.gtag).toHaveBeenCalledWith('event', 'page_view', {
            page_title: 'Test Title',
            page_location: expect.any(String),
            page_name: 'test-page'
        });
    });

    test('trackPageView does nothing if gtag unavailable', () => {
        delete global.gtag;
        AnalyticsUtils.trackPageView('test', 'test');
        expect(global.gtag).toBeUndefined();
    });

    test('trackGameStart calls gtag correctly', () => {
        AnalyticsUtils.trackGameStart(['murph'], 4, { murph: { enabled: true } });
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_session_start', expect.objectContaining({
            player_count: 4,
            games_selected: 'murph',
            total_games: 1
        }));
    });

    test('trackGameAction calls gtag with params', () => {
        AnalyticsUtils.trackGameAction('murph', 'modal_action', 5, { result: 'success' });
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_action', expect.objectContaining({
            game_type: 'murph',
            action_type: 'modal_action',
            hole_number: 5,
            result: 'success'
        }));
    });

    test('trackGameComplete tracks completion and financials', () => {
        const finalSummary = { player1: 10, player2: -10 };
        AnalyticsUtils.trackGameComplete('murph', 18, finalSummary);
        expect(global.gtag).toHaveBeenCalledTimes(2);
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_complete', expect.objectContaining({
            game_type: 'murph',
            holes_played: 18,
            completion_rate: 100
        }));
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_financial_summary', expect.objectContaining({
            total_money_flow: 20,
            player_count: 2
        }));
    });

    // Add similar tests for trackSessionComplete, trackNavigation, trackModalInteraction,
    // trackFeatureUsage, trackError, trackPerformance
    // Test skips if !available, empty params, etc.

    test('trackGameAction calls gtag correctly', () => {
        AnalyticsUtils.trackGameAction('murph', 'scoring', { player: 'Player1', result: 'success' });
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_action', expect.objectContaining({
            game_type: 'murph',
            action_type: 'scoring'
        }));
    });

    test('trackModalInteraction calls gtag correctly', () => {
        AnalyticsUtils.trackModalInteraction('murph', 'open');
        expect(global.gtag).toHaveBeenCalledWith('event', 'modal_interaction', expect.objectContaining({
            modal_type: 'murph',
            modal_action: 'open'
        }));
    });

    test('trackError calls gtag correctly', () => {
        AnalyticsUtils.trackError('validation', 'Test error', 'test-location');
        expect(global.gtag).toHaveBeenCalledWith('event', 'exception', expect.objectContaining({
            description: 'validation: Test error',
            fatal: false,
            error_location: 'test-location'
        }));
    });

    test('trackPageView handles missing parameters gracefully', () => {
        AnalyticsUtils.trackPageView();
        expect(global.gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
            page_title: undefined,
            page_name: undefined
        }));
    });

    test('trackGameStart handles missing parameters gracefully', () => {
        AnalyticsUtils.trackGameStart([], undefined, {});
        expect(global.gtag).toHaveBeenCalledWith('event', 'game_session_start', expect.objectContaining({
            player_count: undefined,
            games_selected: '',
            total_games: 0
        }));
    });
});
