module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@dr\\.pogodin/react-native-fs$':
      '<rootDir>/src/shims/react-native-fs.ts',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  modulePathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  watchPathIgnorePatterns: ['<rootDir>/.worktrees/'],
};
