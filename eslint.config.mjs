import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  js.configs.recommended,
  {
    files: ["*.config.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommended,
      next.configs["core-web-vitals"],
      reactHooks.configs.flat.recommended,
    ],
  },
]);
