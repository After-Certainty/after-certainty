#!/usr/bin/env python3
"""
Assemble an IngramSpark submission-kit ZIP.

INGRAM-003 implements ebook-only packaging. Print artifacts are added in later tasks.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import zipfile
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import (  # noqa: E402
    ingramspark_artifact_name,
    load_spec_for_book_dir,
    spec_ingramspark_enabled,
    spec_ingramspark_target,
)
from ingramspark.ebook_cover import EbookCoverError, export_ebook_cover_jpg  # noqa: E402
from ingramspark.ebook_export import EbookExportError, export_ingramspark_epub  # noqa: E402
from ingramspark.ebook_preflight import (  # noqa: E402
    run_ebook_preflight,
    write_ebook_preflight_reports,
)
from ingramspark.paths import (  # noqa: E402
    book_id,
    ebook_isbn,
    ebook_output_dir,
    ingramspark_build_dir,
    package_zip_path,
)
from ingramspark.profile import load_profile  # noqa: E402


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _git_commit(repo: Path) -> str:
    try:
        out = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo.as_posix(), text=True)
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def _git_dirty(repo: Path) -> bool:
    try:
        out = subprocess.check_output(
            ["git", "status", "--porcelain"], cwd=repo.as_posix(), text=True
        )
        return bool(out.strip())
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def _write_readme(
    *,
    spec: dict[str, Any],
    isbn: str,
    profile_id: str,
    warnings: list[str],
) -> str:
    book = _as_dict(spec.get("book"))
    title = str(book.get("title") or "")
    author = _as_dict(book.get("author")).get("name") or ""
    lines = [
        "IngramSpark submission kit (ebook)",
        "=================================",
        "",
        "This ZIP is a submission kit containing separate upload files.",
        "Do not upload the ZIP itself as a single title file.",
        "",
        f"Title: {title}",
        f"Author: {author}",
        f"Ebook ISBN: {isbn}",
        f"Specification profile: {profile_id}",
        "",
        "Ebook upload fields",
        "-------------------",
        f"Interior (EPUB): ebook/{isbn}.epub",
        f"Cover (JPG):     ebook/{isbn}.jpg",
        "",
        "Print upload fields",
        "-------------------",
        "Not included in this ebook-only package.",
        "",
        "Manual checks still required",
        "----------------------------",
        "- Confirm EPUB opens on a reader and metadata matches the cover.",
        "- Confirm the JPG is front-cover-only (no spine/back).",
        "- IngramSpark account ingestion may still reject files that pass local preflight.",
        "",
    ]
    if warnings:
        lines.append("Known warnings from preflight")
        lines.append("-----------------------------")
        lines.extend(f"- {w}" for w in warnings)
        lines.append("")
    return "\n".join(lines)


def _add_zip_file(
    zf: zipfile.ZipFile, arcname: str, data: bytes, date_time: tuple[int, ...]
) -> None:
    info = zipfile.ZipInfo(arcname)
    info.date_time = date_time  # type: ignore[assignment]
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data)


def package_ebook_only(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    pandoc: str = "pandoc",
    skip_epubcheck: bool = False,
    allow_cover_upscale: bool = False,
    skip_build: bool = False,
) -> Path:
    if not spec_ingramspark_enabled(spec):
        raise SystemExit("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    ebook = _as_dict(target.get("ebook"))
    if ebook.get("enabled", False) is not True:
        raise SystemExit(
            "ebook-only packaging requires publishing.targets.ingramspark.ebook.enabled"
        )
    if _as_dict(target.get("print")).get("enabled", False) is True:
        # Full packages come later; refuse mixed mode until print pipeline exists.
        raise SystemExit(
            "print.enabled is true, but print packaging is not implemented yet "
            "(INGRAM-004/005/007). Disable print or wait for the print pipeline."
        )

    profile_id = str(target.get("specification_profile") or "").strip()
    profile = load_profile(profile_id)
    isbn = ebook_isbn(spec)
    build_dir = ingramspark_build_dir(repo, spec)
    ebook_dir = ebook_output_dir(repo, spec)
    build_dir.mkdir(parents=True, exist_ok=True)

    if not skip_build:
        try:
            export_ingramspark_epub(repo=repo, book_dir=book_dir, spec=spec, pandoc=pandoc)
            export_ebook_cover_jpg(
                repo=repo,
                book_dir=book_dir,
                spec=spec,
                allow_upscale=allow_cover_upscale,
            )
        except (EbookExportError, EbookCoverError, ValueError) as exc:
            raise SystemExit(str(exc)) from exc

    report = run_ebook_preflight(repo=repo, spec=spec, skip_epubcheck=skip_epubcheck)
    write_ebook_preflight_reports(report, ebook_dir)
    if not report.ok:
        raise SystemExit(report.human_text())

    epub_path = ebook_dir / f"{isbn}.epub"
    jpg_path = ebook_dir / f"{isbn}.jpg"
    source_commit = _git_commit(repo)
    dirty = _git_dirty(repo)
    build_ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if os.environ.get("SOURCE_DATE_EPOCH"):
        build_ts = time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", time.gmtime(int(os.environ["SOURCE_DATE_EPOCH"]))
        )

    book = _as_dict(spec.get("book"))
    manifest = {
        "book_id": book_id(spec),
        "slug": book_id(spec),
        "title": book.get("title"),
        "subtitle": book.get("subtitle"),
        "author": _as_dict(book.get("author")).get("name"),
        "modes": ["ebook"],
        "isbns": {"ebook": isbn},
        "source_commit": source_commit,
        "dirty_tree": dirty,
        "build_timestamp": build_ts,
        "specification_profile": profile_id,
        "epub_content_version": profile.get("epub_content_version"),
        "epubcheck_tool_version": profile.get("epubcheck_tool_version"),
        "preflight": report.to_dict(),
        "files": {
            f"ebook/{isbn}.epub": {"sha256": _sha256(epub_path)},
            f"ebook/{isbn}.jpg": {"sha256": _sha256(jpg_path)},
        },
        "artifact_name": ingramspark_artifact_name(book_id(spec)),
    }

    warnings = [i.message for i in report.issues if i.severity == "warning"]
    readme = _write_readme(spec=spec, isbn=isbn, profile_id=profile_id, warnings=warnings)
    checksum_lines = [
        f"{manifest['files'][f'ebook/{isbn}.epub']['sha256']}  ebook/{isbn}.epub",
        f"{manifest['files'][f'ebook/{isbn}.jpg']['sha256']}  ebook/{isbn}.jpg",
    ]
    tool_versions = {
        "specification_profile": profile_id,
        "epub_content_version": profile.get("epub_content_version"),
        "epubcheck_tool_version": profile.get("epubcheck_tool_version"),
        **report.tool_versions,
    }
    book_yml_snapshot = (book_dir / "book.yml").read_text(encoding="utf-8")

    meta_dir = build_dir / "metadata"
    meta_dir.mkdir(parents=True, exist_ok=True)
    (meta_dir / "book-yml-snapshot.yml").write_text(book_yml_snapshot, encoding="utf-8")
    (meta_dir / "production-metadata.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (meta_dir / "source-commit.txt").write_text(source_commit + "\n", encoding="utf-8")
    (meta_dir / "tool-versions.json").write_text(
        json.dumps(tool_versions, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (build_dir / "package-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (build_dir / "README-UPLOAD.txt").write_text(readme, encoding="utf-8")
    (build_dir / "checksums.sha256").write_text("\n".join(checksum_lines) + "\n", encoding="utf-8")

    zip_path = package_zip_path(repo, spec)
    # Deterministic-ish timestamps when SOURCE_DATE_EPOCH is set.
    if os.environ.get("SOURCE_DATE_EPOCH"):
        dt = time.gmtime(int(os.environ["SOURCE_DATE_EPOCH"]))
        date_time = (dt.tm_year, dt.tm_mon, dt.tm_mday, dt.tm_hour, dt.tm_min, dt.tm_sec)
    else:
        date_time = time.gmtime()[:6]

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        members: list[tuple[str, bytes]] = [
            ("README-UPLOAD.txt", readme.encode("utf-8")),
            (
                "package-manifest.json",
                json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8") + b"\n",
            ),
            ("checksums.sha256", ("\n".join(checksum_lines) + "\n").encode("utf-8")),
            (f"ebook/{isbn}.epub", epub_path.read_bytes()),
            (f"ebook/{isbn}.jpg", jpg_path.read_bytes()),
            (
                "ebook/preflight.json",
                json.dumps(report.to_dict(), indent=2, sort_keys=True).encode("utf-8") + b"\n",
            ),
            ("metadata/book-yml-snapshot.yml", book_yml_snapshot.encode("utf-8")),
            (
                "metadata/production-metadata.json",
                json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8") + b"\n",
            ),
            ("metadata/source-commit.txt", (source_commit + "\n").encode("utf-8")),
            (
                "metadata/tool-versions.json",
                json.dumps(tool_versions, indent=2, sort_keys=True).encode("utf-8") + b"\n",
            ),
        ]
        for arcname, data in sorted(members, key=lambda item: item[0]):
            _add_zip_file(zf, arcname, data, date_time)

    print(zip_path.as_posix())
    return zip_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--pandoc", default="pandoc")
    parser.add_argument("--ebook-only", action="store_true", help="Package ebook assets only")
    parser.add_argument("--preflight-only", action="store_true")
    parser.add_argument("--skip-epubcheck", action="store_true")
    parser.add_argument(
        "--allow-cover-upscale",
        action="store_true",
        help="Test/fixture only; do not use for production packaging",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Reuse existing ebook outputs under build/ingramspark/",
    )
    args = parser.parse_args()

    if not args.ebook_only and not args.preflight_only:
        # Default to ebook-only until print packaging lands.
        args.ebook_only = True

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)

    if args.preflight_only:
        if not args.skip_build:
            try:
                export_ingramspark_epub(repo=repo, book_dir=book_dir, spec=spec, pandoc=args.pandoc)
                export_ebook_cover_jpg(
                    repo=repo,
                    book_dir=book_dir,
                    spec=spec,
                    allow_upscale=args.allow_cover_upscale,
                )
            except (EbookExportError, EbookCoverError, ValueError) as exc:
                raise SystemExit(str(exc)) from exc
        report = run_ebook_preflight(repo=repo, spec=spec, skip_epubcheck=args.skip_epubcheck)
        json_path, text_path = write_ebook_preflight_reports(report, ebook_output_dir(repo, spec))
        print(text_path.read_text(encoding="utf-8"))
        print(json_path.as_posix())
        raise SystemExit(0 if report.ok else 1)

    package_ebook_only(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        pandoc=args.pandoc,
        skip_epubcheck=args.skip_epubcheck,
        allow_cover_upscale=args.allow_cover_upscale,
        skip_build=args.skip_build,
    )


if __name__ == "__main__":
    main()
