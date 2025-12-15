const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const { FlatCompat } = require('@eslint/eslintrc'); // Correct import

// Create a FlatCompat instance
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    plugins: ['@typescript-eslint', 'react-hooks'],
  },
});

module.exports = [
  {
    ignores: ['.next', '**/node_modules'],
  },
  // Convert the legacy next/core-web-vitals config to flat config format
  ...compat.extends('next/core-web-vitals'),

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // Any custom rules not covered by nextVitals
    },
  },
];


