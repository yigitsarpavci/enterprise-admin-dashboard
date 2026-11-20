/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
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
