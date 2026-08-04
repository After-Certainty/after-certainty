"""Chapter audio: provider-neutral resolve, list, and (later) plan/generate helpers."""

from __future__ import annotations

__all__ = [
    "PLACEHOLDER_VOICE_PREFIX",
    "ResolvedUnitAudio",
    "iter_resolved_units",
    "load_voice_catalog",
    "resolve_unit_audio",
]

PLACEHOLDER_VOICE_PREFIX = "PLACEHOLDER"
