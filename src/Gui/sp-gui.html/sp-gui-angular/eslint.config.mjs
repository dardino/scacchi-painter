//@ts-check

import angularEsLint from "@angular-eslint/eslint-plugin";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {any} */
const tsRecomended = tseslint.configs.recommended;

/** @type {import("typescript-eslint").ConfigWithExtends[]} */
export default defineConfig([
  { ignores: ["node_modules", "dist", ".angular", "**/popeye_ww.js"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js, angularEsLint }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  ...tsRecomended,
  {
    files: ["**/*.conf.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        "module": "readonly",
        "require": "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": ["warn", { allow: ["warn", "error", "group", "groupEnd"] }],
    },
  },
]);
