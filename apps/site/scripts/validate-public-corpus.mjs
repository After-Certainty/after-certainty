#!/usr/bin/env node
/**
 * CLI wrapper: public corpus cross-feature integrity.
 * Usage: npm run validate:public-corpus
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  "npx",
  ["vitest", "run", "lib/corpus/validate-public-corpus.test.ts"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, SEMANTIC_MANIFEST_OFFLINE: "1" },
  },
);

process.exit(result.status ?? 1);
