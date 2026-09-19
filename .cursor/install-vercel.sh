#!/usr/bin/env bash
# Install locked Vercel CLI for Cloud Agent sessions (idempotent, non-interactive).
# Version and transitive tree come from tools/vercel-cli/{package.json,package-lock.json}.
# Binary only — no VERCEL_TOKEN. Token Material is injected by `pade exec`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG="$ROOT/tools/vercel-cli"
BIN="$PKG/node_modules/.bin"

if ! command -v npm >/dev/null 2>&1; then
  echo "error: npm is required to install the locked Vercel CLI from tools/vercel-cli" >&2
  exit 1
fi

if [[ ! -f "$PKG/package.json" || ! -f "$PKG/package-lock.json" ]]; then
  echo "error: missing tools/vercel-cli/package.json or package-lock.json" >&2
  exit 1
fi

npm ci --prefix "$PKG" --no-fund --no-audit

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
