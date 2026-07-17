#!/usr/bin/env bash
# Revalidate www.after-certainty.com caches after a successful release publish.
#
# Security: the Authorization header is attached only after the destination URL
# passes an exact allowlist check. Repository variables must not supply an
# arbitrary destination. Redirects are not followed while carrying the secret.
#
# Required env:
#   CACHE_REVALIDATE_SECRET — bearer token (never printed)
#
# Optional env (tests only):
#   REVALIDATE_CURL_BIN — curl binary override
#   REVALIDATE_DRY_RUN=1 — validate URL and exit 0 without contacting the network
set -euo pipefail
# Never trace commands (would print the Authorization header).
set +x

readonly APPROVED_URL="https://www.after-certainty.com/api/cache/revalidate"

die() {
  echo "revalidate_site_cache: $*" >&2
  exit 1
}

validate_revalidate_url() {
  local url="${1:-}"
  if [[ -z "$url" ]]; then
    die "URL is empty"
  fi
  # Exact match only — no suffix/substring allowlists.
  if [[ "$url" != "$APPROVED_URL" ]]; then
    die "URL is not on the exact allowlist (refusing to send Authorization)"
  fi
  # Defense in depth: structural checks even though allowlist is exact.
  case "$url" in
    https://*) ;;
    *) die "URL must use https" ;;
  esac
  if [[ "$url" == *"@"* ]]; then
    die "URL must not contain userinfo"
  fi
}

# When sourced by tests, only define helpers.
if [[ "${REVALIDATE_SOURCED:-}" == "1" ]]; then
  return 0 2>/dev/null || exit 0
fi

if [[ -z "${CACHE_REVALIDATE_SECRET:-}" ]]; then
  echo "CACHE_REVALIDATE_SECRET not set; skipping site revalidate."
  exit 0
fi

url="$APPROVED_URL"
validate_revalidate_url "$url"

if [[ "${REVALIDATE_DRY_RUN:-}" == "1" ]]; then
  echo "Dry run: would POST to approved URL (secret not printed)."
  exit 0
fi

curl_bin="${REVALIDATE_CURL_BIN:-curl}"
# --max-redirs 0: do not follow redirects while carrying Authorization.
code="$("$curl_bin" -sS --max-redirs 0 -o /tmp/site-revalidate.json -w "%{http_code}" \
  -X POST "$url" \
  -H "Authorization: Bearer ${CACHE_REVALIDATE_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"targets":["podcast","semantic","books"]}')" || true

# Response body may be logged; never echo the secret or the Authorization header.
if [[ -f /tmp/site-revalidate.json ]]; then
  cat /tmp/site-revalidate.json
  echo ""
fi

if [[ "$code" != "200" ]]; then
  echo "Site revalidate failed (HTTP ${code}). Deploy after-certainty-site with /api/cache/revalidate and matching CACHE_REVALIDATE_SECRET on Vercel." >&2
  exit 1
fi
echo "Revalidated www.after-certainty.com: podcast RSS, semantic-manifest.json, books-manifest.json"
