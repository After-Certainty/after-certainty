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
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "book.schema.json"
UPCOMING_SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "upcoming.schema.json"
_SCHEMA_CACHE: dict[str, Any] | None = None
_UPCOMING_SCHEMA_CACHE: dict[str, Any] | None = None


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def discover_book_spec_paths(repo: Path) -> list[Path]:
    """Only `books/**/book.yml` are publishable; `upcoming/` and other trees are ignored."""
    books_root = (repo / "books").resolve()
    if not books_root.is_dir():
        return []
    paths = [
        p.resolve()
        for p in books_root.rglob(SPEC_FILE_NAME)
        if ".git" not in p.parts
    ]
    return sorted(set(paths))


def discover_upcoming_spec_paths(repo: Path) -> list[Path]:
    """Discover metadata-backed upcoming manuscripts in `upcoming/**/book.yml`."""
    upcoming_root = (repo / "upcoming").resolve()
    if not upcoming_root.is_dir():
        return []
    paths = [
        p.resolve()
        for p in upcoming_root.rglob(SPEC_FILE_NAME)
        if ".git" not in p.parts
    ]
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


def validate_book_spec(spec: dict[str, Any], spec_path: Path) -> None:
    schema = load_schema()
    try:
        jsonschema.validate(instance=spec, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise ValueError(f"{spec_path}: schema validation failed at {location}: {exc.message}") from exc


def validate_upcoming_spec(spec: dict[str, Any], spec_path: Path) -> None:
    schema = load_upcoming_schema()
    try:
        jsonschema.validate(instance=spec, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise ValueError(f"{spec_path}: schema validation failed at {location}: {exc.message}") from exc


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


def spec_book_dir(spec_path: Path) -> Path:
    return spec_path.parent.resolve()


def spec_publish_enabled(spec: dict[str, Any]) -> bool:
    publishing = _as_dict(spec.get("publishing"))
    # enabled defaults to true so existing books are publishable by default.
    return publishing.get("enabled", True) is not False


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


def all_books_from_specs(repo: Path) -> list[Path]:
    out = [spec_book_dir(p) for p in discover_book_spec_paths(repo)]
    return sorted(set(out))
