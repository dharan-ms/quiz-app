/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setupEnv.ts"],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts", "!src/generated/**"],
  globals: {
    "ts-jest": {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
