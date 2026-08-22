#!/usr/bin/env bash
# Install pinned Vercel CLI for Cloud Agent sessions (idempotent, non-interactive).
# Version matches VERCEL_CLI_VERSION in .github/workflows/site-ci.yml.
# Binary only — no VERCEL_TOKEN. Token Material is injected by `pade exec`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS="$ROOT/.tools/vercel"
VERSION=59.3.0
BIN="$TOOLS/node_modules/.bin"

if ! command -v npm >/dev/null 2>&1; then
  echo "error: npm is required to install vercel@${VERSION}" >&2
  exit 1
fi

mkdir -p "$TOOLS"
npm install --prefix "$TOOLS" --no-save --no-fund --no-audit "vercel@${VERSION}"

# Expose vercel on PATH for agent shells.
PROFILE="/etc/profile.d/cursor-vercel.sh"
if [[ -w "$(dirname "$PROFILE")" ]]; then
  cat >"$PROFILE" <<EOF
# Cursor Cloud Agent: Vercel CLI (installed by .cursor/install-vercel.sh)
export PATH="$BIN:\$PATH"
EOF
else
  SNIPPET="$HOME/.cursor-vercel-env.sh"
  cat >"$SNIPPET" <<EOF
export PATH="$BIN:\$PATH"
EOF
  if ! grep -qF "$SNIPPET" "$HOME/.bashrc" 2>/dev/null; then
    echo "[ -f \"$SNIPPET\" ] && . \"$SNIPPET\"" >>"$HOME/.bashrc"
  fi
fi

export PATH="$BIN:$PATH"
"$BIN/vercel" --version
