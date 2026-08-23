"""Resolve authored narration defaults + unit overrides into concrete settings."""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from after_certainty.manuscript.structure import build_structure_for_book, load_chapter_enrichment
from after_certainty.specs.book_specs import discover_book_spec_paths, load_book_spec

PLACEHOLDER_VOICE_PREFIX = "PLACEHOLDER"

# Used when book.yml omits narration.defaults entirely.
_FALLBACK_DEFAULTS: dict[str, Any] = {
    "enabled": False,
    "provider": "elevenlabs",
    "voice": "reflective-narrator",
    "model": "eleven_flash_v2_5",
    "output_format": "mp3_44100_128",
    "language": "en",
    "include_title": True,
    "include_footnotes": False,
    "max_estimated_usd": 1.0,
    "provider_options": {},
}

_MERGE_KEYS = (
    "enabled",
    "provider",
    "voice",
    "model",
    "output_format",
    "language",
    "include_title",
    "include_footnotes",
    "instructions",
    "max_estimated_usd",
    "max_credits",
    "seed",
)


@dataclass(frozen=True)
class ResolvedUnitAudio:
    unit_id: str
    edition_slug: str  # public id for routes / site URLs
    book_relpath: str  # repo-relative book dir (may be nested, e.g. books/.../v1)
    title: str
    source_path: str
    kind: str
    chapter_slug: str
    route_key: str
    enabled: bool
    inherited_fields: tuple[str, ...]
    overridden_fields: tuple[str, ...]
    provider: str | None
    voice_alias: str | None
    provider_voice_id: str | None
    model: str | None
    output_format: str | None
    language: str | None
    include_title: bool
    include_footnotes: bool
    instructions: str | None
    max_estimated_usd: float | None
    max_credits: float | None
    provider_options: dict[str, Any] = field(default_factory=dict)
    status: str = "disabled"
    status_reason: str = ""
    settings: dict[str, Any] = field(default_factory=dict)


def load_voice_catalog(repo: Path) -> dict[str, Any]:
    path = repo / "config" / "chapter-audio-voices.yml"
    if not path.is_file():
        return {"voices": {}}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return {"voices": {}}
    voices = raw.get("voices")
    if not isinstance(voices, dict):
        return {"voices": {}}
    return {"voices": voices}


def _deep_merge_provider_options(
    base: dict[str, Any] | None, overlay: dict[str, Any] | None
) -> dict[str, Any]:
    out: dict[str, Any] = copy.deepcopy(base) if isinstance(base, dict) else {}
    if not isinstance(overlay, dict):
        return out
    for key, value in overlay.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            merged = dict(out[key])
            merged.update(value)
            out[str(key)] = merged
        else:
            out[str(key)] = copy.deepcopy(value)
    return out


def merge_audio_settings(
    book_defaults: dict[str, Any] | None,
    unit_audio: dict[str, Any] | None,
) -> tuple[dict[str, Any], tuple[str, ...], tuple[str, ...]]:
    """Return (merged, inherited_field_names, overridden_field_names).

    A unit is enabled only when chapter ``audio.enabled`` is explicitly true.
    Book ``defaults.enabled`` never silently enables units (pilot rule).
    """
    merged = copy.deepcopy(_FALLBACK_DEFAULTS)
    inherited: set[str] = set()
    overridden: set[str] = set()

    book = book_defaults if isinstance(book_defaults, dict) else {}
    unit = unit_audio if isinstance(unit_audio, dict) else {}

    for key in _MERGE_KEYS:
        if key == "enabled":
            continue
        if key in book and book[key] is not None:
            merged[key] = copy.deepcopy(book[key])
            inherited.add(key)
        if key in unit and unit[key] is not None:
            merged[key] = copy.deepcopy(unit[key])
            overridden.add(key)
            inherited.discard(key)
        elif key not in inherited and key not in overridden:
            inherited.add(key)

    merged["provider_options"] = _deep_merge_provider_options(
        book.get("provider_options") if isinstance(book.get("provider_options"), dict) else {},
        unit.get("provider_options") if isinstance(unit.get("provider_options"), dict) else {},
    )
    if "provider_options" in unit:
        overridden.add("provider_options")
    elif "provider_options" in book:
        inherited.add("provider_options")
    else:
        inherited.add("provider_options")

    if "enabled" in unit:
        merged["enabled"] = bool(unit["enabled"])
        overridden.add("enabled")
    else:
        merged["enabled"] = False
        inherited.add("enabled")

    return merged, tuple(sorted(inherited)), tuple(sorted(overridden))


def _resolve_provider_voice(
    catalog: dict[str, Any],
    *,
    voice_alias: str | None,
    provider: str | None,
) -> str | None:
    if not voice_alias or not provider:
        return None
    voices = catalog.get("voices") if isinstance(catalog, dict) else None
    if not isinstance(voices, dict):
        return None
    entry = voices.get(voice_alias)
    if not isinstance(entry, dict):
        return None
    provider_entry = entry.get(provider)
    if not isinstance(provider_entry, dict):
        return None
    if provider == "elevenlabs":
        vid = str(provider_entry.get("voice_id") or "").strip()
        return vid or None
    if provider == "openai":
        vid = str(provider_entry.get("voice") or "").strip()
        return vid or None
    return None


def _is_placeholder_voice(provider_voice_id: str | None) -> bool:
    if not provider_voice_id:
        return True
    return provider_voice_id.upper().startswith(PLACEHOLDER_VOICE_PREFIX)


def classify_status(
    *,
    enabled: bool,
    provider: str | None,
    voice_alias: str | None,
    provider_voice_id: str | None,
    model: str | None,
    has_current_artifacts: bool = False,
    hash_matches: bool = False,
    artifacts_invalid: bool = False,
) -> tuple[str, str]:
    if not enabled:
        return "disabled", "audio.enabled is not true on this unit"
    if not provider or not voice_alias or not model:
        return (
            "enabled-unconfigured",
            "enabled but provider, voice, or model is missing after inheritance",
        )
    if _is_placeholder_voice(provider_voice_id):
        return (
            "enabled-unconfigured",
            "voice catalog still has a PLACEHOLDER provider voice id",
        )
    if artifacts_invalid:
        return "enabled-invalid", "receipt or audio artifacts are invalid"
    if has_current_artifacts and hash_matches:
        return "enabled-current", "receipt generationHash matches current plan"
    if has_current_artifacts and not hash_matches:
        return "enabled-stale", "artifacts exist but generationHash does not match"
    return "enabled-missing", "enabled and configured but no current artifacts"


def resolve_unit_audio(
    *,
    repo: Path,
    edition_slug: str,
    chapter: dict[str, Any],
    book_defaults: dict[str, Any] | None,
    unit_audio: dict[str, Any] | None,
    voice_catalog: dict[str, Any] | None = None,
    book_relpath: str | None = None,
) -> ResolvedUnitAudio:
    catalog = voice_catalog if voice_catalog is not None else load_voice_catalog(repo)
    merged, inherited, overridden = merge_audio_settings(book_defaults, unit_audio)
    enabled = bool(merged.get("enabled"))
    provider = str(merged.get("provider") or "").strip() or None
    voice_alias = str(merged.get("voice") or "").strip() or None
    model = str(merged.get("model") or "").strip() or None
    output_format = str(merged.get("output_format") or "").strip() or None
    language = str(merged.get("language") or "").strip() or None
    provider_voice_id = _resolve_provider_voice(catalog, voice_alias=voice_alias, provider=provider)
    status, reason = classify_status(
        enabled=enabled,
        provider=provider,
        voice_alias=voice_alias,
        provider_voice_id=provider_voice_id,
        model=model,
    )
    source_path = str(chapter.get("sourcePath") or "").strip()
    route_key = str(chapter.get("routeKey") or "").strip()
    chapter_slug = str(chapter.get("chapterSlug") or "").strip()
    if not chapter_slug and route_key:
        chapter_slug = route_key.rstrip("/").split("/")[-1]
    relpath = (book_relpath or f"books/{edition_slug}").replace("\\", "/").strip("/")
    return ResolvedUnitAudio(
        unit_id=str(chapter.get("id") or "").strip(),
        edition_slug=edition_slug,
        book_relpath=relpath,
        title=str(chapter.get("title") or "").strip(),
        source_path=source_path,
        kind=str(chapter.get("kind") or "").strip(),
        chapter_slug=chapter_slug,
        route_key=route_key,
        enabled=enabled,
        inherited_fields=inherited,
        overridden_fields=overridden,
        provider=provider if enabled or provider else provider,
        voice_alias=voice_alias,
        provider_voice_id=provider_voice_id,
        model=model,
        output_format=output_format,
        language=language,
        include_title=bool(merged.get("include_title", True)),
        include_footnotes=bool(merged.get("include_footnotes", False)),
        instructions=(
            str(merged["instructions"]) if merged.get("instructions") is not None else None
        ),
        max_estimated_usd=(
            float(merged["max_estimated_usd"])
            if merged.get("max_estimated_usd") is not None
            else None
        ),
        max_credits=(
            float(merged["max_credits"]) if merged.get("max_credits") is not None else None
        ),
        provider_options=dict(merged.get("provider_options") or {}),
        status=status,
        status_reason=reason,
        settings=merged,
    )


def iter_resolved_units(repo: Path) -> list[ResolvedUnitAudio]:
    repo = repo.resolve()
    catalog = load_voice_catalog(repo)
    out: list[ResolvedUnitAudio] = []
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent
        if not (book_dir / "index.md").is_file():
            continue
        try:
            spec = load_book_spec(spec_path)
        except (OSError, ValueError):
            continue
        book = spec.get("book") if isinstance(spec, dict) else None
        if not isinstance(book, dict):
            continue
        slug = str(book.get("id") or "").strip()
        if not slug:
            continue
        narration = spec.get("narration") if isinstance(spec, dict) else None
        defaults = None
        if isinstance(narration, dict) and isinstance(narration.get("defaults"), dict):
            defaults = narration["defaults"]
        enrichment = load_chapter_enrichment(book_dir)
        edition_id = f"book-{slug}"
        work_id = str(book.get("work_id") or f"work-{slug}").strip() or f"work-{slug}"
        book_kind = str(book.get("kind") or "prose").strip() or "prose"
        try:
            _parts, chapters = build_structure_for_book(
                book_dir,
                edition_slug=slug,
                work_id=work_id,
                edition_id=edition_id,
                public=True,
                enrichment=enrichment,
                book_kind=book_kind,
            )
        except (OSError, ValueError, FileNotFoundError):
            continue
        try:
            book_relpath = str(book_dir.resolve().relative_to(repo)).replace("\\", "/")
        except ValueError:
            book_relpath = f"books/{slug}"
        for chapter in chapters:
            source = str(chapter.get("sourcePath") or "").strip()
            unit_id = str(chapter.get("id") or "").strip()
            authored = enrichment.get(unit_id) or enrichment.get(source) or {}
            unit_audio = authored.get("audio") if isinstance(authored, dict) else None
            if unit_audio is not None and not isinstance(unit_audio, dict):
                unit_audio = None
            out.append(
                resolve_unit_audio(
                    repo=repo,
                    edition_slug=slug,
                    book_relpath=book_relpath,
                    chapter=chapter,
                    book_defaults=defaults,
                    unit_audio=unit_audio,
                    voice_catalog=catalog,
                )
            )
    return out
