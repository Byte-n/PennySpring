module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  modulePathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  watchPathIgnorePatterns: ['<rootDir>/.worktrees/'],
};
