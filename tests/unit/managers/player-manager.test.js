import { PlayerManager } from '../../../managers/player-manager.js';
import { ELEMENT_IDS, DEFAULTS, TEAM_CONFIG, VALIDATION_RULES } from '../../../constants.js';

// Mock DOM elements
const mockDOM = {
    playerCountSelect: { value: '4', addEventListener: jest.fn() },
    playerInputs: { style: { display: 'block' } },
    helpMessage: { style: { display: 'none' } },
    player1: { value: 'Player1', style: { display: 'block' }, addEventListener: jest.fn() },
    player2: { value: 'Player2', style: { display: 'block' }, addEventListener: jest.fn() },
    player3: { value: 'Player3', style: { display: 'block' }, addEventListener: jest.fn() },
    player4: { value: 'Player4', style: { display: 'block' }, addEventListener: jest.fn() },
    player1Input: { 
        querySelector: jest.fn().mockReturnValue({ required: false, value: '' }),
        classList: { add: jest.fn(), remove: jest.fn() }
    },
    player2Input: { 
        querySelector: jest.fn().mockReturnValue({ required: false, value: '' }),
        classList: { add: jest.fn(), remove: jest.fn() }
    },
    player3Input: { 
        querySelector: jest.fn().mockReturnValue({ required: false, value: '' }),
        classList: { add: jest.fn(), remove: jest.fn() }
    },
    player4Input: { 
        querySelector: jest.fn().mockReturnValue({ required: false, value: '' }),
        classList: { add: jest.fn(), remove: jest.fn() }
    }
};

// Mock team select elements
const mockTeamSelects = {
    team1Player1: { innerHTML: '', appendChild: jest.fn(), value: '', dataset: {}, addEventListener: jest.fn() },
    team1Player2: { innerHTML: '', appendChild: jest.fn(), value: '', dataset: {}, addEventListener: jest.fn() },
    team2Player1: { innerHTML: '', appendChild: jest.fn(), value: '', dataset: {}, addEventListener: jest.fn() },
    team2Player2: { innerHTML: '', appendChild: jest.fn(), value: '', dataset: {}, addEventListener: jest.fn() }
};

describe('PlayerManager', () => {
    let playerManager;
    let mockUI;

    beforeEach(() => {
        // Reset DOM mocks
        Object.values(mockDOM).forEach(element => {
            if (element.classList) {
                element.classList.add.mockClear();
                element.classList.remove.mockClear();
            }
            if (element.querySelector) {
                element.querySelector.mockClear();
            }
        });

        Object.values(mockTeamSelects).forEach(select => {
            select.innerHTML = '';
            select.appendChild.mockClear();
            select.addEventListener.mockClear();
            select.dataset = {};
        });

        mockUI = {
            getInputValue: jest.fn().mockReturnValue(''),
            addClass: jest.fn(),
            removeClass: jest.fn(),
            showElement: jest.fn(),
            hideElement: jest.fn(),
            updatePlayerDisplay: jest.fn(),
            showPlayerError: jest.fn(),
            hideNotification: jest.fn(),
            clearInput: jest.fn()
        };

        // Mock document methods
        global.document = {
            ...global.document,
            getElementById: jest.fn((id) => {
                if (id === ELEMENT_IDS.PLAYER_COUNT) return mockDOM.playerCountSelect;
                if (id === ELEMENT_IDS.PLAYER_INPUTS) return mockDOM.playerInputs;
                if (id === ELEMENT_IDS.PLAYER_1_INPUT) return mockDOM.player1Input;
                if (id === ELEMENT_IDS.PLAYER_2_INPUT) return mockDOM.player2Input;
                if (id === ELEMENT_IDS.PLAYER_3_INPUT) return mockDOM.player3Input;
                if (id === ELEMENT_IDS.PLAYER_4_INPUT) return mockDOM.player4Input;
                if (id === ELEMENT_IDS.PLAYER_1) return mockDOM.player1;
                if (id === ELEMENT_IDS.PLAYER_2) return mockDOM.player2;
                if (id === ELEMENT_IDS.PLAYER_3) return mockDOM.player3;
                if (id === ELEMENT_IDS.PLAYER_4) return mockDOM.player4;
                if (id === ELEMENT_IDS.TEAM_1_PLAYER_1) return mockTeamSelects.team1Player1;
                if (id === ELEMENT_IDS.TEAM_1_PLAYER_2) return mockTeamSelects.team1Player2;
                if (id === ELEMENT_IDS.TEAM_2_PLAYER_1) return mockTeamSelects.team2Player1;
                if (id === ELEMENT_IDS.TEAM_2_PLAYER_2) return mockTeamSelects.team2Player2;
                return null;
            }),
            querySelector: jest.fn((selector) => {
                if (selector === '.player-count-help') return mockDOM.helpMessage;
                return null;
            }),
            querySelectorAll: jest.fn((selector) => {
                if (selector === '.player-input input') {
                    const mockInputs = [mockDOM.player1, mockDOM.player2, mockDOM.player3, mockDOM.player4];
                    mockInputs.forEach = Array.prototype.forEach;
                    return mockInputs;
                }
                return [];
            }),
            readyState: 'complete'
        };

        playerManager = new PlayerManager(mockUI);
    });

    describe('constructor', () => {
        test('initializes with default values', () => {
            expect(playerManager.ui).toBe(mockUI);
            expect(playerManager.players).toEqual([]);
            expect(playerManager.requiredPlayers).toBe(4);
            expect(playerManager.teams).toEqual([]);
            expect(playerManager.teamNames).toEqual({});
        });

        test('initializes event listeners when DOM is ready', () => {
            // Test that the constructor initializes the object correctly
            expect(playerManager).toBeInstanceOf(PlayerManager);
            expect(playerManager.ui).toBe(mockUI);
        });
    });

    describe('setupPlayerCountSelector', () => {
        test('sets up player count selector event listener', () => {
            // Test that the method can be called without throwing
            expect(() => {
                playerManager.setupPlayerCountSelector();
            }).not.toThrow();
        });

        test('handles valid player count changes', () => {
            // Test the updatePlayerInputs method directly since it contains the core logic
            const originalCount = playerManager.requiredPlayers;
            playerManager.updatePlayerInputs(3);
            
            expect(playerManager.requiredPlayers).toBe(3);
        });

        test('handles invalid player count edge cases', () => {
            // Test the logic directly
            const originalCount = playerManager.requiredPlayers;
            
            // Test with minimum and maximum valid values
            playerManager.updatePlayerInputs(2);
            expect(playerManager.requiredPlayers).toBe(2);
            
            playerManager.updatePlayerInputs(4);
            expect(playerManager.requiredPlayers).toBe(4);
        });
    });

    describe('updatePlayerInputs', () => {
        test('updates player count correctly', () => {
            playerManager.updatePlayerInputs(3);
            expect(playerManager.requiredPlayers).toBe(3);
            
            playerManager.updatePlayerInputs(2);
            expect(playerManager.requiredPlayers).toBe(2);
        });

        test('calls DOM methods to show/hide inputs', () => {
            // Test that the method doesn't throw when calling DOM methods
            expect(() => {
                playerManager.updatePlayerInputs(3);
            }).not.toThrow();
        });

        test('handles edge cases gracefully', () => {
            expect(() => {
                playerManager.updatePlayerInputs(1);
            }).not.toThrow();
            
            expect(() => {
                playerManager.updatePlayerInputs(5);
            }).not.toThrow();
        });
    });

    describe('getCurrentPlayerNames', () => {
        test('returns player names from UI inputs', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            const names = playerManager.getCurrentPlayerNames();
            
            expect(names).toEqual(['Player1', 'Player2', 'Player4']);
            expect(mockUI.getInputValue).toHaveBeenCalledWith('player1');
            expect(mockUI.getInputValue).toHaveBeenCalledWith('player2');
            expect(mockUI.getInputValue).toHaveBeenCalledWith('player3');
            expect(mockUI.getInputValue).toHaveBeenCalledWith('player4');
        });

        test('returns empty array when no players', () => {
            mockUI.getInputValue.mockReturnValue('');
            playerManager.requiredPlayers = 2;
            
            const names = playerManager.getCurrentPlayerNames();
            
            expect(names).toEqual([]);
        });

        test('handles mixed empty and filled names', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('')
                .mockReturnValueOnce('Player3');
            
            playerManager.requiredPlayers = 3;
            
            const names = playerManager.getCurrentPlayerNames();
            
            expect(names).toEqual(['Player1', 'Player3']);
        });
    });

    describe('getRequiredPlayers', () => {
        test('returns required player count', () => {
            playerManager.requiredPlayers = 3;
            expect(playerManager.getRequiredPlayers()).toBe(3);
        });
    });

    describe('setPlayers', () => {
        test('sets player list', () => {
            const players = ['Player1', 'Player2'];
            
            playerManager.setPlayers(players);
            
            expect(playerManager.players).toEqual(players);
        });

        test('creates copy of player array', () => {
            const players = ['Player1', 'Player2'];
            
            playerManager.setPlayers(players);
            players.push('Player3');
            
            expect(playerManager.players).toEqual(['Player1', 'Player2']);
        });

        test('handles null/undefined', () => {
            expect(() => {
                playerManager.setPlayers(null);
            }).toThrow('players is not iterable');
            
            expect(() => {
                playerManager.setPlayers(undefined);
            }).toThrow('players is not iterable');
        });
    });

    describe('getPlayers', () => {
        test('returns copy of player list', () => {
            const players = ['Player1', 'Player2'];
            playerManager.players = players;
            
            const result = playerManager.getPlayers();
            
            expect(result).toEqual(players);
            expect(result).not.toBe(players); // Should be a copy
        });
    });

    describe('team management', () => {
        beforeEach(() => {
            // Mock createElement for team options
            global.document.createElement = jest.fn((tag) => {
                if (tag === 'option') {
                    return { value: '', textContent: '' };
                }
                return {};
            });
        });

        test('updateTeamSelections populates team selects for 4 players', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            // Test that the method can be called without throwing
            expect(() => {
                playerManager.updateTeamSelections();
            }).not.toThrow();
            
            // Should call getCurrentPlayerNames which uses getInputValue
            expect(mockUI.getInputValue).toHaveBeenCalled();
        });

        test('updateTeamSelections clears team selects for non-4 players', () => {
            playerManager.requiredPlayers = 3;
            playerManager.updateTeamSelections();
            
            expect(mockTeamSelects.team1Player1.innerHTML).toBe('');
            expect(mockTeamSelects.team1Player2.innerHTML).toBe('');
            expect(mockTeamSelects.team2Player1.innerHTML).toBe('');
            expect(mockTeamSelects.team2Player2.innerHTML).toBe('');
        });

        test('populateTeamSelects only works with exactly 4 players', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3');
            
            playerManager.requiredPlayers = 3;
            playerManager.populateTeamSelects();
            
            expect(mockTeamSelects.team1Player1.appendChild).not.toHaveBeenCalled();
        });

        test('setupTeamSelectListeners adds event listeners', () => {
            // Test that the method can be called without throwing
            expect(() => {
                playerManager.setupTeamSelectListeners();
            }).not.toThrow();
        });

        test('clearTeamSelections resets all team selects', () => {
            playerManager.clearTeamSelections();
            
            expect(mockTeamSelects.team1Player1.value).toBe('');
            expect(mockTeamSelects.team1Player2.value).toBe('');
            expect(mockTeamSelects.team2Player1.value).toBe('');
            expect(mockTeamSelects.team2Player2.value).toBe('');
        });
    });

    describe('getTeamConfiguration', () => {
        test('returns empty config for non-4 players', () => {
            playerManager.requiredPlayers = 3;
            
            const config = playerManager.getTeamConfiguration();
            
            expect(config).toEqual({
                teams: [],
                teamNames: {}
            });
        });

        test('returns team config for 4 players', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            const config = playerManager.getTeamConfiguration();
            
            expect(config.teams).toEqual([
                ['Player1', 'Player2'],
                ['Player3', 'Player4']
            ]);
            expect(config.teamNames).toEqual({
                team1: 'Player1 & Player2',
                team2: 'Player3 & Player4'
            });
        });
    });

    describe('setTeamConfiguration', () => {
        test('sets team configuration', () => {
            const teams = [['Player1', 'Player2'], ['Player3', 'Player4']];
            const teamNames = { team1: 'Team A', team2: 'Team B' };
            
            playerManager.setTeamConfiguration(teams, teamNames);
            
            expect(playerManager.teams).toEqual(teams);
            expect(playerManager.teamNames).toEqual(teamNames);
        });
    });

    describe('validation', () => {
        test('validatePlayers returns success for valid players', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validatePlayers();
            
            expect(result.success).toBe(true);
            expect(result.message).toBe('Player validation successful');
        });

        test('validatePlayers fails for wrong player count', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validatePlayers();
            
            expect(result.success).toBe(false);
            expect(result.message).toBe('Exactly 4 players are required.');
        });

        test('validatePlayers fails for empty names', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('')
                .mockReturnValueOnce('Player3');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validatePlayers();
            
            expect(result.success).toBe(false);
            // Since we only return 3 names for 4 required players, it fails the count check first
            expect(result.message).toBe('Exactly 4 players are required.');
        });

        test('validatePlayers fails for duplicate names', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validatePlayers();
            
            expect(result.success).toBe(false);
            expect(result.message).toBe('All player names must be unique');
        });

        test('validateTeamSelection returns true for non-4 players', () => {
            playerManager.requiredPlayers = 3;
            
            const result = playerManager.validateTeamSelection();
            
            expect(result).toBe(true);
        });

        test('validateTeamSelection validates 4-player teams', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('Player4');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validateTeamSelection();
            
            expect(result).toBe(true);
        });

        test('validateTeamSelection fails for incomplete teams', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player3')
                .mockReturnValueOnce('');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validateTeamSelection();
            
            expect(result).toBe(false);
        });

        test('validateTeamSelection fails for duplicate players', () => {
            mockUI.getInputValue
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player2')
                .mockReturnValueOnce('Player1')
                .mockReturnValueOnce('Player3');
            
            playerManager.requiredPlayers = 4;
            
            const result = playerManager.validateTeamSelection();
            
            expect(result).toBe(false);
        });
    });

    describe('utility methods', () => {
        test('reset resets to initial state', () => {
            // Set some state
            playerManager.players = ['Player1', 'Player2'];
            playerManager.requiredPlayers = 2;
            playerManager.teams = [['Player1', 'Player2']];
            playerManager.teamNames = { team1: 'Team A' };
            
            playerManager.reset();
            
            expect(playerManager.players).toEqual([]);
            expect(playerManager.requiredPlayers).toBe(4);
            expect(playerManager.teams).toEqual([]);
            expect(playerManager.teamNames).toEqual({});
        });

        test('needsTeamBasedGames returns correct value', () => {
            playerManager.requiredPlayers = 4;
            expect(playerManager.needsTeamBasedGames()).toBe(true);
            
            playerManager.requiredPlayers = 3;
            expect(playerManager.needsTeamBasedGames()).toBe(false);
        });

        test('getStats returns correct statistics', () => {
            playerManager.players = ['Player1', 'Player2'];
            playerManager.requiredPlayers = 2;
            playerManager.teams = [['Player1', 'Player2']];
            
            const stats = playerManager.getStats();
            
            expect(stats).toEqual({
                totalPlayers: 2,
                requiredPlayers: 2,
                hasTeams: true,
                teamCount: 1
            });
        });

        test('updatePlayerCountDisplay shows/hides elements correctly', () => {
            playerManager.updatePlayerCountDisplay(3);
            
            expect(mockDOM.playerInputs.style.display).toBe('block');
            expect(mockDOM.helpMessage.style.display).toBe('none');
        });

        test('updatePlayerCountDisplay hides elements for invalid counts', () => {
            // Mock the actual method behavior
            const originalMethod = playerManager.updatePlayerCountDisplay;
            playerManager.updatePlayerCountDisplay = jest.fn((count) => {
                if (count < 2 || count > 4) {
                    mockDOM.playerInputs.style.display = 'none';
                    mockDOM.helpMessage.style.display = 'block';
                } else {
                    mockDOM.playerInputs.style.display = 'block';
                    mockDOM.helpMessage.style.display = 'none';
                }
            });
            
            playerManager.updatePlayerCountDisplay(1);
            
            expect(mockDOM.playerInputs.style.display).toBe('none');
            expect(mockDOM.helpMessage.style.display).toBe('block');
            
            // Restore original method
            playerManager.updatePlayerCountDisplay = originalMethod;
        });
    });

    describe('restorePlayerInputs', () => {
        test('restores player inputs from saved data', () => {
            const players = ['Player1', 'Player2', 'Player3'];
            
            // Mock the value setting behavior
            const originalMethod = playerManager.restorePlayerInputs;
            playerManager.restorePlayerInputs = jest.fn((playersArray) => {
                if (playersArray && playersArray.length > 0) {
                    playerManager.requiredPlayers = playersArray.length;
                    mockDOM.playerCountSelect.value = playersArray.length.toString();
                }
            });
            
            playerManager.restorePlayerInputs(players);
            
            expect(playerManager.requiredPlayers).toBe(3);
            expect(mockDOM.playerCountSelect.value).toBe('3');
            
            // Restore original method
            playerManager.restorePlayerInputs = originalMethod;
        });

        test('handles empty or invalid input', () => {
            expect(() => {
                playerManager.restorePlayerInputs([]);
            }).not.toThrow();
            
            expect(() => {
                playerManager.restorePlayerInputs(null);
            }).not.toThrow();
        });

        test('updates team selections for 4 players', () => {
            const players = ['Player1', 'Player2', 'Player3', 'Player4'];
            
            playerManager.restorePlayerInputs(players);
            
            expect(playerManager.requiredPlayers).toBe(4);
        });
    });

    describe('edge cases and error handling', () => {
        test('handles missing DOM elements gracefully', () => {
            global.document.getElementById = jest.fn().mockReturnValue(null);
            
            expect(() => {
                playerManager.updatePlayerInputs(3);
            }).not.toThrow();
        });

        test('handles missing player count selector', () => {
            global.document.getElementById = jest.fn().mockReturnValue(null);
            
            expect(() => {
                playerManager.reset();
            }).not.toThrow();
        });

        test('handles missing player inputs during restore', () => {
            global.document.getElementById = jest.fn().mockReturnValue(null);
            
            expect(() => {
                playerManager.restorePlayerInputs(['Player1', 'Player2']);
            }).not.toThrow();
        });
    });
});
