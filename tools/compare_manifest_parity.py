#!/usr/bin/env python3
"""Compare a locally generated semantic-manifest.json to the public release asset.

Phase 3 (Stage B) of the monorepo migration: production still serves the remote
manifest; this report proves the same-checkout generator stays compatible and
does not regress public entity coverage.

Exit codes:
  0 — compatible (schema matches; required collections present; counts >= floor)
  1 — incompatible or missing inputs
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

DEFAULT_REMOTE_URL = (
    "https://github.com/ksteffe/after-certainty/releases/download/latest/semantic-manifest.json"
)

COLLECTIONS = (
    "books",
    "glossary",
    "patterns",
    "situations",
    "sources",
    "relationships",
    "thinkers",
    "works",
    "editions",
    "questions",
    "trails",
    "shelves",
    "changeEvents",
    "searchAliases",
    "parts",
    "chapters",
)

# Stable public entities used by site smoke URLs / Phase 0 contract tests.
REQUIRED_BOOK_SLUGS = (
    "after-certainty",
    "boundary-conditions",
    "observer-patterns",
    "how-meaning-moves",
)
REQUIRED_IDS = {
    "questions": ("trust-survives-disagreement",),
    "trails": ("judgment-before-certainty",),
}


def _load_json(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"{path}: expected JSON object")
    return data


def _fetch_json(url: str, timeout: float = 120.0) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310 — trusted release URL
        data = json.load(resp)
    if not isinstance(data, dict):
        raise ValueError(f"{url}: expected JSON object")
    return data


def _is_author_facing_chapter(row: Any) -> bool:
    """Design-handbook paths under docs/ are not reader chapters.

    Older release manifests may still list them if index.md once linked docs.
    Exclude them from chapter count floors so cleaning the TOC is not a
    false Stage B regression.
    """
    if not isinstance(row, dict):
        return False
    source = str(row.get("sourcePath") or "").replace("\\", "/").lstrip("./")
    return source == "docs" or source.startswith("docs/")


def _collection_count(manifest: dict[str, Any], key: str) -> int:
    rows = list(manifest.get(key) or [])
    if key != "chapters":
        return len(rows)
    return sum(1 for row in rows if not _is_author_facing_chapter(row))


REQUIRED_LOCAL_SCHEMA_VERSION = "2.4"


def _parse_schema_version(value: Any) -> tuple[int, int] | None:
    """Parse additive ``major.minor`` schemaVersion strings."""
    if not isinstance(value, str) or not value.strip():
        return None
    parts = value.strip().split(".")
    if len(parts) < 2:
        return None
    try:
        major = int(parts[0])
        minor = int(parts[1])
    except ValueError:
        return None
    return major, minor


def _identity(manifest: dict[str, Any]) -> dict[str, Any]:
    return {
        "manifestVersion": manifest.get("manifestVersion"),
        "schemaVersion": manifest.get("schemaVersion"),
        "generatedAt": manifest.get("generatedAt"),
        "sourceCommit": manifest.get("sourceCommit"),
        "repository": manifest.get("repository"),
        "ref": manifest.get("ref"),
        "releaseTag": manifest.get("releaseTag"),
        "counts": {key: _collection_count(manifest, key) for key in COLLECTIONS},
    }


def _slugs(rows: list[Any], *keys: str) -> set[str]:
    out: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            continue
        for key in keys:
            val = row.get(key)
            if isinstance(val, str) and val:
                out.add(val)
                break
    return out


def compare(local: dict[str, Any], remote: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Return (report_dict, error_messages)."""
    errors: list[str] = []
    local_id = _identity(local)
    remote_id = _identity(remote)

    local_schema = local_id["schemaVersion"]
    remote_schema = remote_id["schemaVersion"]
    if local_schema != REQUIRED_LOCAL_SCHEMA_VERSION:
        errors.append(
            f"local schemaVersion must be {REQUIRED_LOCAL_SCHEMA_VERSION!r}, got {local_schema!r}"
        )

    local_parsed = _parse_schema_version(local_schema)
    remote_parsed = _parse_schema_version(remote_schema)
    if local_parsed is None:
        errors.append(f"local schemaVersion is not parseable: {local_schema!r}")
    elif remote_parsed is None:
        errors.append(f"remote schemaVersion is not parseable: {remote_schema!r}")
    elif local_parsed[0] != remote_parsed[0]:
        errors.append(
            f"schemaVersion major mismatch: local={local_schema!r} remote={remote_schema!r}"
        )
    elif local_parsed < remote_parsed:
        # Local must not lag a newer published release contract.
        errors.append(
            f"schemaVersion regression: local={local_schema!r} < remote={remote_schema!r}"
        )
    # local > remote is allowed: additive bumps land in PRs before the release asset updates.

    count_deltas: dict[str, dict[str, int]] = {}
    for key in COLLECTIONS:
        local_n = int(local_id["counts"][key])
        remote_n = int(remote_id["counts"][key])
        count_deltas[key] = {
            "local": local_n,
            "remote": remote_n,
            "delta": local_n - remote_n,
        }
        if local_n < remote_n:
            errors.append(f"count regression for {key}: local={local_n} < remote={remote_n}")
        if local_n < 1:
            errors.append(f"local collection empty: {key}")

    book_slugs = _slugs(list(local.get("books") or []), "slug", "id")
    for slug in REQUIRED_BOOK_SLUGS:
        if slug not in book_slugs:
            errors.append(f"local manifest missing required book slug: {slug}")

    for collection, ids in REQUIRED_IDS.items():
        present = _slugs(list(local.get(collection) or []), "id", "slug")
        for entity_id in ids:
            if entity_id not in present:
                errors.append(f"local manifest missing {collection} id: {entity_id}")

    # Content-type representatives (fiction / poetry / nonfiction).
    by_slug = {
        str(b.get("slug")): b
        for b in (local.get("books") or [])
        if isinstance(b, dict) and b.get("slug")
    }
    if by_slug.get("boundary-conditions", {}).get("contentType") != "fiction":
        errors.append("boundary-conditions contentType must be fiction")
    if by_slug.get("observer-patterns", {}).get("contentType") != "poetry":
        errors.append("observer-patterns contentType must be poetry")

    report = {
        "generatedAt": datetime.now(UTC).isoformat(),
        "compatible": not errors,
        "errors": errors,
        "notes": [
            "sourceCommit and generatedAt are expected to differ while production "
            "still serves the remote release artifact (Stage B).",
            "Count floors use the live remote release; local must not shrink below remote.",
            "Chapter floors exclude author-facing docs/ sourcePath entries "
            "(design handbook / outline), which are not reader chapters.",
            "Additive schemaVersion bumps are allowed when local is ahead of remote "
            f"within the same major (local must be {REQUIRED_LOCAL_SCHEMA_VERSION}).",
        ],
        "local": local_id,
        "remote": remote_id,
        "countDeltas": count_deltas,
        "sourceCommitDiffer": local_id.get("sourceCommit") != remote_id.get("sourceCommit"),
    }
    return report, errors


def _write_markdown(report: dict[str, Any], path: Path) -> None:
    lines = [
        "# Semantic manifest parity report",
        "",
        f"Generated: `{report['generatedAt']}`",
        "",
        f"**Compatible:** {'yes' if report['compatible'] else 'NO'}",
        "",
        "## Identity",
        "",
        "| Field | Local | Remote |",
        "|-------|-------|--------|",
    ]
    for field in (
        "schemaVersion",
        "manifestVersion",
        "sourceCommit",
        "generatedAt",
        "repository",
        "ref",
        "releaseTag",
    ):
        local_v = (report.get("local") or {}).get(field)
        remote_v = (report.get("remote") or {}).get(field)
        lines.append(f"| `{field}` | `{local_v}` | `{remote_v}` |")

    lines.extend(
        [
            "",
            "## Collection counts",
            "",
            "| Collection | Local | Remote | Δ |",
            "|------------|------:|-------:|---:|",
        ]
    )
    for key, row in (report.get("countDeltas") or {}).items():
        lines.append(f"| `{key}` | {row['local']} | {row['remote']} | {row['delta']:+d} |")

    if report.get("errors"):
        lines.extend(["", "## Errors", ""])
        for err in report["errors"]:
            lines.append(f"- {err}")
    else:
        lines.extend(["", "## Errors", "", "_None_", ""])

    if report.get("notes"):
        lines.extend(["", "## Notes", ""])
        for note in report["notes"]:
            lines.append(f"- {note}")
        lines.append("")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--local",
        type=Path,
        default=Path("build/semantic-manifest.json"),
        help="Path to locally generated manifest",
    )
    parser.add_argument(
        "--remote-url",
        default=DEFAULT_REMOTE_URL,
        help="Public release manifest URL",
    )
    parser.add_argument(
        "--remote-file",
        type=Path,
        default=None,
        help="Optional local copy of the remote manifest (skips network)",
    )
    parser.add_argument(
        "--json-out",
        type=Path,
        default=Path("reports/manifest-parity.json"),
    )
    parser.add_argument(
        "--md-out",
        type=Path,
        default=Path("reports/manifest-parity.md"),
    )
    args = parser.parse_args(argv)

    if not args.local.is_file():
        print(f"error: local manifest not found: {args.local}", file=sys.stderr)
        return 1

    try:
        local = _load_json(args.local)
        if args.remote_file is not None:
            remote = _load_json(args.remote_file)
        else:
            remote = _fetch_json(args.remote_url)
    except (OSError, ValueError, json.JSONDecodeError, urllib.error.URLError) as exc:
        print(f"error: failed to load manifests: {exc}", file=sys.stderr)
        return 1

    report, errors = compare(local, remote)
    report["remoteUrl"] = None if args.remote_file else args.remote_url
    report["remoteFile"] = str(args.remote_file) if args.remote_file else None
    report["localPath"] = str(args.local)

    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    _write_markdown(report, args.md_out)

    print(f"Wrote {args.json_out}")
    print(f"Wrote {args.md_out}")
    if errors:
        print(f"INCOMPATIBLE: {len(errors)} error(s)", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1
    print("Compatible with remote release (Stage B parity).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
