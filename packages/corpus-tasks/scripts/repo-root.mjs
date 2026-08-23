import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Monorepo root (packages/corpus-tasks/scripts → ../../..). */
export function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}

export function pythonEnv(repo) {
  const sep = path.delimiter;
  return {
    ...process.env,
    PATH: [
      path.join(repo, ".venv/bin"),
      path.join(process.env.HOME || "", ".local/bin"),
      process.env.PATH,
    ]
      .filter(Boolean)
      .join(sep),
    PYTHONPATH: [path.join(repo, "src"), path.join(repo, "tools"), process.env.PYTHONPATH]
      .filter(Boolean)
      .join(sep),
  };
}

/** Run a Python script with uv (preferred) or venv/python3 + PYTHONPATH. */
export function execRepoPython(repo, scriptArgs) {
  const env = pythonEnv(repo);
  const uv = path.join(process.env.HOME || "", ".local/bin/uv");
  const quoted = scriptArgs.map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg));
  if (existsSync(uv) || existsSync("uv")) {
    execSync(["uv", "run", "python", ...quoted].join(" "), { cwd: repo, stdio: "inherit", env });
    return;
  }
  const venvPy = path.join(repo, ".venv/bin/python3");
  const py = existsSync(venvPy) ? venvPy : "python3";
  execSync([py, ...quoted].join(" "), { cwd: repo, stdio: "inherit", env });
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
