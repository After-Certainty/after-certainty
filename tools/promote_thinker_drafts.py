#!/usr/bin/env python3
"""
Promote derived thinker drafts into canonical semantic/thinkers/*.yml.

Reads drafts from semantic/_drafts/generated/thinkers/ (from derive_thinker_drafts.py)
and optional editorial overrides (summary, whyThisMatters) from a YAML file.

Typical workflow::

    make derive-thinker-drafts
    # edit semantic/thinkers-pilot-overrides.yml or pass --overrides
    python3 tools/promote_thinker_drafts.py --repo . --slug hannah-arendt --slug karl-e-weick
    make verify-semantic-ontology
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

DEFAULT_DRAFT_ROOT = Path("semantic/_drafts/generated/thinkers")
DEFAULT_DEST = Path("semantic/thinkers")
DEFAULT_OVERRIDES = Path("semantic/thinkers-pilot-overrides.yml")


def _load_overrides(path: Path) -> dict[str, dict]:
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return {}
    thinkers = raw.get("thinkers")
    if not isinstance(thinkers, dict):
        return {}
    return {str(k).strip(): v for k, v in thinkers.items() if isinstance(v, dict)}


def _apply_overrides(rec: dict, overrides: dict) -> dict:
    extra = overrides.get(str(rec.get("slug", "")).strip(), {})
    if not extra:
        return rec
    out = dict(rec)
    for key in ("summary", "whyThisMatters", "type", "name"):
        if key in extra and str(extra[key]).strip():
            out[key] = str(extra[key]).strip()
    return out


def _dump_record(rec: dict) -> str:
    return (
        yaml.safe_dump(
            rec,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        ).rstrip()
        + "\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--draft-root",
        default=str(DEFAULT_DRAFT_ROOT),
        help="Directory of derived thinker draft YAML",
    )
    parser.add_argument(
        "--dest",
        default=str(DEFAULT_DEST),
        help="Canonical semantic thinkers directory",
    )
    parser.add_argument(
        "--overrides",
        default=str(DEFAULT_OVERRIDES),
        help="YAML file with per-slug summary/whyThisMatters overrides",
    )
    parser.add_argument(
        "--slug",
        action="append",
        default=[],
        metavar="SLUG",
        help="Promote only this thinker slug (repeatable). Default: all drafts.",
    )
    parser.add_argument(
        "--pilot-only",
        action="store_true",
        help="Promote only slugs listed in the overrides file (semantic/thinkers-pilot-overrides.yml).",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    draft_root = (repo / args.draft_root).resolve()
    dest = (repo / args.dest).resolve()
    overrides_path = (repo / args.overrides).resolve()
    overrides = _load_overrides(overrides_path)

    if args.pilot_only and not overrides:
        raise SystemExit(f"No thinkers in overrides file: {overrides_path}")

    if not draft_root.is_dir():
        raise SystemExit(
            f"Missing draft directory: {draft_root} (run derive_thinker_drafts.py first)"
        )

    slugs = sorted(p.stem for p in draft_root.glob("*.yml"))
    if args.pilot_only:
        wanted = sorted(overrides.keys())
        slugs = wanted
        missing = set(wanted) - {p.stem for p in draft_root.glob("*.yml")}
        if missing:
            raise SystemExit(f"Draft(s) not found: {', '.join(sorted(missing))}")
    elif args.slug:
        wanted = {s.strip() for s in args.slug if s.strip()}
        slugs = [s for s in slugs if s in wanted]
        missing = wanted - set(slugs)
        if missing:
            raise SystemExit(f"Draft(s) not found: {', '.join(sorted(missing))}")

    if not slugs:
        raise SystemExit("No thinker drafts to promote.")

    dest.mkdir(parents=True, exist_ok=True)
    promoted = 0
    for slug in slugs:
        draft_path = draft_root / f"{slug}.yml"
        raw = yaml.safe_load(draft_path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        rec = _apply_overrides(raw, overrides)
        summary = str(rec.get("summary", "")).strip()
        if summary.startswith("Thinker draft aggregated from"):
            print(f"Warning: {slug} still has placeholder summary", file=sys.stderr)
        out_path = dest / f"{slug}.yml"
        if args.dry_run:
            print(f"would write {out_path}")
            promoted += 1
            continue
        out_path.write_text(_dump_record(rec), encoding="utf-8")
        promoted += 1

    action = "Would promote" if args.dry_run else "Promoted"
    print(f"{action} {promoted} thinker file(s) under {dest}/", file=sys.stderr)


if __name__ == "__main__":
    main()
