"""Orchestrate chapter-audio generation (budgets, skip-current, atomic write)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from chapter_audio.adapters.elevenlabs import ADAPTER_VERSION as ELEVENLABS_ADAPTER_VERSION
from chapter_audio.artifacts import write_artifact_trio
from chapter_audio.estimate import estimate_usage
from chapter_audio.extract import EXTRACTOR_VERSION, extract_spoken_document
from chapter_audio.hashing import (
    PIPELINE_VERSION,
    build_generation_hash_payload,
    generation_hash,
    sha256_digest,
)
from chapter_audio.plan import ALIGNMENT_STRATEGY
from chapter_audio.provider import GenerationRequest, NormalizedAlignment, TtsProvider
from chapter_audio.receipts import (
    alignment_path_for,
    audio_path_for,
    classify_artifacts,
    receipt_path_for,
)
from chapter_audio.resolve import ResolvedUnitAudio, iter_resolved_units


class GenerateError(RuntimeError):
    """User-facing generate refusal / failure."""


@dataclass(frozen=True)
class GenerateResult:
    unit_id: str
    action: str
    reason: str
    generation_hash: str | None = None
    audio_path: str | None = None
    receipt_path: str | None = None
    alignment_path: str | None = None
    estimated_credits: float | None = None


def adapter_version_for(provider_name: str) -> str:
    if provider_name == "elevenlabs":
        return ELEVENLABS_ADAPTER_VERSION
    raise GenerateError(f"unsupported provider for generate: {provider_name}")


def find_resolved_unit(repo: Path, unit_id: str) -> ResolvedUnitAudio:
    for unit in iter_resolved_units(repo):
        if unit.unit_id == unit_id:
            return unit
    raise GenerateError(f"unknown unit id: {unit_id}")


def _budget_ok(unit: ResolvedUnitAudio, chars: int) -> None:
    usage = estimate_usage(
        provider=unit.provider or "",
        model=unit.model or "",
        spoken_characters=chars,
        provider_options=unit.provider_options,
    )
    if unit.max_credits is not None and usage.unit == "credits":
        if usage.amount > float(unit.max_credits):
            raise GenerateError(
                f"estimated {usage.amount:g} credits exceeds max_credits={unit.max_credits:g}"
            )
    if unit.max_estimated_usd is not None and usage.usd is not None:
        if usage.usd > float(unit.max_estimated_usd):
            raise GenerateError(
                f"estimated ${usage.usd:g} exceeds max_estimated_usd={unit.max_estimated_usd:g}"
            )


def _build_request(
    unit: ResolvedUnitAudio, spoken_text: str, segments: tuple[Any, ...]
) -> GenerationRequest:
    assert unit.provider and unit.voice_alias and unit.provider_voice_id and unit.model
    return GenerationRequest(
        unit_id=unit.unit_id,
        spoken_text=spoken_text,
        voice_alias=unit.voice_alias,
        provider_voice_id=unit.provider_voice_id,
        model=unit.model,
        output_format=unit.output_format or "mp3_44100_128",
        language=unit.language or "en",
        instructions=unit.instructions,
        provider_options=dict(unit.provider_options or {}),
        seed=unit.settings.get("seed"),
        max_estimated_usd=unit.max_estimated_usd,
        max_credits=unit.max_credits,
        segments=segments,
    )


def _alignment_payload(
    *,
    unit_id: str,
    gen_hash: str,
    alignment: NormalizedAlignment,
) -> dict[str, Any]:
    segments: list[dict[str, Any]] = []
    for seg in alignment.segments:
        item: dict[str, Any] = {
            "id": seg.id,
            "text": seg.text,
            "startMs": seg.start_ms,
            "endMs": seg.end_ms,
        }
        if seg.char_start is not None:
            item["charStart"] = seg.char_start
        if seg.char_end is not None:
            item["charEnd"] = seg.char_end
        segments.append(item)
    return {
        "schemaVersion": 1,
        "unitId": unit_id,
        "generationHash": gen_hash,
        "granularity": alignment.granularity,
        "segments": segments,
    }


def _receipt_payload(
    *,
    unit: ResolvedUnitAudio,
    gen_hash: str,
    source_hash: str,
    spoken_hash: str,
    spoken_chars: int,
    audio_rel: str,
    audio_sha: str,
    alignment_rel: str | None,
    alignment_granularity: str,
    estimated: dict[str, Any],
    actual: dict[str, Any],
    provider_generation_id: str | None,
    adapter_version: str,
) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "unitId": unit.unit_id,
        "editionSlug": unit.edition_slug,
        "chapterSlug": unit.chapter_slug,
        "sourcePath": unit.source_path,
        "sourceHash": source_hash,
        "spokenTextHash": spoken_hash,
        "generationHash": gen_hash,
        "pipelineVersion": PIPELINE_VERSION,
        "extractorVersion": EXTRACTOR_VERSION,
        "provider": unit.provider,
        "providerAdapterVersion": adapter_version,
        "model": unit.model,
        "voice": {
            "alias": unit.voice_alias,
            "providerVoiceId": unit.provider_voice_id,
        },
        "outputFormat": unit.output_format or "mp3_44100_128",
        "language": unit.language or "en",
        "includeTitle": unit.include_title,
        "includeFootnotes": unit.include_footnotes,
        "spokenCharacters": spoken_chars,
        "estimatedUsage": estimated,
        "actualUsage": actual,
        "providerGenerationId": provider_generation_id,
        "alignment": {
            "granularity": alignment_granularity,
            "path": alignment_rel,
        },
        "audioPath": audio_rel,
        "audioSha256": audio_sha,
        "generatedAt": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def generate_unit(
    repo: Path,
    unit: ResolvedUnitAudio,
    provider: TtsProvider,
    *,
    dry_run: bool = False,
    force: bool = False,
    manuscript_text: str | None = None,
) -> GenerateResult:
    repo = repo.resolve()
    if not unit.enabled:
        raise GenerateError("unit is disabled (audio.enabled is not true)")
    if unit.status == "enabled-unconfigured" or not unit.provider_voice_id:
        raise GenerateError(
            unit.status_reason or "unit is enabled-unconfigured; fix voice catalog first"
        )
    if not unit.provider or not unit.voice_alias or not unit.model:
        raise GenerateError("unit missing provider, voice, or model")
    if unit.provider != provider.name:
        raise GenerateError(
            f"provider mismatch: unit wants {unit.provider}, adapter is {provider.name}"
        )

    book_dir = repo / unit.book_relpath
    source_file = book_dir / unit.source_path
    if manuscript_text is None:
        if not source_file.is_file():
            raise GenerateError(f"missing manuscript: {source_file}")
        source_bytes = source_file.read_bytes()
        manuscript_text = source_bytes.decode("utf-8")
    else:
        source_bytes = manuscript_text.encode("utf-8")

    spoken_doc = extract_spoken_document(
        manuscript_text,
        include_title=unit.include_title,
        include_footnotes=unit.include_footnotes,
    )
    spoken_text = spoken_doc.spoken_text
    if not spoken_text.strip():
        raise GenerateError("spoken text is empty after extraction")

    adapter_version = adapter_version_for(unit.provider)
    if provider.adapter_version != adapter_version:
        # Keep hash + receipt adapter version tied to the concrete adapter in use.
        adapter_version = provider.adapter_version

    payload = build_generation_hash_payload(
        spoken_text=spoken_text,
        provider=unit.provider,
        provider_adapter_version=adapter_version,
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
        book_relpath=unit.book_relpath,
        chapter_slug=unit.chapter_slug,
        expected_generation_hash=gen_hash,
    )
    if has_art and hash_ok and not invalid and not force:
        return GenerateResult(
            unit_id=unit.unit_id,
            action="skip",
            reason="artifacts current; pass --force to regenerate",
            generation_hash=gen_hash,
            audio_path=str(
                audio_path_for(repo, unit.book_relpath, unit.chapter_slug).relative_to(repo)
            ),
            receipt_path=str(
                receipt_path_for(repo, unit.book_relpath, unit.chapter_slug).relative_to(repo)
            ),
            estimated_credits=float(len(spoken_text)),
        )

    _budget_ok(unit, len(spoken_text))
    request = _build_request(unit, spoken_text, spoken_doc.segments)
    estimate = provider.estimate(request)

    if dry_run:
        return GenerateResult(
            unit_id=unit.unit_id,
            action="dry-run",
            reason=(
                f"would generate ~{estimate.amount:g} {estimate.unit}"
                + (f" ({art_reason})" if art_reason else "")
            ),
            generation_hash=gen_hash,
            estimated_credits=estimate.amount if estimate.unit == "credits" else None,
        )

    result = provider.generate(request)
    if not result.audio_bytes:
        raise GenerateError("provider returned empty audio")

    alignment = provider.normalize_alignment(result, spoken_text, request=request)
    audio_path = audio_path_for(repo, unit.book_relpath, unit.chapter_slug)
    receipt_path = receipt_path_for(repo, unit.book_relpath, unit.chapter_slug)
    align_path = alignment_path_for(repo, unit.book_relpath, unit.chapter_slug)

    audio_rel = str(audio_path.relative_to(repo))
    receipt_rel = str(receipt_path.relative_to(repo))
    align_rel: str | None = None
    alignment_doc: dict[str, Any] | None = None
    granularity = "none"
    if alignment is not None and alignment.granularity != "none" and alignment.segments:
        alignment_doc = _alignment_payload(
            unit_id=unit.unit_id, gen_hash=gen_hash, alignment=alignment
        )
        align_rel = str(align_path.relative_to(repo))
        granularity = alignment.granularity

    estimated = {
        "unit": estimate.unit,
        "amount": estimate.amount,
        "usd": estimate.usd,
    }
    actual = {
        "unit": result.usage_unit or estimate.unit,
        "amount": result.usage_amount if result.usage_amount is not None else estimate.amount,
        "usd": result.usage_usd,
    }
    receipt = _receipt_payload(
        unit=unit,
        gen_hash=gen_hash,
        source_hash=sha256_digest(source_bytes),
        spoken_hash=sha256_digest(spoken_text),
        spoken_chars=len(spoken_text),
        audio_rel=audio_rel,
        audio_sha=sha256_digest(result.audio_bytes),
        alignment_rel=align_rel,
        alignment_granularity=granularity,
        estimated=estimated,
        actual=actual,
        provider_generation_id=result.provider_generation_id,
        adapter_version=adapter_version,
    )

    write_artifact_trio(
        audio_path=audio_path,
        audio_bytes=result.audio_bytes,
        receipt_path=receipt_path,
        receipt=receipt,
        alignment_path=align_path if alignment_doc else None,
        alignment=alignment_doc,
    )

    return GenerateResult(
        unit_id=unit.unit_id,
        action="generated",
        reason="wrote audio + receipt" + (" + alignment" if alignment_doc else ""),
        generation_hash=gen_hash,
        audio_path=audio_rel,
        receipt_path=receipt_rel,
        alignment_path=align_rel,
        estimated_credits=estimate.amount if estimate.unit == "credits" else None,
    )


__all__ = [
    "GenerateError",
    "GenerateResult",
    "adapter_version_for",
    "find_resolved_unit",
    "generate_unit",
]
