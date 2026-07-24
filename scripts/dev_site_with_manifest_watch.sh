#!/usr/bin/env bash
# Local DX: keep local semantic-manifest fresh while running Next.js.
# Ctrl-C stops both the watcher and the site.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export SEMANTIC_MANIFEST_USE_LOCAL=1
export SEMANTIC_MANIFEST_OFFLINE=1

# Bootstrap once so the first Next boot has a local file.
npm run corpus:build-manifest
npm run site:install-local-manifest

node scripts/watch_local_manifest.mjs &
WATCH_PID=$!

cleanup() {
  kill "$WATCH_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

npm run site:dev
