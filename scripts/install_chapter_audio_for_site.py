#!/usr/bin/env python3
"""Install available chapter audio into apps/site (no semantic-manifest required)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import install_local_manifest_for_site as install  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--site-data", type=Path, default=None)
    parser.add_argument("--site-public", type=Path, default=None)
    args = parser.parse_args(argv)
    repo = args.repo.resolve()
    site_data = (args.site_data or (repo / "apps" / "site" / "data")).resolve()
    site_public = (args.site_public or (repo / "apps" / "site" / "public")).resolve()
    return install._install_chapter_audio(
        repo=repo,
        site_data=site_data,
        site_public=site_public,
        build_manifest_out=repo / "build" / "chapter-audio-manifest.json",
    )


if __name__ == "__main__":
    raise SystemExit(main())
