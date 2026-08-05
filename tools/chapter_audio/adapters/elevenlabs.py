"""ElevenLabs TTS adapter (stdlib HTTP; mock mode for CI)."""

from __future__ import annotations

import base64
import json
import math
import urllib.error
import urllib.request
from collections.abc import Callable
from typing import Any

from chapter_audio.estimate import estimate_usage
from chapter_audio.provider import (
    AlignmentSegment,
    GenerationEstimate,
    GenerationRequest,
    NormalizedAlignment,
    ProviderGenerationResult,
)

ADAPTER_VERSION = "1"
DEFAULT_API_BASE = "https://api.elevenlabs.io/v1"

# Minimal MPEG frame-ish payload so artifacts are non-empty and not LFS pointers.
_MOCK_MP3_PREFIX = b"ID3\x03\x00\x00\x00\x00\x00\x00MOCK-CHAPTER-AUDIO"


HttpTransport = Callable[[str, bytes, dict[str, str]], tuple[int, bytes, dict[str, str]]]


def _default_transport(
    url: str, body: bytes, headers: dict[str, str]
) -> tuple[int, bytes, dict[str, str]]:
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read()
            resp_headers = {k.lower(): v for k, v in resp.headers.items()}
            return int(resp.status), raw, resp_headers
    except urllib.error.HTTPError as exc:
        err_body = exc.read() if hasattr(exc, "read") else b""
        raise RuntimeError(f"ElevenLabs HTTP {exc.code}: {(err_body or b'')[:200]!r}") from None


def _segment_timing_from_chars(
    request: GenerationRequest,
    *,
    duration_seconds: float,
) -> NormalizedAlignment:
    spoken = request.spoken_text
    total = max(len(spoken), 1)
    duration_ms = max(duration_seconds, 0.1) * 1000.0
    segs_in = list(request.segments)
    if not segs_in:
        return NormalizedAlignment(
            granularity="segment-only",
            segments=(
                AlignmentSegment(
                    id="s0001",
                    text=spoken,
                    start_ms=0.0,
                    end_ms=duration_ms,
                    char_start=0,
                    char_end=len(spoken),
                ),
            ),
        )
    out: list[AlignmentSegment] = []
    cursor_ms = 0.0
    for i, seg in enumerate(segs_in):
        seg_id = getattr(seg, "id", None) or f"s{i + 1:04d}"
        text = getattr(seg, "text", None) or ""
        char_start = getattr(seg, "char_start", None)
        char_end = getattr(seg, "char_end", None)
        weight = max(int(char_end or 0) - int(char_start or 0), len(text), 1)
        span = duration_ms * (weight / total)
        end_ms = duration_ms if i == len(segs_in) - 1 else cursor_ms + span
        out.append(
            AlignmentSegment(
                id=str(seg_id),
                text=str(text),
                start_ms=round(cursor_ms, 3),
                end_ms=round(end_ms, 3),
                char_start=int(char_start) if char_start is not None else None,
                char_end=int(char_end) if char_end is not None else None,
            )
        )
        cursor_ms = end_ms
    return NormalizedAlignment(granularity="segment-only", segments=tuple(out))


class ElevenLabsProvider:
    """Real ElevenLabs HTTP adapter. Requires an API key; never logs it."""

    name = "elevenlabs"
    adapter_version = ADAPTER_VERSION

    def __init__(
        self,
        api_key: str,
        *,
        api_base: str = DEFAULT_API_BASE,
        transport: HttpTransport | None = None,
        with_timestamps: bool = True,
    ) -> None:
        key = (api_key or "").strip()
        if not key:
            raise ValueError("ElevenLabs API key is required for real generate")
        self._api_key = key
        self._api_base = api_base.rstrip("/")
        self._transport = transport or _default_transport
        self._with_timestamps = with_timestamps

    def estimate(self, request: GenerationRequest) -> GenerationEstimate:
        usage = estimate_usage(
            provider=self.name,
            model=request.model,
            spoken_characters=len(request.spoken_text),
            provider_options=request.provider_options,
        )
        return GenerationEstimate(
            unit=usage.unit,
            amount=usage.amount,
            usd=usage.usd,
            notes=usage.notes,
        )

    def generate(self, request: GenerationRequest) -> ProviderGenerationResult:
        voice_id = request.provider_voice_id
        payload: dict[str, Any] = {
            "text": request.spoken_text,
            "model_id": request.model,
        }
        voice_settings = request.provider_options.get("voice_settings")
        if isinstance(voice_settings, dict):
            payload["voice_settings"] = voice_settings
        if request.language:
            payload["language_code"] = request.language

        headers = {
            "xi-api-key": self._api_key,
            "Content-Type": "application/json",
            "Accept": "application/json" if self._with_timestamps else "audio/mpeg",
        }
        body = json.dumps(payload).encode("utf-8")

        if self._with_timestamps:
            url = f"{self._api_base}/text-to-speech/{voice_id}/with-timestamps"
            status, raw, _hdrs = self._transport(url, body, headers)
            if status >= 400:
                raise RuntimeError(f"ElevenLabs with-timestamps failed: HTTP {status}")
            data = json.loads(raw.decode("utf-8"))
            audio_b64 = data.get("audio_base64") or data.get("audioBase64")
            if not audio_b64:
                raise RuntimeError("ElevenLabs response missing audio_base64")
            audio = base64.b64decode(audio_b64)
            alignment = data.get("alignment") or data.get("normalized_alignment")
            chars = len(request.spoken_text)
            return ProviderGenerationResult(
                audio_bytes=audio,
                provider_generation_id=str(data.get("request_id") or "") or None,
                duration_seconds=None,
                usage_unit="credits",
                usage_amount=float(chars),
                usage_usd=None,
                raw_alignment=alignment,
                warnings=(),
                audit={"endpoint": "with-timestamps", "httpStatus": status},
            )

        url = f"{self._api_base}/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": self._api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        status, raw, _hdrs = self._transport(url, body, headers)
        if status >= 400:
            raise RuntimeError(f"ElevenLabs TTS failed: HTTP {status}")
        chars = len(request.spoken_text)
        return ProviderGenerationResult(
            audio_bytes=raw,
            provider_generation_id=None,
            duration_seconds=None,
            usage_unit="credits",
            usage_amount=float(chars),
            usage_usd=None,
            raw_alignment=None,
            warnings=("timestamps endpoint disabled; alignment may be synthetic",),
            audit={"endpoint": "text-to-speech", "httpStatus": status},
        )

    def normalize_alignment(
        self,
        result: ProviderGenerationResult,
        spoken_text: str,
        *,
        request: GenerationRequest | None = None,
    ) -> NormalizedAlignment | None:
        duration = result.duration_seconds
        if duration is None:
            # ~14 chars/sec heuristic when provider omits duration.
            duration = max(len(spoken_text) / 14.0, 0.1)

        raw = result.raw_alignment
        if isinstance(raw, dict) and request is not None:
            mapped = _alignment_from_elevenlabs_chars(raw, request, duration)
            if mapped is not None:
                return mapped

        if request is not None:
            return _segment_timing_from_chars(request, duration_seconds=duration)
        return NormalizedAlignment(granularity="none", segments=())


def _alignment_from_elevenlabs_chars(
    raw: dict[str, Any],
    request: GenerationRequest,
    duration_seconds: float,
) -> NormalizedAlignment | None:
    """Map character-level ElevenLabs timing onto extractor segments when possible."""
    chars = raw.get("characters") or raw.get("chars")
    starts = raw.get("character_start_times_seconds") or raw.get("start_times")
    ends = raw.get("character_end_times_seconds") or raw.get("end_times")
    if not (isinstance(chars, list) and isinstance(starts, list) and isinstance(ends, list)):
        return None
    if not chars or len(chars) != len(starts) or len(chars) != len(ends):
        return None
    if not request.segments:
        return None
    out: list[AlignmentSegment] = []
    for i, seg in enumerate(request.segments):
        char_start = int(getattr(seg, "char_start", 0) or 0)
        char_end = int(getattr(seg, "char_end", 0) or 0)
        char_end = min(max(char_end, char_start), len(starts))
        if char_start >= len(starts) or char_end <= char_start:
            continue
        start_ms = float(starts[char_start]) * 1000.0
        end_ms = float(ends[char_end - 1]) * 1000.0
        out.append(
            AlignmentSegment(
                id=str(getattr(seg, "id", None) or f"s{i + 1:04d}"),
                text=str(getattr(seg, "text", "") or ""),
                start_ms=round(start_ms, 3),
                end_ms=round(max(end_ms, start_ms), 3),
                char_start=char_start,
                char_end=char_end,
            )
        )
    if not out:
        return _segment_timing_from_chars(request, duration_seconds=duration_seconds)
    return NormalizedAlignment(granularity="segment-only", segments=tuple(out))


class MockElevenLabsProvider:
    """Deterministic offline adapter for CI and laptop dry practice without spend."""

    name = "elevenlabs"
    adapter_version = ADAPTER_VERSION

    def __init__(self, *, call_log: list[str] | None = None) -> None:
        self.call_log = call_log if call_log is not None else []

    def estimate(self, request: GenerationRequest) -> GenerationEstimate:
        usage = estimate_usage(
            provider=self.name,
            model=request.model,
            spoken_characters=len(request.spoken_text),
            provider_options=request.provider_options,
        )
        return GenerationEstimate(
            unit=usage.unit,
            amount=usage.amount,
            usd=usage.usd,
            notes="mock " + usage.notes,
        )

    def generate(self, request: GenerationRequest) -> ProviderGenerationResult:
        self.call_log.append(request.unit_id)
        chars = len(request.spoken_text)
        duration = max(chars / 14.0, 0.1)
        # Stable pseudo-audio: prefix + padded length marker (not a real MP3 decode).
        pad = abs(hash(request.spoken_text)) % 997
        audio = _MOCK_MP3_PREFIX + f":{chars}:{pad}".encode("ascii") + b"\x00" * 32
        return ProviderGenerationResult(
            audio_bytes=audio,
            provider_generation_id="mock-generation",
            duration_seconds=round(duration, 3),
            usage_unit="credits",
            usage_amount=float(chars),
            usage_usd=None,
            raw_alignment=None,
            warnings=("mock provider; not real ElevenLabs audio",),
            audit={"mock": True, "approxDurationSeconds": round(duration, 3)},
        )

    def normalize_alignment(
        self,
        result: ProviderGenerationResult,
        spoken_text: str,
        *,
        request: GenerationRequest | None = None,
    ) -> NormalizedAlignment | None:
        duration = result.duration_seconds or max(len(spoken_text) / 14.0, 0.1)
        if request is None:
            return NormalizedAlignment(granularity="none", segments=())
        return _segment_timing_from_chars(request, duration_seconds=duration)


def duration_heuristic_seconds(spoken_characters: int) -> float:
    return round(max(spoken_characters, 1) / 14.0, 3)


def estimate_ms_budget(spoken_characters: int) -> int:
    return int(math.ceil(duration_heuristic_seconds(spoken_characters) * 1000))
