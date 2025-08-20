import { KPGame } from '../../../games/kp-game.js';

describe('KPGame', () => {
    let kpGame;
    let players;

    beforeEach(() => {
        players = ['Player1', 'Player2', 'Player3'];
        kpGame = new KPGame(players);
    });

    test('initializes with correct properties', () => {
        expect(kpGame.players).toEqual(players);
        expect(kpGame.actions).toEqual([]);
        expect(kpGame.config).toEqual({
            enabled: false,
            betAmount: 2.00
        });
    });

    test('addAction adds KP action correctly', () => {
        const action = {
            winner: 'Player1',
            hole: 1,
            distance: 3.2
        };
        
        kpGame.addAction(action);
        
        expect(kpGame.actions).toHaveLength(1);
        expect(kpGame.actions[0]).toEqual(action);
    });

    test('calculateSummary returns correct player balances', () => {
        // Add KP actions
        kpGame.addAction({ winner: 'Player1', hole: 1 });
        kpGame.addAction({ winner: 'Player2', hole: 2 });
        
        const summary = kpGame.calculateSummary();
        
        // Each KP winner gets paid by 2 other players (1 point each)
        // Player1: +2 (from Player2 and Player3) = 2
        // Player2: +2 (from Player1 and Player3) = 2  
        // Player3: -2 (paid to Player1) - 2 (paid to Player2) = -4
        expect(summary['Player1']).toBe(2);
        expect(summary['Player2']).toBe(2);
        expect(summary['Player3']).toBe(-4);
    });

    test('validateAction validates KP action correctly', () => {
        const validAction = {
            winner: 'Player1',
            hole: 1
        };
        
        expect(kpGame.validateAction(validAction)).toBe(true);
        
        const invalidAction = {
            winner: 'InvalidPlayer',
            hole: 1
        };
        
        expect(kpGame.validateAction(invalidAction)).toBe(false);
        
        const invalidHole = {
            winner: 'Player1',
            hole: 20
        };
        
        expect(kpGame.validateAction(invalidHole)).toBe(false);

        const noPlayer = {
            hole: 1
        };
        expect(kpGame.validateAction(noPlayer)).toBe(false);

        const noHole = {
            winner: 'Player1'
        };
        expect(kpGame.validateAction(noHole)).toBe(false);
    });

    test('getStats returns KP-specific statistics', () => {
        kpGame.addAction({ winner: 'Player1', hole: 1 });
        kpGame.addAction({ winner: 'Player2', hole: 2 });
        
        const stats = kpGame.getStats();
        
        expect(stats.playerWins['Player1']).toBe(1);
        expect(stats.playerWins['Player2']).toBe(1);
        expect(stats.playerWins['Player3']).toBe(0);
        expect(stats.totalKPs).toBe(2);
    });

    test('getPlayerWins returns actions won by specific player', () => {
        kpGame.addAction({ winner: 'Player1', hole: 1 });
        kpGame.addAction({ winner: 'Player2', hole: 2 });
        kpGame.addAction({ winner: 'Player1', hole: 3 });
        
        const player1Wins = kpGame.getPlayerWins('Player1');
        expect(player1Wins).toHaveLength(2);
        expect(player1Wins[0].hole).toBe(1);
        expect(player1Wins[1].hole).toBe(3);
    });

    test('getPar3KPs returns KP actions on Par 3 holes', () => {
        kpGame.addAction({ winner: 'Player1', hole: 3 }); // Par 3
        kpGame.addAction({ winner: 'Player2', hole: 4 }); // Not Par 3
        kpGame.addAction({ winner: 'Player3', hole: 7 }); // Par 3
        
        const par3KPs = kpGame.getPar3KPs();
        expect(par3KPs).toHaveLength(2);
        expect(par3KPs[0].hole).toBe(3);
        expect(par3KPs[1].hole).toBe(7);
    });

    test('handles both winner and player fields for compatibility', () => {
        kpGame.addAction({ player: 'Player1', hole: 1 }); // Using 'player' field
        kpGame.addAction({ winner: 'Player2', hole: 2 }); // Using 'winner' field
        
        const summary = kpGame.calculateSummary();
        expect(summary['Player1']).toBe(2);
        expect(summary['Player2']).toBe(2);
        expect(summary['Player3']).toBe(-4);
    });

    test('getBetAmount returns default bet amount', () => {
        expect(kpGame.getBetAmount()).toBe(2.00); // Default from BaseGame
    });

    test('initializePlayerBalances sets all players to 0', () => {
        const balances = kpGame.initializePlayerBalances();
        expect(balances['Player1']).toBe(0);
        expect(balances['Player2']).toBe(0);
        expect(balances['Player3']).toBe(0);
    });

    test('hasKPForHole checks if hole has KP', () => {
        expect(kpGame.hasKPForHole(1)).toBe(false);
        
        kpGame.addAction({ winner: 'Player1', hole: 1 });
        expect(kpGame.hasKPForHole(1)).toBe(true);
        expect(kpGame.hasKPForHole(2)).toBe(false);
    });

    test('getKPWinnerForHole returns winner for specific hole', () => {
        expect(kpGame.getKPWinnerForHole(1)).toBe(null);
        
        kpGame.addAction({ winner: 'Player1', hole: 1 });
        expect(kpGame.getKPWinnerForHole(1)).toBe('Player1');
        expect(kpGame.getKPWinnerForHole(2)).toBe(null);
    });
});
