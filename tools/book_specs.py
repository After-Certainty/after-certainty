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


SPEC_FILE_NAME = "book.yml"
UPCOMING_SPEC_FILE_NAME = "upcoming.yml"
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "book.schema.json"
UPCOMING_SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "upcoming.schema.json"
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
        paths.extend(
            p.resolve() for p in upcoming_root.rglob(name) if ".git" not in p.parts
        )
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


def spec_publish_enabled(spec: dict[str, Any]) -> bool:
    if isinstance(spec.get("upcoming"), dict):
        return False
    publishing = _as_dict(spec.get("publishing"))
    # enabled defaults to true so existing books are publishable by default.
    return publishing.get("enabled", True) is not False


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
    """Published books plus upcoming titles with build.ci enabled."""
    out: list[Path] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        if spec_publish_enabled(spec) and spec_formats(spec):
            out.append(spec_book_dir(spec_path))
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        if spec_ci_enabled(spec) and spec_formats(spec):
            out.append(spec_book_dir(spec_path))
    return sorted(set(out))


def all_books_from_specs(repo: Path) -> list[Path]:
    out = [spec_book_dir(p) for p in discover_book_spec_paths(repo)]
    return sorted(set(out))


def load_spec_for_book_rel(repo: Path, book_rel: str) -> dict[str, Any]:
    return load_spec_for_book_dir((repo / book_rel).resolve())
