// @ts-check

import js from "@eslint/js";
import angular from "angular-eslint";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

/** @type {import("typescript-eslint").ConfigWithExtends[]} */
export default defineConfig([
  { ignores: ["node_modules", "dist", ".angular", "**/popeye_ww.js"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      stylistic.configs.customize({
        // the following options are the default values
        indent: 2,
        quotes: "double",
        semi: true,
        // ...
      }),
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": ["warn", { allow: ["warn", "error", "group", "groupEnd"] }],
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors"] }],
    },
  },
  {
    files: ["**/{chessboard,dbmanager,host-bridge,ui-elements}/**/*.{ts,js,mjs,cjs}"],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "lib",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "lib",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.conf.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
