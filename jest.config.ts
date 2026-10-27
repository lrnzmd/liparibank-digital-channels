import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup-env.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(file-type)/)"
  ],
  extensionsToTreatAsEsm: [".ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.types.ts",
    "!src/**/*.routes.ts",
    "!src/**/*.controller.ts",
    "!src/**/*.repository.ts",
    "!src/**/*.repository.prisma.ts",
    "!src/index.ts",
    "!src/server.ts",
    "!src/app.ts",
    "!src/config/**",
    "!src/middleware/**",
    "!src/routes/**",
    "!src/broken/**",
    "!src/utils/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      lines: 60,
      functions: 50,
      statements: 60,
    },
  },
  testTimeout: 30000,
  verbose: true,
};

export default config;
