#!/usr/bin/env bash
# Publish immutable IngramSpark production tags from a prepared release-staging dir.
#
# Reads staging/ingramspark-release-plan.json (written by the prepare job). Does not
# run general-purpose repository Python. Requires GH_TOKEN / GITHUB_TOKEN.
#
# Usage: publish_ingramspark_immutable_releases.sh <staging-dir>
set -euo pipefail
set +x

staging="${1:-}"
if [[ -z "$staging" || ! -d "$staging" ]]; then
  echo "usage: $0 <staging-dir>" >&2
  exit 2
fi

if [[ -z "${GH_TOKEN:-}${GITHUB_TOKEN:-}" ]]; then
  echo "GH_TOKEN or GITHUB_TOKEN is required" >&2
  exit 1
fi

plan="$staging/ingramspark-release-plan.json"
if [[ ! -f "$plan" ]]; then
  echo "No IngramSpark release plan at $plan; skipping immutable publishes."
  exit 0
fi

count="$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1]))["immutable"]))' "$plan")"
if [[ "$count" -eq 0 ]]; then
  echo "No immutable IngramSpark releases planned."
  exit 0
fi

python3 - "$staging" "$plan" <<'PY'
import json
import os
import subprocess
import sys
from pathlib import Path

staging = Path(sys.argv[1])
plan = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
for item in plan.get("immutable") or []:
    asset = staging / item["asset"]
    tag = item["tag"]
    title = item.get("title") or tag
    if not asset.is_file():
        raise SystemExit(f"Missing immutable asset: {asset}")
    # Delete prior tag/release with the same name if re-publishing the same ISBN tag.
    subprocess.run(
        ["gh", "release", "delete", tag, "--yes", "--cleanup-tag"],
        check=False,
        env=os.environ,
    )
    subprocess.run(
        [
            "gh",
            "release",
            "create",
            tag,
            "--title",
            title,
            "--notes",
            (
                "Immutable IngramSpark submission kit. "
                "This release is retained after the rolling `latest` tag rotates."
            ),
            str(asset),
        ],
        check=True,
        env=os.environ,
    )
    print(f"Published immutable release {tag} with {asset.name}")
PY
