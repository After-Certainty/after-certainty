#!/usr/bin/env node
import { execSync } from "node:child_process";
import { repoRoot } from "./repo-root.mjs";

const root = repoRoot();
process.chdir(root);

const manifestOut = process.env.SEMANTIC_MANIFEST_OUT ?? "build/semantic-manifest.json";

execSync(
  [
    "python3 tools/compare_manifest_parity.py",
    `--local "${manifestOut}"`,
    "--json-out reports/manifest-parity.json",
    "--md-out reports/manifest-parity.md",
  ].join(" "),
  { stdio: "inherit" },
);
