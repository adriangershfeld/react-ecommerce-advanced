// Create this file in your project root
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/*.test.ts?(x)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};