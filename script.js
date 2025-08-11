class SavageGolf {
    constructor() {
        this.players = [];
        this.gameConfigs = {};
        this.currentHole = 1;
        this.gameActions = {
            murph: [],
            skins: []
        };
        this.gameStarted = false;
        this.requiredPlayers = 4;
        
        this.initializeEventListeners();
        this.setupGameCheckboxes();
    }

    initializeEventListeners() {
        // Game setup
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        
        // Game play
        document.getElementById('nextHole').addEventListener('click', () => this.nextHole());
        
        // Murph game
        document.getElementById('callMurph').addEventListener('click', () => this.showMurphModal());
        document.getElementById('saveMurph').addEventListener('click', () => this.saveMurphCall());
        document.getElementById('cancelMurph').addEventListener('click', () => this.hideMurphModal());
        
        // Skins game
        document.getElementById('recordSkins').addEventListener('click', () => this.showSkinsModal());
        document.getElementById('saveSkins').addEventListener('click', () => this.saveSkinsAction());
        document.getElementById('cancelSkins').addEventListener('click', () => this.hideSkinsModal());
        
        // New game
        document.getElementById('newGame').addEventListener('click', () => this.resetGame());
        
        // Close modals when clicking outside
        document.getElementById('murphModal').addEventListener('click', (e) => {
            if (e.target.id === 'murphModal') {
                this.hideMurphModal();
            }
        });
        
        document.getElementById('skinsModal').addEventListener('click', (e) => {
            if (e.target.id === 'skinsModal') {
                this.hideSkinsModal();
            }
        });
    }

    setupGameCheckboxes() {
        // Set up game selection checkboxes
        const murphCheckbox = document.getElementById('gameMurph');
        const skinsCheckbox = document.getElementById('gameSkins');
        
        murphCheckbox.addEventListener('change', () => this.toggleGameSection('murph'));
        skinsCheckbox.addEventListener('change', () => this.toggleGameSection('skins'));
        
        // Initialize with Murph checked
        this.toggleGameSection('murph');
        
        // Set up player input listeners to populate team selects when players are entered
        this.setupPlayerInputListeners();
    }

    setupPlayerInputListeners() {
        // Listen for changes in player name inputs to populate team selects
        const playerInputs = document.querySelectorAll('.player-input input');
        playerInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateTeamSelects();
            });
        });
    }

    updateTeamSelects() {
        // Get current player names
        const playerNames = Array.from(document.querySelectorAll('.player-input input'))
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        // Only populate if we have 4 players
        if (playerNames.length === 4) {
            this.populateTeamSelects();
        }
    }

    populateTeamSelects() {
        // Get current player names from inputs
        const playerNames = Array.from(document.querySelectorAll('.player-input input'))
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        // Populate all team selection dropdowns
        const teamSelects = [
            'team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'
        ];
        
        teamSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select player...</option>';
            
            playerNames.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                select.appendChild(option);
            });
        });
        
        // Add change listeners to update other dropdowns when selections change
        this.setupTeamSelectListeners();
    }

    setupTeamSelectListeners() {
        const teamSelects = [
            'team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'
        ];
        
        teamSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.addEventListener('change', () => {
                this.updateTeamSelectsAvailability();
            });
        });
    }

    updateTeamSelectsAvailability() {
        const teamSelects = [
            'team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'
        ];
        
        // Get all currently selected values
        const selectedValues = teamSelects.map(selectId => {
            const select = document.getElementById(selectId);
            return select.value;
        });
        
        // Update each dropdown to show only available players
        teamSelects.forEach((selectId, index) => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            
            // Store current selection
            const wasSelected = currentValue;
            
            // Clear and repopulate
            select.innerHTML = '<option value="">Select player...</option>';
            
            // Get all player names
            const playerNames = Array.from(document.querySelectorAll('.player-input input'))
                .map(input => input.value.trim())
                .filter(name => name.length > 0);
            
            // Add options for available players
            playerNames.forEach(player => {
                // Check if this player is already selected in another dropdown
                const isSelectedElsewhere = selectedValues.some((value, otherIndex) => 
                    value === player && otherIndex !== index
                );
                
                // Only add if not selected elsewhere, or if this is the current selection
                if (!isSelectedElsewhere || player === wasSelected) {
                    const option = document.createElement('option');
                    option.value = player;
                    option.textContent = player;
                    select.appendChild(option);
                }
            });
            
            // Restore selection if it was valid
            if (wasSelected && wasSelected !== '') {
                select.value = wasSelected;
            }
        });
    }

    validateTeamSelection() {
        const team1Player1 = document.getElementById('team1Player1').value;
        const team1Player2 = document.getElementById('team1Player2').value;
        const team2Player1 = document.getElementById('team2Player1').value;
        const team2Player2 = document.getElementById('team2Player2').value;
        
        // Check if all players are selected
        if (!team1Player1 || !team1Player2 || !team2Player1 || !team2Player2) {
            return false;
        }
        
        // Check for duplicate players
        const selectedPlayers = [team1Player1, team1Player2, team2Player1, team2Player2];
        const uniquePlayers = new Set(selectedPlayers);
        
        return uniquePlayers.size === 4;
    }

    clearTeamSelections() {
        // Clear team selection dropdowns
        const teamSelects = ['team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'];
        teamSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.value = '';
        });
    }

    toggleGameSection(gameType) {
        const checkbox = document.getElementById(`game${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`);
        const betAmount = document.getElementById(`${gameType}BetAmount`);
        const gameSection = document.getElementById(`${gameType}Actions`);
        
        if (gameType === 'skins') {
            const teamSelection = document.getElementById('skinsTeamSelection');
            if (checkbox.checked) {
                betAmount.style.display = 'block';
                teamSelection.style.display = 'block';
                // Populate team selects if we have 4 players
                this.updateTeamSelects();
                if (this.gameStarted) {
                    gameSection.style.display = 'block';
                }
            } else {
                betAmount.style.display = 'none';
                teamSelection.style.display = 'none';
                // Clear team selections when unchecking
                this.clearTeamSelections();
                if (this.gameStarted) {
                    gameSection.style.display = 'none';
                }
            }
        } else {
            if (checkbox.checked) {
                betAmount.style.display = 'block';
                if (this.gameStarted) {
                    gameSection.style.display = 'block';
                }
            } else {
                betAmount.style.display = 'none';
                if (this.gameStarted) {
                    gameSection.style.display = 'none';
                }
            }
        }
    }

    startGame() {
        // Validate inputs
        if (!this.validateGameSetup()) return;
        
        // Get player names
        this.players = Array.from(document.querySelectorAll('.player-input input'))
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        // Get game configurations
        this.gameConfigs = {};
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        
        if (murphChecked) {
            this.gameConfigs.murph = {
                betAmount: parseFloat(document.getElementById('murphBet').value),
                enabled: true
            };
        }
        
        if (skinsChecked) {
            // Validate team selection
            if (!this.validateTeamSelection()) {
                this.showNotification('Please select 4 different players for the two teams.', 'error');
                return;
            }
            
            const team1Player1 = document.getElementById('team1Player1').value;
            const team1Player2 = document.getElementById('team1Player2').value;
            const team2Player1 = document.getElementById('team2Player1').value;
            const team2Player2 = document.getElementById('team2Player2').value;
            
            this.gameConfigs.skins = {
                betAmount: parseFloat(document.getElementById('skinsBet').value),
                enabled: true,
                teams: {
                    team1: [team1Player1, team1Player2],
                    team2: [team2Player1, team2Player2]
                },
                teamNames: {
                    team1: `${team1Player1} & ${team1Player2}`,
                    team2: `${team2Player1} & ${team2Player2}`
                },
                carryoverCount: 1 // Start with 1 skin
            };
        }
        
        this.gameStarted = true;
        
        // Hide setup, show game
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gamePlay').style.display = 'block';
        
        // Show/hide game sections based on selection
        this.updateGameSections();
        
        // Initialize game state
        this.updateGameDisplay();
        
        // Show success message
        this.showNotification('Game started! Good luck!', 'success');
    }

    validateGameSetup() {
        // Check if at least one game is selected
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        
        if (!murphChecked && !skinsChecked) {
            this.showNotification('Please select at least one game to play.', 'error');
            return false;
        }
        
        // Validate player names
        const playerInputs = document.querySelectorAll('.player-input input');
        const validPlayers = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        if (validPlayers.length !== this.requiredPlayers) {
            this.showNotification(`Exactly ${this.requiredPlayers} players are required.`, 'error');
            return false;
        }
        
        // Check for duplicate names
        const uniqueNames = new Set(validPlayers);
        if (uniqueNames.size !== validPlayers.length) {
            this.showNotification('Player names must be unique.', 'error');
            return false;
        }
        
        // Validate bet amounts for selected games
        if (murphChecked) {
            const murphBet = parseFloat(document.getElementById('murphBet').value);
            if (isNaN(murphBet) || murphBet <= 0) {
                this.showNotification('Please enter a valid bet amount for Murph.', 'error');
                return false;
            }
        }
        
        if (skinsChecked) {
            const skinsBet = parseFloat(document.getElementById('skinsBet').value);
            if (isNaN(skinsBet) || skinsBet <= 0) {
                this.showNotification('Please enter a valid bet amount for Skins.', 'error');
                return false;
            }
        }
        
        return true;
    }

    updateGameSections() {
        // Show/hide game sections based on what's enabled
        if (this.gameConfigs.murph?.enabled) {
            document.getElementById('murphActions').style.display = 'block';
        } else {
            document.getElementById('murphActions').style.display = 'none';
        }
        
        if (this.gameConfigs.skins?.enabled) {
            document.getElementById('skinsActions').style.display = 'block';
        } else {
            document.getElementById('skinsActions').style.display = 'none';
        }
    }

    nextHole() {
        this.currentHole++;
        document.getElementById('currentHole').textContent = this.currentHole;
        this.updateGameDisplay();
        this.showNotification(`Moving to hole ${this.currentHole}`, 'info');
    }

    // Murph Game Methods
    showMurphModal() {
        const modal = document.getElementById('murphModal');
        const playerSelect = document.getElementById('murphPlayer');
        const holeInput = document.getElementById('murphHole');
        
        // Populate player select
        playerSelect.innerHTML = '<option value="">Select player...</option>';
        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        // Reset form
        document.getElementById('murphResult').value = '';
        
        modal.style.display = 'flex';
    }

    hideMurphModal() {
        document.getElementById('murphModal').style.display = 'none';
    }

    saveMurphCall() {
        const player = document.getElementById('murphPlayer').value;
        const hole = parseInt(document.getElementById('murphHole').value);
        const result = document.getElementById('murphResult').value;
        
        if (!player || !hole || !result) {
            this.showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Create murph call
        const murphCall = {
            id: Date.now(),
            player: player,
            hole: hole,
            result: result,
            timestamp: new Date()
        };
        
        this.gameActions.murph.push(murphCall);
        
        // Hide modal and update display
        this.hideMurphModal();
        this.updateGameDisplay();
        
        // Show result message
        const resultText = result === 'success' ? 'made it!' : 'failed';
        this.showNotification(`${player} called Murph on hole ${hole} and ${resultText}`, result === 'success' ? 'success' : 'error');
    }

    // Skins Game Methods
    showSkinsModal() {
        const modal = document.getElementById('skinsModal');
        const holeInput = document.getElementById('skinsHole');
        
        // Set current hole
        holeInput.value = this.currentHole;
        
        // Update team options with actual team names
        if (this.gameConfigs.skins?.teamNames) {
            const team1Option = document.getElementById('team1Option');
            const team2Option = document.getElementById('team2Option');
            
            team1Option.textContent = this.gameConfigs.skins.teamNames.team1;
            team2Option.textContent = this.gameConfigs.skins.teamNames.team2;
        }
        
        // Update carryover count
        if (this.gameConfigs.skins?.carryoverCount) {
            document.getElementById('skinsCarryoverCount').value = this.gameConfigs.skins.carryoverCount;
        }
        
        // Reset form
        document.getElementById('skinsWinner').value = '';
        
        modal.style.display = 'flex';
    }

    hideSkinsModal() {
        document.getElementById('skinsModal').style.display = 'none';
    }

    saveSkinsAction() {
        const hole = parseInt(document.getElementById('skinsHole').value);
        const winner = document.getElementById('skinsWinner').value;
        
        if (!hole || !winner) {
            this.showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Get current carryover count
        const currentCarryover = this.gameConfigs.skins.carryoverCount;
        
        // Create skins action
        const skinsAction = {
            id: Date.now(),
            hole: hole,
            winner: winner,
            skinsWon: winner === 'carryover' ? 0 : currentCarryover,
            carryoverCount: currentCarryover,
            timestamp: new Date()
        };
        
        this.gameActions.skins.push(skinsAction);
        
        // Update carryover count based on result
        if (winner === 'carryover') {
            this.gameConfigs.skins.carryoverCount += 1;
        } else {
            // Reset carryover count when someone wins
            this.gameConfigs.skins.carryoverCount = 1;
        }
        
        // Hide modal and update display
        this.hideSkinsModal();
        this.updateGameDisplay();
        
        // Show result message
        if (winner === 'carryover') {
            this.showNotification(`Hole ${hole}: No winner - ${this.gameConfigs.skins.carryoverCount} skins now carrying over`, 'info');
        } else {
            const winningTeam = winner === 'team1' ? this.gameConfigs.skins.teamNames.team1 : this.gameConfigs.skins.teamNames.team2;
            this.showNotification(`${winningTeam} won ${currentCarryover} skin${currentCarryover > 1 ? 's' : ''} on hole ${hole}`, 'success');
        }
    }

    updateGameDisplay() {
        this.updateMurphActionsList();
        this.updateSkinsActionsList();
        this.updateGameSummary();
    }

    updateMurphActionsList() {
        const container = document.getElementById('murphActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.murph.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Murph calls yet</p>';
            return;
        }
        
        // Group by hole
        const callsByHole = {};
        this.gameActions.murph.forEach(call => {
            if (!callsByHole[call.hole]) {
                callsByHole[call.hole] = [];
            }
            callsByHole[call.hole].push(call);
        });
        
        // Display by hole
        Object.keys(callsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            holeDiv.innerHTML = `<h5 style="margin: 16px 0 8px 0; color: #2c3e50;">Hole ${hole}</h5>`;
            
            callsByHole[hole].forEach(call => {
                const callDiv = document.createElement('div');
                callDiv.className = `game-action-item ${call.result}`;
                callDiv.innerHTML = `
                    <div class="game-action-header">
                        <span class="game-action-player">${call.player}</span>
                        <span class="game-action-hole">Hole ${call.hole}</span>
                    </div>
                    <div class="game-action-result ${call.result}">
                        ${call.result === 'success' ? '✅ Made it!' : '❌ Failed'}
                    </div>
                `;
                holeDiv.appendChild(callDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateSkinsActionsList() {
        const container = document.getElementById('skinsActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.skins.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Skins recorded yet</p>';
            return;
        }
        
        // Group by hole
        const skinsByHole = {};
        this.gameActions.skins.forEach(skin => {
            if (!skinsByHole[skin.hole]) {
                skinsByHole[skin.hole] = [];
            }
            skinsByHole[skin.hole].push(skin);
        });
        
        // Display by hole
        Object.keys(skinsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            holeDiv.innerHTML = `<h5 style="margin: 16px 0 8px 0; color: #2c3e50;">Hole ${hole}</h5>`;
            
            skinsByHole[hole].forEach(skin => {
                const skinDiv = document.createElement('div');
                skinDiv.className = `game-action-item ${skin.winner === 'carryover' ? 'neutral' : 'success'}`;
                
                let resultText = '';
                if (skin.winner === 'team1') {
                    resultText = `${this.gameConfigs.skins.teamNames.team1} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                } else if (skin.winner === 'team2') {
                    resultText = `${this.gameConfigs.skins.teamNames.team2} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                } else {
                    resultText = `Carryover - ${skin.carryoverCount} skin${skin.carryoverCount > 1 ? 's' : ''} at stake`;
                }
                
                skinDiv.innerHTML = `
                    <div class="game-action-header">
                        <span class="game-action-player">Hole ${skin.hole}</span>
                        <span class="game-action-hole">Skins</span>
                    </div>
                    <div class="game-action-result ${skin.winner === 'carryover' ? 'neutral' : 'success'}">
                        ${resultText}
                    </div>
                `;
                holeDiv.appendChild(skinDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateGameSummary() {
        const container = document.getElementById('gameSummary');
        
        if (this.gameActions.murph.length === 0 && this.gameActions.skins.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No activity yet</p>';
            return;
        }
        
        // Calculate financial summary for each game
        const gameSummaries = {};
        
        // Murph game summary
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        // Skins game summary
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        // Combined total summary
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        
        // Display summaries
        let summaryHTML = '';
        
        // Individual game summaries
        Object.entries(gameSummaries).forEach(([gameType, summary]) => {
            const gameName = gameType === 'murph' ? 'Murph' : 'Skins';
            const betAmount = this.gameConfigs[gameType].betAmount;
            
            let gameHeader = `${gameName} ($${betAmount.toFixed(2)} per action)`;
            
            // Add team information for Skins
            if (gameType === 'skins' && this.gameConfigs.skins?.teamNames) {
                gameHeader += `<br><small style="font-weight: normal; color: #7f8c8d;">${this.gameConfigs.skins.teamNames.team1} vs ${this.gameConfigs.skins.teamNames.team2}</small>`;
            }
            
            summaryHTML += `
                <div class="game-summary-section">
                    <h4 style="margin: 16px 0 8px 0; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 4px;">
                        ${gameHeader}
                    </h4>
            `;
            
            Object.entries(summary).forEach(([player, balance]) => {
                const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
                const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                                  balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
                
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-player">${player}</span>
                        <span class="summary-amount ${balanceClass}">${balanceText}</span>
                    </div>
                `;
            });
            
            summaryHTML += '</div>';
        });
        
        // Combined total summary
        if (Object.keys(gameSummaries).length > 1) {
            summaryHTML += `
                <div class="game-summary-section" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #3498db;">
                    <h4 style="margin: 16px 0 8px 0; color: #2c3e50; border-bottom: 1px solid #3498db; padding-bottom: 4px;">
                        Combined Total
                    </h4>
            `;
            
            Object.entries(combinedSummary).forEach(([player, balance]) => {
                const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
                const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                                  balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
                
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-player">${player}</span>
                        <span class="summary-amount ${balanceClass}">${balanceText}</span>
                    </div>
                `;
            });
            
            summaryHTML += '</div>';
        }
        
        container.innerHTML = summaryHTML;
    }

    calculateMurphSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.murph.forEach(call => {
            if (call.result === 'success') {
                // Caller gets paid by all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] -= this.gameConfigs.murph.betAmount;
                    }
                });
                playerBalances[call.player] += (this.players.length - 1) * this.gameConfigs.murph.betAmount;
            } else {
                // Caller pays all other players
                this.players.forEach(player => {
                    if (player !== call.player) {
                        playerBalances[player] += this.gameConfigs.murph.betAmount;
                    }
                });
                playerBalances[call.player] -= (this.players.length - 1) * this.gameConfigs.murph.betAmount;
            }
        });
        
        return playerBalances;
    }

    calculateSkinsSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.skins.forEach(skin => {
            if (skin.winner === 'carryover') {
                // No money changes hands on carryovers
                return;
            }
            
            const betAmount = this.gameConfigs.skins.betAmount;
            const skinsWon = skin.skinsWon;
            
            if (skin.winner === 'team1') {
                // Team 1 players get paid by Team 2 players
                const team1Players = this.gameConfigs.skins.teams.team1;
                const team2Players = this.gameConfigs.skins.teams.team2;
                
                team1Players.forEach(player => {
                    playerBalances[player] += betAmount * skinsWon;
                });
                
                team2Players.forEach(player => {
                    playerBalances[player] -= betAmount * skinsWon;
                });
            } else if (skin.winner === 'team2') {
                // Team 2 players get paid by Team 1 players
                const team1Players = this.gameConfigs.skins.teams.team1;
                const team2Players = this.gameConfigs.skins.teams.team2;
                
                team1Players.forEach(player => {
                    playerBalances[player] -= betAmount * skinsWon;
                });
                
                team2Players.forEach(player => {
                    playerBalances[player] += betAmount * skinsWon;
                });
            }
        });
        
        return playerBalances;
    }

    calculateCombinedSummary(gameSummaries) {
        const combinedBalances = {};
        this.players.forEach(player => {
            combinedBalances[player] = 0;
        });
        
        Object.values(gameSummaries).forEach(summary => {
            Object.entries(summary).forEach(([player, balance]) => {
                combinedBalances[player] += balance;
            });
        });
        
        return combinedBalances;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    resetGame() {
        // Reset game state
        this.players = [];
        this.gameConfigs = {};
        this.currentHole = 1;
        this.gameActions = {
            murph: [],
            skins: []
        };
        this.gameStarted = false;
        
        // Reset form inputs
        document.getElementById('murphBet').value = '1.00';
        document.getElementById('skinsBet').value = '1.00';
        document.getElementById('gameMurph').checked = true;
        document.getElementById('gameSkins').checked = false;
        document.querySelectorAll('.player-input input').forEach(input => input.value = '');
        
        // Reset team selection dropdowns
        const teamSelects = ['team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'];
        teamSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select player...</option>';
        });
        
        // Reset display
        document.getElementById('currentHole').textContent = '1';
        document.getElementById('murphActionsList').innerHTML = '';
        document.getElementById('skinsActionsList').innerHTML = '';
        document.getElementById('gameSummary').innerHTML = '';
        
        // Show setup, hide game
        document.getElementById('gameSetup').style.display = 'block';
        document.getElementById('gamePlay').style.display = 'none';
        document.getElementById('finalResults').style.display = 'none';
        
        // Reset game sections
        this.toggleGameSection('murph');
        this.toggleGameSection('skins');
        
        this.showNotification('Game reset! Ready for a new round.', 'info');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.savageGolf = new SavageGolf();
});
