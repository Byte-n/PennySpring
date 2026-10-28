module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@assistant-ui|assistant-stream|assistant-cloud|ai|@ai-sdk|@workflow|@vercel|zod|nanoid|swr|throttleit|pkce-challenge|secure-json-parse|web-streams-polyfill|text-encoding-utf-8|eventsource-parser)/)',
  ],
  moduleNameMapper: {
    '^@dr\\.pogodin/react-native-fs$':
      '<rootDir>/src/shims/react-native-fs.ts',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  modulePathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/packages/adb-tui/'],
  watchPathIgnorePatterns: ['<rootDir>/.worktrees/'],
};
