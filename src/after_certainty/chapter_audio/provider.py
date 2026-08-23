"""Provider-neutral TTS Protocol and shared request/result types."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable


@dataclass(frozen=True)
class GenerationRequest:
    unit_id: str
    spoken_text: str
    voice_alias: str
    provider_voice_id: str
    model: str
    output_format: str
    language: str
    instructions: str | None = None
    provider_options: dict[str, Any] = field(default_factory=dict)
    seed: Any = None
    max_estimated_usd: float | None = None
    max_credits: float | None = None
    segments: tuple[Any, ...] = ()


@dataclass(frozen=True)
class GenerationEstimate:
    unit: str
    amount: float
    usd: float | None = None
    notes: str = ""


@dataclass(frozen=True)
class AlignmentSegment:
    id: str
    text: str
    start_ms: float
    end_ms: float
    char_start: int | None = None
    char_end: int | None = None


@dataclass(frozen=True)
class NormalizedAlignment:
    granularity: str
    segments: tuple[AlignmentSegment, ...]


@dataclass(frozen=True)
class ProviderGenerationResult:
    audio_bytes: bytes
    provider_generation_id: str | None = None
    duration_seconds: float | None = None
    usage_unit: str | None = None
    usage_amount: float | None = None
    usage_usd: float | None = None
    raw_alignment: Any = None
    warnings: tuple[str, ...] = ()
    audit: dict[str, Any] = field(default_factory=dict)


@runtime_checkable
class TtsProvider(Protocol):
    name: str
    adapter_version: str

    def estimate(self, request: GenerationRequest) -> GenerationEstimate: ...

    def generate(self, request: GenerationRequest) -> ProviderGenerationResult: ...

    def normalize_alignment(
        self,
        result: ProviderGenerationResult,
        spoken_text: str,
        *,
        request: GenerationRequest | None = None,
    ) -> NormalizedAlignment | None: ...
