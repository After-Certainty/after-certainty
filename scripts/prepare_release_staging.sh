#!/usr/bin/env bash
# Prepare release-staging assets: merge builds, generate manifests, secret-scan, checksums.
#
# Runs only with read-only credentials. Must not create/alter/delete GitHub releases.
#
# Env:
#   GITHUB_REPOSITORY — owner/repo (required)
#   GITHUB_SHA — commit for release notes context (optional)
#   PREPARE_MODE — "books" (default) or "semantic-only"
#   PRIOR_DIR, BUILT_DIR, OUT_DIR — directories (defaults: prior, built, upload)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Prefer the frozen CI/local venv when present (GITHUB_PATH only affects later steps).
if [[ -x "$ROOT/.venv/bin/python3" ]]; then
  PYTHON="$ROOT/.venv/bin/python3"
else
  PYTHON="python3"
fi

MODE="${PREPARE_MODE:-books}"
PRIOR_DIR="${PRIOR_DIR:-prior}"
BUILT_DIR="${BUILT_DIR:-built}"
OUT_DIR="${OUT_DIR:-upload}"
REPO_SLUG="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"

mkdir -p "$OUT_DIR"

if [[ "$MODE" == "books" ]]; then
  "$PYTHON" tools/merge_release_assets.py \
    --repo . \
    --prior-dir "$PRIOR_DIR" \
    --built-dir "$BUILT_DIR" \
    --out-dir "$OUT_DIR"
elif [[ "$MODE" == "semantic-only" ]]; then
  if [[ -d "$PRIOR_DIR" ]] && [[ -n "$(ls -A "$PRIOR_DIR" 2>/dev/null || true)" ]]; then
    cp "$PRIOR_DIR"/* "$OUT_DIR"/ 2>/dev/null || true
  fi
else
  echo "Unknown PREPARE_MODE=$MODE" >&2
  exit 2
fi

"$PYTHON" tools/verify_semantic_yaml.py --repo . --strict-prose

# Web-optimized cover derivatives (required before semantic manifest attach).
node packages/corpus-tasks/scripts/generate-book-cover-assets.mjs --repo . --out build/site-assets/book-covers

if [[ "$MODE" == "books" ]]; then
  "$PYTHON" tools/generate_books_manifest.py \
    --repo . \
    --out "$OUT_DIR/books-manifest.json" \
    --github-repository "$REPO_SLUG" \
    --github-ref "main" \
    --release-tag "latest"
  "$PYTHON" tools/validate_books_manifest.py --repo . --manifest "$OUT_DIR/books-manifest.json"
fi

"$PYTHON" tools/generate_semantic_manifest.py \
  --repo . \
  --out "$OUT_DIR/semantic-manifest.json" \
  --github-repository "$REPO_SLUG" \
  --github-ref "main" \
  --release-tag "latest"
"$PYTHON" tools/validate_semantic_manifest.py --repo . --manifest "$OUT_DIR/semantic-manifest.json"

# Portable cover assets for external consumers (paths match coverImages[].path).
if [[ -d build/site-assets/book-covers ]]; then
  tar -C build/site-assets -czf "$OUT_DIR/semantic-cover-assets.tar.gz" book-covers
  echo "Packed semantic-cover-assets.tar.gz"
fi

"$PYTHON" tools/scan_generated_secrets.py "$OUT_DIR"

# Plan optional immutable IngramSpark tags for the write-capable publish job.
"$PYTHON" tools/plan_ingramspark_releases.py \
  --repo . \
  --staging "$OUT_DIR" \
  --out "$OUT_DIR/ingramspark-release-plan.json" \
  --strict

bash scripts/write_sha256sums.sh "$OUT_DIR"
ls -la "$OUT_DIR"
