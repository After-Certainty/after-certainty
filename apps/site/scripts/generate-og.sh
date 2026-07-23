#!/usr/bin/env bash
# Regenerate public/og.png — delegates to the Node/sharp script.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run generate:og --silent
