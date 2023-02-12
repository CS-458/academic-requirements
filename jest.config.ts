import nextJest from "next/jest";
const createJestConfig = nextJest({
  dir: "./"
});

export default createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>/"],
  transform: {
    "\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: ["node_modules/(?!react-dnd/)"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "./components/**",
    "./entities/**",
    "./interfaces/**",
    "./pages/**",
    "./public/**",
    "./services/**",
    "./styles/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
});
