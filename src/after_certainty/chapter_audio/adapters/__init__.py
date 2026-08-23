"""Chapter-audio provider adapters."""

from __future__ import annotations

from after_certainty.chapter_audio.adapters.elevenlabs import (
    ADAPTER_VERSION as ELEVENLABS_ADAPTER_VERSION,
)
from after_certainty.chapter_audio.adapters.elevenlabs import (
    ElevenLabsProvider,
    MockElevenLabsProvider,
)

__all__ = [
    "ELEVENLABS_ADAPTER_VERSION",
    "ElevenLabsProvider",
    "MockElevenLabsProvider",
]
