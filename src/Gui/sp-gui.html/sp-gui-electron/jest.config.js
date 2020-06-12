const { defaults } = require("jest-config");
// jest.config.js
module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
    },
  },
  modulePathIgnorePatterns: ["./src/.config.spec.ts"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["./src/.config.spec.ts"],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  testPathIgnorePatterns: ["/node_modules/", "/app/", "/dist/", "/release/"],
  modulePaths: ["node_modules"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/app/",
    "/dist/",
    "/release/",
  ],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        // suiteName: "jest tests",
        outputDirectory: "./coverage",
        outputName: "./junit-TEST-coverage-report.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        includeConsoleOutput: true,
      },
    ],
  ],
  coverageReporters: ["text", "text-summary", "lcov", "html", "cobertura"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 76,
      functions: 87,
      lines: 90,
    },
  },
  // testResultsProcessor: "jest-sonar-reporter",
};
