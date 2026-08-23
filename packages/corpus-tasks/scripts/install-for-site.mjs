#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { repoRoot } from "./repo-root.mjs";

const root = repoRoot();
const args = ["scripts/install_local_manifest_for_site.py", "--repo", ".", ...process.argv.slice(2)];

const result = spawnSync("python3", args, { cwd: root, stdio: "inherit" });
process.exit(result.status ?? 1);
