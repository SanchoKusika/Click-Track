import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import eslintPrettier from 'eslint-plugin-prettier';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintReactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import { resolve } from 'node:path';

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    extends: [js.configs.recommended, ...tsEslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
  },
  {
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': eslintReactHooks,
      'react-refresh': eslintReactRefresh,
      'simple-import-sort': simpleImportSort,
      'testing-library': testingLibraryPlugin,
      import: importPlugin,
      jsdoc: jsdocPlugin,
      prettier: eslintPrettier,
      react: eslintReact,
      'sort-destructure-keys': sortDestructureKeys,
      boundaries,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
      'boundaries/root-path': resolve(import.meta.dirname),
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*', mode: 'folder' },
        { type: 'pages', pattern: 'src/pages/*', mode: 'folder' },
        { type: 'widgets', pattern: 'src/widgets/*', mode: 'folder' },
        { type: 'features', pattern: 'src/features/*', mode: 'folder' },
        { type: 'entities', pattern: 'src/entities/*', mode: 'folder' },
        { type: 'shared', pattern: 'src/shared/*', mode: 'folder' },
      ],
      'boundaries/ignore': ['**/*.test.*', '**/*.spec.*', '**/__tests__/**', 'src/main.tsx', 'dist', 'public'],
      'boundaries/include': ['src/**/*'],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    plugins: { vitest },
    languageOptions: { globals: vitest.environments.env.globals },
    rules: { 'vitest/no-focused-tests': 'error' },
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2025,
      },
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    rules: {
      ...eslintReactHooks.configs.recommended.rules,
      'boundaries/element-types': 'off',
      'react-refresh/only-export-components': 'off',
      'no-undef': 'warn',
      'newline-before-return': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prettier/prettier': 'off',
      'sort-destructure-keys/sort-destructure-keys': 'off',
      'simple-import-sort/imports': [
        'off',
        {
          groups: [
            ['^\\u0000'],
            [
              '^react',
              '^@\\w',
              '^@/.*',
              '^@pages(/.*|$)',
              '^@widgets(/.*|$)',
              '^@features(/.*|$)',
              '^@entities(/.*|$)',
              '^@shared(/.*|$)',
              '^',
              '^\\.',
            ],
            ['^.+\\.(css)$'],
          ],
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'simple-import-sort/exports': 'off',
    },
  },
  {
    ignores: ['node_modules', 'dist', 'eslint.config.mjs', '**/src/shared/api/generated_api.ts'],
  }
);
