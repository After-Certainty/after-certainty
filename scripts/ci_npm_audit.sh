#!/usr/bin/env bash
# Site CI root npm audit with retries + temporary allowlist for unpatched advisories.
# Usage: bash scripts/ci_npm_audit.sh
#
# Allowed GHSAs must have no patched release on the npm registry yet. Remove an
# entry when a fixed version is published and the root lock picks it up.
# Tracked in docs/security/scorecard-vulnerabilities.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# braces <=3.0.3 (GHSA-vfj7-8cjw-p6xm / CVE-2026-93687): no npm release >3.0.3 yet.
# Upstream: https://github.com/micromatch/braces/issues/70
ALLOWED_UNPATCHED_GHSAS=(
  GHSA-vfj7-8cjw-p6xm
)

attempts="${NPM_AUDIT_ATTEMPTS:-3}"
report="$(mktemp)"
trap 'rm -f "$report"' EXIT

is_valid_audit_json() {
  REPORT_PATH="$report" python3 -c '
import json, os, sys
try:
    data = json.load(open(os.environ["REPORT_PATH"], encoding="utf-8"))
except Exception:
    sys.exit(1)
sys.exit(0 if isinstance(data, dict) and "vulnerabilities" in data else 1)
'
}

filter_allowed() {
  ALLOWED_UNPATCHED_GHSAS_JSON="$(printf '%s\n' "${ALLOWED_UNPATCHED_GHSAS[@]}" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')" \
  REPORT_PATH="$report" \
  python3 <<'PY'
import json
import os
import sys

report_path = os.environ["REPORT_PATH"]
allowed = set(json.loads(os.environ["ALLOWED_UNPATCHED_GHSAS_JSON"]))

with open(report_path, encoding="utf-8") as f:
    try:
        data = json.load(f)
    except json.JSONDecodeError as exc:
        print(f"ci_npm_audit: invalid npm audit JSON: {exc}", file=sys.stderr)
        sys.exit(2)

if "vulnerabilities" not in data:
    print("ci_npm_audit: npm audit JSON missing vulnerabilities (registry error?)", file=sys.stderr)
    sys.exit(1)

blocking = []
for name, vuln in (data.get("vulnerabilities") or {}).items():
    severity = (vuln.get("severity") or "").lower()
    if severity not in {"high", "critical"}:
        continue
    for via in vuln.get("via") or []:
        if not isinstance(via, dict):
            continue
        url = via.get("url") or ""
        ghsa = url.rsplit("/", 1)[-1] if url else ""
        via_sev = (via.get("severity") or severity).lower()
        if via_sev not in {"high", "critical"}:
            continue
        if ghsa and ghsa in allowed:
            continue
        blocking.append(
            {
                "package": name,
                "ghsa": ghsa or "(unknown)",
                "title": via.get("title") or via.get("name") or name,
                "url": url,
                "severity": via_sev,
            }
        )

if not blocking:
    if allowed:
        print(
            "ci_npm_audit: npm audit clear of high/critical findings outside "
            f"allowed unpatched GHSAs ({', '.join(sorted(allowed))})."
        )
    else:
        print("ci_npm_audit: npm audit clear of high/critical findings.")
    sys.exit(0)

print("ci_npm_audit: blocking high/critical advisories remain:", file=sys.stderr)
for item in blocking:
    print(
        f"  - {item['package']}: {item['severity']} {item['ghsa']} — {item['title']}",
        file=sys.stderr,
    )
    if item["url"]:
        print(f"    {item['url']}", file=sys.stderr)
sys.exit(1)
PY
}

# Registry blips (ECONNRESET) fail the audit endpoint even when there are no
# high-severity findings — retry only when the response is not a usable report.
for i in $(seq 1 "$attempts"); do
  set +e
  npm audit --audit-level=high --json >"$report" 2>/dev/null
  status=$?
  set -e

  if is_valid_audit_json; then
    if [[ "$status" -eq 0 ]]; then
      npm audit --audit-level=high
      exit 0
    fi
    # Real findings (or allowlisted-only): print human report, then filter.
    npm audit --audit-level=high || true
    filter_allowed
    exit $?
  fi

  if [[ "$i" -eq "$attempts" ]]; then
    echo "ci_npm_audit: npm audit failed after ${attempts} attempts (no usable JSON)." >&2
    exit 1
  fi
  echo "npm audit failed (attempt ${i}/${attempts}); retrying in $((i * 4))s..."
  sleep $((i * 4))
done
