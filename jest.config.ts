import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: ".",
});

const customConfig: Config = {
  verbose: true,
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch:
    "**/tests/**/*.?([mc])[jt]s?(x), **/?(*.)+(spec|test).?([mc])[jt]s?(x)",
};

export default createJestConfig(customConfig);
