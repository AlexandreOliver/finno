import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: ".",
});

const customConfig: Config = {
  verbose: true,
  moduleDirectories: ["node_modules", "<rootDir>"],
  globalSetup: "./tests/setup.ts",
};

export default createJestConfig(customConfig);
