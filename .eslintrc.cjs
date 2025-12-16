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
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 🔥 CRÍTICO PARA LIBS
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }
    ],

    // JSX / React
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-key': 'error',

    // Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Qualidade
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',

    // Estilo previsível
    'eqeqeq': ['error', 'always'],
  },
};
