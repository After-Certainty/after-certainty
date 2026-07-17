#!/usr/bin/env bash
# Write SHA256SUMS for every regular file in a staging directory (excluding SHA256SUMS itself).
set -euo pipefail

staging="${1:-}"
if [[ -z "$staging" || ! -d "$staging" ]]; then
  echo "usage: $0 <staging-dir>" >&2
  exit 2
fi

(
  cd "$staging"
  : > SHA256SUMS
  shopt -s nullglob
  files=(*)
  for f in "${files[@]}"; do
    if [[ -f "$f" && "$f" != "SHA256SUMS" ]]; then
      sha256sum -- "$f" >> SHA256SUMS
    fi
  done
)
echo "Wrote $staging/SHA256SUMS"
