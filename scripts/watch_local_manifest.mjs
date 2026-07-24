#!/usr/bin/env node
/**
 * Watch public corpus paths and regenerate + install the local semantic manifest.
 *
 * Usage (from monorepo root):
 *   node scripts/watch_local_manifest.mjs
 *   npm run corpus:watch-manifest
 *
 * Debounces filesystem events (~800ms). Does not start Next.js — pair with
 * `npm run site:dev:local` in a second terminal (or `npm run site:dev:watch`).
 */
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const WATCH_DIRS = ["books", "semantic", "schema", "upcoming"].map((d) => join(ROOT, d));
const DEBOUNCE_MS = 800;

let timer = null;
let running = false;
let pending = false;

function log(msg) {
  console.log(`[watch-manifest] ${msg}`);
}

function runPipeline() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  pending = false;
  log("regenerating covers + manifest + install…");
  const child = spawn(
    "bash",
    ["-lc", "npm run corpus:build-manifest && npm run site:install-local-manifest"],
    { cwd: ROOT, stdio: "inherit", env: process.env },
  );
  child.on("exit", (code) => {
    running = false;
    if (code === 0) log("ready — restart or refresh Next if needed");
    else log(`pipeline exited ${code}`);
    if (pending) runPipeline();
  });
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(runPipeline, DEBOUNCE_MS);
}

for (const dir of WATCH_DIRS) {
  try {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      // Skip draft / cache noise under semantic
      const name = String(filename).replace(/\\/g, "/");
      if (name.includes("_drafts/") || name.includes("/.git/") || name.endsWith("~")) return;
      schedule();
    });
    log(`watching ${dir}`);
  } catch (err) {
    log(`skip ${dir}: ${err instanceof Error ? err.message : err}`);
  }
}

log("initial generate…");
runPipeline();
