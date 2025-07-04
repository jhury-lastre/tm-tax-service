// @ts-check
import { config } from "@repo/eslint-config/base";

export default [
  ...config,
  {
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
];