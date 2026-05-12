module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.worktrees/'],
  modulePathIgnorePatterns: ['<rootDir>/.worktrees/'],
  watchPathIgnorePatterns: ['<rootDir>/.worktrees/'],
};
