#!/usr/bin/env node

/**
 * Test Runner Script for Savage Golf Betting Tracker
 * Provides easy commands to run different types of tests
 */

const { spawn } = require('child_process');
const path = require('path');

const commands = {
  'test': 'npm test',
  'test:watch': 'npm run test:watch',
  'test:coverage': 'npm run test:coverage',
  'test:debug': 'npm run test:debug',
  'test:validation': 'npm test -- --testPathPatterns="validation.test.js"',
  'test:games': 'npm test -- --testPathPatterns="games"',
  'test:managers': 'npm test -- --testPathPatterns="managers"',
  'test:integration': 'npm test -- --testPathPatterns="integration"'
};

function runCommand(command) {
  console.log(`🚀 Running: ${command}`);
  console.log('─'.repeat(50));
  
  const child = spawn(command, [], { 
    stdio: 'inherit', 
    shell: true,
    cwd: __dirname
  });
  
  child.on('close', (code) => {
    console.log('─'.repeat(50));
    if (code === 0) {
      console.log('✅ Tests completed successfully!');
    } else {
      console.log(`❌ Tests failed with exit code ${code}`);
    }
    process.exit(code);
  });
  
  child.on('error', (error) => {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  });
}

function showHelp() {
  console.log('🧪 Savage Golf Betting Tracker - Test Runner');
  console.log('─'.repeat(50));
  console.log('Available commands:');
  console.log('');
  console.log('  test              - Run all tests');
  console.log('  test:watch        - Run tests in watch mode');
  console.log('  test:coverage     - Run tests with coverage report');
  console.log('  test:debug        - Run tests in debug mode');
  console.log('  test:validation   - Run only validation tests');
  console.log('  test:games        - Run only game logic tests');
  console.log('  test:managers     - Run only manager tests');
  console.log('  test:integration  - Run only integration tests');
  console.log('  help              - Show this help message');
  console.log('');
  console.log('Usage: node test-runner.js <command>');
  console.log('Example: node test-runner.js test:validation');
}

function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (commands[command]) {
    runCommand(commands[command]);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('');
    showHelp();
    process.exit(1);
  }
}

// Run the main function
main();
