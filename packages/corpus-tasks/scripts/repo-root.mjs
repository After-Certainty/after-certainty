import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Monorepo root (packages/corpus-tasks/scripts → ../../..). */
export function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}

export function githubRepositoryFromEnv() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const remote = execSync("git remote get-url origin", {
      cwd: repoRoot(),
      encoding: "utf8",
    }).trim();
    return remote
      .replace(/^git@github.com:/, "")
      .replace(/^https:\/\/github.com\//, "")
      .replace(/\.git$/, "");
  } catch {
    return "ksteffe/after-certainty";
  }
}
