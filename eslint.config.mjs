import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The experimental react-hooks "set-state-in-effect" rule flags legitimate
  // patterns we rely on (loading flags before fetch, syncing from localStorage /
  // wallet state, and SSR-safe deferral of window-dependent values). These are
  // intentional and don't break the build, so keep them visible as warnings
  // rather than errors.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local tooling scratch dir — not project source.
    ".remember/**",
  ]),
]);

export default eslintConfig;
