"""Secret-free validation of chapter-audio artifacts and voice catalog."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import jsonschema

from chapter_audio.plan import plan_units
from chapter_audio.receipts import is_lfs_pointer


@dataclass(frozen=True)
class ValidationIssue:
    level: str  # "error" | "warning"
    path: str
    message: str


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _schema(repo: Path, name: str) -> dict[str, Any]:
    return _load_json(repo / "schema" / name)


def validate_voice_catalog(repo: Path) -> list[ValidationIssue]:
    path = repo / "config" / "chapter-audio-voices.yml"
    issues: list[ValidationIssue] = []
    if not path.is_file():
        return [ValidationIssue("error", str(path.relative_to(repo)), "voice catalog missing")]
    try:
        import yaml  # local import; pyyaml is a project dependency
    except ModuleNotFoundError:
        return [
            ValidationIssue(
                "error",
                str(path.relative_to(repo)),
                "PyYAML required to validate voice catalog",
            )
        ]
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 — surface parse failures as issues
        return [ValidationIssue("error", str(path.relative_to(repo)), f"YAML parse error: {exc}")]
    try:
        jsonschema.validate(instance=raw, schema=_schema(repo, "chapter-audio-voices.schema.json"))
    except jsonschema.ValidationError as exc:
        issues.append(
            ValidationIssue(
                "error",
                str(path.relative_to(repo)),
                f"schema: {exc.message}",
            )
        )
    return issues


def validate_artifact_tree(repo: Path) -> list[ValidationIssue]:
    """Validate present receipt/alignment/audio files under books/*/audio/."""
    issues: list[ValidationIssue] = []
    receipt_schema = _schema(repo, "chapter-audio-receipt.schema.json")
    alignment_schema = _schema(repo, "chapter-audio-alignment.schema.json")
    audio_roots = sorted((repo / "books").glob("*/audio"))
    for audio_dir in audio_roots:
        for receipt_path in sorted(audio_dir.glob("*.receipt.json")):
            rel = str(receipt_path.relative_to(repo))
            try:
                receipt = _load_json(receipt_path)
            except (OSError, json.JSONDecodeError) as exc:
                issues.append(ValidationIssue("error", rel, f"unreadable receipt: {exc}"))
                continue
            try:
                jsonschema.validate(instance=receipt, schema=receipt_schema)
            except jsonschema.ValidationError as exc:
                issues.append(ValidationIssue("error", rel, f"schema: {exc.message}"))

            stem = receipt_path.name[: -len(".receipt.json")]
            audio_path = audio_dir / f"{stem}.mp3"
            audio_rel = str(audio_path.relative_to(repo))
            if not audio_path.is_file():
                issues.append(
                    ValidationIssue("error", audio_rel, "receipt present but audio missing")
                )
            elif is_lfs_pointer(audio_path):
                issues.append(
                    ValidationIssue(
                        "error",
                        audio_rel,
                        "Git LFS pointer stub (not smudged); fetch LFS objects before install",
                    )
                )

            alignment_path = audio_dir / f"{stem}.alignment.json"
            if alignment_path.is_file():
                align_rel = str(alignment_path.relative_to(repo))
                try:
                    alignment = _load_json(alignment_path)
                except (OSError, json.JSONDecodeError) as exc:
                    issues.append(
                        ValidationIssue("error", align_rel, f"unreadable alignment: {exc}")
                    )
                    continue
                try:
                    jsonschema.validate(instance=alignment, schema=alignment_schema)
                except jsonschema.ValidationError as exc:
                    issues.append(ValidationIssue("error", align_rel, f"schema: {exc.message}"))
    return issues


def validate_stale_enabled_artifacts(repo: Path) -> list[ValidationIssue]:
    """Warn when enabled units have artifacts that no longer match the plan hash."""
    issues: list[ValidationIssue] = []
    for plan in plan_units(repo, enabled_only=True):
        if plan.status == "enabled-stale":
            issues.append(
                ValidationIssue(
                    "warning",
                    f"books/{plan.edition_slug}/audio/{plan.chapter_slug}.receipt.json",
                    f"{plan.unit_id}: {plan.status_reason or 'stale artifacts'}",
                )
            )
        elif plan.status == "enabled-invalid":
            issues.append(
                ValidationIssue(
                    "error",
                    f"books/{plan.edition_slug}/audio/{plan.chapter_slug}",
                    f"{plan.unit_id}: {plan.status_reason or 'invalid artifacts'}",
                )
            )
    return issues


def validate_chapter_audio(
    repo: Path,
    *,
    strict_stale: bool = False,
) -> list[ValidationIssue]:
    repo = repo.resolve()
    issues = [
        *validate_voice_catalog(repo),
        *validate_artifact_tree(repo),
        *validate_stale_enabled_artifacts(repo),
    ]
    if strict_stale:
        issues = [
            ValidationIssue("error", i.path, i.message) if i.level == "warning" else i
            for i in issues
        ]
    return issues


def validate_manifest_file(repo: Path, manifest_path: Path) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    rel = (
        str(manifest_path.relative_to(repo))
        if manifest_path.is_relative_to(repo)
        else str(manifest_path)
    )
    if not manifest_path.is_file():
        return [ValidationIssue("error", rel, "manifest file missing")]
    try:
        payload = _load_json(manifest_path)
    except (OSError, json.JSONDecodeError) as exc:
        return [ValidationIssue("error", rel, f"unreadable manifest: {exc}")]
    try:
        jsonschema.validate(
            instance=payload,
            schema=_schema(repo, "chapter-audio-manifest.schema.json"),
        )
    except jsonschema.ValidationError as exc:
        issues.append(ValidationIssue("error", rel, f"schema: {exc.message}"))
    return issues
