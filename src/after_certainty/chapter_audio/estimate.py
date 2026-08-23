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
_ELEVENLABS_USD_PER_CREDIT = 0.0  # subscription credits; USD unknown here
_OPENAI_USD_PER_1K_CHARS = 0.015  # placeholder planning constant; confirm before real spend

# ElevenLabs subscription credit multipliers (characters → credits).
# Flash/Turbo on this Starter account burn ~0.25 credit/char (calibrated
# 2026-08-05: OP 12,081 + WOLTY first-half 43,983 chars → 14,017 dashboard used).
# Marketing docs often quote 0.5; Multilingual / Eleven v3-class stay ~1.0.
_ELEVENLABS_FLASH_TURBO_PREFIXES = (
    "eleven_flash_",
    "eleven_turbo_",
)

# Empirically observed Flash/Turbo multiplier for Kevin's Starter workspace.
_ELEVENLABS_FLASH_TURBO_CREDITS_PER_CHAR = 0.25


def elevenlabs_credits_per_character(model: str) -> float:
    mid = (model or "").strip().lower()
    if any(mid.startswith(prefix) for prefix in _ELEVENLABS_FLASH_TURBO_PREFIXES):
        return _ELEVENLABS_FLASH_TURBO_CREDITS_PER_CHAR
    return 1.0


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
        rate = elevenlabs_credits_per_character(model)
        credits = chars * rate
        return UsageEstimate(
            unit="credits",
            amount=float(credits),
            usd=None if _ELEVENLABS_USD_PER_CREDIT == 0 else credits * _ELEVENLABS_USD_PER_CREDIT,
            notes=(
                f"offline estimate for model={model}; "
                f"{rate:g} credit/char "
                f"({'Flash/Turbo' if rate < 1 else 'standard'})"
            ),
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
