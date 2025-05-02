module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)', // allow ESM Firebase modules to be transformed
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
};
