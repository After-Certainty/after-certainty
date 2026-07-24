import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    settings: {
      react: {
        // Pin React version so eslint-plugin-react skips ESLint-10-incompatible
        // context.getFilename() auto-detection (see vercel/next.js#89764).
        version: "19.2.7",
      },
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    ignores: ["**/*.{test,spec}.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/data/semantic-manifest.json",
              message:
                "Committed semantic-manifest.json was removed. Use getSemanticGraph / loadOfflineManifestJson (installed local) or inject a test fixture.",
            },
            {
              name: "../data/semantic-manifest.json",
              message:
                "Committed semantic-manifest.json was removed. Use the installed local manifest path.",
            },
          ],
          patterns: [
            {
              group: ["**/test/fixtures/semantic-manifest/**"],
              message:
                "Test fixtures must not be imported from production app/components/lib code.",
            },
            {
              group: ["**/data/semantic-manifest.json"],
              message:
                "Committed semantic-manifest.json was removed. Use installed local-semantic-manifest.json.",
            },
          ],
        },
      ],
    },
  },
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
