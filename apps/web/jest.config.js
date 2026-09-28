const transform = {
  '^.+\\.(ts|tsx)$': [
    'ts-jest',
    {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowJs: true,
      },
    },
  ],
};

const shared = {
  rootDir: __dirname,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform,
};

module.exports = {
  projects: [
    {
      // Pure logic suites: fuzzy search, recent items, preferences, contracts.
      ...shared,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
    },
    {
      // Component suites: anything that needs to mount React into a DOM.
      ...shared,
      displayName: 'dom',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.dom.ts'],
      testMatch: ['<rootDir>/src/__tests__/**/*.test.tsx'],
    },
  ],
};
