import { SkinsGame } from '../../../games/skins-game.js';
import { SKINS_CONFIG } from '../../../constants.js';

describe('SkinsGame', () => {
    let skinsGame;
    let players;

    beforeEach(() => {
        players = ['Player1', 'Player2', 'Player3'];
        skinsGame = new SkinsGame(players);
    });

    describe('constructor and initialization', () => {
        test('initializes with correct properties', () => {
            expect(skinsGame.players).toEqual(players);
            expect(skinsGame.actions).toEqual([]);
            expect(skinsGame.config).toEqual({
                enabled: false,
                betAmount: 2.00,
                carryoverCount: 1,
                teams: [],
                teamNames: []
            });
            expect(skinsGame.requiredPlayers).toBe(4);
        });

        test('initializes with custom config', () => {
            const customConfig = {
                enabled: true,
                betAmount: 5.00,
                carryoverCount: 3,
                requiredPlayers: 3
            };
            const customGame = new SkinsGame(players, customConfig);
            
            expect(customGame.config.enabled).toBe(true);
            expect(customGame.config.betAmount).toBe(5.00);
            expect(customGame.config.carryoverCount).toBe(3);
            expect(customGame.requiredPlayers).toBe(3);
        });

        test('handles empty players array', () => {
            const emptyGame = new SkinsGame([]);
            expect(emptyGame.players).toEqual([]);
            expect(emptyGame.requiredPlayers).toBe(4);
        });
    });

    describe('addAction', () => {
        test('adds skins action correctly', () => {
            const action = {
                winner: 'Player1',
                hole: 1,
                score: 3
            };
            
            skinsGame.addAction(action);
            
            expect(skinsGame.actions).toHaveLength(1);
            expect(skinsGame.actions[0]).toEqual(expect.objectContaining({
                winner: 'Player1',
                hole: 1,
                carryoverCount: 1,
                skinsWon: 1
            }));
        });

        test('updates carryover count on carryover action', () => {
            const initialCarryover = skinsGame.config.carryoverCount;
            
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            
            expect(skinsGame.config.carryoverCount).toBe(initialCarryover + 1);
            expect(skinsGame.actions[0].carryoverCount).toBe(initialCarryover);
            expect(skinsGame.actions[0].skinsWon).toBe(0);
        });

        test('resets carryover count on win action', () => {
            // First add a carryover to increase count
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            expect(skinsGame.config.carryoverCount).toBe(2);
            
            // Then add a win action
            skinsGame.addAction({ winner: 'Player1', hole: 2, score: 3 });
            
            expect(skinsGame.config.carryoverCount).toBe(1);
            expect(skinsGame.actions[1].carryoverCount).toBe(2);
            expect(skinsGame.actions[1].skinsWon).toBe(2);
        });

        test('sets correct skinsWon based on carryover count', () => {
            // Add multiple carryovers to increase count
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            skinsGame.addAction({ winner: 'carryover', hole: 2 });
            expect(skinsGame.config.carryoverCount).toBe(3);
            
            // Win action should have skinsWon = 3
            skinsGame.addAction({ winner: 'Player1', hole: 3, score: 3 });
            expect(skinsGame.actions[2].skinsWon).toBe(3);
        });

        test('returns false for invalid action', () => {
            const invalidAction = { winner: 'InvalidPlayer', hole: 1 };
            const result = skinsGame.addAction(invalidAction);
            
            expect(result).toBe(false);
            expect(skinsGame.actions).toHaveLength(0);
        });
    });

    describe('calculateSummary', () => {
        test('returns correct player balances for individual play', () => {
            // Add actions for hole 1 - Player1 gets birdie, others get par
            skinsGame.addAction({ winner: 'Player1', hole: 1, score: 3 });
            skinsGame.addAction({ winner: 'Player2', hole: 2, score: 3 });
            
            const summary = skinsGame.calculateSummary();
            
            // Player1 gets skin on hole 1, Player2 gets skin on hole 2
            // Each skin is worth 1 point from each other player
            expect(summary['Player1']).toBe(2); // +2 from Player2 and Player3
            expect(summary['Player2']).toBe(2); // +2 from Player1 and Player3
            expect(summary['Player3']).toBe(-4); // -2 to Player1, -2 to Player2
        });

        test('handles carryover correctly', () => {
            // Add carryover on hole 1
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            
            // Add carryover on hole 2
            skinsGame.addAction({ winner: 'carryover', hole: 2 });
            
            // Player1 wins on hole 3
            skinsGame.addAction({ winner: 'Player1', hole: 3, score: 3 });
            
            const summary = skinsGame.calculateSummary();
            
            // Holes 1 and 2 are carryovers, hole 3 goes to Player1
            // Player1 gets 3 skins worth 2 points each from 2 other players = 12
            expect(summary['Player1']).toBe(12);
            expect(summary['Player2']).toBe(-6);
            expect(summary['Player3']).toBe(-6);
        });

        test('handles tied holes correctly', () => {
            // All players get par on hole 1 (tie) - use carryover
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            
            // Player1 gets birdie on hole 2
            skinsGame.addAction({ winner: 'Player1', hole: 2, score: 3 });
            
            const summary = skinsGame.calculateSummary();
            
            // Hole 1 is carryover, so no skin awarded
            // Hole 2 goes to Player1 - gets 2 skins worth 2 points each from 2 other players = 8
            expect(summary['Player1']).toBe(8); // 2 skins × 2 points × 2 players
            expect(summary['Player2']).toBe(-4); // 0 skins, paid to Player1
            expect(summary['Player3']).toBe(-4); // 0 skins, paid to Player1
        });

        test('handles multiple skins per hole', () => {
            // Add carryover to increase count
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            
            // Player1 wins with 2 skins
            skinsGame.addAction({ winner: 'Player1', hole: 2, score: 3 });
            
            const summary = skinsGame.calculateSummary();
            
            // Player1 gets 2 skins worth 2 points each from 2 other players = 8
            expect(summary['Player1']).toBe(8);
            expect(summary['Player2']).toBe(-4);
            expect(summary['Player3']).toBe(-4);
        });

        test('returns zero balances when no actions', () => {
            const summary = skinsGame.calculateSummary();
            
            expect(summary['Player1']).toBe(0);
            expect(summary['Player2']).toBe(0);
            expect(summary['Player3']).toBe(0);
        });
    });

    describe('team-based play', () => {
        let teamGame;
        
        beforeEach(() => {
            const teamPlayers = ['Player1', 'Player2', 'Player3', 'Player4'];
            teamGame = new SkinsGame(teamPlayers, { requiredPlayers: 4 });
            teamGame.setTeams(
                [['Player1', 'Player2'], ['Player3', 'Player4']],
                ['Team Alpha', 'Team Beta']
            );
        });

        test('initializes team configuration correctly', () => {
            const teams = teamGame.getTeams();
            
            expect(teams.teams).toEqual([['Player1', 'Player2'], ['Player3', 'Player4']]);
            expect(teams.teamNames).toEqual(['Team Alpha', 'Team Beta']);
        });

        test('validates team-based actions correctly', () => {
            const team1Action = { winner: SKINS_CONFIG.TEAM_1_VALUE, hole: 1 };
            const team2Action = { winner: SKINS_CONFIG.TEAM_2_VALUE, hole: 2 };
            const invalidAction = { winner: 'Player1', hole: 3 };
            
            expect(teamGame.validateAction(team1Action)).toBe(true);
            expect(teamGame.validateAction(team2Action)).toBe(true);
            expect(teamGame.validateAction(invalidAction)).toBe(false);
        });

        test('calculates team-based balances correctly', () => {
            // Team 1 wins hole 1
            teamGame.addAction({ winner: SKINS_CONFIG.TEAM_1_VALUE, hole: 1 });
            
            const summary = teamGame.calculateSummary();
            
            // Team 1 players get paid by Team 2 players
            expect(summary['Player1']).toBe(2); // +2 from Team 2
            expect(summary['Player2']).toBe(2); // +2 from Team 2
            expect(summary['Player3']).toBe(-2); // -2 to Team 1
            expect(summary['Player4']).toBe(-2); // -2 to Team 1
        });

        test('handles multiple team wins correctly', () => {
            // Team 1 wins hole 1
            teamGame.addAction({ winner: SKINS_CONFIG.TEAM_1_VALUE, hole: 1 });
            // Team 2 wins hole 2
            teamGame.addAction({ winner: SKINS_CONFIG.TEAM_2_VALUE, hole: 2 });
            
            const summary = teamGame.calculateSummary();
            
            // Both teams have 1 win, so balances should be 0
            expect(summary['Player1']).toBe(0);
            expect(summary['Player2']).toBe(0);
            expect(summary['Player3']).toBe(0);
            expect(summary['Player4']).toBe(0);
        });

        test('handles carryovers in team play', () => {
            // Add carryover
            teamGame.addAction({ winner: 'carryover', hole: 1 });
            
            // Team 1 wins hole 2
            teamGame.addAction({ winner: SKINS_CONFIG.TEAM_1_VALUE, hole: 2 });
            
            const summary = teamGame.calculateSummary();
            
            // Team 1 gets 2 skins worth 2 points each from 2 other players = 8
            expect(summary['Player1']).toBe(4); // +4 from Team 2
            expect(summary['Player2']).toBe(4); // +4 from Team 2
            expect(summary['Player3']).toBe(-4); // -4 to Team 1
            expect(summary['Player4']).toBe(-4); // -4 to Team 1
        });
    });

    describe('validateAction', () => {
        test('validates skins action correctly', () => {
            const validAction = {
                winner: 'Player1',
                hole: 1,
                score: 3
            };
            
            expect(skinsGame.validateAction(validAction)).toBe(true);
            
            const invalidAction = {
                winner: 'InvalidPlayer',
                hole: 1,
                score: 3
            };
            
            expect(skinsGame.validateAction(invalidAction)).toBe(false);
            
            const invalidHole = {
                winner: 'Player1',
                hole: 20,
                score: 3
            };
            
            expect(skinsGame.validateAction(invalidHole)).toBe(false);
        });

        test('allows carryover actions', () => {
            const carryoverAction = { winner: 'carryover', hole: 1 };
            expect(skinsGame.validateAction(carryoverAction)).toBe(true);
        });

        test('rejects actions with missing fields', () => {
            const noWinner = { hole: 1, score: 3 };
            const noHole = { winner: 'Player1', score: 3 };
            
            expect(skinsGame.validateAction(noWinner)).toBe(false);
            expect(skinsGame.validateAction(noHole)).toBe(false);
        });

        test('rejects invalid hole numbers', () => {
            const hole0 = { winner: 'Player1', hole: 0 };
            const hole19 = { winner: 'Player1', hole: 19 };
            const holeNegative = { winner: 'Player1', hole: -1 };
            
            expect(skinsGame.validateAction(hole0)).toBe(false);
            expect(skinsGame.validateAction(hole19)).toBe(false);
            expect(skinsGame.validateAction(holeNegative)).toBe(false);
        });

        test('validates team-based actions when teams configured', () => {
            const teamGame = new SkinsGame(['P1', 'P2', 'P3', 'P4'], { requiredPlayers: 4 });
            teamGame.setTeams([['P1', 'P2'], ['P3', 'P4']]);
            
            const team1Action = { winner: SKINS_CONFIG.TEAM_1_VALUE, hole: 1 };
            const team2Action = { winner: SKINS_CONFIG.TEAM_2_VALUE, hole: 2 };
            const individualAction = { winner: 'P1', hole: 3 };
            
            expect(teamGame.validateAction(team1Action)).toBe(true);
            expect(teamGame.validateAction(team2Action)).toBe(true);
            expect(teamGame.validateAction(individualAction)).toBe(false);
        });
    });

    describe('getStats', () => {
        test('returns skins-specific statistics', () => {
            skinsGame.addAction({ winner: 'Player1', hole: 1, score: 3 });
            skinsGame.addAction({ winner: 'Player2', hole: 2, score: 3 });
            
            const stats = skinsGame.getStats();
            
            expect(stats.carryovers).toBe(0);
            expect(stats.actualWins).toBe(2);
            expect(stats.currentCarryover).toBe(1);
            expect(stats.isTeamBased).toBe(false);
        });

        test('counts carryovers correctly', () => {
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            skinsGame.addAction({ winner: 'carryover', hole: 2 });
            skinsGame.addAction({ winner: 'Player1', hole: 3, score: 3 });
            
            const stats = skinsGame.getStats();
            
            expect(stats.carryovers).toBe(2);
            expect(stats.actualWins).toBe(1);
            expect(stats.currentCarryover).toBe(1);
        });

        test('identifies team-based play correctly', () => {
            const teamGame = new SkinsGame(['P1', 'P2', 'P3', 'P4'], { requiredPlayers: 4 });
            expect(teamGame.getStats().isTeamBased).toBe(false);
            
            teamGame.setTeams([['P1', 'P2'], ['P3', 'P4']]);
            expect(teamGame.getStats().isTeamBased).toBe(true);
        });

        test('includes base game statistics', () => {
            skinsGame.addAction({ winner: 'Player1', hole: 1, score: 3 });
            
            const stats = skinsGame.getStats();
            
            expect(stats.totalActions).toBe(1);
            expect(stats.betAmount).toBe(2.00);
            expect(stats.enabled).toBe(false);
        });
    });

    describe('team management', () => {
        test('setTeams updates team configuration', () => {
            const teams = [['Player1', 'Player2'], ['Player3']];
            const teamNames = ['Team Alpha', 'Team Beta'];
            
            skinsGame.setTeams(teams, teamNames);
            
            expect(skinsGame.config.teams).toEqual(teams);
            expect(skinsGame.config.teamNames).toEqual(teamNames);
        });

        test('getTeams returns current team configuration', () => {
            const teams = [['Player1'], ['Player2', 'Player3']];
            const teamNames = ['Team A', 'Team B'];
            
            skinsGame.setTeams(teams, teamNames);
            const result = skinsGame.getTeams();
            
            expect(result.teams).toEqual(teams);
            expect(result.teamNames).toEqual(teamNames);
        });

        test('handles empty team configuration', () => {
            skinsGame.setTeams([], []);
            
            expect(skinsGame.config.teams).toEqual([]);
            expect(skinsGame.config.teamNames).toEqual([]);
        });
    });

    describe('carryover management', () => {
        test('getCarryoverCount returns current count', () => {
            expect(skinsGame.getCarryoverCount()).toBe(1);
            
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            expect(skinsGame.getCarryoverCount()).toBe(2);
        });

        test('carryover count resets on win', () => {
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            skinsGame.addAction({ winner: 'carryover', hole: 2 });
            expect(skinsGame.getCarryoverCount()).toBe(3);
            
            skinsGame.addAction({ winner: 'Player1', hole: 3, score: 3 });
            expect(skinsGame.getCarryoverCount()).toBe(1);
        });
    });

    describe('edge cases and error handling', () => {
        test('handles actions with missing scores', () => {
            const actionWithoutScore = { winner: 'Player1', hole: 1 };
            
            expect(skinsGame.validateAction(actionWithoutScore)).toBe(true);
            expect(skinsGame.addAction(actionWithoutScore)).toBe(true);
        });

        test('handles multiple carryovers in sequence', () => {
            for (let i = 1; i <= 5; i++) {
                skinsGame.addAction({ winner: 'carryover', hole: i });
            }
            
            expect(skinsGame.getCarryoverCount()).toBe(6);
            expect(skinsGame.getStats().carryovers).toBe(5);
        });

        test('handles win after multiple carryovers', () => {
            // Add 3 carryovers
            skinsGame.addAction({ winner: 'carryover', hole: 1 });
            skinsGame.addAction({ winner: 'carryover', hole: 2 });
            skinsGame.addAction({ winner: 'carryover', hole: 3 });
            
            // Player1 wins hole 4
            skinsGame.addAction({ winner: 'Player1', hole: 4, score: 3 });
            
            const summary = skinsGame.calculateSummary();
            
            // Player1 gets 4 skins worth 2 points each from 2 other players = 16
            expect(summary['Player1']).toBe(16);
            expect(skinsGame.getCarryoverCount()).toBe(1);
        });

        test('handles empty players array in calculations', () => {
            const emptyGame = new SkinsGame([]);
            const summary = emptyGame.calculateSummary();
            
            expect(summary).toEqual({});
        });
    });

    describe('inheritance from BaseGame', () => {
        test('getBetAmount returns default bet amount', () => {
            expect(skinsGame.getBetAmount()).toBe(2.00); // Default from BaseGame
        });

        test('initializePlayerBalances sets all players to 0', () => {
            const balances = skinsGame.initializePlayerBalances();
            expect(balances['Player1']).toBe(0);
            expect(balances['Player2']).toBe(0);
            expect(balances['Player3']).toBe(0);
        });

        test('inherits BaseGame methods correctly', () => {
            expect(typeof skinsGame.getActions).toBe('function');
            expect(typeof skinsGame.getActionsForHole).toBe('function');
            expect(typeof skinsGame.clearActions).toBe('function');
            expect(typeof skinsGame.getConfig).toBe('function');
            expect(typeof skinsGame.updateConfig).toBe('function');
        });
    });
});
