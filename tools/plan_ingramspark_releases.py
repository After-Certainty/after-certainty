#!/usr/bin/env python3
"""
Plan immutable IngramSpark GitHub releases from a staging directory.

Runs in the read-only prepare job. Emits ``ingramspark-release-plan.json`` for the
write-capable publish job (short shell script only).
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import zipfile
from pathlib import Path
from typing import Any

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from book_specs import (  # noqa: E402
    discover_book_spec_paths,
    ingramspark_artifact_name,
    is_ingramspark_release_zip,
    load_book_spec,
    spec_book_dir,
    spec_ingramspark_immutable_release,
    spec_ingramspark_production_approved,
    spec_ingramspark_target,
)


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _git_dirty(repo: Path) -> bool:
    try:
        out = subprocess.check_output(
            ["git", "status", "--porcelain"], cwd=repo.as_posix(), text=True
        )
        return bool(out.strip())
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def book_id_from_zip_name(name: str) -> str | None:
    if not is_ingramspark_release_zip(name):
        return None
    return name[: -len("-ingramspark.zip")]


def immutable_tag_for_spec(spec: dict[str, Any], *, date_stamp: str) -> str:
    book = _as_dict(spec.get("book"))
    book_id = str(book.get("id") or "").strip()
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    ebook = _as_dict(target.get("ebook"))
    isbn = ""
    if print_cfg.get("enabled") is True:
        isbn = str(print_cfg.get("isbn") or "").strip()
    if not isbn and ebook.get("enabled") is True:
        isbn = str(ebook.get("isbn") or "").strip()
    token = isbn or date_stamp
    return f"ingramspark/{book_id}/{token}"


def _manifest_dirty_from_zip(zip_path: Path) -> bool | None:
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            raw = zf.read("package-manifest.json")
    except (KeyError, zipfile.BadZipFile, OSError):
        return None
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    flag = payload.get("dirty_tree")
    return bool(flag) if isinstance(flag, bool) else None


def build_plan(*, repo: Path, staging: Path) -> dict[str, Any]:
    specs_by_id: dict[str, tuple[dict[str, Any], str]] = {}
    for path in discover_book_spec_paths(repo):
        spec = load_book_spec(path)
        book_id = str(_as_dict(spec.get("book")).get("id") or "").strip()
        if book_id:
            book_dir = spec_book_dir(path).relative_to(repo).as_posix()
            specs_by_id[book_id] = (spec, book_dir)

    date_stamp = time.strftime("%Y%m%d", time.gmtime())
    latest_zips: list[str] = []
    immutable: list[dict[str, str]] = []
    errors: list[str] = []
    repo_dirty = _git_dirty(repo)

    for path in sorted(staging.iterdir()):
        if not path.is_file() or not is_ingramspark_release_zip(path.name):
            continue
        latest_zips.append(path.name)
        book_id = book_id_from_zip_name(path.name)
        if not book_id:
            continue
        matched = specs_by_id.get(book_id)
        if matched is None:
            errors.append(f"{path.name}: no matching published book.yml for id {book_id!r}")
            continue
        spec, book_dir = matched
        if not (
            spec_ingramspark_immutable_release(spec) and spec_ingramspark_production_approved(spec)
        ):
            continue
        zip_dirty = _manifest_dirty_from_zip(path)
        if repo_dirty or zip_dirty is True:
            errors.append(
                f"{path.name}: refusing immutable release while the git tree or package "
                f"manifest reports dirty_tree (status is production-approved)"
            )
            continue
        expected = ingramspark_artifact_name(book_id)
        if path.name != expected:
            errors.append(f"{path.name}: expected artifact name {expected}")
            continue
        title = str(_as_dict(spec.get("book")).get("title") or book_id)
        immutable.append(
            {
                "asset": path.name,
                "tag": immutable_tag_for_spec(spec, date_stamp=date_stamp),
                "title": f"IngramSpark production package — {title}",
                "book_id": book_id,
                "book_dir": book_dir,
            }
        )

    return {
        "latest_zips": latest_zips,
        "immutable": immutable,
        "errors": errors,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--staging", required=True, help="Release staging directory")
    parser.add_argument(
        "--out",
        default="",
        help="Output plan JSON (default: <staging>/ingramspark-release-plan.json)",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit non-zero when plan.errors is non-empty",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    staging = Path(args.staging).resolve()
    if not staging.is_dir():
        raise SystemExit(f"Staging directory not found: {staging}")

    plan = build_plan(repo=repo, staging=staging)
    out = (
        Path(args.out).resolve() if args.out.strip() else staging / "ingramspark-release-plan.json"
    )
    out.write_text(json.dumps(plan, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(out.as_posix())
    if plan["errors"]:
        for err in plan["errors"]:
            print(f"error: {err}", file=sys.stderr)
        if args.strict:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
