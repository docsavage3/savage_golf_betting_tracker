

class SavageGolf {
    constructor() {
        this.players = [];
        this.gameConfigs = {};
        this.currentHole = 1;
        this.gameActions = {
            murph: [],
            skins: [],
            kp: [],
            snake: []
        };
        this.gameStarted = false;
        this.requiredPlayers = 4;
        this.currentPage = 'navigation';
        
        this.initializeEventListeners();
        this.setupGameCheckboxes();
        this.setupPlayerCountSelector();
    }

    initializeEventListeners() {
        // Game setup
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        
        // Game play
        document.getElementById('previousHole').addEventListener('click', () => this.previousHole());
        document.getElementById('nextHole').addEventListener('click', () => this.nextHole());
        
        // Navigation buttons
        document.getElementById('navMurph').addEventListener('click', () => this.showPage('murph'));
        document.getElementById('navSkins').addEventListener('click', () => this.showPage('skins'));
        document.getElementById('navKP').addEventListener('click', () => this.showPage('kp'));
        document.getElementById('navSnake').addEventListener('click', () => this.showPage('snake'));
        document.getElementById('navCombined').addEventListener('click', () => this.showPage('combined'));
        
        // Back to navigation buttons
        document.getElementById('backToNav').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav2').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNavKP').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNavSnake').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav3').addEventListener('click', () => this.showPage('navigation'));
        document.getElementById('backToNav4').addEventListener('click', () => this.showPage('navigation'));
        
        // New game from final results
        document.getElementById('newGameFromFinal').addEventListener('click', () => this.resetGame());
        
        // Murph game
        document.getElementById('callMurph').addEventListener('click', () => this.showMurphModal());
        document.getElementById('saveMurph').addEventListener('click', () => this.saveMurphCall());
        document.getElementById('cancelMurph').addEventListener('click', () => this.hideMurphModal());
        
        // Skins game
        document.getElementById('recordSkins').addEventListener('click', () => this.showSkinsModal());
        document.getElementById('saveSkins').addEventListener('click', () => this.saveSkinsAction());
        document.getElementById('cancelSkins').addEventListener('click', () => this.hideSkinsModal());
        
        // KP game
        document.getElementById('recordKP').addEventListener('click', () => this.showKPModal());
        document.getElementById('saveKP').addEventListener('click', () => this.saveKPAction());
        document.getElementById('cancelKP').addEventListener('click', () => this.hideKPModal());
        
        // Snake game
        document.getElementById('recordSnake').addEventListener('click', () => this.showSnakeModal());
        document.getElementById('saveSnake').addEventListener('click', () => this.saveSnakeAction());
        document.getElementById('cancelSnake').addEventListener('click', () => this.hideSnakeModal());

        
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
        
        document.getElementById('kpModal').addEventListener('click', (e) => {
            if (e.target.id === 'kpModal') {
                this.hideKPModal();
            }
        });
        
        document.getElementById('snakeModal').addEventListener('click', (e) => {
            if (e.target.id === 'snakeModal') {
                this.hideSnakeModal();
            }
        });
    }

    showPage(pageName) {
        // Hide all pages
        const pages = ['gameNavigation', 'murphPage', 'skinsPage', 'kpPage', 'snakePage', 'combinedPage', 'finalResults'];
        pages.forEach(page => {
            document.getElementById(page).style.display = 'none';
        });
        
        // Show the requested page
        if (pageName === 'navigation') {
            document.getElementById('gameNavigation').style.display = 'block';
        } else if (pageName === 'murph') {
            if (this.gameConfigs.murph?.enabled) {
                document.getElementById('murphPage').style.display = 'block';
            } else {
                this.showNotification('Murph game is not enabled for this round.', 'error');
                return;
            }
        } else if (pageName === 'skins') {
            if (this.gameConfigs.skins?.enabled) {
                document.getElementById('skinsPage').style.display = 'block';
            } else {
                this.showNotification('Skins game is not enabled for this round.', 'error');
                return;
            }
        } else if (pageName === 'kp') {
            if (this.gameConfigs.kp?.enabled) {
                document.getElementById('kpPage').style.display = 'block';
            } else {
                this.showNotification('KP game is not enabled for this round.', 'error');
                return;
            }
        } else if (pageName === 'snake') {
            if (this.gameConfigs.snake?.enabled) {
                document.getElementById('snakePage').style.display = 'block';
            } else {
                this.showNotification('Snake game is not enabled for this round.', 'error');
                return;
            }
        } else if (pageName === 'combined') {
            document.getElementById('combinedPage').style.display = 'block';
        } else if (pageName === 'finalResults') {
            document.getElementById('finalResults').style.display = 'block';
        }
        
        this.currentPage = pageName;
        
        // Update the specific page content
        if (pageName === 'murph') {
            this.updateMurphPage();
        } else if (pageName === 'skins') {
            this.updateSkinsPage();
        } else if (pageName === 'kp') {
            this.updateKPPage();
        } else if (pageName === 'snake') {
            this.updateSnakePage();
        } else if (pageName === 'combined') {
            this.updateCombinedPage();
        } else if (pageName === 'finalResults') {
            this.updateFinalResults();
        }
    }

    updateMurphPage() {
        this.updateMurphActionsList();
        this.updateMurphSummary();
    }

    updateSkinsPage() {
        this.updateSkinsActionsList();
        this.updateSkinsSummary();
    }

    updateKPPage() {
        this.updateKPActionsList();
        this.updateKPSummary();
    }

    updateSnakePage() {
        this.updateSnakeActionsList();
        this.updateSnakeSummary();
    }

    updateCombinedPage() {
        this.updateCombinedSummary();
        this.updateGameBreakdowns();
    }

    setupGameCheckboxes() {
        // Set up game selection checkboxes
        const murphCheckbox = document.getElementById('gameMurph');
        const skinsCheckbox = document.getElementById('gameSkins');
        const kpCheckbox = document.getElementById('gameKP');
        const snakeCheckbox = document.getElementById('gameSnake');
        
        murphCheckbox.addEventListener('change', () => this.toggleGameSection('murph'));
        skinsCheckbox.addEventListener('change', () => this.toggleGameSection('skins'));
        kpCheckbox.addEventListener('change', () => this.toggleGameSection('kp'));
        snakeCheckbox.addEventListener('change', () => this.toggleGameSection('snake'));
        
        // Set initial navigation button visibility
        this.updateGameNavigationVisibility();
        
        // Don't call toggleGameSection initially since no games are checked
        // The bet amount fields will be shown/hidden when checkboxes are changed
        
        // Set up player input listeners to populate team selects when players are entered
        this.setupPlayerInputListeners();
    }

    setupPlayerCountSelector() {
        const playerCountSelect = document.getElementById('playerCount');
        if (playerCountSelect) {
            playerCountSelect.addEventListener('change', (e) => {
                const playerCount = parseInt(e.target.value);
                
                this.updatePlayerInputs(playerCount);
                this.updateTeamSelections();
                
                // Show player input fields when a count is selected
                const playerInputsContainer = document.getElementById('playerInputs');
                if (playerInputsContainer) {
                    playerInputsContainer.style.display = 'block';
                }
                
                // Hide help message when a count is selected
                const helpMessage = document.querySelector('.player-count-help');
                if (helpMessage) {
                    helpMessage.style.display = 'none';
                }
            });
        }
    }

    updatePlayerInputs(playerCount) {
        this.requiredPlayers = playerCount;
        
        // Show/hide player inputs based on count
        const playerInputs = ['player1Input', 'player2Input', 'player3Input', 'player4Input'];
        playerInputs.forEach((inputId, index) => {
            const inputDiv = document.getElementById(inputId);
            if (inputDiv) {
                if (index < playerCount) {
                    inputDiv.classList.remove('hidden');
                    const input = inputDiv.querySelector('input');
                    if (input) input.required = true;
                } else {
                    inputDiv.classList.add('hidden');
                    const input = inputDiv.querySelector('input');
                    if (input) input.required = false;
                }
            }
        });
        
        // Also ensure the container is visible when we have a valid player count
        if (playerCount > 0) {
            const playerInputsContainer = document.getElementById('playerInputs');
            if (playerInputsContainer) {
                playerInputsContainer.style.display = 'block';
            }
        }
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
        
        // Only populate team selects if we have exactly 4 players
        if (playerNames.length === 4) {
            this.populateTeamSelects();
        } else {
            // Clear team selections if we don't have 4 players
            this.clearTeamSelections();
        }
    }

    populateTeamSelects() {
        // Get current player names from inputs
        const playerNames = Array.from(document.querySelectorAll('.player-input input'))
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        

        
        // Only proceed if we have exactly 4 players
        if (playerNames.length !== 4) {
            this.clearTeamSelections();
            return;
        }
        
        // Populate all team selection dropdowns
        const teamSelects = [
            'team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'
        ];
        
        teamSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select player...</option>';
                
                playerNames.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player;
                    option.textContent = player;
                    select.appendChild(option);
                });

            } else {

            }
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
                // Only update other dropdowns when this one changes
                this.updateOtherDropdowns(selectId);
            });
        });
    }

    updateOtherDropdowns(changedSelectId) {
        const teamSelects = [
            'team1Player1', 'team1Player2', 'team2Player1', 'team2Player2'
        ];
        
        // Get all currently selected values
        const selectedValues = teamSelects.map(selectId => {
            const select = document.getElementById(selectId);
            return select.value;
        });
        
        // Update other dropdowns (not the one that just changed)
        teamSelects.forEach((selectId) => {
            if (selectId === changedSelectId) return; // Skip the changed one
            
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
                const isSelectedElsewhere = selectedValues.some((value, otherSelectId) => 
                    value === player && otherSelectId !== selectId
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
            if (select) {
                select.value = '';
                select.innerHTML = '<option value="">Select player...</option>';
            }
        });
    }

    toggleGameSection(gameType) {
        // Handle special case for KP (since it's already uppercase in HTML)
        let checkboxId;
        if (gameType === 'kp') {
            checkboxId = 'gameKP';
        } else {
            checkboxId = `game${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`;
        }
        
        const checkbox = document.getElementById(checkboxId);
        const betAmount = document.getElementById(`${gameType}BetAmount`);
        
        if (!checkbox) {
            return;
        }
        
        if (!betAmount) {
            return;
        }
        
        if (gameType === 'skins') {
            const teamSelection = document.getElementById('skinsTeamSelection');
            if (checkbox.checked) {
                betAmount.style.display = 'block';
                // Only show team selection for 4 players
                if (this.requiredPlayers === 4) {
                    teamSelection.style.display = 'block';
                    // Populate team selects if we have 4 players
                    this.updateTeamSelects();
                } else {
                    teamSelection.style.display = 'none';
                }
            } else {
                betAmount.style.display = 'none';
                teamSelection.style.display = 'none';
                // Clear team selections when unchecking
                this.clearTeamSelections();
            }
        } else {
            if (checkbox.checked) {
                betAmount.style.display = 'block';
            } else {
                betAmount.style.display = 'none';
            }
        }
        
        // Update the game navigation buttons based on what's selected
        this.updateGameNavigationVisibility();
    }

    updateGameNavigationVisibility() {
        // Only show navigation buttons for games that are selected
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        
        // Show/hide Murph button
        const navMurph = document.getElementById('navMurph');
        if (navMurph) {
            navMurph.style.display = murphChecked ? 'flex' : 'none';
        }
        
        // Show/hide Skins button
        const navSkins = document.getElementById('navSkins');
        if (navSkins) {
            navSkins.style.display = skinsChecked ? 'flex' : 'none';
        }
        
        // Show/hide KP button
        const navKP = document.getElementById('navKP');
        if (navKP) {
            navKP.style.display = kpChecked ? 'flex' : 'none';
        }
        
        // Show/hide Snake button
        const navSnake = document.getElementById('navSnake');
        if (navSnake) {
            navSnake.style.display = snakeChecked ? 'flex' : 'none';
        }
    }

    startGame() {
        // Validate inputs
        if (!this.validateGameSetup()) return;
        
        // Get player count
        const playerCountSelect = document.getElementById('playerCount');
        this.requiredPlayers = parseInt(playerCountSelect.value);
        
        // Get player names (only the required number)
        this.players = Array.from(document.querySelectorAll('.player-input input'))
            .map(input => input.value.trim())
            .filter(name => name.length > 0)
            .slice(0, this.requiredPlayers);
        
        // Get game configurations
        this.gameConfigs = {};
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        
        if (murphChecked) {
            this.gameConfigs.murph = {
                betAmount: parseFloat(document.getElementById('murphBet').value),
                enabled: true
            };
        }
        
        if (skinsChecked) {
            this.gameConfigs.skins = {
                betAmount: parseFloat(document.getElementById('skinsBet').value),
                enabled: true,
                teams: [],
                carryoverCount: 1 // Start with 1 skin
            };
            
            // Only set up teams if we have 4 players
            if (this.requiredPlayers === 4) {
                // Validate team selection
                if (!this.validateTeamSelection()) {
                    this.showNotification('Please select 4 different players for the two teams.', 'error');
                    return;
                }
                
                const team1Player1 = document.getElementById('team1Player1').value;
                const team1Player2 = document.getElementById('team1Player2').value;
                const team2Player1 = document.getElementById('team2Player1').value;
                const team2Player2 = document.getElementById('team2Player2').value;
                
                this.gameConfigs.skins.teams = [
                    [team1Player1, team1Player2],
                    [team2Player1, team2Player2]
                ];
                this.gameConfigs.skins.teamNames = {
                    team1: `${team1Player1} & ${team1Player2}`,
                    team2: `${team2Player1} & ${team2Player2}`
                };
            }
        }
        
        if (kpChecked) {
            this.gameConfigs.kp = {
                betAmount: parseFloat(document.getElementById('kpBet').value),
                enabled: true
            };
        }
        
        if (snakeChecked) {
            this.gameConfigs.snake = {
                betAmount: parseFloat(document.getElementById('snakeBet').value),
                enabled: true
            };
        }
        
        this.gameStarted = true;
        
        // Hide setup, show navigation
        document.getElementById('gameSetup').style.display = 'none';
        this.showPage('navigation');
        
        // Initialize hole navigation button states
        this.updatePreviousHoleButton();
        
        // Initialize game state
        this.updateGameDisplay();
        
        // Update navigation button visibility for selected games
        this.updateGameNavigationVisibility();
        
        // Show success message
        this.showNotification('Game started! Good luck!', 'success');
    }

    validateGameSetup() {
        // Check if at least one game is selected
        const murphChecked = document.getElementById('gameMurph').checked;
        const skinsChecked = document.getElementById('gameSkins').checked;
        const kpChecked = document.getElementById('gameKP').checked;
        const snakeChecked = document.getElementById('gameSnake').checked;
        
        if (!murphChecked && !skinsChecked && !kpChecked && !snakeChecked) {
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
            
            // Only validate team selection for 4 players
            if (this.requiredPlayers === 4) {
                if (!this.validateTeamSelection()) {
                    this.showNotification('Please select 4 different players for the two teams.', 'error');
                    return false;
                }
            }
        }
        

        
        if (kpChecked) {
            const kpBet = parseFloat(document.getElementById('kpBet').value);
            if (isNaN(kpBet) || kpBet <= 0) {
                this.showNotification('Please enter a valid bet amount for KP.', 'error');
                return false;
            }
        }
        
        if (snakeChecked) {
            const snakeBet = parseFloat(document.getElementById('snakeBet').value);
            if (isNaN(snakeBet) || snakeBet <= 0) {
                this.showNotification('Please enter a valid bet amount for Snake.', 'error');
                return false;
            }
        }
        
        return true;
    }

    previousHole() {
        if (this.currentHole > 1) {
            this.currentHole--;
            document.getElementById('currentHole').textContent = this.currentHole;
            this.updatePreviousHoleButton();
            this.updateGameDisplay();
            this.showNotification(`Moved back to hole ${this.currentHole}`, 'info');
        }
    }

    nextHole() {
        if (this.currentHole >= 18) {
            this.showNotification('Maximum 18 holes reached. Game complete!', 'success');
            this.endGame();
            return;
        }
        
        this.currentHole++;
        document.getElementById('currentHole').textContent = this.currentHole;
        this.updatePreviousHoleButton();
        this.updateGameDisplay();
        this.showNotification(`Moving to hole ${this.currentHole}`, 'info');
    }

    updatePreviousHoleButton() {
        const previousButton = document.getElementById('previousHole');
        const nextButton = document.getElementById('nextHole');
        
        previousButton.disabled = this.currentHole <= 1;
        
        // Disable next button on hole 18
        if (nextButton) {
            nextButton.disabled = this.currentHole >= 18;
            if (this.currentHole >= 18) {
                nextButton.textContent = 'Game Complete';
                nextButton.style.opacity = '0.6';
            } else {
                nextButton.textContent = 'Next Hole →';
                nextButton.style.opacity = '1';
            }
        }
    }

    endGame() {
        // Show final results page
        this.showPage('finalResults');
        
        // Update final results content
        this.updateFinalResults();
    }

    updateFinalResults() {
        const container = document.getElementById('finalResultsContent');
        
        if (!container) return;
        
        let finalResultsHTML = '';
        
        // Game Summary Header
        finalResultsHTML += `
            <div class="final-header">
                <h2>🏆 Game Complete!</h2>
                <p class="final-subtitle">Final results for all games played</p>
            </div>
        `;
        
        // Individual Game Results
        if (this.gameConfigs.murph?.enabled && this.gameActions.murph.length > 0) {
            finalResultsHTML += this.generateMurphFinalSummary();
        }
        
        if (this.gameConfigs.skins?.enabled && this.gameActions.skins.length > 0) {
            finalResultsHTML += this.generateSkinsFinalSummary();
        }
        
        if (this.gameConfigs.kp?.enabled && this.gameActions.kp.length > 0) {
            finalResultsHTML += this.generateKPFinalSummary();
        }
        
        if (this.gameConfigs.snake?.enabled && this.gameActions.snake.length > 0) {
            finalResultsHTML += this.generateSnakeFinalSummary();
        }
        
        // Combined Final Summary
        finalResultsHTML += this.generateCombinedFinalSummary();
        
        // Payment Instructions
        finalResultsHTML += this.generatePaymentInstructions();
        
        container.innerHTML = finalResultsHTML;
    }

    generateMurphFinalSummary() {
        const murphSummary = this.calculateMurphSummary();
        let html = `
            <div class="final-game-section">
                <h3>🎯 Murph Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Calls:</span>
                        <span class="stat-value">${this.gameActions.murph.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.murph.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(murphSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateSkinsFinalSummary() {
        const skinsSummary = this.calculateSkinsSummary();
        const totalSkins = this.gameActions.skins.filter(skin => skin.winner !== 'carryover').length;
        const carryoverSkins = this.gameActions.skins.filter(skin => skin.winner === 'carryover').length;
        
        let html = `
            <div class="final-game-section">
                <h3>🏆 Skins Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Skins Won:</span>
                        <span class="stat-value">${totalSkins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Carryover Skins:</span>
                        <span class="stat-value">${carryoverSkins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.skins.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(skinsSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateKPFinalSummary() {
        const kpSummary = this.calculateKPSummary();
        const totalKPs = this.gameActions.kp.length;
        
        let html = `
            <div class="final-game-section">
                <h3>🎯 KP Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total KPs:</span>
                        <span class="stat-value">${totalKPs}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.kp.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(kpSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateSnakeFinalSummary() {
        const snakeSummary = this.calculateSnakeSummary();
        const totalSnakes = this.gameActions.snake.length;
        
        let html = `
            <div class="final-game-section">
                <h3>🐍 Snake Game Results</h3>
                <div class="final-game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Snakes:</span>
                        <span class="stat-value">${totalSnakes}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bet Amount:</span>
                        <span class="stat-value">$${this.gameConfigs.snake.betAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="final-game-summary">
        `;
        
        Object.entries(snakeSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateCombinedFinalSummary() {
        const gameSummaries = {};
        
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        if (this.gameConfigs.kp?.enabled) {
            gameSummaries.kp = this.calculateKPSummary();
        }
        
        if (this.gameConfigs.snake?.enabled) {
            gameSummaries.snake = this.calculateSnakeSummary();
        }
        
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        
        let html = `
            <div class="final-game-section final-combined">
                <h3>💰 Combined Final Results</h3>
                <div class="final-game-summary">
        `;
        
        Object.entries(combinedSummary).forEach(([player, balance]) => {
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
            const balanceText = balance > 0 ? `+$${balance.toFixed(2)}` : 
                              balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00';
            
            html += `
                <div class="final-summary-item">
                    <span class="final-summary-player">${player}</span>
                    <span class="final-summary-amount ${balanceClass}">${balanceText}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generatePaymentInstructions() {
        const gameSummaries = {};
        
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        if (this.gameConfigs.kp?.enabled) {
            gameSummaries.kp = this.calculateKPSummary();
        }
        
        if (this.gameConfigs.snake?.enabled) {
            gameSummaries.snake = this.calculateSnakeSummary();
        }
        
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        
        // Separate winners and losers
        const winners = Object.entries(combinedSummary).filter(([player, balance]) => balance > 0);
        const losers = Object.entries(combinedSummary).filter(([player, balance]) => balance < 0);
        
        let html = `
            <div class="final-game-section payment-instructions">
                <h3>💳 Payment Instructions</h3>
        `;
        
        if (winners.length === 0 && losers.length === 0) {
            html += '<p class="no-payments">No payments needed - all players are even!</p>';
        } else {
            html += '<div class="payment-list">';
            
            // Generate payment instructions
            winners.forEach(([winner, amount]) => {
                const paymentAmount = Math.abs(amount);
                html += `
                    <div class="payment-item">
                        <div class="payment-header">
                            <span class="payment-recipient">${winner} receives $${paymentAmount.toFixed(2)}</span>
                        </div>
                        <div class="payment-breakdown">
                `;
                
                // Show who pays this winner
                losers.forEach(([loser, lossAmount]) => {
                    if (Math.abs(lossAmount) > 0) {
                        const payment = Math.min(paymentAmount, Math.abs(lossAmount));
                        html += `
                            <div class="payment-detail">
                                <span class="payment-from">${loser}</span>
                                <span class="payment-arrow">→</span>
                                <span class="payment-to">${winner}</span>
                                <span class="payment-amount">$${payment.toFixed(2)}</span>
                            </div>
                        `;
                    }
                });
                
                html += '</div></div>';
            });
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
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
        
        // Handle different player counts
        console.log('showSkinsModal - requiredPlayers:', this.requiredPlayers);
        console.log('showSkinsModal - gameConfigs.skins:', this.gameConfigs.skins);
        console.log('showSkinsModal - teamNames:', this.gameConfigs.skins?.teamNames);
        
        if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames) {
            // 4 players: Show team options
            console.log('Showing team options for 4 players');
            const winnerSelect = document.getElementById('skinsWinner');
            winnerSelect.innerHTML = '<option value="">Select result...</option>';
            
            // Add team options
            const team1Option = document.createElement('option');
            team1Option.value = 'team1';
            team1Option.textContent = this.gameConfigs.skins.teamNames.team1;
            winnerSelect.appendChild(team1Option);
            
            const team2Option = document.createElement('option');
            team2Option.value = 'team2';
            team2Option.textContent = this.gameConfigs.skins.teamNames.team2;
            winnerSelect.appendChild(team2Option);
            
            // Add carryover option
            const carryoverOption = document.createElement('option');
            carryoverOption.value = 'carryover';
            carryoverOption.textContent = 'Carryover (No Winner)';
            winnerSelect.appendChild(carryoverOption);
        } else {
            console.log('Showing individual player options for', this.requiredPlayers, 'players');
            // 2-3 players: Show individual player options
            const winnerSelect = document.getElementById('skinsWinner');
            winnerSelect.innerHTML = '<option value="">Select winner...</option>';
            
            this.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                winnerSelect.appendChild(option);
            });
            
            // Add carryover option
            const carryoverOption = document.createElement('option');
            carryoverOption.value = 'carryover';
            carryoverOption.textContent = 'No Winner (Carryover)';
            winnerSelect.appendChild(carryoverOption);
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
            if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames && (winner === 'team1' || winner === 'team2')) {
                // 4 players: Show team names
                const winningTeam = winner === 'team1' ? this.gameConfigs.skins.teamNames.team1 : this.gameConfigs.skins.teamNames.team2;
                this.showNotification(`${winningTeam} won ${currentCarryover} skin${currentCarryover > 1 ? 's' : ''} on hole ${hole}`, 'success');
            } else {
                // 2-3 players: Show individual player name
                this.showNotification(`${winner} won ${currentCarryover} skin${currentCarryover > 1 ? 's' : ''} on hole ${hole}`, 'success');
            }
        }
    }

    // KP Game Methods
    showKPModal() {
        const modal = document.getElementById('kpModal');
        const playerSelect = document.getElementById('kpWinner');
        const holeInput = document.getElementById('kpHole');
        
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
        
        modal.style.display = 'flex';
    }

    hideKPModal() {
        document.getElementById('kpModal').style.display = 'none';
    }

    saveKPAction() {
        const hole = parseInt(document.getElementById('kpHole').value);
        const winner = document.getElementById('kpWinner').value;
        
        if (!hole || !winner) {
            this.showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Create KP action
        const kpAction = {
            id: Date.now(),
            hole: hole,
            winner: winner,
            timestamp: new Date()
        };
        
        this.gameActions.kp.push(kpAction);
        
        // Hide modal and update display
        this.hideKPModal();
        this.updateGameDisplay();
        
        // Show result message
        this.showNotification(`${winner} got closest to the pin on hole ${hole}!`, 'success');
    }

    // Snake Game Methods
    showSnakeModal() {
        const modal = document.getElementById('snakeModal');
        const playerSelect = document.getElementById('snakePlayer');
        const holeInput = document.getElementById('snakeHole');
        
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
        
        modal.style.display = 'flex';
    }

    hideSnakeModal() {
        document.getElementById('snakeModal').style.display = 'none';
    }

    saveSnakeAction() {
        const hole = parseInt(document.getElementById('snakeHole').value);
        const player = document.getElementById('snakePlayer').value;
        
        if (!hole || !player) {
            this.showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Create snake action
        const snakeAction = {
            id: Date.now(),
            hole: hole,
            player: player,
            timestamp: new Date()
        };
        
        this.gameActions.snake.push(snakeAction);
        
        // Hide modal and update display
        this.hideSnakeModal();
        this.updateGameDisplay();
        
        // Show result message
        this.showNotification(`${player} got a snake on hole ${hole}!`, 'success');
    }

    updateGameDisplay() {
        // Update navigation status
        this.updateNavigationStatus();
        
        // Update current page if it's visible and the game is enabled
        if (this.currentPage === 'murph' && this.gameConfigs.murph?.enabled) {
            this.updateMurphPage();
        } else if (this.currentPage === 'skins' && this.gameConfigs.skins?.enabled) {
            this.updateSkinsPage();
        } else if (this.currentPage === 'kp' && this.gameConfigs.kp?.enabled) {
            this.updateKPPage();
        } else if (this.currentPage === 'snake' && this.gameConfigs.snake?.enabled) {
            this.updateSnakePage();
        } else if (this.currentPage === 'combined') {
            this.updateCombinedPage();
        }
    }

    updateNavigationStatus() {
        // Update Murph status and styling
        if (this.gameConfigs.murph?.enabled) {
            const murphCount = this.gameActions.murph.length;
            const murphStatus = document.getElementById('murphStatus');
            if (murphStatus) {
                murphStatus.textContent = `${murphCount} call${murphCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Murph button
            const murphBtn = document.getElementById('navMurph');
            if (murphBtn) {
                murphBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Murph button
            const murphBtn = document.getElementById('navMurph');
            if (murphBtn) {
                murphBtn.classList.remove('selected');
            }
        }
        
        // Update Skins status and styling
        if (this.gameConfigs.skins?.enabled) {
            const skinsCount = this.gameActions.skins.length;
            const skinsStatus = document.getElementById('skinsStatus');
            if (skinsStatus) {
                skinsStatus.textContent = `${skinsCount} skin${skinsCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Skins button
            const skinsBtn = document.getElementById('navSkins');
            if (skinsBtn) {
                skinsBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Skins button
            const skinsBtn = document.getElementById('navSkins');
            if (skinsBtn) {
                skinsBtn.classList.remove('selected');
            }
        }
        
        // Update KP status and styling
        if (this.gameConfigs.kp?.enabled) {
            const kpCount = this.gameActions.kp.length;
            const kpStatus = document.getElementById('kpStatus');
            if (kpStatus) {
                kpStatus.textContent = `${kpCount} KP${kpCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to KP button
            const kpBtn = document.getElementById('navKP');
            if (kpBtn) {
                kpBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from KP button
            const kpBtn = document.getElementById('navKP');
            if (kpBtn) {
                kpBtn.classList.remove('selected');
            }
        }
        
        // Update Snake status and styling
        if (this.gameConfigs.snake?.enabled) {
            const snakeCount = this.gameActions.snake.length;
            const snakeStatus = document.getElementById('snakeStatus');
            if (snakeStatus) {
                snakeStatus.textContent = `${snakeCount} snake${snakeCount !== 1 ? 's' : ''}`;
            }
            // Add selected class to Snake button
            const snakeBtn = document.getElementById('navSnake');
            if (snakeBtn) {
                snakeBtn.classList.add('selected');
            }
        } else {
            // Remove selected class from Snake button
            const snakeBtn = document.getElementById('navSnake');
            if (snakeBtn) {
                snakeBtn.classList.remove('selected');
            }
        }
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
                        <button type="button" class="btn-delete" onclick="window.savageGolf.deleteMurphCall(${call.id})" title="Delete this Murph call">
                            🗑️
                        </button>
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
                if (skin.winner === 'carryover') {
                    resultText = `Carryover - ${skin.carryoverCount} skin${skin.carryoverCount > 1 ? 's' : ''} at stake`;
                } else if (this.requiredPlayers === 4 && this.gameConfigs.skins?.teamNames && (skin.winner === 'team1' || skin.winner === 'team2')) {
                    // 4 players: Show team names
                    if (skin.winner === 'team1') {
                        resultText = `${this.gameConfigs.skins.teamNames.team1} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                    } else {
                        resultText = `${this.gameConfigs.skins.teamNames.team2} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                    }
                } else {
                    // 2-3 players: Show individual player name
                    resultText = `${skin.winner} won ${skin.skinsWon} skin${skin.skinsWon > 1 ? 's' : ''}`;
                }
                
                skinDiv.innerHTML = `
                    <div class="game-action-header">
                        <span class="game-action-player">Hole ${skin.hole}</span>
                        <span class="game-action-hole">Skins</span>
                        <button type="button" class="btn-delete" onclick="window.savageGolf.deleteSkinsAction(${skin.id})" title="Delete this Skins action">
                            🗑️
                        </button>
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

    updateKPActionsList() {
        const container = document.getElementById('kpActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.kp.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No KPs recorded yet</p>';
            return;
        }
        
        // Group by hole
        const kpsByHole = {};
        this.gameActions.kp.forEach(kp => {
            if (!kpsByHole[kp.hole]) {
                kpsByHole[kp.hole] = [];
            }
            kpsByHole[kp.hole].push(kp);
        });
        
        // Display by hole
        Object.keys(kpsByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            holeDiv.innerHTML = `<h5 style="margin: 16px 0 8px 0; color: #2c3e50;">Hole ${hole}</h5>`;
            
            kpsByHole[hole].forEach(kp => {
                const kpDiv = document.createElement('div');
                kpDiv.className = 'game-action-item success';
                
                kpDiv.innerHTML = `
                    <div class="game-action-header">
                        <span class="game-action-player">${kp.winner}</span>
                        <span class="game-action-hole">Hole ${kp.hole}</span>
                        <button type="button" class="btn-delete" onclick="window.savageGolf.deleteKPAction(${kp.id})" title="Delete this KP action">
                            🗑️
                        </button>
                    </div>
                    <div class="game-action-result success">
                        🎯 Closest to the Pin
                    </div>
                `;
                holeDiv.appendChild(kpDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateSnakeActionsList() {
        const container = document.getElementById('snakeActionsList');
        container.innerHTML = '';
        
        if (this.gameActions.snake.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No snakes recorded yet</p>';
            return;
        }
        
        // Group by hole
        const snakesByHole = {};
        this.gameActions.snake.forEach(snake => {
            if (!snakesByHole[snake.hole]) {
                snakesByHole[snake.hole] = [];
            }
            snakesByHole[snake.hole].push(snake);
        });
        
        // Display by hole
        Object.keys(snakesByHole).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hole => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole-group';
            holeDiv.innerHTML = `<h5 style="margin: 16px 0 8px 0; color: #2c3e50;">Hole ${hole}</h5>`;
            
            snakesByHole[hole].forEach(snake => {
                const snakeDiv = document.createElement('div');
                snakeDiv.className = 'game-action-item error';
                
                snakeDiv.innerHTML = `
                    <div class="game-action-header">
                        <span class="game-action-player">${snake.player}</span>
                        <span class="game-action-hole">Hole ${snake.hole}</span>
                        <button type="button" class="btn-delete" onclick="window.savageGolf.deleteSnakeAction(${snake.id})" title="Delete this Snake action">
                            🗑️
                        </button>
                    </div>
                    <div class="game-action-result error">
                        🐍 Snake
                    </div>
                `;
                holeDiv.appendChild(snakeDiv);
            });
            
            container.appendChild(holeDiv);
        });
    }

    updateMurphSummary() {
        const container = document.getElementById('murphSummary');
        
        if (this.gameActions.murph.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Murph calls yet</p>';
            return;
        }
        
        const summary = this.calculateMurphSummary();
        this.displaySummary(container, summary);
    }

    updateSkinsSummary() {
        const container = document.getElementById('skinsSummary');
        
        if (this.gameActions.skins.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No Skins recorded yet</p>';
            return;
        }
        
        const summary = this.calculateSkinsSummary();
        this.displaySummary(container, summary);
    }

    updateKPSummary() {
        const container = document.getElementById('kpSummary');
        
        if (this.gameActions.kp.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No KPs recorded yet</p>';
            return;
        }
        
        const summary = this.calculateKPSummary();
        this.displaySummary(container, summary);
    }

    updateSnakeSummary() {
        const container = document.getElementById('snakeSummary');
        
        if (this.gameActions.snake.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No snakes recorded yet</p>';
            return;
        }
        
        const summary = this.calculateSnakeSummary();
        this.displaySummary(container, summary);
    }

    updateCombinedSummary() {
        const container = document.getElementById('combinedSummary');
        
        if (this.gameActions.murph.length === 0 && this.gameActions.skins.length === 0 && this.gameActions.kp.length === 0 && this.gameActions.snake.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No activity yet</p>';
            return;
        }
        
        // Calculate combined summary
        const gameSummaries = {};
        
        if (this.gameConfigs.murph?.enabled) {
            gameSummaries.murph = this.calculateMurphSummary();
        }
        
        if (this.gameConfigs.skins?.enabled) {
            gameSummaries.skins = this.calculateSkinsSummary();
        }
        
        if (this.gameConfigs.kp?.enabled) {
            gameSummaries.kp = this.calculateKPSummary();
        }
        
        if (this.gameConfigs.snake?.enabled) {
            gameSummaries.snake = this.calculateSnakeSummary();
        }
        
        const combinedSummary = this.calculateCombinedSummary(gameSummaries);
        this.displaySummary(container, combinedSummary);
    }

    updateGameBreakdowns() {
        // Update Murph breakdown
        const murphBreakdownSection = document.getElementById('murphBreakdownSection');
        if (this.gameConfigs.murph?.enabled) {
            if (murphBreakdownSection) {
                murphBreakdownSection.style.display = 'block';
            }
            const murphBreakdown = document.getElementById('murphBreakdown');
            if (murphBreakdown) {
                const summary = this.calculateMurphSummary();
                this.displaySummary(murphBreakdown, summary);
            }
        } else {
            if (murphBreakdownSection) {
                murphBreakdownSection.style.display = 'none';
            }
        }
        
        // Update Skins breakdown
        const skinsBreakdownSection = document.getElementById('skinsBreakdownSection');
        if (this.gameConfigs.skins?.enabled) {
            if (skinsBreakdownSection) {
                skinsBreakdownSection.style.display = 'block';
            }
            const skinsBreakdown = document.getElementById('skinsBreakdown');
            if (skinsBreakdown) {
                const summary = this.calculateSkinsSummary();
                this.displaySummary(skinsBreakdown, summary);
            }
        } else {
            if (skinsBreakdownSection) {
                skinsBreakdownSection.style.display = 'none';
            }
        }
        
        // Update KP breakdown
        const kpBreakdownSection = document.getElementById('kpBreakdownSection');
        if (this.gameConfigs.kp?.enabled) {
            if (kpBreakdownSection) {
                kpBreakdownSection.style.display = 'block';
            }
            const kpBreakdown = document.getElementById('kpBreakdown');
            if (kpBreakdown) {
                const summary = this.calculateKPSummary();
                this.displaySummary(kpBreakdown, summary);
            }
        } else {
            if (kpBreakdownSection) {
                kpBreakdownSection.style.display = 'none';
            }
        }
        
        // Update Snake breakdown
        const snakeBreakdownSection = document.getElementById('snakeBreakdownSection');
        if (this.gameConfigs.snake?.enabled) {
            if (snakeBreakdownSection) {
                snakeBreakdownSection.style.display = 'block';
            }
            const snakeBreakdown = document.getElementById('snakeBreakdown');
            if (snakeBreakdown) {
                const summary = this.calculateSnakeSummary();
                this.displaySummary(snakeBreakdown, summary);
            }
        } else {
            if (snakeBreakdownSection) {
                snakeBreakdownSection.style.display = 'none';
            }
        }
    }

    displaySummary(container, summary) {
        let summaryHTML = '';
        
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
            
            if (this.requiredPlayers === 4 && this.gameConfigs.skins.teams && this.gameConfigs.skins.teams.length > 0) {
                // 4 players: Handle team-based skins
                if (skin.winner === 'team1') {
                    // Team 1 players get paid by Team 2 players
                    const team1Players = this.gameConfigs.skins.teams[0];
                    const team2Players = this.gameConfigs.skins.teams[1];
                    
                    team1Players.forEach(player => {
                        playerBalances[player] += betAmount * skinsWon;
                    });
                    
                    team2Players.forEach(player => {
                        playerBalances[player] -= betAmount * skinsWon;
                    });
                } else if (skin.winner === 'team2') {
                    // Team 2 players get paid by Team 1 players
                    const team1Players = this.gameConfigs.skins.teams[0];
                    const team2Players = this.gameConfigs.skins.teams[1];
                    
                    team1Players.forEach(player => {
                        playerBalances[player] -= betAmount * skinsWon;
                    });
                    
                    team2Players.forEach(player => {
                        playerBalances[player] += betAmount * skinsWon;
                    });
                }
            } else {
                // 2-3 players: Handle individual player skins
                const winner = skin.winner;
                
                // Winner gets paid by all other players
                this.players.forEach(player => {
                    if (player === winner) {
                        playerBalances[player] += betAmount * skinsWon * (this.players.length - 1);
                    } else {
                        playerBalances[player] -= betAmount * skinsWon;
                    }
                });
            }
        });
        
        return playerBalances;
    }

    calculateKPSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        this.gameActions.kp.forEach(kp => {
            const betAmount = this.gameConfigs.kp.betAmount;
            
            // KP winner gets paid by all other players
            this.players.forEach(player => {
                if (player !== kp.winner) {
                    playerBalances[player] -= betAmount;
                }
            });
            playerBalances[kp.winner] += (this.players.length - 1) * betAmount;
        });
        
        return playerBalances;
    }

    calculateSnakeSummary() {
        const playerBalances = {};
        this.players.forEach(player => {
            playerBalances[player] = 0;
        });
        
        if (this.gameActions.snake.length === 0) {
            return playerBalances;
        }
        
        const betAmount = this.gameConfigs.snake.betAmount;
        const totalSnakes = this.gameActions.snake.length;
        const snakePot = totalSnakes * betAmount;
        
        // Each snake increases the pot (no individual penalties)
        // The last snake player owes the entire accumulated pot to the other 3 players
        
        if (totalSnakes === 1) {
            // Special case: Only 1 snake - that player owes the pot to the other 3
            const singleSnake = this.gameActions.snake[0];
            playerBalances[singleSnake.player] -= snakePot;
            
            // The other 3 players each get paid the pot amount divided by 3
            const paymentPerPlayer = snakePot / 3;
            
            this.players.forEach(player => {
                if (player !== singleSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        } else {
            // Multiple snakes: Each increases pot, last snake owes entire pot
            // Each snake player does NOT pay individually - they just increase the pot
            
            // The last player to get a snake owes the entire pot to the other 3 players
            const lastSnake = this.gameActions.snake[this.gameActions.snake.length - 1];
            playerBalances[lastSnake.player] -= snakePot;
            
            // The other 3 players each get paid the pot amount divided by 3
            const paymentPerPlayer = snakePot / 3;
            
            this.players.forEach(player => {
                if (player !== lastSnake.player) {
                    playerBalances[player] += paymentPerPlayer;
                }
            });
        }
        
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
            skins: [],
            kp: [],
            snake: []
        };
        this.gameStarted = false;
        this.currentPage = 'navigation';
        
        // Reset form inputs
        document.getElementById('murphBet').value = '1.00';
        document.getElementById('skinsBet').value = '1.00';
        document.getElementById('kpBet').value = '1.00';
        document.getElementById('snakeBet').value = '1.00';
        document.getElementById('gameMurph').checked = false;
        document.getElementById('gameSkins').checked = false;
        document.getElementById('gameKP').checked = false;
        document.getElementById('gameSnake').checked = false;
        document.querySelectorAll('.player-input input').forEach(input => input.value = '');
        
        // Reset player count to 4 and hide player inputs
        const playerCountSelect = document.getElementById('playerCount');
        if (playerCountSelect) {
            playerCountSelect.value = '4';
            this.updatePlayerInputs(4);
        }
        
        // Hide player input fields
        const playerInputsContainer = document.getElementById('playerInputs');
        if (playerInputsContainer) {
            playerInputsContainer.style.display = 'none';
        }
        
        // Show help message again
        const helpMessage = document.querySelector('.player-count-help');
        if (helpMessage) {
            helpMessage.style.display = 'block';
        }
        
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
        document.getElementById('kpActionsList').innerHTML = '';
        document.getElementById('snakeActionsList').innerHTML = '';
        document.getElementById('murphSummary').innerHTML = '';
        document.getElementById('skinsSummary').innerHTML = '';
        document.getElementById('kpSummary').innerHTML = '';
        document.getElementById('snakeSummary').innerHTML = '';
        document.getElementById('combinedSummary').innerHTML = '';
        document.getElementById('murphBreakdown').innerHTML = '';
        document.getElementById('skinsBreakdown').innerHTML = '';
        document.getElementById('kpBreakdown').innerHTML = '';
        document.getElementById('snakeBreakdown').innerHTML = '';
        
        // Reset breakdown section visibility
        const breakdownSections = ['murphBreakdownSection', 'skinsBreakdownSection', 'kpBreakdownSection', 'snakeBreakdownSection'];
        breakdownSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Show setup, hide all game pages
        document.getElementById('gameSetup').style.display = 'block';
        document.getElementById('gameNavigation').style.display = 'none';
        document.getElementById('murphPage').style.display = 'none';
        document.getElementById('skinsPage').style.display = 'none';
        document.getElementById('kpPage').style.display = 'none';
        document.getElementById('snakePage').style.display = 'none';
        document.getElementById('combinedPage').style.display = 'none';
        document.getElementById('finalResults').style.display = 'none';
        
        // Reset game sections
        this.toggleGameSection('murph');
        this.toggleGameSection('skins');
        this.toggleGameSection('kp');
        this.toggleGameSection('snake');
        
        // Set initial navigation button visibility
        this.updateGameNavigationVisibility();
        
        // Reset previous hole button state
        this.updatePreviousHoleButton();
        
        this.showNotification('Game reset! Ready for a new round.', 'info');
    }

    deleteMurphCall(callId) {
        // Find the call to delete
        const callIndex = this.gameActions.murph.findIndex(call => call.id === callId);
        if (callIndex === -1) {
            this.showNotification('Murph call not found.', 'error');
            return;
        }
        
        const call = this.gameActions.murph[callIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this Murph call?\n\n${call.player} on Hole ${call.hole} - ${call.result === 'success' ? 'Made it' : 'Failed'}`)) {
            // Remove the call
            this.gameActions.murph.splice(callIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.showNotification(`Deleted Murph call for ${call.player} on Hole ${call.hole}`, 'success');
        }
    }

    deleteSkinsAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.skins.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.showNotification('Skins action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.skins[actionIndex];
        
        // Show confirmation dialog
        let actionDescription = '';
        if (action.winner === 'team1') {
            actionDescription = `${this.gameConfigs.skins.teamNames.team1} won ${action.skinsWon} skin${action.skinsWon > 1 ? 's' : ''}`;
        } else if (action.winner === 'team2') {
            actionDescription = `${this.gameConfigs.skins.teamNames.team2} won ${action.skinsWon} skin${action.skinsWon > 1 ? 's' : ''}`;
        } else {
            actionDescription = `Carryover - ${action.carryoverCount} skin${action.carryoverCount > 1 ? 's' : ''} at stake`;
        }
        
        if (confirm(`Are you sure you want to delete this Skins action?\n\nHole ${action.hole}: ${actionDescription}`)) {
            // Remove the action
            this.gameActions.skins.splice(actionIndex, 1);
            
            // Recalculate carryover count if this was a carryover action
            if (action.winner === 'carryover') {
                this.recalculateCarryoverCount();
            }
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.showNotification(`Deleted Skins action for Hole ${action.hole}`, 'success');
        }
    }

    deleteKPAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.kp.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.showNotification('KP action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.kp[actionIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this KP action?\n\n${action.winner} got closest to the pin on Hole ${action.hole}`)) {
            // Remove the action
            this.gameActions.kp.splice(actionIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.showNotification(`Deleted KP action for ${action.winner} on Hole ${action.hole}`, 'success');
        }
    }

    deleteSnakeAction(actionId) {
        // Find the action to delete
        const actionIndex = this.gameActions.snake.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            this.showNotification('Snake action not found.', 'error');
            return;
        }
        
        const action = this.gameActions.snake[actionIndex];
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete this Snake action?\n\n${action.player} got a snake on Hole ${action.hole}`)) {
            // Remove the action
            this.gameActions.snake.splice(actionIndex, 1);
            
            // Update display
            this.updateGameDisplay();
            
            // Show success message
            this.showNotification(`Deleted Snake action for ${action.player} on Hole ${action.hole}`, 'success');
        }
    }

    recalculateCarryoverCount() {
        // Find the most recent carryover action to determine current carryover count
        const carryoverActions = this.gameActions.skins
            .filter(action => action.winner === 'carryover')
            .sort((a, b) => b.hole - a.hole); // Sort by hole descending
        
        if (carryoverActions.length > 0) {
            // Get the carryover count from the most recent carryover
            this.gameConfigs.skins.carryoverCount = carryoverActions[0].carryoverCount;
        } else {
            // No carryovers, reset to 1
            this.gameConfigs.skins.carryoverCount = 1;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.savageGolf = new SavageGolf();
});
