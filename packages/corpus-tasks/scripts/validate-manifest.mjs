#!/usr/bin/env node
import { execRepoPython, repoRoot } from "./repo-root.mjs";

const root = repoRoot();
process.chdir(root);

const manifest =
  process.env.SEMANTIC_MANIFEST ??
  process.env.SEMANTIC_MANIFEST_OUT ??
  "build/semantic-manifest.json";

execRepoPython(root, [
  "tools/validate_semantic_manifest.py",
  "--repo",
  ".",
  "--manifest",
  manifest,
]);
