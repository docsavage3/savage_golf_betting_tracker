# 🏌️ Savage Golf - Side Game Tracker

A mobile-friendly web application to track golf side games and bets. Perfect for foursomes looking to add some excitement to their rounds with multiple side games running simultaneously.

**Copyright (c) 2025 Daniel Savage. All rights reserved. Proprietary software - no commercial use, copying, forking, or reuse permitted.**

## 🎮 Games Available

### **Murph Game**
- **Players**: 2-4 players
- **Objective**: Call "Murph" and get the ball in the hole within 2 shots
- **Betting**: Agreed amount per Murph call
- **Rules**: 
  - Success: All other players pay the caller
  - Failure: Caller pays all other players
  - Multiple calls per hole allowed
  - Agreed bet amount is applied to each Murph call

### **Skins Game**
- **Players**: 2-4 players
- **Objective**: Best individual score (2-3 players) or best team score (4 players) wins the skin
- **Betting**: Agreed amount per skin won
- **Rules**: 
  - **2-3 players**: Individual competition, best score wins
  - **4 players**: Team competition (2 teams of 2), best team score wins
  - Carryover system: if no one wins, skins accumulate
  - Agreed bet amount is applied to each skin won

### **Closest to the Pin (KP)**
- **Players**: 2-4 players
- **Objective**: Get closest to the pin on designated holes
- **Betting**: Agreed amount per KP won
- **Rules**: 
  - KP is assigned to specific holes during setup
  - Player closest to the pin wins the KP
  - Multiple KPs can be won per round
  - Agreed bet amount is applied to each KP

### **Snake Game**
- **Players**: 2-4 players
- **Objective**: Avoid being the last player to get a "snake" on any hole
- **Betting**: Agreed amount per snake
- **Rules**: 
  - Snake is assigned to one player per hole
  - Each snake adds the bet amount to the pot
  - Last player to get a snake owes the entire pot to other players
  - Pot is split equally among non-snake players

### **Wolf Game**
- **Players**: 4 players only
- **Objective**: Rotate being the "Wolf" and choose to play alone or with a partner
- **Betting**: Agreed amount per hole
- **Rules**: 
  - **Wolf Rotation**: Players rotate being Wolf every 4 holes (holes 1-4, 5-8, 9-12, 13-16)
  - **Wolf Choice**: Each Wolf can choose to be "Lone Wolf" or pick a "Partner"
  - **Lone Wolf**: Plays alone against all other players
  - **Partner**: Teams up with chosen player against other 2 players
  - **Scoring**: 
    - **Wolf + Partner Win**: Each gets 1x bet, others lose 1x bet each
    - **Lone Wolf Wins**: Gets 3x bet from each other player (9x total), others lose 3x bet each
    - **Wolf + Partner Lose**: Each loses 3x bet, others get 1x bet each
    - **Lone Wolf Loses**: Loses 3x bet to each other player (9x total), others get 3x bet each

## 📱 Features

- **Mobile-first design** - Optimized for phone use on the course
- **Multiple side games** - Play Murph, Skins, KP, and Snake simultaneously
- **Flexible player count** - Supports 2-4 players (perfect for any group size)
- **Individual game tracking** - Separate bet amounts and tracking for each game
- **Combined totals** - See overall financial standings across all games
- **Real-time tracking** - See who owes what as the game progresses
- **Hole-by-hole organization** - Track game actions by hole
- **Bidirectional hole navigation** - Move forward and backward between holes
- **Page-based navigation** - Dedicated pages for each game type and combined totals
- **Financial summary** - Always know the current standings
- **Responsive notifications** - Get feedback on game actions

## 🚀 Getting Started

1. **Open the app** in your mobile browser
2. **Select number of players** (2-4 players supported)
3. **Enter player names** for your group
4. **Select which games to play** (Murph, Skins, KP, Snake, or any combination)
5. **Set bet amounts** for each selected game
6. **Start the game** and begin tracking!

## 🎮 During the Game

### **Game Navigation**
Once the game starts, you'll see a central navigation page with:
- **Hole navigation** - Previous/Next hole buttons
- **Game buttons** - Large, easy-to-tap buttons for each game type
- **Status indicators** - See how many actions have been recorded for each game

### **Murph Game Page:**
1. Click **"Call Murph"** button
2. Select the player calling Murph
3. Choose the hole number
4. Select the result (Made it ✅ or Failed ❌)
5. Save the call
6. View **Murph Calls History** organized by hole
7. See **Murph Financial Summary** for current standings

### **Skins Game Page:**
1. **For 4 players**: Select your teams from the dropdown menus (each player can only be on one team)
2. Click **"Record Skins"** button
3. Enter the hole number
4. Select the winner (individual player for 2-3 players, team for 4 players) or carryover
5. **Carryover tracking** - See how many skins are at stake
6. Save the result
7. View **Skins History** organized by hole
8. See **Skins Financial Summary** for current standings

### **KP (Closest to the Pin) Game Page:**
1. Click **"Record KP"** button
2. Enter the hole number
3. Select the player who got closest to the pin
4. Save the result
5. View **KP History** organized by hole
6. See **KP Financial Summary** for current standings

### **Snake Game Page:**
1. Click **"Record Snake"** button
2. Enter the hole number
3. Select the player who got the "snake" on that hole
4. Save the result
5. View **Snake History** organized by hole
6. See **Snake Financial Summary** for current standings

### **Wolf Game Page:**
1. Click **"Record Wolf Hole"** button
2. Enter the hole number
3. Select the current Wolf (automatically determined by rotation)
4. Choose Wolf's decision: **"Lone Wolf"** or **"Partner"**
5. If choosing Partner: Select the partner player
6. Select the result: **"Wolf Wins"** or **"Wolf Loses"**
7. Save the result
8. View **Wolf History** organized by hole
9. See **Wolf Financial Summary** for current standings

### **Combined Total Page:**
- **Overall Financial Summary** - Combined totals across all games
- **Game Breakdowns** - Individual summaries for each game type
- **Complete picture** - See who's winning/losing overall

### **Moving Between Holes:**
- Use the **"Next Hole"** button to advance
- Use the **"Previous Hole"** button to go back and make edits
- The app automatically tracks the current hole
- **18-hole limit** - Game automatically ends after hole 18
- Previous Hole button is disabled on hole 1
- Next Hole button shows "Game Complete" on hole 18

### **Navigation Between Pages:**
- **From any game page**: Click "← Back to Navigation" to return to the main navigation
- **From navigation**: Click any game button to go to that specific game page
- **Seamless switching**: Move between games and combined totals easily
- **Always accessible**: New Game button is always visible for quick resets

### **Correcting Mistakes:**
- **Delete individual actions** - Click the 🗑️ button on any Murph call or Skins action
- **Confirmation dialogs** - Prevents accidental deletions
- **Automatic recalculation** - Financial summaries update immediately
- **Carryover handling** - Skins carryover counts recalculate correctly when deleting carryover actions

### **Game Completion:**
- **18-hole limit** - Game automatically ends after completing hole 18
- **Final Results Page** - Comprehensive summary of all games played
- **Individual game breakdowns** - See results for Murph, Skins, KP, Snake, and Wolf separately
- **Combined totals** - Overall financial standings across all games
- **Payment instructions** - Clear breakdown of who needs to pay whom
- **Easy restart** - Start a new game directly from final results

### **Tracking Results:**
- **Dedicated spaces** - Each game has its own page with history and summary
- **Real-time updates** - See standings update as you record actions
- **Organized by hole** - All actions grouped by hole number
- **Easy corrections** - Delete individual actions with 🗑️ buttons
- **Clear visual indicators**:
  - 🟢 Green for successful actions/wins
  - 🔴 Red for failed actions/losses  
  - 🟠 Orange for carryovers (Skins)
  - 🎯 Blue for KP wins
  - 🐍 Purple for Snake penalties
  - 🐺 Gray for Wolf actions

## 💰 Financial Tracking

The app automatically calculates:
- **Individual game totals** - See standings for each game separately (Murph, Skins, KP, Snake, Wolf)
- **Combined totals** - Overall financial standings across all games
- **Running totals** throughout the game
- **Clear visual indicators** (green for positive, red for negative, orange for neutral)
- **Team-based calculations** for Skins game (4 players)
- **Carryover multipliers** - Multiple skins can be won on a single hole
- **Snake pot management** - Automatic calculation of snake penalties and payouts
- **Wolf rotation tracking** - Automatic Wolf assignment based on hole number

## 🔄 Starting a New Game

Click **"🔄 New Game"** to reset everything and start fresh with new players or bet amounts.

## 📱 Mobile Optimization

- **Touch-friendly navigation** - Large buttons and easy page switching
- **Responsive design** - Works perfectly on all screen sizes
- **Optimized for portrait orientation** - Perfect for one-handed use on the course
- **Fast loading** - Smooth animations and transitions
- **Intuitive layout** - Easy to find what you need

## 🎨 Design Features

- **Modern, clean interface** - Professional golf app appearance
- **Golf-themed color scheme** - Familiar and pleasant to use
- **Smooth animations** - Professional feel with transitions
- **Easy-to-read typography** - Clear information display
- **Intuitive navigation** - Logical page flow and easy access

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript** - No external dependencies
- **Modular architecture** - Easy to add new side games
- **Page-based navigation** - Clean separation of concerns
- **Local storage** - Game data persists during the session
- **Responsive design** - Works on all devices
- **Progressive Web App** ready
- **5 game types supported** - Murph, Skins, KP, Snake, and Wolf
- **Flexible player support** - 2-4 players with adaptive game logic (Wolf requires exactly 4 players)

## 💡 Tips for Best Experience

- **Use on a mobile device** for optimal experience
- **Keep the browser tab open** during your round
- **Enter player names clearly** to avoid confusion
- **Update game actions immediately** after each hole
- **Use the hole navigation** to keep track of progress
- **Switch between game pages** to focus on specific games
- **Check combined totals** regularly to see overall standings

---

## 📄 License

**PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

**Copyright (c) 2025 Daniel Savage. All rights reserved.**

This software is proprietary and confidential. The following restrictions apply:

**🚫 STRICTLY PROHIBITED:**
- **Commercial Use**: No selling, licensing, or distributing for profit
- **Copying**: No reproduction or duplication in any form
- **Forking**: No branching or deriving into separate projects
- **Reuse**: No incorporation into other software projects
- **Distribution**: No sharing or making available to third parties
- **Reverse Engineering**: No disassembly or decompilation

**✅ PERMITTED USE:**
- Personal use only by Daniel Savage
- Educational purposes for Daniel Savage
- Development and testing by Daniel Savage

**⚠️ LEGAL NOTICE:**
Any violation of these restrictions constitutes a breach of this license and may result in legal action. Unauthorized use, copying, distribution, or modification is strictly prohibited.

This software is protected by copyright laws and international treaties.

---

**Enjoy your round and may the Savage Golf be with you!** ⛳
