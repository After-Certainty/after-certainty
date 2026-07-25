"""Load and validate dated IngramSpark specification profiles."""

from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML is required for IngramSpark profiles. Install with: python3 -m pip install pyyaml"
    ) from exc

try:
    import jsonschema
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "jsonschema is required for IngramSpark profiles. "
        "Install with: python3 -m pip install jsonschema"
    ) from exc

_REPO_ROOT = Path(__file__).resolve().parents[2]
PROFILE_DIR = _REPO_ROOT / "schema" / "profiles" / "ingramspark"
PROFILE_SCHEMA_PATH = PROFILE_DIR / "profile.schema.json"

_PROFILE_SCHEMA_CACHE: dict[str, Any] | None = None


def profile_path_for_id(profile_id: str, *, profiles_dir: Path | None = None) -> Path:
    stem = str(profile_id).strip()
    if not stem or "/" in stem or "\\" in stem or stem in {".", ".."}:
        raise ValueError(f"Invalid IngramSpark specification_profile id: {profile_id!r}")
    root = profiles_dir if profiles_dir is not None else PROFILE_DIR
    return (root / f"{stem}.yml").resolve()


def discover_profile_ids(*, profiles_dir: Path | None = None) -> list[str]:
    root = profiles_dir if profiles_dir is not None else PROFILE_DIR
    if not root.is_dir():
        return []
    return sorted(p.stem for p in root.glob("ingramspark-*.yml") if p.is_file())


def load_profile_schema() -> dict[str, Any]:
    global _PROFILE_SCHEMA_CACHE
    if _PROFILE_SCHEMA_CACHE is not None:
        return _PROFILE_SCHEMA_CACHE
    import json

    with PROFILE_SCHEMA_PATH.open("r", encoding="utf-8") as f:
        _PROFILE_SCHEMA_CACHE = json.load(f)
    return _PROFILE_SCHEMA_CACHE


def validate_profile(profile: dict[str, Any], profile_path: Path) -> None:
    schema = load_profile_schema()
    try:
        jsonschema.validate(instance=profile, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise ValueError(
            f"{profile_path}: profile schema validation failed at {location}: {exc.message}"
        ) from exc

    profile_id = str(profile.get("id", "")).strip()
    if profile_id and profile_id != profile_path.stem:
        raise ValueError(
            f"{profile_path}: profile id {profile_id!r} must match filename stem "
            f"{profile_path.stem!r}"
        )

    tool_ver = str(profile.get("epubcheck_tool_version", "")).strip()
    # Guard the roadmap conflation: "EPUB 3.0.0" content wording ≠ EPUBCheck tool 3.0.0.
    if tool_ver in {"3.0", "3.0.0"}:
        raise ValueError(
            f"{profile_path}: epubcheck_tool_version {tool_ver!r} looks like an EPUB content "
            f"version; pin a current EPUBCheck release instead (see epub_content_version for "
            f"content conformance)"
        )


def load_profile(profile_id: str, *, profiles_dir: Path | None = None) -> dict[str, Any]:
    path = profile_path_for_id(profile_id, profiles_dir=profiles_dir)
    if not path.is_file():
        known = ", ".join(discover_profile_ids(profiles_dir=profiles_dir)) or "(none)"
        raise FileNotFoundError(
            f"Unknown IngramSpark specification_profile {profile_id!r} "
            f"(expected {path}; known: {known})"
        )
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise ValueError(f"Expected mapping in {path}")
    validate_profile(data, path)
    return data


def validate_all_profiles(*, profiles_dir: Path | None = None) -> list[str]:
    """Validate every profile YAML; return sorted profile ids."""
    ids = discover_profile_ids(profiles_dir=profiles_dir)
    for profile_id in ids:
        load_profile(profile_id, profiles_dir=profiles_dir)
    return ids
