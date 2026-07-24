#!/usr/bin/env python3
"""Install a same-checkout semantic-manifest.json into apps/site for preview/prod builds.

Phase 4–5 (Stage C/D): write gitignored local artifacts under apps/site/data/
so SEMANTIC_MANIFEST_USE_LOCAL=1 (+ OFFLINE=1) builds consume the checkout’s
generated manifest without overwriting the committed production fallback.

Public release artifacts remain published; Stage D disables runtime remote fetch
via env on the deployment.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path


def _check_deploy_sha(manifest: dict, expected: str | None) -> int:
    if not expected:
        return 0
    actual = manifest.get("sourceCommit")
    if not isinstance(actual, str) or not actual.strip():
        print("error: manifest missing sourceCommit for deploy-SHA check", file=sys.stderr)
        return 1
    if actual.strip() != expected.strip():
        print(
            "error: manifest sourceCommit does not match deploy SHA\n"
            f"  sourceCommit={actual.strip()}\n"
            f"  deploySha={expected.strip()}",
            file=sys.stderr,
        )
        return 1
    print(f"Deploy SHA matches manifest sourceCommit={actual.strip()}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("."),
        help="Monorepo root (default: cwd)",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Local manifest path (default: <repo>/build/semantic-manifest.json)",
    )
    parser.add_argument(
        "--site-data",
        type=Path,
        default=None,
        help="Site data directory (default: <repo>/apps/site/data)",
    )
    parser.add_argument(
        "--require-deploy-sha",
        default=None,
        help="Require manifest sourceCommit to equal this SHA (Vercel: VERCEL_GIT_COMMIT_SHA).",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate only; do not write site data files.",
    )
    args = parser.parse_args(argv)

    repo = args.repo.resolve()
    source = (args.source or (repo / "build" / "semantic-manifest.json")).resolve()
    site_data = (args.site_data or (repo / "apps" / "site" / "data")).resolve()

    if not source.is_file():
        print(
            f"error: local manifest not found: {source}\n"
            "Run: make generate-semantic-manifest  (or npm run corpus:build-manifest)",
            file=sys.stderr,
        )
        return 1

    try:
        manifest = json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"error: invalid JSON in {source}: {exc}", file=sys.stderr)
        return 1

    if not isinstance(manifest, dict):
        print(f"error: {source} must be a JSON object", file=sys.stderr)
        return 1

    schema = manifest.get("schemaVersion")
    if schema != "2.3":
        print(f"error: expected schemaVersion '2.3', got {schema!r}", file=sys.stderr)
        return 1

    if args.require_deploy_sha:
        code = _check_deploy_sha(manifest, args.require_deploy_sha)
        if code != 0:
            return code

    if args.check_only:
        print(f"OK: checked {source}")
        return 0

    site_data.mkdir(parents=True, exist_ok=True)
    dest = site_data / "local-semantic-manifest.json"
    intended_path = site_data / "local-intended-manifest-release.json"

    dest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    intended = {
        "schemaVersion": schema,
        "sourceCommit": manifest.get("sourceCommit"),
        "generatedAt": manifest.get("generatedAt"),
        "contentVersion": manifest.get("contentVersion"),
        "manifestUrl": "local:build/semantic-manifest.json",
        "syncedAt": datetime.now(UTC).isoformat(),
        "source": "local-checkout",
    }
    intended_path.write_text(json.dumps(intended, indent=2) + "\n", encoding="utf-8")

    books = len(manifest.get("books") or [])
    print(f"Installed preview/production manifest → {dest}")
    print(f"Pinned local intended release → {intended_path}")
    print(f"schemaVersion={schema} sourceCommit={intended.get('sourceCommit')} books={books}")
    print("Build with: SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
