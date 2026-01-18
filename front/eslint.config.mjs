import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const asConfigArray = (config) => {
  if (Array.isArray(config)) return config;
  if (config && Array.isArray(config.default)) return config.default;
  if (config && config.default) return [config.default];
  if (config) return [config];
  return [];
};

const eslintConfig = defineConfig([
  ...asConfigArray(nextVitals),
  ...asConfigArray(nextTs),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
