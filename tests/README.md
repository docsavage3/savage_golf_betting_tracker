# 🧪 Testing Guide - Savage Golf Betting Tracker

This directory contains comprehensive tests for the golf betting tracker application, ensuring reliability and functionality across all game types and user workflows.

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── games/              # Game logic tests
│   │   ├── murph-game.test.js
│   │   ├── skins-game.test.js
│   │   ├── kp-game.test.js
│   │   └── snake-game.test.js
│   ├── managers/           # Manager class tests
│   │   ├── game-manager.test.js
│   │   ├── player-manager.test.js
│   │   └── storage-manager.test.js
│   └── utils/              # Utility function tests
│       └── validation.test.js
├── integration/             # Integration tests for workflows
│   └── game-workflow.test.js
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in debug mode
npm run test:debug
```

## 🧪 Test Types

### 1. Unit Tests
**Purpose**: Test individual functions and classes in isolation
**Coverage**: Business logic, calculations, validation rules
**Speed**: Fast execution (<100ms per test)

**Example**:
```javascript
test('should calculate correct payouts for successful murph call', () => {
  const game = new MurphGame(['John', 'Mike', 'Sarah'], { betAmount: 5 });
  game.addAction({ player: 'John', hole: 1, result: 'success' });
  
  const summary = game.calculateSummary();
  expect(summary['John']).toBe(10); // 2 other players × $5
  expect(summary['Mike']).toBe(-5);
  expect(summary['Sarah']).toBe(-5);
});
```

### 2. Integration Tests
**Purpose**: Test complete user workflows and system interactions
**Coverage**: End-to-end scenarios, data flow between components
**Speed**: Medium execution (1-5 seconds per test)

**Example**:
```javascript
test('should save and restore game state correctly', () => {
  // Setup game state
  const gameState = { /* ... */ };
  
  // Save state
  localStorage.setItem('savageGolfGameState', JSON.stringify(gameState));
  
  // Verify persistence
  const savedState = localStorage.getItem('savageGolfGameState');
  expect(savedState).toBeDefined();
  
  // Verify content integrity
  const parsedState = JSON.parse(savedState);
  expect(parsedState.players).toEqual(['John', 'Mike', 'Sarah', 'Tom']);
});
```

## 🎯 What We Test

### Game Logic
- ✅ **Murph Game**: Success/failure payouts, player validation
- ✅ **Skins Game**: Team wins, carryovers, payout calculations
- ✅ **KP Game**: Closest to pin assignments, financial summaries
- ✅ **Snake Game**: Snake penalties, pot distribution, last snake logic

### Validation
- ✅ **Player Names**: Uniqueness, required fields, length limits
- ✅ **Bet Amounts**: Positive values, numeric validation
- ✅ **Hole Numbers**: Range validation (1-18), numeric types
- ✅ **Team Selection**: Complete teams, no overlaps

### Storage & Persistence
- ✅ **Game State**: Save, load, validation, corruption handling
- ✅ **Backup Management**: Create, restore, cleanup
- ✅ **Export/Import**: JSON serialization, file handling

### User Workflows
- ✅ **Game Setup**: Player configuration, game selection
- ✅ **Game Play**: Hole navigation, action recording
- ✅ **Game Reset**: State clearing, form reset
- ✅ **Auto-Resume**: Saved game detection, state restoration

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',           // Browser-like environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [              // Coverage targets
    'managers/**/*.js',
    'games/**/*.js',
    'utils/**/*.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000                  // 10 second timeout
};
```

### Jest Setup (`jest.setup.js`)
- Mock localStorage for testing
- Mock DOM elements not available in jsdom
- Configure console output for tests

## 📊 Coverage Goals

- **Unit Tests**: 80%+ coverage of business logic
- **Integration Tests**: Cover main user workflows
- **Critical Paths**: 100% coverage of financial calculations

## 🚨 Common Test Issues

### 1. ES6 Module Import Errors
**Problem**: Jest can't import ES6 modules by default
**Solution**: Use jsdom environment and mock dependencies

### 2. DOM Element Not Found
**Problem**: Tests run in Node.js, not browser
**Solution**: Mock DOM elements or use jsdom environment

### 3. localStorage Not Available
**Problem**: Node.js doesn't have localStorage
**Solution**: Mock localStorage in jest.setup.js

### 4. Async Operations
**Problem**: File operations and some game logic are async
**Solution**: Use async/await and proper test timeouts

## 🧹 Test Maintenance

### Adding New Tests
1. **Unit Tests**: Add to appropriate `unit/` subdirectory
2. **Integration Tests**: Add to `integration/` directory
3. **Follow Naming**: Use `.test.js` or `.spec.js` extensions

### Test Naming Convention
```javascript
describe('ComponentName', () => {
  describe('MethodName', () => {
    test('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Mocking Best Practices
- Mock external dependencies (localStorage, DOM)
- Use `beforeEach` to reset mocks
- Keep mocks simple and focused

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## 📈 Performance Testing

### Test Execution Times
- **Unit Tests**: <100ms per test
- **Integration Tests**: <5 seconds per test
- **Full Suite**: <30 seconds total

### Memory Usage
- Monitor for memory leaks in long-running tests
- Use `--detectOpenHandles` for debugging

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test File
```bash
npm test -- tests/unit/games/murph-game.test.js
```

### Coverage Report
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Mocking Strategies](https://jestjs.io/docs/mock-functions)

## 🤝 Contributing

When adding new features:
1. **Write tests first** (TDD approach)
2. **Ensure coverage** doesn't decrease
3. **Update this README** if adding new test types
4. **Run full test suite** before submitting

---

**Happy Testing! 🏌️‍♂️** Your golf betting tracker is now thoroughly tested and reliable!
