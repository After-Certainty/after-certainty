#!/usr/bin/env node
import { execSync } from "node:child_process";
import { repoRoot } from "./repo-root.mjs";

const root = repoRoot();
process.chdir(root);

const manifest =
  process.env.SEMANTIC_MANIFEST ??
  process.env.SEMANTIC_MANIFEST_OUT ??
  "build/semantic-manifest.json";

execSync(
  `python3 tools/validate_semantic_manifest.py --repo . --manifest "${manifest}"`,
  { stdio: "inherit" },
);
