/** @type {import('eslint').Linter.Config} */
module.exports = {
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
