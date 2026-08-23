#!/usr/bin/env node
import { execSync } from "node:child_process";
import { execRepoPython, githubRepositoryFromEnv, pythonEnv, repoRoot } from "./repo-root.mjs";

const root = repoRoot();
process.chdir(root);

execRepoPython(root, ["tools/validate_book_specs.py", "--repo", "."]);
execRepoPython(root, ["tools/verify_semantic_yaml.py", "--repo", ".", "--strict-prose"]);

if (!process.env.SKIP_WEB_COVERS) {
  const out =
    process.env.BOOK_COVER_ASSETS_OUT ?? "build/site-assets/book-covers";
  const allowMissing = process.env.ALLOW_MISSING_WEB_COVERS ? "--allow-missing-sharp" : "";
  execSync(
    `node packages/corpus-tasks/scripts/generate-book-cover-assets.mjs --repo . --out "${out}" ${allowMissing}`.trim(),
    { stdio: "inherit" },
  );
}

const manifestOut = process.env.SEMANTIC_MANIFEST_OUT ?? "build/semantic-manifest.json";
const manifestRef = process.env.MANIFEST_REF ?? "main";
const releaseTag = process.env.MANIFEST_RELEASE_TAG ?? "latest";
const githubRepo = githubRepositoryFromEnv();

execSync(
  [
    "uv run ac-manifest",
    "--repo .",
    `--out "${manifestOut}"`,
    `--github-repository "${githubRepo}"`,
    `--github-ref "${manifestRef}"`,
    `--release-tag "${releaseTag}"`,
  ].join(" "),
  { stdio: "inherit", env: pythonEnv(root) },
);
