import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/__tests__/__mocks__/setup.ts'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/__mocks__/'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }]
  }
}

export default createJestConfig(customJestConfig)