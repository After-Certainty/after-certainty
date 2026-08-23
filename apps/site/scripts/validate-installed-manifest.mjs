#!/usr/bin/env node
/**
 * CLI wrapper: validate installed local manifest freshness.
 * Usage: npm run validate:installed-manifest [-- --strict]
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

const env = {
  ...process.env,
  SEMANTIC_MANIFEST_OFFLINE: "1",
  VALIDATE_INSTALLED_MANIFEST_STRICT: strict ? "1" : process.env.VALIDATE_INSTALLED_MANIFEST_STRICT,
  VALIDATE_FALLBACK_STRICT: strict ? "1" : process.env.VALIDATE_FALLBACK_STRICT,
};

const result = spawnSync(
  "npx",
  [
    "vitest",
    "run",
    "lib/graph/installed-manifest-freshness.test.ts",
    "lib/graph/installed-manifest-cli.test.ts",
  ],
  { cwd: root, stdio: "inherit", env },
);

process.exit(result.status ?? 1);
