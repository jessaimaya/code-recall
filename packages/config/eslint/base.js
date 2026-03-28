import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").Config} */
export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, {
  rules: {
    // Disallow implicit `any` — use `eslint-disable` comment when unavoidable
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
});
