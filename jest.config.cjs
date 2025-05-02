// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Updated to full package name
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Add this line
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts?(x)'],
  globals: {
    'ts-jest': {
      // Required for Firebase compatibility
      diagnostics: false,
    },
  },
  // Add these node polyfills
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};