module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.test.tsx', '**/tests/**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@expo|expo|@testing-library|@unimodules|unimodules|sentry-expo|native-base)',
  ],
};
