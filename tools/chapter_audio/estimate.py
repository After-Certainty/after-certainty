"""Offline usage / cost estimates (no network)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class UsageEstimate:
    unit: str
    amount: float
    usd: float | None
    notes: str = ""


# Conservative free-tier-oriented defaults; not billed rates.
_ELEVENLABS_USD_PER_CREDIT = 0.0  # free-plan pilot; USD unknown / not charged
_OPENAI_USD_PER_1K_CHARS = 0.015  # placeholder planning constant; confirm before real spend


def estimate_usage(
    *,
    provider: str,
    model: str,
    spoken_characters: int,
    provider_options: dict[str, Any] | None = None,
) -> UsageEstimate:
    void = provider_options  # reserved for future model-specific multipliers
    _ = void
    chars = max(0, int(spoken_characters))
    if provider == "elevenlabs":
        # Many ElevenLabs TTS plans meter ~1 credit per character for standard models.
        return UsageEstimate(
            unit="credits",
            amount=float(chars),
            usd=None if _ELEVENLABS_USD_PER_CREDIT == 0 else chars * _ELEVENLABS_USD_PER_CREDIT,
            notes=f"offline estimate for model={model}; ~1 credit/char assumption",
        )
    if provider == "openai":
        usd = (chars / 1000.0) * _OPENAI_USD_PER_1K_CHARS
        return UsageEstimate(
            unit="usd",
            amount=usd,
            usd=usd,
            notes=f"offline placeholder estimate for model={model}",
        )
    return UsageEstimate(
        unit="characters",
        amount=float(chars),
        usd=None,
        notes=f"unknown provider={provider}; character count only",
    )
