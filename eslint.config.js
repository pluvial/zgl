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
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      ['no-unused-vars']: ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.ts'],
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
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-throw-literal': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
    },
  },
  { ignores: ['dist'] },
  prettier,
];
