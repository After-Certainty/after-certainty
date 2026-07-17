#!/usr/bin/env bash
# Fail if tracked source files were modified unexpectedly by validation/build.
# Allowed untracked/ignored paths are those already covered by .gitignore
# (build/, export-assets/, etc.). Unexpected modifications to tracked files fail.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Diff against HEAD for tracked files only.
if ! git diff --quiet HEAD; then
  echo "Unexpected modifications to tracked files after build/validation:" >&2
  git --no-pager diff --stat HEAD >&2
  git --no-pager diff HEAD >&2 | head -n 200
  exit 1
fi

# Untracked files outside approved generated directories.
# shellcheck disable=SC2207
untracked=($(git ls-files --others --exclude-standard))
allowed_prefixes=(
  "build/"
  "upload/"
  "staging/"
  "prior/"
  "built/"
  "reports/"
)
bad=()
for f in "${untracked[@]+"${untracked[@]}"}"; do
  ok=0
  for p in "${allowed_prefixes[@]}"; do
    case "$f" in
      "$p"*) ok=1; break ;;
    esac
  done
  # Temporary pytest/cache noise
  case "$f" in
    *.pyc | __pycache__/* | .pytest_cache/* | .ruff_cache/* | .venv/* | uv.lock.tmp) ok=1 ;;
  esac
  if [[ "$ok" -eq 0 ]]; then
    bad+=("$f")
  fi
done

if [[ ${#bad[@]} -gt 0 ]]; then
  echo "Unexpected untracked files after build/validation:" >&2
  printf '  %s\n' "${bad[@]}" >&2
  exit 1
fi

echo "Clean-tree check passed."
