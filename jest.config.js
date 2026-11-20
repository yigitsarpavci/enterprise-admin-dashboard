/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/server/**/*.ts', '!src/server/app.ts'],
  coverageThreshold: { global: { statements: 80, lines: 80, functions: 75, branches: 60 } },
  // jose ships ESM only; let ts-jest transpile it to CommonJS for the tests.
  transformIgnorePatterns: ['/node_modules/(?!jose/)'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        jsx: 'react-jsx',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowJs: true,
        esModuleInterop: true,
        skipLibCheck: true
      }
    }]
  }
};
