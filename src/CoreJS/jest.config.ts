import type { Config } from "jest";

const config: Config = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        target: "es2024",
      },
    ],
  },
};

export default config;
