#!/usr/bin/env python3
"""Validate chapter-audio voice catalog and present artifacts (secret-free, no network)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.validate import validate_chapter_audio  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument(
        "--strict-stale",
        action="store_true",
        help="Treat stale enabled artifacts as errors (default: warnings only)",
    )
    args = parser.parse_args(argv)
    repo = args.repo.resolve()
    issues = validate_chapter_audio(repo, strict_stale=bool(args.strict_stale))
    errors = [i for i in issues if i.level == "error"]
    warnings = [i for i in issues if i.level == "warning"]
    for issue in issues:
        print(f"{issue.level}: {issue.path}: {issue.message}", file=sys.stderr)
    if not issues:
        print("Validated chapter audio (no issues).", file=sys.stderr)
    else:
        print(
            f"Chapter audio validation: {len(errors)} error(s), {len(warnings)} warning(s).",
            file=sys.stderr,
        )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
