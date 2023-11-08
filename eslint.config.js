import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // ...globals.node,
        ...globals.nodeBuiltin,
        // ...globals['shared-node-browser'],
      },
    },
  },
  { files: ['**/*.js'], ...js.configs.recommended },
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': ts },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: true,
      },
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      // ...ts.configs.recommended.rules,
      // ...ts.configs.stylistic.rules,
      // ...ts.configs.strict.rules,
      // ...ts.configs.stylistic.rules,
      // ...ts.configs['recommended-type-checked'].rules,
      ...ts.configs['strict-type-checked'].rules,
      ...ts.configs['stylistic-type-checked'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  { rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } },
  { ignores: ['dist'] },
  prettier,
];
