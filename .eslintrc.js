module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['**/dist/', '**/docs-dist/', '**/drizzle/migrations.js'],
  rules: {
    'react-hooks/exhaustive-deps': 0,
  },
};
