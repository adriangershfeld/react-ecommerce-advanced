// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts?(x)'],
  // Remove any ESM-related flags
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      // Disable ESM handling in ts-jest
      useESM: false,
    },
  },
};