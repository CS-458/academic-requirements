import nextJest from "next/jest";
const createJestConfig = nextJest({
  dir: "./"
});

export default createJestConfig({
  transform: {},
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true
    }
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80
  //   }
  // },
  collectCoverageFrom: [
    "./components/**",
    "./entities/**",
    "./interfaces/**",
    "./pages/**",
    "./public/**",
    "./services/**",
    "./styles/**"
  ]
});
