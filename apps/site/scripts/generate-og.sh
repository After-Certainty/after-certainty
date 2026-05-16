#!/usr/bin/env bash
# Regenerate public/og.png (1200×630) from the home hero backdrop. Requires macOS sips.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/images/hero/hero-backdrop.png"
OUT="$ROOT/public/og.png"
TMP="$(mktemp /tmp/og-resize.XXXXXX.png)"
trap 'rm -f "$TMP"' EXIT

sips --resampleWidth 1200 "$SRC" --out "$TMP" >/dev/null
sips --cropToHeightWidth 630 1200 "$TMP" --out "$OUT" >/dev/null
echo "Wrote $OUT ($(sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | awk '/pixel/{printf "%s ", $2} END{print ""}'))"
