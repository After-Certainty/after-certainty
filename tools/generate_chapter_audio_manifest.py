#!/usr/bin/env python3
"""Generate build/chapter-audio-manifest.json (available units only; secret-free)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.site_manifest import (  # noqa: E402
    build_chapter_audio_manifest,
    write_chapter_audio_manifest,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output path (default: <repo>/build/chapter-audio-manifest.json)",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print JSON to stdout instead of writing a file",
    )
    args = parser.parse_args(argv)
    repo = args.repo.resolve()
    if args.stdout:
        payload = build_chapter_audio_manifest(repo)
        print(json.dumps(payload, indent=2))
        return 0
    dest = write_chapter_audio_manifest(repo, out=args.out.resolve() if args.out else None)
    count = len(json.loads(dest.read_text(encoding="utf-8")).get("units") or [])
    print(f"Wrote {dest} ({count} available unit(s))", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
