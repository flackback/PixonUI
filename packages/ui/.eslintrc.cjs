/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['dist', 'node_modules', 'src/__tests__', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
  rules: {
    // This rule is too restrictive for typical animation/transition patterns in the library.
    // We still keep the other react-hooks rules enabled.
    'react-hooks/set-state-in-effect': 'off',
    // These rules are currently too strict for common, intentional patterns in the codebase.
    'react-hooks/purity': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/immutability': 'off',
    // TS already provides the component contract for props.
    'react/prop-types': 'off',
  },
};
