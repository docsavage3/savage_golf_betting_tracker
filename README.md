# 🏌️ Savage Golf - Side Game Tracker

A mobile-friendly web application to track golf side games and bets. Perfect for foursomes looking to add some excitement to their rounds with multiple side games running simultaneously.

**Copyright (c) 2025 Daniel Savage. Licensed under [MIT License](LICENSE).**

## 🎮 Games Available

### **Murph Game**
- **Players**: 2-4 players (now requires exactly 4)
- **Objective**: Call "Murph" and get the ball in the hole within 2 shots
- **Betting**: Agreed amount per Murph call
- **Rules**: 
  - Success: All other players pay the caller
  - Failure: Caller pays all other players
  - Multiple calls per hole allowed
  - Agreed bet amount is applied to each Murph call

### **Skins Game**
- **Players**: Exactly 4 players (2 teams of 2)
- **Objective**: Lowest net team score wins the skin
- **Betting**: Agreed amount per skin won
- **Rules**: 
  - Teams are formed from 4 players
  - Lowest net score from one team wins the skin
  - Carryover system: if no team wins, skins accumulate
  - Agreed bet amount is applied to each skin won

## 📱 Features

- **Mobile-first design** - Optimized for phone use on the course
- **Multiple side games** - Play Murph and Skins simultaneously
- **4-player requirement** - Perfect for foursome golf rounds
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
2. **Enter 4 player names** (exactly 4 players required)
3. **Select which games to play** (Murph, Skins, or both)
4. **Set bet amounts** for each selected game
5. **Start the game** and begin tracking!

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
1. **Select your teams** from the dropdown menus (each player can only be on one team)
2. Click **"Record Skins"** button
3. Enter the hole number
4. Select the winning team or carryover
5. **Carryover tracking** - See how many skins are at stake
6. Save the result
7. View **Skins History** organized by hole
8. See **Skins Financial Summary** for current standings

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
- **Individual game breakdowns** - See results for Murph and Skins separately
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

## 💰 Financial Tracking

The app automatically calculates:
- **Individual game totals** - See standings for each game separately
- **Combined totals** - Overall financial standings across all games
- **Running totals** throughout the game
- **Clear visual indicators** (green for positive, red for negative, orange for neutral)
- **Team-based calculations** for Skins game
- **Carryover multipliers** - Multiple skins can be won on a single hole

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Daniel Savage. All rights reserved.**

The MIT License allows others to:
- Use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software
- Use the software for commercial purposes
- Modify the software and distribute modified versions

**However, the MIT License requires that:**
- The original copyright notice and license must be included in all copies
- The software is provided "as is" without warranty

This protects your intellectual property while allowing legitimate use and development.

---

**Enjoy your round and may the Savage Golf be with you!** ⛳
