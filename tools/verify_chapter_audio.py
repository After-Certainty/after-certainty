#!/usr/bin/env python3
"""
Verify chapter-audio contracts (secret-free): validate artifacts, build available-only
manifest, and schema-validate the manifest.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.site_manifest import write_chapter_audio_manifest  # noqa: E402
from chapter_audio.validate import (  # noqa: E402
    validate_chapter_audio,
    validate_manifest_file,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument(
        "--strict-stale",
        action="store_true",
        help="Treat stale enabled artifacts as errors",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Manifest output path (default: <repo>/build/chapter-audio-manifest.json)",
    )
    args = parser.parse_args(argv)
    repo = args.repo.resolve()

    issues = validate_chapter_audio(repo, strict_stale=bool(args.strict_stale))
    for issue in issues:
        print(f"{issue.level}: {issue.path}: {issue.message}", file=sys.stderr)
    if any(i.level == "error" for i in issues):
        return 1

    dest = write_chapter_audio_manifest(repo, out=args.out.resolve() if args.out else None)
    print(f"Wrote {dest}", file=sys.stderr)
    manifest_issues = validate_manifest_file(repo, dest)
    for issue in manifest_issues:
        print(f"{issue.level}: {issue.path}: {issue.message}", file=sys.stderr)
    if any(i.level == "error" for i in manifest_issues):
        return 1
    print("Verified chapter audio.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
