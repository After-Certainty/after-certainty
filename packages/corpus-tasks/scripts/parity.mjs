#!/usr/bin/env node
import { execRepoPython, repoRoot } from "./repo-root.mjs";

const root = repoRoot();
process.chdir(root);

const manifestOut = process.env.SEMANTIC_MANIFEST_OUT ?? "build/semantic-manifest.json";

execRepoPython(root, [
  "tools/compare_manifest_parity.py",
  "--local",
  manifestOut,
  "--json-out",
  "reports/manifest-parity.json",
  "--md-out",
  "reports/manifest-parity.md",
]);
