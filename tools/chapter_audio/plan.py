"""Build provider-neutral chapter-audio plans (secret-free, no network)."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from chapter_audio.adapters.elevenlabs import ADAPTER_VERSION as ELEVENLABS_ADAPTER_VERSION
from chapter_audio.estimate import estimate_usage
from chapter_audio.extract import EXTRACTOR_VERSION, extract_spoken_document
from chapter_audio.hashing import (
    PIPELINE_VERSION,
    build_generation_hash_payload,
    generation_hash,
    sha256_digest,
)
from chapter_audio.receipts import classify_artifacts
from chapter_audio.resolve import ResolvedUnitAudio, classify_status, iter_resolved_units

ALIGNMENT_STRATEGY = "segment-only"


def _adapter_version(provider: str | None) -> str:
    if provider == "elevenlabs":
        return ELEVENLABS_ADAPTER_VERSION
    return ELEVENLABS_ADAPTER_VERSION


@dataclass(frozen=True)
class UnitAudioPlan:
    unit_id: str
    edition_slug: str
    title: str
    source_path: str
    kind: str
    chapter_slug: str
    route_key: str
    enabled: bool
    status: str
    status_reason: str
    provider: str | None
    voice_alias: str | None
    provider_voice_id: str | None
    model: str | None
    inherited_fields: tuple[str, ...]
    overridden_fields: tuple[str, ...]
    spoken_characters: int
    estimated_duration_seconds: float | None
    estimated_usage_unit: str | None
    estimated_usage_amount: float | None
    estimated_usage_usd: float | None
    generation_hash: str | None
    receipt_generation_hash: str | None
    spoken_text_hash: str | None
    source_hash: str | None
    regenerate_required: bool
    regenerate_reason: str


def _duration_heuristic(chars: int) -> float:
    # ~14 chars/sec rough TTS pacing for planning only.
    if chars <= 0:
        return 0.0
    return round(chars / 14.0, 1)


def plan_unit(
    repo: Path,
    unit: ResolvedUnitAudio,
    *,
    manuscript_text: str | None = None,
) -> UnitAudioPlan:
    repo = repo.resolve()
    book_dir = repo / "books" / unit.edition_slug
    source_file = book_dir / unit.source_path
    source_bytes = b""
    if manuscript_text is None:
        if source_file.is_file():
            source_bytes = source_file.read_bytes()
            manuscript_text = source_bytes.decode("utf-8")
        else:
            manuscript_text = ""
    else:
        source_bytes = manuscript_text.encode("utf-8")

    source_hash = sha256_digest(source_bytes) if source_bytes else None

    if not unit.enabled:
        return UnitAudioPlan(
            unit_id=unit.unit_id,
            edition_slug=unit.edition_slug,
            title=unit.title,
            source_path=unit.source_path,
            kind=unit.kind,
            chapter_slug=unit.chapter_slug,
            route_key=unit.route_key,
            enabled=False,
            status="disabled",
            status_reason=unit.status_reason,
            provider=unit.provider,
            voice_alias=unit.voice_alias,
            provider_voice_id=unit.provider_voice_id,
            model=unit.model,
            inherited_fields=unit.inherited_fields,
            overridden_fields=unit.overridden_fields,
            spoken_characters=0,
            estimated_duration_seconds=None,
            estimated_usage_unit=None,
            estimated_usage_amount=None,
            estimated_usage_usd=None,
            generation_hash=None,
            receipt_generation_hash=None,
            spoken_text_hash=None,
            source_hash=source_hash,
            regenerate_required=False,
            regenerate_reason="disabled",
        )

    spoken = extract_spoken_document(
        manuscript_text,
        include_title=unit.include_title,
        include_footnotes=unit.include_footnotes,
    )
    chars = len(spoken.spoken_text)
    spoken_hash = sha256_digest(spoken.spoken_text)

    # Unconfigured units still get spoken metrics for planning visibility.
    if (
        not unit.provider
        or not unit.voice_alias
        or not unit.model
        or not unit.provider_voice_id
        or unit.status == "enabled-unconfigured"
    ):
        status, reason = classify_status(
            enabled=True,
            provider=unit.provider,
            voice_alias=unit.voice_alias,
            provider_voice_id=unit.provider_voice_id,
            model=unit.model,
        )
        usage = None
        if unit.provider:
            usage = estimate_usage(
                provider=unit.provider,
                model=unit.model or "",
                spoken_characters=chars,
                provider_options=unit.provider_options,
            )
        return UnitAudioPlan(
            unit_id=unit.unit_id,
            edition_slug=unit.edition_slug,
            title=unit.title,
            source_path=unit.source_path,
            kind=unit.kind,
            chapter_slug=unit.chapter_slug,
            route_key=unit.route_key,
            enabled=True,
            status=status,
            status_reason=reason,
            provider=unit.provider,
            voice_alias=unit.voice_alias,
            provider_voice_id=unit.provider_voice_id,
            model=unit.model,
            inherited_fields=unit.inherited_fields,
            overridden_fields=unit.overridden_fields,
            spoken_characters=chars,
            estimated_duration_seconds=_duration_heuristic(chars),
            estimated_usage_unit=usage.unit if usage else None,
            estimated_usage_amount=usage.amount if usage else None,
            estimated_usage_usd=usage.usd if usage else None,
            generation_hash=None,
            receipt_generation_hash=None,
            spoken_text_hash=spoken_hash,
            source_hash=source_hash,
            regenerate_required=False,
            regenerate_reason="not configured for generation",
        )

    payload = build_generation_hash_payload(
        spoken_text=spoken.spoken_text,
        provider=unit.provider,
        provider_adapter_version=_adapter_version(unit.provider),
        model=unit.model,
        voice_alias=unit.voice_alias,
        provider_voice_id=unit.provider_voice_id,
        output_format=unit.output_format or "mp3_44100_128",
        language=unit.language or "en",
        include_title=unit.include_title,
        include_footnotes=unit.include_footnotes,
        instructions=unit.instructions,
        provider_options=unit.provider_options,
        extractor_version=EXTRACTOR_VERSION,
        alignment_strategy=ALIGNMENT_STRATEGY,
        seed=unit.settings.get("seed"),
        pipeline_version=PIPELINE_VERSION,
    )
    gen_hash = generation_hash(payload)
    has_art, hash_ok, invalid, art_reason = classify_artifacts(
        repo=repo,
        edition_slug=unit.edition_slug,
        chapter_slug=unit.chapter_slug,
        expected_generation_hash=gen_hash,
    )
    status, reason = classify_status(
        enabled=True,
        provider=unit.provider,
        voice_alias=unit.voice_alias,
        provider_voice_id=unit.provider_voice_id,
        model=unit.model,
        has_current_artifacts=has_art,
        hash_matches=hash_ok,
        artifacts_invalid=invalid,
    )
    if not reason:
        reason = art_reason
    usage = estimate_usage(
        provider=unit.provider,
        model=unit.model,
        spoken_characters=chars,
        provider_options=unit.provider_options,
    )
    receipt = None
    from chapter_audio.receipts import load_receipt, receipt_path_for

    receipt = load_receipt(receipt_path_for(repo, unit.edition_slug, unit.chapter_slug))
    receipt_hash = str(receipt.get("generationHash") or "").strip() or None if receipt else None
    regen = status in {"enabled-missing", "enabled-stale", "enabled-invalid"}
    regen_reason = reason if regen else "current; regeneration not required"
    return UnitAudioPlan(
        unit_id=unit.unit_id,
        edition_slug=unit.edition_slug,
        title=unit.title,
        source_path=unit.source_path,
        kind=unit.kind,
        chapter_slug=unit.chapter_slug,
        route_key=unit.route_key,
        enabled=True,
        status=status,
        status_reason=reason,
        provider=unit.provider,
        voice_alias=unit.voice_alias,
        provider_voice_id=unit.provider_voice_id,
        model=unit.model,
        inherited_fields=unit.inherited_fields,
        overridden_fields=unit.overridden_fields,
        spoken_characters=chars,
        estimated_duration_seconds=_duration_heuristic(chars),
        estimated_usage_unit=usage.unit,
        estimated_usage_amount=usage.amount,
        estimated_usage_usd=usage.usd,
        generation_hash=gen_hash,
        receipt_generation_hash=receipt_hash,
        spoken_text_hash=spoken_hash,
        source_hash=source_hash,
        regenerate_required=regen,
        regenerate_reason=regen_reason,
    )


def plan_units(
    repo: Path,
    *,
    enabled_only: bool = False,
    unit_id: str | None = None,
) -> list[UnitAudioPlan]:
    plans: list[UnitAudioPlan] = []
    for unit in iter_resolved_units(repo):
        if unit_id and unit.unit_id != unit_id:
            continue
        if enabled_only and not unit.enabled:
            continue
        plans.append(plan_unit(repo, unit))
    return plans


def plan_to_dict(plan: UnitAudioPlan) -> dict[str, Any]:
    return asdict(plan)
