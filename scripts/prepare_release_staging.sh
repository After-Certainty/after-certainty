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

MODE="${PREPARE_MODE:-books}"
PRIOR_DIR="${PRIOR_DIR:-prior}"
BUILT_DIR="${BUILT_DIR:-built}"
OUT_DIR="${OUT_DIR:-upload}"
REPO_SLUG="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"

mkdir -p "$OUT_DIR"

if [[ "$MODE" == "books" ]]; then
  python3 tools/merge_release_assets.py \
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

python3 tools/verify_semantic_yaml.py --repo . --strict-prose

if [[ "$MODE" == "books" ]]; then
  python3 tools/generate_books_manifest.py \
    --repo . \
    --out "$OUT_DIR/books-manifest.json" \
    --github-repository "$REPO_SLUG" \
    --github-ref "main" \
    --release-tag "latest"
  python3 tools/validate_books_manifest.py --repo . --manifest "$OUT_DIR/books-manifest.json"
fi

python3 tools/generate_semantic_manifest.py \
  --repo . \
  --out "$OUT_DIR/semantic-manifest.json" \
  --github-repository "$REPO_SLUG" \
  --github-ref "main" \
  --release-tag "latest"
python3 tools/validate_semantic_manifest.py --repo . --manifest "$OUT_DIR/semantic-manifest.json"

python3 tools/scan_generated_secrets.py "$OUT_DIR"

bash scripts/write_sha256sums.sh "$OUT_DIR"
ls -la "$OUT_DIR"
