/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts', 'package-lock.json', 'packages/preview/src/demos', 'packages/ui/src'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 🔥 CRÍTICO PARA LIBS
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // JSX / React
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-key': 'error',

    // Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',

    // Qualidade
    'no-console': 'off',
    'no-debugger': 'error',

    // Estilo previsível
    'eqeqeq': ['error', 'always'],
  },
};
