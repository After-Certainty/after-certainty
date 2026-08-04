#!/usr/bin/env python3
"""Generate chapter audio for one unit (mock by default in CI; real with --real)."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.adapters.elevenlabs import (  # noqa: E402
    ElevenLabsProvider,
    MockElevenLabsProvider,
)
from chapter_audio.env_loader import resolve_secret  # noqa: E402
from chapter_audio.generate import GenerateError, find_resolved_unit, generate_unit  # noqa: E402


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", type=Path, default=Path("."), help="Repository root")
    p.add_argument("--unit", required=True, help="Semantic unit id to generate")
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Plan + budget checks only; no provider call and no writes",
    )
    p.add_argument(
        "--mock",
        action="store_true",
        help="Use offline mock ElevenLabs adapter (no network, no API key)",
    )
    p.add_argument(
        "--real",
        action="store_true",
        help="Call real ElevenLabs API (requires ELEVENLABS_API_KEY in env or .env.local)",
    )
    p.add_argument(
        "--force",
        action="store_true",
        help="Regenerate even when current artifacts match",
    )
    p.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    if args.mock and args.real:
        print("error: pass only one of --mock or --real", file=sys.stderr)
        return 2
    if not args.mock and not args.real and not args.dry_run:
        # Safe default: dry-run when mode omitted (no accidental spend).
        args.dry_run = True
        print(
            "note: neither --mock nor --real given; defaulting to --dry-run",
            file=sys.stderr,
        )

    repo = args.repo.resolve()
    try:
        unit = find_resolved_unit(repo, args.unit.strip())
    except GenerateError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    provider: ElevenLabsProvider | MockElevenLabsProvider
    if args.real and not args.dry_run:
        key = resolve_secret("ELEVENLABS_API_KEY", repo=repo)
        if not key:
            print(
                "error: ELEVENLABS_API_KEY missing "
                "(set in environment or gitignored root .env.local)",
                file=sys.stderr,
            )
            return 1
        if unit.provider != "elevenlabs":
            print(f"error: unit provider is {unit.provider!r}, not elevenlabs", file=sys.stderr)
            return 1
        provider = ElevenLabsProvider(key)
    else:
        provider = MockElevenLabsProvider()

    try:
        result = generate_unit(
            repo,
            unit,
            provider,
            dry_run=bool(args.dry_run),
            force=bool(args.force),
        )
    except GenerateError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    payload = asdict(result)
    if args.format == "json":
        json.dump(payload, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print(f"unit:\t{result.unit_id}")
        print(f"action:\t{result.action}")
        print(f"reason:\t{result.reason}")
        if result.generation_hash:
            print(f"hash:\t{result.generation_hash}")
        if result.audio_path:
            print(f"audio:\t{result.audio_path}")
        if result.receipt_path:
            print(f"receipt:\t{result.receipt_path}")
        if result.alignment_path:
            print(f"alignment:\t{result.alignment_path}")
        if result.estimated_credits is not None:
            print(f"estCredits:\t{result.estimated_credits:g}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
