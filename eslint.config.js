const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                navigator: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                gtag: 'readonly',
                global: 'readonly',
                
                // Jest globals for tests
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            // Code Quality Rules
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off', // We use console for error logging
            'no-debugger': 'error',
            'no-alert': 'warn',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            
            // Style Rules (relaxed for legacy code)
            'indent': 'off',
            'quotes': ['error', 'single', { avoidEscape: true }],
            'semi': ['error', 'always'],
            'comma-trailing': 'off', // Allow trailing commas
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            
            // Best Practices
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'dot-notation': 'error',
            'no-magic-numbers': ['warn', { ignore: [-1, 0, 1, 2] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'arrow-spacing': 'error',
            
            // Error Prevention
            'no-undef': 'error',
            'no-redeclare': 'error',
            'no-shadow': 'warn',
            'no-use-before-define': ['error', { functions: false }],
            
            // Complexity Management
            'complexity': ['warn', 10],
            'max-depth': ['warn', 4],
            'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
            'max-params': ['warn', 5]
        }
    },
    {
        // Test files have more relaxed rules
        files: ['tests/**/*.js', '**/*.test.js'],
        rules: {
            'no-magic-numbers': 'off',
            'max-lines-per-function': 'off',
            'max-params': 'off'
        }
    }
];
