#!/usr/bin/env node
/**
 * CLI wrapper: validate bundled fallback freshness.
 * Usage: npm run validate:fallback [-- --strict]
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

const env = {
  ...process.env,
  SEMANTIC_MANIFEST_OFFLINE: "1",
  VALIDATE_FALLBACK_STRICT: strict ? "1" : process.env.VALIDATE_FALLBACK_STRICT,
};

const result = spawnSync(
  "npx",
  ["vitest", "run", "lib/graph/fallback-freshness.test.ts", "lib/graph/fallback-cli.test.ts"],
  { cwd: root, stdio: "inherit", env },
);

process.exit(result.status ?? 1);
