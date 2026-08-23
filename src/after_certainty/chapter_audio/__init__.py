"""Chapter audio: provider-neutral resolve, extract, plan, and generate helpers."""

from __future__ import annotations

from chapter_audio.extract import EXTRACTOR_VERSION, SpokenDocument, extract_spoken_document
from chapter_audio.resolve import (
    PLACEHOLDER_VOICE_PREFIX,
    ResolvedUnitAudio,
    iter_resolved_units,
    load_voice_catalog,
    resolve_unit_audio,
)

__all__ = [
    "EXTRACTOR_VERSION",
    "PLACEHOLDER_VOICE_PREFIX",
    "ResolvedUnitAudio",
    "SpokenDocument",
    "extract_spoken_document",
    "iter_resolved_units",
    "load_voice_catalog",
    "resolve_unit_audio",
]
