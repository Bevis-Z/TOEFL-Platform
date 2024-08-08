module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'consistent-return': 0,
    'no-console': 0,
    'no-unused-vars': 0,
    'default-case': 0,
    radix: 0,
    'object-shorthand': 0,
    'prefer-destructuring': 0,
    'no-unused-expressions': 0,
    camelcase: 0,
    'global-require': 0,
    semi: [2, 'never'],
    'no-useless-return': 0,
    'no-plusplus': 0,
  },
}
