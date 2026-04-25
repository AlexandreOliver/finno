import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: ".",
});

const customConfig: Config = {
  verbose: true,
  moduleDirectories: ["node_modules", "<rootDir>"],
};

export default createJestConfig(customConfig);
