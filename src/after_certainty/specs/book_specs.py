#!/usr/bin/env python3
"""
Helpers for loading per-book publishing specs from YAML files.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML is required for book specs. Install with: python3 -m pip install pyyaml"
    ) from exc

try:
    import jsonschema
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "jsonschema is required for book spec validation. Install with: python3 -m pip install jsonschema"
    ) from exc


from after_certainty.core.repo_root import repo_root

SPEC_FILE_NAME = "book.yml"
UPCOMING_SPEC_FILE_NAME = "upcoming.yml"


def _schema_dir() -> Path:
    return repo_root() / "schema"


SCHEMA_PATH = _schema_dir() / "book.schema.json"
UPCOMING_SCHEMA_PATH = _schema_dir() / "upcoming.schema.json"
_SCHEMA_CACHE: dict[str, Any] | None = None
_UPCOMING_SCHEMA_CACHE: dict[str, Any] | None = None


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def resolve_spec_path(book_dir: Path) -> Path | None:
    """Return `book.yml` or `upcoming.yml` under a book directory, if present."""
    book_dir = book_dir.resolve()
    for name in (SPEC_FILE_NAME, UPCOMING_SPEC_FILE_NAME):
        candidate = book_dir / name
        if candidate.is_file():
            return candidate
    return None


def discover_book_spec_paths(repo: Path) -> list[Path]:
    """Only `books/**/book.yml` are publishable; `upcoming/` and other trees are ignored."""
    books_root = (repo / "books").resolve()
    if not books_root.is_dir():
        return []
    paths = [p.resolve() for p in books_root.rglob(SPEC_FILE_NAME) if ".git" not in p.parts]
    return sorted(set(paths))


def discover_upcoming_spec_paths(repo: Path) -> list[Path]:
    """Discover metadata-backed upcoming manuscripts in `upcoming/**/upcoming.yml`."""
    upcoming_root = (repo / "upcoming").resolve()
    if not upcoming_root.is_dir():
        return []
    paths: list[Path] = []
    for name in (UPCOMING_SPEC_FILE_NAME, SPEC_FILE_NAME):
        paths.extend(p.resolve() for p in upcoming_root.rglob(name) if ".git" not in p.parts)
    return sorted(set(paths))


def load_schema() -> dict[str, Any]:
    global _SCHEMA_CACHE
    if _SCHEMA_CACHE is not None:
        return _SCHEMA_CACHE
    import json

    with SCHEMA_PATH.open("r", encoding="utf-8") as f:
        _SCHEMA_CACHE = json.load(f)
    return _SCHEMA_CACHE


def load_upcoming_schema() -> dict[str, Any]:
    global _UPCOMING_SCHEMA_CACHE
    if _UPCOMING_SCHEMA_CACHE is not None:
        return _UPCOMING_SCHEMA_CACHE
    import json

    with UPCOMING_SCHEMA_PATH.open("r", encoding="utf-8") as f:
        _UPCOMING_SCHEMA_CACHE = json.load(f)
    return _UPCOMING_SCHEMA_CACHE


def _validate_poetry_constraints(spec: dict[str, Any], spec_path: Path) -> None:
    book = _as_dict(spec.get("book"))
    kind = str(book.get("kind", "prose")).strip().lower() or "prose"
    if kind != "poetry":
        return

    build = _as_dict(spec.get("build"))
    formats = _as_dict(build.get("formats"))
    for fmt in ("epub", "docx"):
        cfg = _as_dict(formats.get(fmt))
        if cfg.get("enabled", False):
            raise ValueError(
                f"{spec_path}: poetry books support PDF (Typst) only; "
                f"build.formats.{fmt}.enabled must be false"
            )

    pdf_cfg = _as_dict(formats.get("pdf"))
    if pdf_cfg.get("enabled", False):
        engine = str(pdf_cfg.get("pdf_engine", "")).strip().lower()
        if engine != "typst":
            raise ValueError(
                f"{spec_path}: poetry books require build.formats.pdf.pdf_engine: typst"
            )


def spec_ingramspark_target(spec: dict[str, Any]) -> dict[str, Any]:
    publishing = _as_dict(spec.get("publishing"))
    targets = _as_dict(publishing.get("targets"))
    target = targets.get("ingramspark")
    return target if isinstance(target, dict) else {}


def spec_ingramspark_enabled(spec: dict[str, Any]) -> bool:
    """True only when publishing.targets.ingramspark.enabled is explicitly true."""
    return spec_ingramspark_target(spec).get("enabled", False) is True


def spec_ingramspark_github_release(spec: dict[str, Any]) -> bool:
    """True when the derived submission-kit ZIP should attach to GitHub Releases."""
    if not spec_ingramspark_enabled(spec):
        return False
    package = _as_dict(spec_ingramspark_target(spec).get("package"))
    return package.get("github_release", False) is True


def spec_ingramspark_immutable_release(spec: dict[str, Any]) -> bool:
    """True when an immutable production tag should also be published."""
    if not spec_ingramspark_enabled(spec):
        return False
    package = _as_dict(spec_ingramspark_target(spec).get("package"))
    return package.get("immutable_release", False) is True


def spec_ingramspark_production_approved(spec: dict[str, Any]) -> bool:
    return str(spec_ingramspark_target(spec).get("status") or "").strip() == "production-approved"


def ingramspark_artifact_name(book_id: str) -> str:
    """Derived package filename; not configurable in book.yml."""
    stem = str(book_id).strip()
    if not stem:
        raise ValueError("book.id is required to derive IngramSpark artifact name")
    return f"{stem}-ingramspark.zip"


def ingramspark_preview_artifact_name(book_id: str) -> str:
    """Planning cover-preview ZIP (not an IngramSpark submission kit)."""
    stem = str(book_id).strip()
    if not stem:
        raise ValueError("book.id is required to derive IngramSpark preview artifact name")
    return f"{stem}-ingramspark-preview.zip"


def is_ingramspark_release_zip(name: str) -> bool:
    """True for derived submission-kit ZIPs only (not preview or arbitrary .zip files)."""
    return str(name).endswith("-ingramspark.zip")


def _validate_ingramspark_constraints(spec: dict[str, Any], spec_path: Path) -> None:
    """Semantic rules beyond JSON Schema (profile existence, ISBN uniqueness, assets)."""
    target = spec_ingramspark_target(spec)
    if not target:
        return

    enabled = target.get("enabled", False) is True
    profile_id = str(target.get("specification_profile", "")).strip()
    if profile_id:
        from after_certainty.ingramspark.profile import load_profile

        try:
            load_profile(profile_id)
        except (FileNotFoundError, ValueError) as exc:
            raise ValueError(f"{spec_path}: {exc}") from exc

    if not enabled:
        return

    if not profile_id:
        raise ValueError(
            f"{spec_path}: publishing.targets.ingramspark.specification_profile is required "
            f"when enabled is true"
        )

    ebook = _as_dict(target.get("ebook"))
    print_cfg = _as_dict(target.get("print"))
    ebook_on = ebook.get("enabled", False) is True
    print_on = print_cfg.get("enabled", False) is True
    if not ebook_on and not print_on:
        raise ValueError(
            f"{spec_path}: publishing.targets.ingramspark.enabled is true but neither "
            f"ebook.enabled nor print.enabled is true"
        )

    book_dir = spec_path.parent
    if ebook_on:
        cover_source = str(ebook.get("cover_source", "")).strip()
        if cover_source:
            cover_path = (book_dir / cover_source).resolve()
            if not cover_path.is_file():
                raise ValueError(
                    f"{spec_path}: publishing.targets.ingramspark.ebook.cover_source "
                    f"{cover_source!r} does not exist under {book_dir}"
                )

    status = str(target.get("status") or "").strip()
    package = _as_dict(target.get("package"))
    release_packaging = (
        package.get("github_release") is True or package.get("immutable_release") is True
    )
    print_isbn_value = str(print_cfg.get("isbn") or "").strip()

    if print_on and not print_isbn_value:
        if status != "planning":
            raise ValueError(
                f"{spec_path}: publishing.targets.ingramspark.print.isbn is required "
                f"when status is {status!r} (omit only for status: planning cover previews)"
            )
        if release_packaging:
            raise ValueError(
                f"{spec_path}: publishing.targets.ingramspark.print.isbn is required "
                f"when package.github_release or package.immutable_release is true"
            )

    if print_on:
        cover = _as_dict(print_cfg.get("cover"))
        strategy = str(cover.get("strategy") or "").strip()
        if strategy == "supplied-wrap":
            source = str(cover.get("source", "")).strip()
            if source:
                wrap_path = (book_dir / source).resolve()
                if not wrap_path.is_file():
                    raise ValueError(
                        f"{spec_path}: publishing.targets.ingramspark.print.cover.source "
                        f"{source!r} does not exist under {book_dir}"
                    )
        elif strategy == "raster-wrap":
            source = str(cover.get("source", "")).strip()
            if source:
                wrap_path = (book_dir / source).resolve()
                if not wrap_path.is_file():
                    raise ValueError(
                        f"{spec_path}: publishing.targets.ingramspark.print.cover.source "
                        f"{source!r} does not exist under {book_dir}"
                    )
        elif strategy == "assembled-raster-wrap":
            assets = _as_dict(cover.get("assets"))
            for role in ("back", "spine", "front"):
                rel = str(assets.get(role) or "").strip()
                if not rel:
                    continue
                panel = (book_dir / rel).resolve()
                if not panel.is_file():
                    raise ValueError(
                        f"{spec_path}: publishing.targets.ingramspark.print.cover.assets."
                        f"{role} {rel!r} does not exist under {book_dir}"
                    )

    if ebook_on and print_on:
        ebook_isbn = str(ebook.get("isbn", "")).strip()
        if ebook_isbn and print_isbn_value and ebook_isbn == print_isbn_value:
            raise ValueError(
                f"{spec_path}: ebook ISBN and print ISBN must be distinct (both are {ebook_isbn!r})"
            )


def validate_book_spec(spec: dict[str, Any], spec_path: Path) -> None:
    schema = load_schema()
    try:
        jsonschema.validate(instance=spec, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise ValueError(
            f"{spec_path}: schema validation failed at {location}: {exc.message}"
        ) from exc
    _validate_poetry_constraints(spec, spec_path)
    _validate_ingramspark_constraints(spec, spec_path)


def validate_upcoming_spec(spec: dict[str, Any], spec_path: Path) -> None:
    schema = load_upcoming_schema()
    try:
        jsonschema.validate(instance=spec, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise ValueError(
            f"{spec_path}: schema validation failed at {location}: {exc.message}"
        ) from exc
    _validate_poetry_constraints(spec, spec_path)


def load_book_spec(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise ValueError(f"Expected mapping in {path}")
    validate_book_spec(data, path)
    return data


def load_upcoming_spec(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise ValueError(f"Expected mapping in {path}")
    validate_upcoming_spec(data, path)
    return data


def load_any_book_spec(spec_path: Path) -> dict[str, Any]:
    """
    Load and validate `book.yml` or `upcoming.yml` whether it lives under `books/`
    (publishable) or `upcoming/` (metadata-only pipeline), based on the presence of
    an `upcoming` block.
    """
    with spec_path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise ValueError(f"Expected mapping in {spec_path}")
    if isinstance(data.get("upcoming"), dict):
        validate_upcoming_spec(data, spec_path)
        return data
    validate_book_spec(data, spec_path)
    return data


def load_spec_for_book_dir(book_dir: Path) -> dict[str, Any]:
    spec_path = resolve_spec_path(book_dir)
    if spec_path is None:
        raise FileNotFoundError(f"No book.yml or upcoming.yml in {book_dir}")
    return load_any_book_spec(spec_path)


def spec_book_dir(spec_path: Path) -> Path:
    return spec_path.parent.resolve()


def spec_kind(spec: dict[str, Any]) -> str:
    book = _as_dict(spec.get("book"))
    kind = str(book.get("kind", "prose")).strip().lower()
    return kind or "prose"


def spec_pdf_engine(spec: dict[str, Any]) -> str:
    pdf_cfg = spec_format_config(spec, "pdf")
    return str(pdf_cfg.get("pdf_engine", "")).strip().lower()


def spec_typst_config(spec: dict[str, Any]) -> dict[str, Any]:
    build = _as_dict(spec.get("build"))
    typst = build.get("typst")
    return typst if isinstance(typst, dict) else {}


def spec_is_upcoming(spec: dict[str, Any]) -> bool:
    return isinstance(spec.get("upcoming"), dict)


def spec_publish_enabled(spec: dict[str, Any]) -> bool:
    if spec_is_upcoming(spec):
        return False
    publishing = _as_dict(spec.get("publishing"))
    # enabled defaults to true so existing books are publishable by default.
    return publishing.get("enabled", True) is not False


def spec_publication_boundary_validation(spec: dict[str, Any]) -> bool:
    """Opt-in strict checks for internal paths and planning material in exports."""
    publishing = _as_dict(spec.get("publishing"))
    return publishing.get("validate_boundary", False) is True


def spec_ci_enabled(spec: dict[str, Any]) -> bool:
    build = _as_dict(spec.get("build"))
    return build.get("ci", False) is True


def spec_formats(spec: dict[str, Any]) -> list[str]:
    build = _as_dict(spec.get("build"))
    formats = build.get("formats")
    if not isinstance(formats, dict):
        return []
    enabled: list[str] = []
    for name, config in formats.items():
        fmt = str(name).strip().lower()
        if not fmt:
            continue
        if not isinstance(config, dict):
            continue
        if config.get("enabled", False):
            enabled.append(fmt)

    if spec_kind(spec) == "poetry":
        return [fmt for fmt in enabled if fmt == "pdf"]
    return enabled


def spec_in_latest_release(spec: dict[str, Any]) -> bool:
    """Export artifacts attached to the rolling ``latest`` GitHub release."""
    if spec_is_upcoming(spec):
        return False
    return spec_publish_enabled(spec) and bool(spec_formats(spec))


def spec_format_config(spec: dict[str, Any], fmt: str) -> dict[str, Any]:
    build = _as_dict(spec.get("build"))
    formats = _as_dict(build.get("formats"))
    config = formats.get(fmt, {})
    return config if isinstance(config, dict) else {}


def publishable_books(repo: Path) -> list[Path]:
    out: list[Path] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        if spec_publish_enabled(spec):
            out.append(spec_book_dir(spec_path))
    return sorted(set(out))


def ci_export_books(repo: Path) -> list[Path]:
    """Published books plus upcoming titles with at least one export format enabled."""
    out: list[Path] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        if spec_publish_enabled(spec) and spec_formats(spec):
            out.append(spec_book_dir(spec_path))
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        if spec_formats(spec):
            out.append(spec_book_dir(spec_path))
    return sorted(set(out))


def upcoming_export_stems(repo: Path) -> set[str]:
    """Output basenames for upcoming books that CI may build but must not attach to ``latest``."""
    from book_output_stem import stem_for_book_dir

    stems: set[str] = set()
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        if not spec_formats(spec):
            continue
        book_dir = spec_book_dir(spec_path)
        rel = book_dir.relative_to(repo.resolve()).as_posix()
        stems.add(stem_for_book_dir(rel, root=repo.resolve()))
    return stems


def all_books_from_specs(repo: Path) -> list[Path]:
    out = [spec_book_dir(p) for p in discover_book_spec_paths(repo)]
    return sorted(set(out))


def load_spec_for_book_rel(repo: Path, book_rel: str) -> dict[str, Any]:
    return load_spec_for_book_dir((repo / book_rel).resolve())
