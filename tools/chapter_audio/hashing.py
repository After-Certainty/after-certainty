"""Generation hashing for chapter audio (provider-neutral)."""

from __future__ import annotations

import hashlib
import json
from typing import Any

PIPELINE_VERSION = 1


def sha256_hex(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def sha256_digest(data: bytes | str) -> str:
    return f"sha256:{sha256_hex(data)}"


def canonical_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def build_generation_hash_payload(
    *,
    spoken_text: str,
    provider: str,
    provider_adapter_version: str,
    model: str,
    voice_alias: str,
    provider_voice_id: str,
    output_format: str,
    language: str,
    include_title: bool,
    include_footnotes: bool,
    instructions: str | None,
    provider_options: dict[str, Any] | None,
    extractor_version: int,
    alignment_strategy: str,
    seed: Any = None,
    pipeline_version: int = PIPELINE_VERSION,
) -> dict[str, Any]:
    return {
        "alignmentStrategy": alignment_strategy,
        "extractorVersion": extractor_version,
        "includeFootnotes": include_footnotes,
        "includeTitle": include_title,
        "instructions": instructions or "",
        "language": language,
        "model": model,
        "outputFormat": output_format,
        "pipelineVersion": pipeline_version,
        "provider": provider,
        "providerAdapterVersion": provider_adapter_version,
        "providerOptions": provider_options or {},
        "providerVoiceId": provider_voice_id,
        "seed": seed,
        "spokenText": spoken_text,
        "voiceAlias": voice_alias,
    }


def generation_hash(payload: dict[str, Any]) -> str:
    return sha256_digest(canonical_json(payload))
