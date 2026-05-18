/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['dist', 'node_modules', 'src/demos'],
  rules: {
    // Preview app is intentionally more experimental; keep hooks basics, relax overly strict addon rules.
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/purity': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/immutability': 'off',
    // TS already provides the component contract for props.
    'react/prop-types': 'off',
  },
};
