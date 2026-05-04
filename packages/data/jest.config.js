module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@pennyspring/data$': '<rootDir>/src/index.ts',
  },
}
