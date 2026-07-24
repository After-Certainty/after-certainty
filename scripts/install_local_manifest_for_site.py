#!/usr/bin/env python3
"""Install a same-checkout semantic-manifest.json into apps/site for preview builds.

Phase 4 (Stage C): write gitignored local preview artifacts under apps/site/data/
so SEMANTIC_MANIFEST_USE_LOCAL=1 + SEMANTIC_MANIFEST_OFFLINE=1 builds consume the
checkout’s generated manifest without overwriting the committed production fallback.

Production on after-certainty-site remains remote until Phase 5.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path


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
    print(f"Installed preview manifest → {dest}")
    print(f"Pinned local intended release → {intended_path}")
    print(f"schemaVersion={schema} sourceCommit={intended.get('sourceCommit')} books={books}")
    print("Build with: SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
