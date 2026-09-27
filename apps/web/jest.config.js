/**
 * Jest configuration for @savitools/web.
 *
 * The app is a Next.js React front end, so tests need a DOM (`jsdom`) and the
 * transformer has to handle JSX. Coverage is collected from `src` and gated by
 * a floor that `npm run test:coverage -w apps/web` enforces.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
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
  },
  // `.tsx` matters: every React component and route page test is JSX. Both
  // suffixes are collected because the repo already carries `.test.ts` and
  // `.spec.ts(x)` files — anything else silently never runs.
  testMatch: ['<rootDir>/src/__tests__/**/*.{test,spec}.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  // A ratchet floor, not a target: it is pinned just under the coverage this
  // suite already measures so the gate can never drift down. It should only
  // ever be raised as component and route coverage lands.
  coverageThreshold: {
    global: {
      branches: 3.5,
      functions: 3.5,
      lines: 7.5,
      statements: 7,
    },
  },
};
