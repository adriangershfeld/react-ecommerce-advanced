import { Config } from 'jest';

/** @type {Config} */
const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',

    // Redirect any import whose last segment is "firebaseConfig" to the mock
    '(.*/)?firebaseConfig$': '<rootDir>/src/__mocks__/firebaseConfig.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)',
  ],
};

export default config;
