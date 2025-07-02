module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/backend/src/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/backend/src/__tests__/setup.ts'],
      moduleNameMapper: {
        '^@echopages/shared$': '<rootDir>/packages/shared/src',
      },
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/packages/shared/src/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/packages/web/tests/**/*.test.tsx'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      moduleNameMapper: {
        '^@echopages/shared$': '<rootDir>/packages/shared/src',
      },
    },
    {
      displayName: 'mobile',
      testMatch: ['<rootDir>/packages/mobile/tests/**/*.test.tsx'],
      preset: 'react-native',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      moduleNameMapper: {
        '^@echopages/shared$': '<rootDir>/packages/shared/src',
      },
    },
    {
      displayName: 'desktop',
      testMatch: ['<rootDir>/packages/desktop/tests/**/*.test.tsx'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      moduleNameMapper: {
        '^@echopages/shared$': '<rootDir>/packages/shared/src',
      },
    },
    {
      displayName: 'react-native-legacy',
      testMatch: ['<rootDir>/EchoPagesJournal/__tests__/**/*.test.tsx'],
      preset: 'react-native',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    },
  ],
  collectCoverageFrom: [
    'backend/src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
