"""Assemble IngramSpark submission-kit ZIP (ebook and/or print)."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import time
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

from book_specs import (
    ingramspark_artifact_name,
    spec_ingramspark_enabled,
    spec_ingramspark_target,
)
from ingramspark.cover_validate import CoverValidateError, validate_print_cover_or_raise
from ingramspark.ebook_cover import EbookCoverError, export_ebook_cover_jpg
from ingramspark.ebook_export import EbookExportError, export_ingramspark_epub
from ingramspark.paths import (
    book_id,
    ebook_isbn,
    ebook_output_dir,
    ingramspark_build_dir,
    package_zip_path,
    print_cover_pdf_path,
    print_interior_pdf_path,
    print_isbn,
    print_output_dir,
    print_page_count_path,
)
from ingramspark.preflight import (
    PreflightError,
    UnifiedPreflightReport,
    run_preflight,
    select_modes,
    write_unified_preflight_reports,
)
from ingramspark.print_export import PrintExportError, export_ingramspark_print_interior
from ingramspark.profile import load_profile

Mode = Literal["ebook", "print"]


class PackageError(ValueError):
    pass


@dataclass(frozen=True)
class PackageResult:
    zip_path: Path
    modes: list[str]
    manifest: dict[str, Any]


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git_commit(repo: Path) -> str:
    try:
        out = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo.as_posix(), text=True)
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def git_dirty(repo: Path) -> bool:
    try:
        out = subprocess.check_output(
            ["git", "status", "--porcelain"], cwd=repo.as_posix(), text=True
        )
        return bool(out.strip())
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def build_timestamp() -> str:
    if os.environ.get("SOURCE_DATE_EPOCH"):
        return time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", time.gmtime(int(os.environ["SOURCE_DATE_EPOCH"]))
        )
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def zip_date_time() -> tuple[int, int, int, int, int, int]:
    if os.environ.get("SOURCE_DATE_EPOCH"):
        dt = time.gmtime(int(os.environ["SOURCE_DATE_EPOCH"]))
        return (dt.tm_year, dt.tm_mon, dt.tm_mday, dt.tm_hour, dt.tm_min, dt.tm_sec)
    return time.gmtime()[:6]


def _add_zip_file(
    zf: zipfile.ZipFile, arcname: str, data: bytes, date_time: tuple[int, ...]
) -> None:
    info = zipfile.ZipInfo(arcname)
    info.date_time = date_time  # type: ignore[assignment]
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data)


def write_readme_upload(
    *,
    spec: dict[str, Any],
    profile_id: str,
    modes: list[str],
    warnings: list[str],
    manual_review: list[str],
    print_meta: dict[str, Any] | None,
) -> str:
    book = _as_dict(spec.get("book"))
    target = spec_ingramspark_target(spec)
    ebook = _as_dict(target.get("ebook"))
    print_cfg = _as_dict(target.get("print"))
    title = str(book.get("title") or "")
    author = _as_dict(book.get("author")).get("name") or ""
    mode_label = "+".join(modes) if modes else "empty"
    lines = [
        f"IngramSpark submission kit ({mode_label})",
        "=" * (28 + len(mode_label)),
        "",
        "This ZIP is a submission kit containing separate upload files.",
        "Do not upload the ZIP itself as a single title file.",
        "",
        f"Title: {title}",
        f"Author: {author}",
        f"Specification profile: {profile_id}",
        f"Modes: {', '.join(modes)}",
        "",
    ]

    if "ebook" in modes:
        e_isbn = str(ebook.get("isbn") or "").strip()
        lines.extend(
            [
                "Ebook upload fields",
                "-------------------",
                f"Ebook ISBN:      {e_isbn}",
                f"Interior (EPUB): ebook/{e_isbn}.epub",
                f"Cover (JPG):     ebook/{e_isbn}.jpg",
                "",
            ]
        )
    else:
        lines.extend(
            [
                "Ebook upload fields",
                "-------------------",
                "Not included in this package.",
                "",
            ]
        )

    if "print" in modes:
        p_isbn = str(print_cfg.get("isbn") or "").strip()
        trim = _as_dict(print_cfg.get("trim"))
        interior = _as_dict(print_cfg.get("interior"))
        cover = _as_dict(print_cfg.get("cover"))
        page_count = (print_meta or {}).get("page_count")
        lines.extend(
            [
                "Print upload fields",
                "-------------------",
                f"Print ISBN:         {p_isbn}",
                f"Interior (PDF):     print/{p_isbn}_txt.pdf",
                f"Cover wrap (PDF):   print/{p_isbn}_cvr.pdf",
                f"Edition:            {print_cfg.get('edition')}",
                f"Binding:            {print_cfg.get('binding')}",
                f"Trim (inches):      {trim.get('width_inches')}x{trim.get('height_inches')}",
                f"Paper:              {interior.get('paper')}",
                f"Interior color:     {interior.get('color_mode')}",
                f"Bleed:              {interior.get('bleed')}",
                f"Barcode mode:       {cover.get('barcode_mode')}",
                f"Template pages:     {cover.get('template_page_count')}",
                f"Interior pages:     {page_count}",
                "",
            ]
        )
    else:
        lines.extend(
            [
                "Print upload fields",
                "-------------------",
                "Not included in this package.",
                "",
            ]
        )

    lines.extend(
        [
            "Manual checks still required",
            "----------------------------",
        ]
    )
    if manual_review:
        lines.extend(f"- {item}" for item in manual_review)
    else:
        lines.append("- IngramSpark account ingestion may still reject locally passing files.")
    lines.append("")

    if warnings:
        lines.append("Known warnings from preflight")
        lines.append("-----------------------------")
        lines.extend(f"- {w}" for w in warnings)
        lines.append("")

    return "\n".join(lines)


def _build_exports(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    modes: list[str],
    pandoc: str,
    pdf_engine: str,
    allow_cover_upscale: bool,
) -> None:
    try:
        if "ebook" in modes:
            export_ingramspark_epub(repo=repo, book_dir=book_dir, spec=spec, pandoc=pandoc)
            export_ebook_cover_jpg(
                repo=repo,
                book_dir=book_dir,
                spec=spec,
                allow_upscale=allow_cover_upscale,
            )
        if "print" in modes:
            export_ingramspark_print_interior(
                repo=repo,
                book_dir=book_dir,
                spec=spec,
                pandoc=pandoc,
                pdf_engine=pdf_engine,
            )
            validate_print_cover_or_raise(repo=repo, book_dir=book_dir, spec=spec, stage=True)
    except (
        EbookExportError,
        EbookCoverError,
        PrintExportError,
        CoverValidateError,
        ValueError,
        FileNotFoundError,
    ) as exc:
        raise PackageError(str(exc)) from exc


def _read_print_page_count(repo: Path, spec: dict[str, Any]) -> dict[str, Any] | None:
    path = print_page_count_path(repo, spec)
    if not path.is_file():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def _collect_files(
    *,
    repo: Path,
    spec: dict[str, Any],
    modes: list[str],
    preflight: UnifiedPreflightReport,
) -> dict[str, Path]:
    files: dict[str, Path] = {}
    if "ebook" in modes:
        e_isbn = ebook_isbn(spec)
        ebook_dir = ebook_output_dir(repo, spec)
        files[f"ebook/{e_isbn}.epub"] = ebook_dir / f"{e_isbn}.epub"
        files[f"ebook/{e_isbn}.jpg"] = ebook_dir / f"{e_isbn}.jpg"
        files["ebook/preflight.json"] = ebook_dir / "preflight.json"
    if "print" in modes:
        p_isbn = print_isbn(spec)
        files[f"print/{p_isbn}_txt.pdf"] = print_interior_pdf_path(repo, spec)
        files[f"print/{p_isbn}_cvr.pdf"] = print_cover_pdf_path(repo, spec)
        files["print/preflight.json"] = print_output_dir(repo, spec) / "preflight.json"
    for arcname, path in files.items():
        if not path.is_file():
            raise PackageError(f"Missing package member {arcname}: {path}")
    # Root preflight report is written by write_unified_preflight_reports.
    build_dir = ingramspark_build_dir(repo, spec)
    root_preflight = build_dir / "preflight.json"
    if root_preflight.is_file():
        files["preflight.json"] = root_preflight
    elif preflight is not None:
        # Ensure it exists for packaging.
        write_unified_preflight_reports(preflight, repo=repo, spec=spec)
        files["preflight.json"] = build_dir / "preflight.json"
    return files


def build_package_manifest(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    modes: list[str],
    profile: dict[str, Any],
    preflight: UnifiedPreflightReport,
    files: dict[str, Path],
) -> dict[str, Any]:
    book = _as_dict(spec.get("book"))
    target = spec_ingramspark_target(spec)
    ebook = _as_dict(target.get("ebook"))
    print_cfg = _as_dict(target.get("print"))
    cover = _as_dict(print_cfg.get("cover"))
    interior = _as_dict(print_cfg.get("interior"))
    trim = _as_dict(print_cfg.get("trim"))
    print_meta = _read_print_page_count(repo, spec) if "print" in modes else None

    isbns: dict[str, str] = {}
    if "ebook" in modes:
        isbns["ebook"] = ebook_isbn(spec)
    if "print" in modes:
        isbns["print"] = print_isbn(spec)

    file_hashes = {
        arcname: {"sha256": sha256_file(path)}
        for arcname, path in sorted(files.items())
        if not arcname.endswith("preflight.json") and arcname != "preflight.json"
    }

    manifest: dict[str, Any] = {
        "book_id": book_id(spec),
        "slug": book_id(spec),
        "title": book.get("title"),
        "subtitle": book.get("subtitle"),
        "author": _as_dict(book.get("author")).get("name"),
        "edition": print_cfg.get("edition") if "print" in modes else None,
        "modes": list(modes),
        "isbns": isbns,
        "source_commit": git_commit(repo),
        "dirty_tree": git_dirty(repo),
        "build_timestamp": build_timestamp(),
        "specification_profile": preflight.specification_profile,
        "epub_content_version": profile.get("epub_content_version"),
        "epubcheck_tool_version": profile.get("epubcheck_tool_version"),
        "tool_versions": preflight.tool_versions,
        "preflight": preflight.to_dict(),
        "human_review": preflight.manual_review,
        "files": file_hashes,
        "artifact_name": ingramspark_artifact_name(book_id(spec)),
        "book_dir": book_dir.relative_to(repo).as_posix()
        if book_dir.is_relative_to(repo)
        else book_dir.as_posix(),
    }
    if "print" in modes:
        manifest["print"] = {
            "binding": print_cfg.get("binding"),
            "trim_inches": {
                "width": trim.get("width_inches"),
                "height": trim.get("height_inches"),
            },
            "paper": interior.get("paper"),
            "color_mode": interior.get("color_mode"),
            "bleed": interior.get("bleed"),
            "barcode_mode": cover.get("barcode_mode"),
            "template_page_count": cover.get("template_page_count"),
            "interior_page_count": (print_meta or {}).get("page_count"),
        }
    if "ebook" in modes:
        manifest["ebook"] = {
            "format": ebook.get("format"),
            "isbn": isbns.get("ebook"),
        }
    return manifest


def package_ingramspark(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    ebook_only: bool = False,
    print_only: bool = False,
    pandoc: str = "pandoc",
    pdf_engine: str = "xelatex",
    skip_epubcheck: bool = False,
    allow_cover_upscale: bool = False,
    skip_build: bool = False,
) -> PackageResult:
    """
    Build ``{book.id}-ingramspark.zip`` for enabled modes.

    ``--ebook-only`` / ``--print-only`` restrict modes; otherwise package whatever
    ``book.yml`` enables. Ebook-only ZIPs omit ``print/``; print-only omits ``ebook/``.
    """
    if not spec_ingramspark_enabled(spec):
        raise PackageError("publishing.targets.ingramspark.enabled must be true")

    try:
        modes = select_modes(spec, ebook_only=ebook_only, print_only=print_only)
    except PreflightError as exc:
        raise PackageError(str(exc)) from exc

    target = spec_ingramspark_target(spec)
    profile_id = str(target.get("specification_profile") or "").strip()
    profile = load_profile(profile_id)
    build_dir = ingramspark_build_dir(repo, spec)
    build_dir.mkdir(parents=True, exist_ok=True)

    if not skip_build:
        _build_exports(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            modes=modes,
            pandoc=pandoc,
            pdf_engine=pdf_engine,
            allow_cover_upscale=allow_cover_upscale,
        )
    elif "print" in modes:
        # Staging cover is required even when reusing an existing interior.
        try:
            validate_print_cover_or_raise(repo=repo, book_dir=book_dir, spec=spec, stage=True)
        except CoverValidateError as exc:
            raise PackageError(str(exc)) from exc

    try:
        preflight = run_preflight(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            ebook_only=ebook_only,
            print_only=print_only,
            skip_epubcheck=skip_epubcheck,
        )
    except PreflightError as exc:
        raise PackageError(str(exc)) from exc

    write_unified_preflight_reports(preflight, repo=repo, spec=spec)
    if not preflight.ok:
        raise PackageError(preflight.human_text())

    files = _collect_files(repo=repo, spec=spec, modes=modes, preflight=preflight)
    print_meta = _read_print_page_count(repo, spec) if "print" in modes else None
    manifest = build_package_manifest(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        modes=modes,
        profile=profile,
        preflight=preflight,
        files=files,
    )

    warnings = [i.message for i in preflight.issues if i.severity == "warning"]
    readme = write_readme_upload(
        spec=spec,
        profile_id=profile_id,
        modes=modes,
        warnings=warnings,
        manual_review=preflight.manual_review,
        print_meta=print_meta,
    )

    checksum_lines = [
        f"{meta['sha256']}  {arcname}" for arcname, meta in sorted(manifest["files"].items())
    ]
    tool_versions = {
        "specification_profile": profile_id,
        "epub_content_version": profile.get("epub_content_version"),
        "epubcheck_tool_version": profile.get("epubcheck_tool_version"),
        **preflight.tool_versions,
    }
    book_yml_snapshot = (book_dir / "book.yml").read_text(encoding="utf-8")

    meta_dir = build_dir / "metadata"
    meta_dir.mkdir(parents=True, exist_ok=True)
    (meta_dir / "book-yml-snapshot.yml").write_text(book_yml_snapshot, encoding="utf-8")
    (meta_dir / "production-metadata.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (meta_dir / "source-commit.txt").write_text(manifest["source_commit"] + "\n", encoding="utf-8")
    (meta_dir / "tool-versions.json").write_text(
        json.dumps(tool_versions, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (build_dir / "package-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (build_dir / "README-UPLOAD.txt").write_text(readme, encoding="utf-8")
    (build_dir / "checksums.sha256").write_text("\n".join(checksum_lines) + "\n", encoding="utf-8")

    date_time = zip_date_time()
    zip_path = package_zip_path(repo, spec)
    members: list[tuple[str, bytes]] = [
        ("README-UPLOAD.txt", readme.encode("utf-8")),
        (
            "package-manifest.json",
            json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8") + b"\n",
        ),
        ("checksums.sha256", ("\n".join(checksum_lines) + "\n").encode("utf-8")),
        ("metadata/book-yml-snapshot.yml", book_yml_snapshot.encode("utf-8")),
        (
            "metadata/production-metadata.json",
            json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8") + b"\n",
        ),
        ("metadata/source-commit.txt", (manifest["source_commit"] + "\n").encode("utf-8")),
        (
            "metadata/tool-versions.json",
            json.dumps(tool_versions, indent=2, sort_keys=True).encode("utf-8") + b"\n",
        ),
    ]
    for arcname, path in sorted(files.items()):
        members.append((arcname, path.read_bytes()))

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for arcname, data in sorted(members, key=lambda item: item[0]):
            _add_zip_file(zf, arcname, data, date_time)

    return PackageResult(zip_path=zip_path, modes=list(modes), manifest=manifest)


def verify_checksums_file(checksums_path: Path, *, root: Path) -> list[str]:
    """Return list of mismatch messages; empty means all listed files match."""
    errors: list[str] = []
    for line in checksums_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        digest, _, rel = line.partition("  ")
        if not rel:
            errors.append(f"Malformed checksum line: {line!r}")
            continue
        path = root / rel
        if not path.is_file():
            errors.append(f"Missing file for checksum: {rel}")
            continue
        actual = sha256_file(path)
        if actual != digest:
            errors.append(f"Checksum mismatch for {rel}")
    return errors
