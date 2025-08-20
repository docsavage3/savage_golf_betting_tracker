import { WolfGame } from '../../../games/wolf-game.js';
import { GAME_TYPES } from '../../../constants.js';

describe('WolfGame', () => {
    let wolfGame;
    let players;

    beforeEach(() => {
        players = ['Daniel', 'Bill', 'Josh', 'Steve'];
        wolfGame = new WolfGame(players, { betAmount: 2.00 });
    });

    describe('Constructor', () => {
        test('should create a Wolf game with correct properties', () => {
            expect(wolfGame.gameType).toBe(GAME_TYPES.WOLF);
            expect(wolfGame.players).toEqual(players);
            expect(wolfGame.requiredPlayers).toBe(4);
            expect(wolfGame.actions).toEqual([]);
        });

        test('should not throw error for 4 players', () => {
            expect(() => new WolfGame(['Daniel', 'Bill', 'Josh', 'Steve'], { betAmount: 1.00 }))
                .not.toThrow();
        });

        test('should create Wolf game with custom config', () => {
            const customConfig = {
                betAmount: 5.00,
                enabled: true,
                customProperty: 'test'
            };
            const customWolfGame = new WolfGame(players, customConfig);
            
            expect(customWolfGame.config.betAmount).toBe(5.00);
            expect(customWolfGame.config.enabled).toBe(true);
            expect(customWolfGame.config.customProperty).toBe('test');
            expect(customWolfGame.config.wolfRotation).toBeDefined();
            expect(customWolfGame.config.holesPerWolf).toBeDefined();
        });
    });

    describe('Wolf Rotation', () => {
        test('should get correct wolf for each hole', () => {
            expect(wolfGame.getWolfForHole(1)).toBe('Daniel');
            expect(wolfGame.getWolfForHole(2)).toBe('Daniel');
            expect(wolfGame.getWolfForHole(3)).toBe('Daniel');
            expect(wolfGame.getWolfForHole(4)).toBe('Daniel');
            expect(wolfGame.getWolfForHole(5)).toBe('Bill'); // Next wolf
            expect(wolfGame.getWolfForHole(9)).toBe('Josh'); // 3rd wolf
            expect(wolfGame.getWolfForHole(13)).toBe('Steve'); // 4th wolf
            expect(wolfGame.getWolfForHole(16)).toBe('Steve'); // Last hole for Steve
            expect(wolfGame.getWolfForHole(17)).toBeUndefined(); // No wolf assigned
            expect(wolfGame.getWolfForHole(18)).toBeUndefined(); // No wolf assigned
        });

        test('should get current wolf information for hole', () => {
            const wolfInfo = wolfGame.getCurrentWolf(3);
            expect(wolfInfo.player).toBe('Daniel');
            expect(wolfInfo.startHole).toBe(1);
            expect(wolfInfo.endHole).toBe(4);
        });
    });

    describe('Partner Selection', () => {
        test('should get available partners excluding current wolf', () => {
            const availablePartners = wolfGame.getAvailablePartners(1); // Daniel is wolf
            expect(availablePartners).toEqual(['Bill', 'Josh', 'Steve']);
            expect(availablePartners).not.toContain('Daniel');
        });

        test('should get available partners for different wolf', () => {
            const availablePartners = wolfGame.getAvailablePartners(5); // Bill is wolf
            expect(availablePartners).toEqual(['Daniel', 'Josh', 'Steve']);
            expect(availablePartners).not.toContain('Bill');
        });
    });

    describe('Action Validation', () => {
        test('should validate valid wolf action', () => {
            const validAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(validAction)).toBe(true);
        });

        test('should validate valid lone wolf action', () => {
            const validAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'lone_wolf',
                partner: null,
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(validAction)).toBe(true);
        });

        test('should reject action with invalid wolf choice', () => {
            const invalidAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'invalid_choice',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(invalidAction)).toBe(false);
        });

        test('should reject action with invalid result', () => {
            const invalidAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'invalid_result'
            };
            expect(wolfGame.validateAction(invalidAction)).toBe(false);
        });

        test('should reject partner action without partner', () => {
            const invalidAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: null,
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(invalidAction)).toBe(false);
        });

        test('should reject action with wolf as partner', () => {
            const invalidAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Daniel',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(invalidAction)).toBe(false);
        });

        test('should reject action with missing required fields', () => {
            const noHole = {
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(noHole)).toBe(false);

            const noWolf = {
                hole: 1,
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(noWolf)).toBe(false);

            const noWolfChoice = {
                hole: 1,
                wolf: 'Daniel',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(noWolfChoice)).toBe(false);

            const noResult = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill'
            };
            expect(wolfGame.validateAction(noResult)).toBe(false);
        });

        test('should reject action with invalid hole numbers', () => {
            const hole0 = {
                hole: 0,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(hole0)).toBe(false);

            const hole19 = {
                hole: 19,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(hole19)).toBe(false);

            const holeNegative = {
                hole: -1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(holeNegative)).toBe(false);
        });

        test('should reject action with invalid wolf player', () => {
            const invalidWolf = {
                hole: 1,
                wolf: 'InvalidPlayer',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(invalidWolf)).toBe(false);
        });

        test('should reject action with wrong wolf for hole', () => {
            // Daniel is wolf for holes 1-4, so Bill can't be wolf on hole 1
            const wrongWolf = {
                hole: 1,
                wolf: 'Bill',
                wolfChoice: 'partner',
                partner: 'Josh',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(wrongWolf)).toBe(false);

            // Bill is wolf for holes 5-8, so Daniel can't be wolf on hole 5
            const wrongWolf2 = {
                hole: 5,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Josh',
                result: 'wolf_wins'
            };
            expect(wolfGame.validateAction(wrongWolf2)).toBe(false);
        });
    });

    describe('Action Management', () => {
        test('should add valid action', () => {
            const action = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            
            wolfGame.addAction(action);
            expect(wolfGame.actions).toHaveLength(1);
            expect(wolfGame.actions[0]).toEqual(action);
        });

        test('should reject invalid action', () => {
            const invalidAction = {
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'invalid',
                partner: 'Bill',
                result: 'wolf_wins'
            };
            
            wolfGame.addAction(invalidAction);
            expect(wolfGame.actions).toHaveLength(0);
        });

        test('should check if hole is played', () => {
            expect(wolfGame.isHolePlayed(1)).toBe(false);
            
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });
            
            expect(wolfGame.isHolePlayed(1)).toBe(true);
            expect(wolfGame.isHolePlayed(2)).toBe(false);
        });
    });

    describe('Summary Calculation', () => {
        test('should calculate empty summary', () => {
            const summary = wolfGame.calculateSummary();
            expect(summary).toEqual({
                Daniel: 0,
                Bill: 0,
                Josh: 0,
                Steve: 0
            });
        });

        test('should calculate summary for wolf + partner win', () => {
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });

            const summary = wolfGame.calculateSummary();
            expect(summary.Daniel).toBe(4.00); // Gets 2x bet amount
            expect(summary.Bill).toBe(4.00);   // Gets 2x bet amount
            expect(summary.Josh).toBe(-2.00);  // Loses bet amount
            expect(summary.Steve).toBe(-2.00); // Loses bet amount
        });

        test('should calculate summary for lone wolf win', () => {
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'lone_wolf',
                partner: null,
                result: 'wolf_wins'
            });

            const summary = wolfGame.calculateSummary();
            expect(summary.Daniel).toBe(8.00); // Gets 4x bet amount
            expect(summary.Bill).toBe(-2.00);  // Loses bet amount
            expect(summary.Josh).toBe(-2.00);  // Loses bet amount
            expect(summary.Steve).toBe(-2.00); // Loses bet amount
        });

        test('should calculate summary for wolf + partner lose', () => {
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'partners_win'
            });

            const summary = wolfGame.calculateSummary();
            expect(summary.Daniel).toBe(-6.00); // Loses 3x bet
            expect(summary.Bill).toBe(-6.00);   // Loses 3x bet
            expect(summary.Josh).toBe(2.00);    // Gets bet amount
            expect(summary.Steve).toBe(2.00);   // Gets bet amount
        });

        test('should calculate summary for lone wolf lose', () => {
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'lone_wolf',
                partner: null,
                result: 'partners_win'
            });

            const summary = wolfGame.calculateSummary();
            expect(summary.Daniel).toBe(-6.00); // Loses 3x bet
            expect(summary.Bill).toBe(2.00);    // Gets bet amount
            expect(summary.Josh).toBe(2.00);    // Gets bet amount
            expect(summary.Steve).toBe(2.00);   // Gets bet amount
        });

        test('should calculate summary for multiple holes', () => {
            // Hole 1: Daniel + Bill win
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });

            // Hole 5: Bill + Daniel win (Bill is wolf on hole 5)
            wolfGame.addAction({
                hole: 5,
                wolf: 'Bill',
                wolfChoice: 'partner',
                partner: 'Daniel',
                result: 'wolf_wins'
            });

            const summary = wolfGame.calculateSummary();
            expect(summary.Daniel).toBe(8.00); // +4 from hole 1, +4 from hole 5
            expect(summary.Bill).toBe(8.00);   // +4 from hole 5 only (but gets 2x bet = 4)
            expect(summary.Josh).toBe(-4.00);  // -2 from hole 1, -2 from hole 5
            expect(summary.Steve).toBe(-4.00); // -2 from hole 1, -2 from hole 5
        });
    });

    describe('Game Statistics', () => {
        test('should get game statistics', () => {
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });

            const stats = wolfGame.getStats();
            expect(stats.totalActions).toBe(1);
            expect(stats.totalHoles).toBe(1);
            expect(stats.wolfWins).toBe(1);
            expect(stats.partnerWins).toBe(0);
            expect(stats.requiredPlayers).toBe(4);
        });
    });

    describe('Wolf Schedule', () => {
        test('should get wolf schedule for 18 holes', () => {
            const schedule = wolfGame.getWolfSchedule();
            expect(schedule).toHaveLength(4); // 4 wolf rotations
            
            // Check first wolf rotation
            expect(schedule[0].player).toBe('Daniel'); // Holes 1-4
            expect(schedule[0].holes).toBe('1-4');
            
            // Check second wolf rotation
            expect(schedule[1].player).toBe('Bill');   // Holes 5-8
            expect(schedule[1].holes).toBe('5-8');
        });

        test('should get next wolf hole', () => {
            expect(wolfGame.getNextWolfHole('Daniel')).toBe(1); // Daniel is wolf on holes 1-4
            expect(wolfGame.getNextWolfHole('Bill')).toBe(5);   // Bill is wolf on holes 5-8
            expect(wolfGame.getNextWolfHole('Josh')).toBe(9);   // Josh is wolf on holes 9-12
            expect(wolfGame.getNextWolfHole('Steve')).toBe(13); // Steve is wolf on holes 13-16
        });

        test('should return null for invalid player in getNextWolfHole', () => {
            expect(wolfGame.getNextWolfHole('InvalidPlayer')).toBe(null);
            expect(wolfGame.getNextWolfHole('')).toBe(null);
            expect(wolfGame.getNextWolfHole(null)).toBe(null);
        });

        test('should return null when all wolf holes are played', () => {
            // Play all of Daniel's holes (1-4)
            wolfGame.addAction({
                hole: 1,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });
            wolfGame.addAction({
                hole: 2,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });
            wolfGame.addAction({
                hole: 3,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });
            wolfGame.addAction({
                hole: 4,
                wolf: 'Daniel',
                wolfChoice: 'partner',
                partner: 'Bill',
                result: 'wolf_wins'
            });

            // Now Daniel should have no more holes
            expect(wolfGame.getNextWolfHole('Daniel')).toBe(null);
        });
    });
});
